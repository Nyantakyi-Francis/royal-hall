import ForgotPasswordForm from "./ui/forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <div className="glass rounded-3xl p-6 sm:p-8">
      <h1 className="text-xl font-semibold tracking-tight">Forgot password</h1>
      <p className="mt-1 text-sm text-black/80">We’ll email you a reset link.</p>
      <div className="mt-6">
        <ForgotPasswordForm />
      </div>
    </div>
  );
}

