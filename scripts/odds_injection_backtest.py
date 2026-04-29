"""
적중률 Phase 1 백테스트 — 배당 주입 (odds_draw + 파생 5개)

베이스라인 (현재 ml_model.py 27 피처) vs 배당 주입 모델 (32 피처) 비교.
시간순 80/20 분할로 동일 split. ⭐4+ 55% 복원이 게이트.

Usage:
    source .venv/bin/activate
    python scripts/odds_injection_backtest.py
    → matchlab/reports/odds_injection_backtest.json
"""

import os, json, sys
from datetime import datetime
from pathlib import Path

import numpy as np
import pandas as pd
import xgboost as xgb
from sklearn.metrics import accuracy_score

# 같은 디렉토리의 ml_model.py 재사용
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from ml_model import (
    pages_to_dataframe, build_features, map_result, RESULT_MAP,
    notion_query_all, parse_pct, rich_text,
)

REPORTS_DIR = Path(__file__).resolve().parent.parent.parent / "matchlab" / "reports"
REPORTS_DIR.mkdir(parents=True, exist_ok=True)
OUTPUT_PATH = REPORTS_DIR / "odds_injection_backtest.json"

# 베이스라인 피처 셋 (현재 운영 27 피처 — odds_draw / 파생 제외)
BASELINE_FEATURES = [
    "poisson_home", "poisson_away",
    "elo_home", "elo_away",
    "xg_home", "xg_away",
    "odds_home", "odds_away",
    "home_recent5_pts", "away_recent5_pts",
    "home_home_pts", "away_away_pts",
    "rank_diff", "h2h_home_winrate",
    "home_gd", "away_gd",
    "fatigue_home", "fatigue_away",
    "is_derby",
]


def baseline_build_features(df, league_columns=None):
    """배당 주입 없이 베이스라인 피처만으로 X 매트릭스 구성."""
    X_num = df[BASELINE_FEATURES].copy()
    league_dummies = pd.get_dummies(df["league"], prefix="league")
    if league_columns is not None:
        for col in league_columns:
            if col not in league_dummies.columns:
                league_dummies[col] = 0
        league_dummies = league_dummies[league_columns]
    else:
        league_columns = list(league_dummies.columns)
    X = pd.concat([X_num, league_dummies], axis=1)
    return X.values.astype(np.float32), list(X.columns), league_columns


def confidence_band(prob_max):
    """ML 최고확률 → 별등급."""
    if prob_max >= 0.65:
        return 5
    if prob_max >= 0.55:
        return 4
    if prob_max >= 0.45:
        return 3
    if prob_max >= 0.35:
        return 2
    return 1


def evaluate(model, X_test, y_test, df_test, prefix=""):
    """모델 평가 — 적중률 / 별등급별 / 리그별 / Draw 지표."""
    proba = model.predict_proba(X_test)
    y_pred = proba.argmax(axis=1)
    prob_max = proba.max(axis=1)

    overall_acc = float(accuracy_score(y_test, y_pred))

    # 별등급별
    bands = pd.Series([confidence_band(p) for p in prob_max])
    star4plus_mask = bands >= 4
    star5_mask = bands >= 5
    star4_acc = float(accuracy_score(y_test[star4plus_mask], y_pred[star4plus_mask])) if star4plus_mask.sum() > 0 else None
    star5_acc = float(accuracy_score(y_test[star5_mask], y_pred[star5_mask])) if star5_mask.sum() > 0 else None

    # 리그별
    by_league = {}
    leagues = df_test["league"].unique()
    for lg in leagues:
        mask = df_test["league"].values == lg
        if mask.sum() == 0:
            continue
        by_league[lg] = {
            "acc": float(accuracy_score(y_test[mask], y_pred[mask])),
            "n": int(mask.sum()),
        }

    # Draw 진단
    draw_idx = RESULT_MAP.get("무승부", 1)
    draw_actual_mask = (y_test == draw_idx)
    draw_pred_mask = (y_pred == draw_idx)
    draw_recall = float((draw_actual_mask & draw_pred_mask).sum() / max(draw_actual_mask.sum(), 1))
    draw_precision = float((draw_actual_mask & draw_pred_mask).sum() / max(draw_pred_mask.sum(), 1))
    ml_draw_max_prob = float(proba[:, draw_idx].max())

    return {
        "test_accuracy": overall_acc,
        "star4plus": {
            "hit_rate": star4_acc,
            "n": int(star4plus_mask.sum()),
        },
        "star5": {
            "hit_rate": star5_acc,
            "n": int(star5_mask.sum()),
        },
        "by_league": by_league,
        "draw_recall": draw_recall,
        "draw_precision": draw_precision,
        "ml_draw_max_prob": ml_draw_max_prob,
    }


