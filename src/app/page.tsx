import Link from "next/link";
import { auth, signOut } from "@/auth";

export default async function Home() {
  const session = await auth();

  return (
    <main className="app-shell min-h-screen px-5 py-6 text-zinc-950 sm:px-8 lg:px-12">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <header className="glass-panel rounded-[2rem] px-6 py-5 sm:px-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="eyebrow">Codex Next.js App</p>
              <p className="mt-2 text-sm text-zinc-600">
                Auth.js, Prisma, SQLite and a polished starter experience
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href={session?.user ? "/dashboard" : "/login"}
                className="inline-flex h-11 items-center justify-center rounded-full bg-[var(--brand)] px-5 text-sm font-semibold text-white hover:bg-[var(--brand-deep)]"
              >
                {session?.user ? "Open dashboard" : "Sign in"}
              </Link>
              {session?.user ? (
                <form
                  action={async () => {
                    "use server";
                    await signOut({ redirectTo: "/" });
                  }}
                >
                  <button
                    type="submit"
                    className="inline-flex h-11 items-center justify-center rounded-full border border-[color:var(--line)] bg-white/60 px-5 text-sm font-semibold text-zinc-700 hover:border-zinc-900 hover:text-zinc-950"
                  >
                    Sign out
                  </button>
                </form>
              ) : (
                <Link
                  href="/register"
                  className="inline-flex h-11 items-center justify-center rounded-full border border-[color:var(--line)] bg-white/60 px-5 text-sm font-semibold text-zinc-700 hover:border-zinc-900 hover:text-zinc-950"
                >
                  Create account
                </Link>
              )}
            </div>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
          <div className="glass-panel rounded-[2rem] px-7 py-8 sm:px-10 sm:py-12">
            <div className="space-y-6">
              <div className="space-y-3">
                <p className="eyebrow">Authentication Suite</p>
                <h1 className="serif-heading max-w-3xl text-5xl leading-tight tracking-tight sm:text-6xl">
                  Professional auth UI ที่พร้อมต่อยอดเป็น product จริง
                </h1>
                <p className="max-w-2xl text-base leading-8 text-zinc-600 sm:text-lg">
                  ระบบนี้มีทั้ง registration, credential sign-in, protected
                  dashboard, validation และ test เบื้องต้น พร้อม visual language
                  ใหม่ที่ชัดขึ้น สะอาดขึ้น และดูเป็น production มากขึ้น
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  href={session?.user ? "/dashboard" : "/register"}
                  className="inline-flex h-12 items-center justify-center rounded-full bg-zinc-950 px-6 text-sm font-semibold text-white hover:-translate-y-0.5 hover:bg-zinc-800"
                >
                  {session?.user ? "View dashboard" : "Start with registration"}
                </Link>
                <Link
                  href="/login"
                  className="inline-flex h-12 items-center justify-center rounded-full border border-[color:var(--line)] bg-white/70 px-6 text-sm font-semibold text-zinc-700 hover:border-zinc-950 hover:text-zinc-950"
                >
                  Explore sign-in flow
                </Link>
              </div>

              <div className="grid gap-4 pt-2 sm:grid-cols-3">
                {[
                  ["Secure by default", "Hashed passwords and server-side session checks"],
                  ["Built for teams", "Clear route structure and reusable auth helpers"],
                  ["Ready to ship", "Linted, build-tested, and backed by Vitest"],
                ].map(([title, body]) => (
                  <div key={title} className="soft-card rounded-[1.6rem] p-5">
                    <p className="text-sm font-semibold text-zinc-950">{title}</p>
                    <p className="mt-2 text-sm leading-6 text-zinc-600">{body}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <aside className="flex flex-col gap-6">
            <div className="glass-panel rounded-[2rem] px-6 py-7">
              <p className="eyebrow">Session Status</p>
              <div className="mt-4 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-3 w-3 rounded-full bg-[var(--brand)] shadow-[0_0_0_6px_rgba(15,118,110,0.12)]" />
                  <p className="text-sm font-semibold text-zinc-900">
                    {session?.user ? "Authenticated" : "Guest mode"}
                  </p>
                </div>
                <div className="soft-card rounded-[1.5rem] p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                    Active identity
                  </p>
                  <p className="mt-3 text-lg font-semibold text-zinc-950">
                    {session?.user?.name ?? "Not signed in"}
                  </p>
                  <p className="mt-1 break-all text-sm text-zinc-600">
                    {session?.user?.email ?? "Create an account to start a session."}
                  </p>
                </div>
              </div>
            </div>

            <div className="soft-card rounded-[2rem] p-6">
              <p className="eyebrow">What is included</p>
              <ul className="mt-4 space-y-4 text-sm leading-6 text-zinc-700">
                <li>Credentials login with Auth.js beta for App Router</li>
                <li>Prisma schema and SQLite-ready persistence</li>
                <li>Protected route middleware and dashboard gatekeeping</li>
                <li>Vitest coverage for validation and auth helpers</li>
              </ul>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
