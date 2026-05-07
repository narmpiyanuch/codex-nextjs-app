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
    <main className="app-shell flex min-h-screen items-center justify-center px-5 py-8 sm:px-8">
      <div className="grid w-full max-w-6xl overflow-hidden rounded-[2rem] border border-[color:var(--line)] bg-white/45 shadow-[0_24px_70px_rgba(28,25,18,0.10)] lg:grid-cols-[0.95fr_1.05fr]">
        <section className="bg-zinc-950 px-8 py-10 text-white sm:px-10 sm:py-12">
          <Link
            href="/"
            className="inline-flex h-10 items-center rounded-full border border-white/15 px-4 text-sm font-medium text-white/80 hover:border-white/30 hover:text-white"
          >
            Back to home
          </Link>

          <div className="mt-10 space-y-6">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/55">
              Welcome back
            </p>
            <h1 className="serif-heading max-w-md text-5xl leading-tight tracking-tight">
              Sign in and continue where you left off.
            </h1>
            <p className="max-w-md text-base leading-8 text-white/72">
              Access your protected workspace, session-aware dashboard, and
              server-validated auth flow from one polished sign-in surface.
            </p>
          </div>

          <div className="mt-12 grid gap-4">
            {[
              ["Protected routes", "Middleware keeps private pages behind authentication."],
              ["Server-first flow", "Credentials are validated on the server with Auth.js."],
            ].map(([title, body]) => (
              <div
                key={title}
                className="rounded-[1.5rem] border border-white/10 bg-white/6 p-5"
              >
                <p className="text-sm font-semibold text-white">{title}</p>
                <p className="mt-2 text-sm leading-6 text-white/65">{body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="glass-panel flex items-center px-6 py-8 sm:px-10 sm:py-12">
          <div className="mx-auto w-full max-w-md">
            <div className="mb-8 space-y-3">
              <p className="eyebrow">Sign In</p>
              <h2 className="serif-heading text-4xl tracking-tight text-zinc-950">
                Access your dashboard
              </h2>
              <p className="text-sm leading-7 text-zinc-600">
                Use your registered email and password to continue securely.
              </p>
            </div>

            <LoginForm />
          </div>
        </section>
      </div>
    </main>
  );
}
