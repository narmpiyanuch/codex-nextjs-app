import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { RegisterForm } from "@/components/auth/register-form";

export default async function RegisterPage() {
  const session = await auth();

  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <main className="app-shell flex min-h-screen items-center justify-center px-5 py-8 sm:px-8">
      <div className="grid w-full max-w-6xl overflow-hidden rounded-[2rem] border border-[color:var(--line)] bg-white/45 shadow-[0_24px_70px_rgba(28,25,18,0.10)] lg:grid-cols-[1.02fr_0.98fr]">
        <section className="glass-panel flex items-center px-6 py-8 sm:px-10 sm:py-12 lg:order-2">
          <div className="mx-auto w-full max-w-md">
            <div className="mb-8 space-y-3">
              <Link href="/" className="text-sm font-medium text-zinc-500 hover:text-zinc-900">
                Back to home
              </Link>
              <p className="eyebrow">Create Account</p>
              <h1 className="serif-heading text-4xl tracking-tight text-zinc-950">
                Launch your workspace
              </h1>
              <p className="text-sm leading-7 text-zinc-600">
                Register with email and password. We&apos;ll sign you in
                automatically after account creation.
              </p>
            </div>

            <RegisterForm />
          </div>
        </section>

        <section className="bg-[linear-gradient(160deg,#113c3f_0%,#0d2d36_50%,#191b2d_100%)] px-8 py-10 text-white sm:px-10 sm:py-12 lg:order-1">
          <div className="space-y-6">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/55">
              New account
            </p>
            <h2 className="serif-heading max-w-md text-5xl leading-tight tracking-tight">
              Start with a clean, secure onboarding flow.
            </h2>
            <p className="max-w-md text-base leading-8 text-white/72">
              This starter is designed to feel dependable from the first screen:
              clear hierarchy, strong focus states, and a modern auth journey.
            </p>
          </div>

          <div className="mt-12 grid gap-4">
            {[
              ["Validation built in", "Zod catches invalid input before user creation."],
              ["Passwords protected", "Credentials are hashed before they ever touch storage."],
              ["SQLite friendly", "Great local setup for demos, prototypes, and MVPs."],
            ].map(([title, body]) => (
              <div
                key={title}
                className="rounded-[1.5rem] border border-white/10 bg-white/7 p-5"
              >
                <p className="text-sm font-semibold text-white">{title}</p>
                <p className="mt-2 text-sm leading-6 text-white/65">{body}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