def fit_xgb(X_train, y_train, n_classes=3):
    model = xgb.XGBClassifier(
        objective="multi:softprob",
        num_class=n_classes,
        n_estimators=300,
        max_depth=4,
        learning_rate=0.05,
        subsample=0.8,
        colsample_bytree=0.8,
        random_state=42,
        eval_metric="mlogloss",
    )
    model.fit(X_train, y_train)
    return model


def feature_importance_top(model, feature_names, top_n=10):
    importances = model.feature_importances_
    pairs = sorted(zip(feature_names, importances), key=lambda x: -x[1])
    return [{"feature": f, "importance": float(i)} for f, i in pairs[:top_n]]


def main():
    print("[1/5] Notion 판정 완료 데이터 로드...")
    pages = notion_query_all()
    df = pages_to_dataframe(pages)
    df["y"] = df["actual"].apply(map_result)
    df = df[df["y"] >= 0].copy()
    df = df.sort_values("kickoff").reset_index(drop=True)
    print(f"  → {len(df)}건 로드")

    if len(df) < 50:
        print(f"[!] 데이터 부족: {len(df)}건. 백테스트 중단.")
        return

    # 시간순 80/20 분할 (identical split)
    split_idx = int(len(df) * 0.8)
    df_train, df_test = df.iloc[:split_idx], df.iloc[split_idx:]
    y_train = df_train["y"].values
    y_test = df_test["y"].values
    print(f"  → train {len(df_train)} / test {len(df_test)}")

    print("[2/5] 베이스라인 (27 피처) 학습 + 평가...")
    X_train_base, feat_base, lg_cols = baseline_build_features(df_train)
    X_test_base, _, _ = baseline_build_features(df_test, league_columns=lg_cols)
    model_base = fit_xgb(X_train_base, y_train)
    res_base = evaluate(model_base, X_test_base, y_test, df_test)

    print("[3/5] 배당 주입 모델 (32 피처) 학습 + 평가...")
    X_train_inj, feat_inj, lg_cols2 = build_features(df_train)
    X_test_inj, _, _ = build_features(df_test, league_columns=lg_cols2)
    model_inj = fit_xgb(X_train_inj, y_train)
    res_inj = evaluate(model_inj, X_test_inj, y_test, df_test)

    print("[4/5] Delta 계산 + Go/No-Go 판정...")
    def pp(a, b):
        if a is None or b is None:
            return None
        return round((a - b) * 100, 2)

    delta = {
        "test_accuracy_pp": pp(res_inj["test_accuracy"], res_base["test_accuracy"]),
        "star4plus_pp": pp(res_inj["star4plus"]["hit_rate"], res_base["star4plus"]["hit_rate"]),
        "star5_pp": pp(res_inj["star5"]["hit_rate"], res_base["star5"]["hit_rate"]),
        "draw_recall_pp": pp(res_inj["draw_recall"], res_base["draw_recall"]),
        "ml_draw_max_prob_pp": pp(res_inj["ml_draw_max_prob"], res_base["ml_draw_max_prob"]),
    }

    star4_inj = res_inj["star4plus"]["hit_rate"]
    if star4_inj is not None and star4_inj >= 0.55:
        verdict = "GO"
        reason = f"⭐4+ {star4_inj*100:.1f}% ≥ 55% 게이트 통과 — Phase 2 보류, weekly-retrain 재개"
    elif star4_inj is not None:
        verdict = "NO_GO_PHASE_2"
        reason = f"⭐4+ {star4_inj*100:.1f}% < 55% — Phase 2 (Meta XGBoost 스태킹) 즉시 착수"
    else:
        verdict = "INSUFFICIENT_DATA"
        reason = "테스트셋에 ⭐4+ 샘플 부족 — 추가 데이터 수집 필요"

    output = {
        "generated_at": datetime.now().isoformat(),
        "data_count": {
            "total": int(len(df)),
            "train": int(len(df_train)),
            "test": int(len(df_test)),
        },
        "baseline": {**res_base, "n_features": len(feat_base)},
        "odds_injection": {**res_inj, "n_features": len(feat_inj)},
        "delta": delta,
        "feature_importance_top10_odds_injection": feature_importance_top(model_inj, feat_inj, 10),
        "verdict": verdict,
        "verdict_reason": reason,
    }

    print("[5/5] 결과 저장...")
    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False, indent=2)
    print(f"  → {OUTPUT_PATH}")
    print(f"\n=== Verdict: {verdict} ===")
    print(reason)


if __name__ == "__main__":
    main()
