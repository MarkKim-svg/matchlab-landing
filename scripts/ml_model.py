"""
MatchLab XGBoost 3-class classifier
- Notion 예측 DB에서 판정 완료 데이터 로드
- 기존 4모델 확률 + 신규 피처 + 리그 원핫 → XGBoost multi:softprob
- 시간순 80/20 분할로 학습/검증
- 모델 저장 + Notion ML 컬럼 업데이트

Usage:
    source .venv/bin/activate
    python scripts/ml_model.py              # 학습 + 검증 리포트
    python scripts/ml_model.py --predict    # 미판정 경기 예측 → Notion 기록
"""

import os, sys, json, time, re
import numpy as np
import pandas as pd
import xgboost as xgb
from sklearn.metrics import accuracy_score, classification_report
from dotenv import load_dotenv
import requests as req

load_dotenv(".env.local")

NOTION_TOKEN = os.environ["NOTION_TOKEN"]
DB_ID = "c451c2a04e6b4a7d85d0b8771e278d05"
NOTION_HEADERS = {
    "Authorization": f"Bearer {NOTION_TOKEN}",
    "Notion-Version": "2022-06-28",
    "Content-Type": "application/json",
}
NOTION_API = "https://api.notion.com/v1"

SCRIPTS_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.dirname(SCRIPTS_DIR)
MODEL_PATH = os.path.join(SCRIPTS_DIR, "trained_model.json")
CONFIG_PATH = os.path.join(SCRIPTS_DIR, "feature_config.json")

# ── Notion data loading ──────────────────────────────────────────

def notion_query_all():
    """Paginate through entire predictions DB."""
    pages = []
    payload = {"page_size": 100, "sorts": [{"property": "날짜", "direction": "ascending"}]}
    while True:
        r = req.post(f"{NOTION_API}/databases/{DB_ID}/query", headers=NOTION_HEADERS, json=payload)
        r.raise_for_status()
        data = r.json()
        pages.extend(data["results"])
        if not data.get("has_more"):
            break
        payload["start_cursor"] = data["next_cursor"]
    return pages


def rich_text(props, name):
    parts = props.get(name, {}).get("rich_text", [])
    return "".join(p.get("plain_text", "") for p in parts)


def parse_pct(s):
    """'45.2%' → 45.2, '45.2' → 45.2, '' → NaN"""
    if not s:
        return np.nan
    s = s.strip().replace("%", "").replace("일", "")
    try:
        return float(s)
    except ValueError:
        return np.nan


def parse_float(s):
    if not s:
        return np.nan
    try:
        return float(s.strip())
    except ValueError:
        return np.nan


RESULT_MAP = {"홈승": 0, "무승부": 1, "원정승": 2}
RESULT_LABELS = ["홈승", "무승부", "원정승"]

LEAGUES = [
    "프리미어리그", "라리가", "세리에A", "분데스리가", "리그1",
    "챔피언스리그", "유로파리그", "컨퍼런스리그",
    "FA컵", "코파델레이", "코파이탈리아", "DFB포칼", "쿠프드프랑스",
]


