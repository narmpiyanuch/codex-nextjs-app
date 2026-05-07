import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <main className="app-shell min-h-screen px-5 py-6 sm:px-8 lg:px-12">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <header className="glass-panel rounded-[2rem] px-6 py-6 sm:px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <p className="eyebrow">Protected Workspace</p>
              <h1 className="serif-heading text-5xl leading-tight tracking-tight text-zinc-950">
                Dashboard
              </h1>
              <p className="max-w-2xl text-base leading-8 text-zinc-600">
                พื้นที่นี้เปิดได้เฉพาะผู้ใช้ที่ผ่านการยืนยันตัวตนแล้ว และตอนนี้
                session ถูกอ่านผ่าน server component อย่างเรียบร้อย
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/"
                className="inline-flex h-11 items-center justify-center rounded-full border border-[color:var(--line)] bg-white/70 px-5 text-sm font-semibold text-zinc-700 hover:border-zinc-950 hover:text-zinc-950"
              >
                กลับหน้าแรก
              </Link>
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/" });
                }}
              >
                <button
                  type="submit"
                  className="h-11 rounded-full bg-zinc-950 px-5 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(23,32,51,0.16)] hover:-translate-y-0.5 hover:bg-zinc-800"
                >
                  ออกจากระบบ
                </button>
              </form>
            </div>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="grid gap-6">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="glass-panel rounded-[1.8rem] p-5">
                <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                  Status
                </p>
                <p className="mt-5 text-2xl font-semibold text-zinc-950">
                  Active
                </p>
                <p className="mt-2 text-sm leading-6 text-zinc-600">
                  Session is valid and protected routing is in effect.
                </p>
              </div>
              <div className="glass-panel rounded-[1.8rem] p-5">
                <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                  Auth strategy
                </p>
                <p className="mt-5 text-2xl font-semibold text-zinc-950">
                  Credentials
                </p>
                <p className="mt-2 text-sm leading-6 text-zinc-600">
                  Email and password handled through Auth.js server flow.
                </p>
              </div>
              <div className="glass-panel rounded-[1.8rem] p-5">
                <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                  Persistence
                </p>
                <p className="mt-5 text-2xl font-semibold text-zinc-950">
                  SQLite
                </p>
                <p className="mt-2 text-sm leading-6 text-zinc-600">
                  Lightweight local database powered by Prisma models.
                </p>
              </div>
            </div>

            <div className="glass-panel rounded-[2rem] p-6 sm:p-8">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="eyebrow">Identity</p>
                  <h2 className="mt-3 text-2xl font-semibold text-zinc-950">
                    Account profile
                  </h2>
                </div>
                <div className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
                  Verified session
                </div>
              </div>

              <div className="mt-8 grid gap-4 md:grid-cols-2">
                <div className="soft-card rounded-[1.5rem] p-5">
                  <p className="text-sm text-zinc-500">Name</p>
                  <p className="mt-2 text-xl font-semibold text-zinc-950">
                    {session.user.name ?? "-"}
                  </p>
                </div>
                <div className="soft-card rounded-[1.5rem] p-5">
                  <p className="text-sm text-zinc-500">Email</p>
                  <p className="mt-2 text-xl font-semibold text-zinc-950">
                    {session.user.email ?? "-"}
                  </p>
                </div>
                <div className="soft-card rounded-[1.5rem] p-5 md:col-span-2">
                  <p className="text-sm text-zinc-500">User ID</p>
                  <p className="mt-2 break-all text-sm font-medium text-zinc-950">
                    {session.user.id}
                  </p>
                </div>
              </div>
            </div>

            <div className="soft-card rounded-[2rem] p-6 sm:p-8">
              <p className="eyebrow">Implementation Notes</p>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm font-semibold text-zinc-950">
                    What is working
                  </p>
                  <p className="mt-2 text-sm leading-7 text-zinc-600">
                    Auth.js session handling, route protection, Prisma-backed user
                    storage, and a clean server-rendered dashboard experience.
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-zinc-950">
                    Good next steps
                  </p>
                  <p className="mt-2 text-sm leading-7 text-zinc-600">
                    Add profile editing, activity history, or OAuth providers when
                    you&apos;re ready to expand beyond credentials-only auth.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <aside className="grid gap-6">
            <div className="glass-panel rounded-[2rem] p-6">
              <p className="eyebrow">Workspace Summary</p>
              <div className="mt-5 space-y-4">
                {[
                  ["Current user", session.user.name ?? session.user.email ?? "-"],
                  ["Route access", "Protected by middleware"],
                  ["Testing", "Vitest setup available"],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="flex items-center justify-between rounded-[1.2rem] border border-[color:var(--line)] bg-white/60 px-4 py-3"
                  >
                    <span className="text-sm text-zinc-500">{label}</span>
                    <span className="text-sm font-semibold text-zinc-950">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="soft-card rounded-[2rem] p-6">
              <p className="eyebrow">Quick Guide</p>
              <ol className="mt-5 space-y-4 text-sm leading-7 text-zinc-700">
                <li>Use this dashboard as the first protected destination after login.</li>
                <li>Reuse the visual cards here for future settings, profile, or admin pages.</li>
                <li>Keep actions concise and surface account status near the top.</li>
              </ol>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
