import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { LoginForm } from "@/components/auth/login-form";

export default async function LoginPage() {
  const session = await auth();

  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-100 px-6 py-16">
      <div className="w-full max-w-md rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
        <div className="mb-8 space-y-3">
          <Link href="/" className="text-sm font-medium text-zinc-500">
            Back to home
          </Link>
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-950">
            Sign in
          </h1>
          <p className="text-sm leading-6 text-zinc-600">
            Use your registered email and password to access the dashboard.
          </p>
        </div>

        <LoginForm />
      </div>
    </main>
  );
}
