import ResetPasswordForm from "./ui/reset-password-form";

export default function ResetPasswordPage() {
  return (
    <div className="glass rounded-3xl p-6 sm:p-8">
      <h1 className="text-xl font-semibold tracking-tight">Reset password</h1>
      <p className="mt-1 text-sm text-black/80">Set a new password.</p>
      <div className="mt-6">
        <ResetPasswordForm />
      </div>
    </div>
  );
}

