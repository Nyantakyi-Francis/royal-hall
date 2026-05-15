import LoginForm from "./ui/login-form";
import { Suspense } from "react";

export default function LoginPage() {
  return (
    <div className="glass rounded-3xl p-6 sm:p-8">
      <h1 className="text-xl font-semibold tracking-tight">Log in</h1>
      <p className="mt-1 text-sm text-black/80">Student or admin account</p>
      <div className="mt-6">
        <Suspense fallback={<div className="text-sm text-black/80">Loading...</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}

