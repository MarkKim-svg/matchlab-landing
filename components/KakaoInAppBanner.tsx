"use client";

import { useState, useEffect } from "react";

export default function KakaoInAppBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (/KAKAOTALK/i.test(navigator.userAgent)) {
      setVisible(true);
    }
  }, []);

  if (!visible) return null;

  function openExternal() {
    window.location.href =
      "kakaotalk://web/openExternal?url=" +
      encodeURIComponent(window.location.href);
  }

  return (
    <div className="fixed top-0 left-0 z-[100] w-full bg-amber-600 text-white py-2 px-4 flex items-center justify-between text-xs">
      <p>
        카카오톡 앱에서 열렸습니다.{" "}
        <button onClick={openExternal} className="underline underline-offset-2 font-medium">
          Safari/Chrome에서 열기
        </button>
        를 권장합니다.
      </p>
      <button
        onClick={() => setVisible(false)}
        className="ml-3 shrink-0 text-white/80 hover:text-white"
        aria-label="닫기"
      >
        ✕
      </button>
    </div>
  );
}
