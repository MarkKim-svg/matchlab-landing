import { Suspense } from "react";
import LoginContent from "./LoginContent";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-dvh bg-bg-900 flex items-center justify-center">
          <div className="text-bg-200 text-sm">로딩 중...</div>
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
