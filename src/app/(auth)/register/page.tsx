import RegisterForm from "./ui/register-form";

export default function RegisterPage() {
  return (
    <div className="glass rounded-3xl p-6 sm:p-8">
      <h1 className="text-xl font-semibold tracking-tight">Student registration</h1>
      <p className="mt-1 text-sm text-black/80">Hall is fixed to Hall 1</p>
      <div className="mt-6">
        <RegisterForm />
      </div>
    </div>
  );
}

