import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-100 px-6 py-16">
      <div className="w-full max-w-3xl rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm sm:p-12">
        <div className="flex flex-col gap-8">
          <div className="space-y-4">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-zinc-500">
              Protected page
            </p>
            <h1 className="text-4xl font-semibold tracking-tight text-zinc-950">
              Dashboard
            </h1>
            <p className="max-w-2xl text-base leading-7 text-zinc-600">
              หน้านี้เปิดได้เฉพาะผู้ใช้ที่ login แล้ว ตอนนี้ session ถูกเชื่อมกับ
              Auth.js และอ่านผ่าน server component ได้เรียบร้อย
            </p>
          </div>

          <div className="grid gap-4 rounded-2xl border border-zinc-200 bg-zinc-50 p-6 sm:grid-cols-2">
            <div>
              <p className="text-sm text-zinc-500">Name</p>
              <p className="mt-1 text-lg font-medium text-zinc-950">
                {session.user.name ?? "-"}
              </p>
            </div>
            <div>
              <p className="text-sm text-zinc-500">Email</p>
              <p className="mt-1 text-lg font-medium text-zinc-950">
                {session.user.email ?? "-"}
              </p>
            </div>
            <div>
              <p className="text-sm text-zinc-500">User ID</p>
              <p className="mt-1 break-all text-sm font-medium text-zinc-950">
                {session.user.id}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/"
              className="inline-flex h-11 items-center justify-center rounded-full border border-zinc-300 px-5 text-sm font-medium text-zinc-700 transition hover:border-zinc-950 hover:text-zinc-950"
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
                className="h-11 rounded-full bg-zinc-950 px-5 text-sm font-medium text-white transition hover:bg-zinc-800"
              >
                ออกจากระบบ
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