def pages_to_dataframe(pages):
    rows = []
    for page in pages:
        props = page["properties"]
        match = props.get("경기", {}).get("title", [])
        match_name = match[0]["plain_text"] if match else ""
        date = props.get("날짜", {}).get("date", {}).get("start", "")
        league = props.get("리그", {}).get("select", {})
        league_name = league.get("name", "") if league else ""
        hit_status = props.get("적중여부", {}).get("select", {})
        hit = hit_status.get("name", "") if hit_status else ""
        result_text = rich_text(props, "실제결과")
        prediction_sel = props.get("예측", {}).get("select", {})
        prediction = prediction_sel.get("name", "") if prediction_sel else ""
        conf_sel = props.get("확신도", {}).get("select", {})
        conf_label = conf_sel.get("name", "") if conf_sel else ""
        confidence = len([c for c in conf_label if c == "⭐"])

        row = {
            "page_id": page["id"],
            "match": match_name,
            "date": date,
            "league": league_name,
            "hit_status": hit,
            "actual_result": result_text,
            "prediction": prediction,
            "confidence": confidence,
            # 기존 4모델
            "poisson_home": parse_pct(rich_text(props, "푸아송_홈승")),
            "poisson_away": parse_pct(rich_text(props, "푸아송_원정승")),
            "elo_home": parse_pct(rich_text(props, "ELO_홈승")),
            "elo_away": parse_pct(rich_text(props, "ELO_원정승")),
            "xg_home": parse_float(rich_text(props, "xG_홈")),
            "xg_away": parse_float(rich_text(props, "xG_원정")),
            "odds_home": parse_pct(rich_text(props, "배당_홈승")),
            "odds_draw": parse_pct(rich_text(props, "배당_무승부")),
            "odds_away": parse_pct(rich_text(props, "배당_원정승")),
            # 신규 피처
            "home_recent5_pts": parse_float(rich_text(props, "홈팀_최근5경기_승점")),
            "away_recent5_pts": parse_float(rich_text(props, "원정팀_최근5경기_승점")),
            "home_home_pts": parse_float(rich_text(props, "홈팀_홈성적_승점")),
            "away_away_pts": parse_float(rich_text(props, "원정팀_원정성적_승점")),
            "rank_diff": parse_float(rich_text(props, "순위차이")),
            "h2h_home_winrate": parse_pct(rich_text(props, "H2H_홈승률")),
            "home_gd": parse_float(rich_text(props, "홈팀_득실차")),
            "away_gd": parse_float(rich_text(props, "원정팀_득실차")),
            "fatigue_home": parse_pct(rich_text(props, "일정피로_홈")),
            "fatigue_away": parse_pct(rich_text(props, "일정피로_원정")),
            "is_derby": 1 if rich_text(props, "더비여부") == "Y" else 0,
            # 앙상블
            "ensemble_home": parse_pct(rich_text(props, "통계모델_홈승")),
            "ensemble_draw": parse_pct(rich_text(props, "통계모델_무승부")),
            "ensemble_away": parse_pct(rich_text(props, "통계모델_원정승")),
        }
        rows.append(row)
    return pd.DataFrame(rows)


# ── Feature engineering ──────────────────────────────────────────

NUMERIC_FEATURES = [
    "poisson_home", "poisson_away",
    "elo_home", "elo_away",
    "xg_home", "xg_away",
    "odds_home", "odds_draw", "odds_away",
    # 배당 파생 피처 5개 (Phase 1 — Draw Blindness 완화)
    "odds_implied_home_norm",
    "odds_implied_draw_norm",
    "odds_implied_away_norm",
    "odds_home_away_gap",
    "odds_ev_top",
    "home_recent5_pts", "away_recent5_pts",
    "home_home_pts", "away_away_pts",
    "rank_diff", "h2h_home_winrate",
    "home_gd", "away_gd",
    "fatigue_home", "fatigue_away",
    "is_derby",
]


def _add_odds_derived_features(df):
    """배당 파생 피처 5개. 결측은 NaN 유지 (XGBoost가 missing=NaN으로 처리)."""
    df = df.copy()
    h, d, a = df["odds_home"], df["odds_draw"], df["odds_away"]
    total = h + d + a  # 오버라운드 (보통 105~108%)
    df["odds_implied_home_norm"] = h / total * 100
    df["odds_implied_draw_norm"] = d / total * 100
    df["odds_implied_away_norm"] = a / total * 100
    df["odds_home_away_gap"] = (h - a).abs()
    eh = df.get("ensemble_home")
    ed = df.get("ensemble_draw")
    ea = df.get("ensemble_away")
    if eh is not None and ed is not None and ea is not None:
        ev_home = eh - df["odds_implied_home_norm"]
        ev_draw = ed - df["odds_implied_draw_norm"]
        ev_away = ea - df["odds_implied_away_norm"]
        df["odds_ev_top"] = pd.concat([ev_home, ev_draw, ev_away], axis=1).max(axis=1)
    else:
        df["odds_ev_top"] = np.nan
    return df


def build_features(df, league_columns=None):
    """Build feature matrix. Returns X, feature_names, league_columns."""
    df = _add_odds_derived_features(df)
    X_num = df[NUMERIC_FEATURES].copy()

    # League one-hot
    league_dummies = pd.get_dummies(df["league"], prefix="league")
    if league_columns is not None:
        # Align with training columns
        for col in league_columns:
            if col not in league_dummies.columns:
                league_dummies[col] = 0
        league_dummies = league_dummies[league_columns]
    else:
        league_columns = list(league_dummies.columns)

    X = pd.concat([X_num, league_dummies], axis=1)
    feature_names = list(X.columns)
    return X.values.astype(np.float32), feature_names, league_columns


def map_result(text):
    """Map actual result text to class index. e.g. '홈승 (1:6)' → 0"""
    text = text.strip()
    for label, idx in RESULT_MAP.items():
        if text.startswith(label):
            return idx
    return -1


# ── Training ─────────────────────────────────────────────────────

def train_and_evaluate(df):
    # Filter judged only
    judged = df[df["hit_status"].isin(["적중", "미적중"])].copy()
    judged["target"] = judged["actual_result"].apply(map_result)
    judged = judged[judged["target"] >= 0].reset_index(drop=True)

    print(f"\n📊 판정 완료 데이터: {len(judged)}건")
    print(f"   클래스 분포: {dict(judged['target'].value_counts().sort_index())}")
    print(f"   (0=홈승, 1=무승부, 2=원정승)\n")

    if len(judged) < 20:
        print("❌ 데이터가 너무 적어 학습 불가")
        return None, None, None

    # Time-based split (already sorted by date ascending)
    split_idx = int(len(judged) * 0.8)
    train_df = judged.iloc[:split_idx]
    test_df = judged.iloc[split_idx:]

    print(f"🔀 시간순 분할: 학습 {len(train_df)}건 / 테스트 {len(test_df)}건")
    print(f"   학습 기간: {train_df['date'].iloc[0]} ~ {train_df['date'].iloc[-1]}")
    print(f"   테스트 기간: {test_df['date'].iloc[0]} ~ {test_df['date'].iloc[-1]}\n")

    X_train, feature_names, league_cols = build_features(train_df)
    y_train = train_df["target"].values

    X_test, _, _ = build_features(test_df, league_columns=league_cols)
    y_test = test_df["target"].values

    # XGBoost
    dtrain = xgb.DMatrix(X_train, label=y_train, feature_names=feature_names, missing=np.nan)
    dtest = xgb.DMatrix(X_test, label=y_test, feature_names=feature_names, missing=np.nan)

    params = {
        "objective": "multi:softprob",
        "num_class": 3,
        "max_depth": 4,
        "learning_rate": 0.1,
        "subsample": 0.8,
        "colsample_bytree": 0.8,
        "eval_metric": "mlogloss",
        "seed": 42,
    }

    model = xgb.train(
        params, dtrain,
        num_boost_round=200,
        evals=[(dtrain, "train"), (dtest, "test")],
        early_stopping_rounds=30,
        verbose_eval=20,
    )

    # ── Predictions ──
    probs = model.predict(dtest)
    preds = np.argmax(probs, axis=1)

    # ── Results ──
    print("\n" + "=" * 60)
    print("📊 XGBoost 모델 검증 결과")
    print("=" * 60)

    # Overall accuracy
    acc = accuracy_score(y_test, preds)
    print(f"\n✅ 전체 적중률: {acc*100:.1f}% ({int(acc*len(y_test))}/{len(y_test)})")

    # Compare with existing ensemble
    ensemble_preds = []
    for _, row in test_df.iterrows():
        eh = row.get("ensemble_home", np.nan)
        ed = row.get("ensemble_draw", np.nan)
        ea = row.get("ensemble_away", np.nan)
        if pd.notna(eh) and pd.notna(ed) and pd.notna(ea):
            vals = [eh, ed, ea]
            ensemble_preds.append(np.argmax(vals))
        else:
            ensemble_preds.append(-1)

    ensemble_valid = [(p, t) for p, t in zip(ensemble_preds, y_test) if p >= 0]
    if ensemble_valid:
        ens_preds_arr, ens_true_arr = zip(*ensemble_valid)
        ens_acc = accuracy_score(ens_true_arr, ens_preds_arr)
        print(f"📈 기존 앙상블 적중률: {ens_acc*100:.1f}% ({int(ens_acc*len(ens_true_arr))}/{len(ens_true_arr)})")
        print(f"   → ML 개선폭: {(acc - ens_acc)*100:+.1f}%p")

    # Existing prediction (예측 select) accuracy
    existing_preds_list = []
    for _, row in test_df.iterrows():
        p = row.get("prediction", "")
        if p in RESULT_MAP:
            existing_preds_list.append(RESULT_MAP[p])
        else:
            existing_preds_list.append(-1)
    existing_valid = [(p, t) for p, t in zip(existing_preds_list, y_test) if p >= 0]
    if existing_valid:
        ex_preds_arr, ex_true_arr = zip(*existing_valid)
        ex_acc = accuracy_score(ex_true_arr, ex_preds_arr)
        print(f"📈 기존 최종예측 적중률: {ex_acc*100:.1f}% ({int(ex_acc*len(ex_true_arr))}/{len(ex_true_arr)})")

    # By confidence
    print("\n── 확신도별 적중률 ──")
    for star in sorted(test_df["confidence"].unique()):
        if star == 0:
            continue
        mask = test_df["confidence"].values == star
        if mask.sum() == 0:
            continue
        sub_acc = accuracy_score(y_test[mask], preds[mask])
        ens_sub = [(p, t) for p, t, m in zip(ensemble_preds, y_test, mask) if m and p >= 0]
        ens_sub_str = ""
        if ens_sub:
            ep, et = zip(*ens_sub)
            ens_sub_acc = accuracy_score(et, ep)
            ens_sub_str = f" (앙상블: {ens_sub_acc*100:.1f}%)"
        print(f"   {'⭐'*star}: ML {sub_acc*100:.1f}% ({int(sub_acc*mask.sum())}/{mask.sum()}){ens_sub_str}")

    # By league
    print("\n── 리그별 적중률 ──")
    for league in sorted(test_df["league"].unique()):
        mask = test_df["league"].values == league
        if mask.sum() < 2:
            continue
        sub_acc = accuracy_score(y_test[mask], preds[mask])
        ens_sub = [(p, t) for p, t, m in zip(ensemble_preds, y_test, mask) if m and p >= 0]
        ens_sub_str = ""
        if ens_sub:
            ep, et = zip(*ens_sub)
            ens_sub_acc = accuracy_score(et, ep)
            ens_sub_str = f" (앙상블: {ens_sub_acc*100:.1f}%)"
        print(f"   {league}: ML {sub_acc*100:.1f}% ({int(sub_acc*mask.sum())}/{mask.sum()}){ens_sub_str}")

    # Draw performance
    print("\n── 무승부 예측 성능 ──")
    draw_actual = (y_test == 1)
    draw_pred = (preds == 1)
    if draw_actual.sum() > 0:
        draw_recall = (draw_actual & draw_pred).sum() / draw_actual.sum()
        print(f"   실제 무승부 {draw_actual.sum()}건 중 ML이 맞춘 수: {(draw_actual & draw_pred).sum()}건 (재현율: {draw_recall*100:.1f}%)")
    if draw_pred.sum() > 0:
        draw_prec = (draw_actual & draw_pred).sum() / draw_pred.sum()
        print(f"   ML 무승부 예측 {draw_pred.sum()}건 중 실제 무승부: {(draw_actual & draw_pred).sum()}건 (정밀도: {draw_prec*100:.1f}%)")

    # Feature importance
    print("\n── 피처 중요도 Top 10 ──")
    importance = model.get_score(importance_type="gain")
    sorted_imp = sorted(importance.items(), key=lambda x: x[1], reverse=True)[:10]
    for rank, (feat, score) in enumerate(sorted_imp, 1):
        print(f"   {rank:2d}. {feat}: {score:.1f}")

    # ── Save model ──
    model.save_model(MODEL_PATH)
    print(f"\n💾 모델 저장: {MODEL_PATH}")

    config = {
        "feature_names": feature_names,
        "league_columns": league_cols,
        "numeric_features": NUMERIC_FEATURES,
        "result_labels": RESULT_LABELS,
        "num_class": 3,
        "train_size": len(train_df),
        "test_size": len(test_df),
        "test_accuracy": round(acc * 100, 1),
    }
    with open(CONFIG_PATH, "w", encoding="utf-8") as f:
        json.dump(config, f, ensure_ascii=False, indent=2)
    print(f"💾 피처 설정 저장: {CONFIG_PATH}")

    return model, feature_names, league_cols


# ── Prediction (미판정 경기) ─────────────────────────────────────

def ensure_ml_columns():
    """Add ML_홈승, ML_무승부, ML_원정승 columns to Notion DB if missing."""
    r = req.get(f"{NOTION_API}/databases/{DB_ID}", headers=NOTION_HEADERS)
    r.raise_for_status()
    existing = set(r.json()["properties"].keys())
    cols = ["ML_홈승", "ML_무승부", "ML_원정승"]
    to_create = [c for c in cols if c not in existing]
    if not to_create:
        return
    props = {c: {"rich_text": {}} for c in to_create}
    r = req.patch(f"{NOTION_API}/databases/{DB_ID}", headers=NOTION_HEADERS,
                  json={"properties": props})
    r.raise_for_status()
    print(f"  ✅ Notion 컬럼 추가: {', '.join(to_create)}")


def predict_and_update(df, model_path=MODEL_PATH, config_path=CONFIG_PATH):
    """Predict unjudged matches and write ML probabilities to Notion."""
    if not os.path.exists(model_path) or not os.path.exists(config_path):
        print("❌ 학습된 모델이 없습니다. 먼저 학습을 실행하세요.")
        return

    with open(config_path, "r", encoding="utf-8") as f:
        config = json.load(f)

    model = xgb.Booster()
    model.load_model(model_path)

    ensure_ml_columns()

    # Filter unjudged
    unjudged = df[~df["hit_status"].isin(["적중", "미적중"])].copy()
    if unjudged.empty:
        print("  미판정 경기가 없습니다.")
        return

    print(f"\n🔮 미판정 경기 {len(unjudged)}건 예측 중...")

    X, _, _ = build_features(unjudged, league_columns=config["league_columns"])
    dmatrix = xgb.DMatrix(X, feature_names=config["feature_names"], missing=np.nan)
    probs = model.predict(dmatrix)

    updated = 0
    for i, (_, row) in enumerate(unjudged.iterrows()):
        p = probs[i]
        page_id = row["page_id"]
        props = {
            "ML_홈승": {"rich_text": [{"text": {"content": f"{p[0]*100:.1f}%"}}]},
            "ML_무승부": {"rich_text": [{"text": {"content": f"{p[1]*100:.1f}%"}}]},
            "ML_원정승": {"rich_text": [{"text": {"content": f"{p[2]*100:.1f}%"}}]},
        }
        try:
            r = req.patch(f"{NOTION_API}/pages/{page_id}", headers=NOTION_HEADERS,
                          json={"properties": props})
            r.raise_for_status()
            pred_label = RESULT_LABELS[np.argmax(p)]
            print(f"  [{i+1}/{len(unjudged)}] {row['date']} {row['match']}: "
                  f"홈={p[0]*100:.1f}% 무={p[1]*100:.1f}% 원={p[2]*100:.1f}% → {pred_label} ✅")
            updated += 1
            time.sleep(0.35)
        except Exception as e:
            print(f"  [{i+1}/{len(unjudged)}] {row['match']}: ❌ {e}")

    print(f"\n✅ {updated}건 Notion 업데이트 완료")


# ── Main ─────────────────────────────────────────────────────────

def main():
    print("🔄 Notion 예측 DB 로드 중...")
    pages = notion_query_all()
    print(f"  총 {len(pages)}건 로드 완료")

    df = pages_to_dataframe(pages)
    print(f"  DataFrame 변환 완료: {len(df)}행 × {len(df.columns)}열")

    predict_mode = "--predict" in sys.argv

    if not predict_mode:
        model, feature_names, league_cols = train_and_evaluate(df)
        if model is not None:
            print("\n" + "=" * 60)
            print("🔮 미판정 경기 예측 + Notion 기록")
            print("=" * 60)
            predict_and_update(df)
    else:
        predict_and_update(df)


if __name__ == "__main__":
    main()
