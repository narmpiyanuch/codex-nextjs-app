import Link from "next/link";
import { auth, signOut } from "@/auth";

export default async function Home() {
  const session = await auth();

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-100 px-6 py-16 text-zinc-950">
      <div className="w-full max-w-4xl rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm sm:p-12">
        <div className="flex flex-col gap-10">
          <div className="space-y-4">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-zinc-500">
              Next.js Auth Starter
            </p>
            <h1 className="max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">
              Login/Register พร้อมใช้ด้วย Auth.js, Prisma และ SQLite
            </h1>
            <p className="max-w-2xl text-base leading-7 text-zinc-600 sm:text-lg">
              ตอนนี้โปรเจ็กต์มีระบบสมัครสมาชิก, เข้าสู่ระบบด้วย email/password,
              session management และหน้า protected route เบื้องต้นแล้ว
            </p>
          </div>

          <div className="grid gap-4 rounded-2xl border border-zinc-200 bg-zinc-50 p-6 sm:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-3">
              <h2 className="text-lg font-semibold">สถานะการเข้าสู่ระบบ</h2>
              {session?.user ? (
                <>
                  <p className="text-zinc-700">
                    เข้าสู่ระบบแล้วในชื่อ{" "}
                    <span className="font-medium">
                      {session.user.name ?? session.user.email}
                    </span>
                  </p>
                  <p className="text-sm text-zinc-500">{session.user.email}</p>
                </>
              ) : (
                <p className="text-zinc-700">
                  ยังไม่ได้เข้าสู่ระบบ ลองสมัครสมาชิกแล้วทดสอบ flow ได้เลย
                </p>
              )}
            </div>

            <div className="flex flex-col gap-3 sm:items-end">
              {session?.user ? (
                <>
                  <Link
                    href="/dashboard"
                    className="inline-flex h-11 w-full items-center justify-center rounded-full bg-zinc-950 px-5 text-sm font-medium text-white transition hover:bg-zinc-800 sm:w-44"
                  >
                    ไปที่ Dashboard
                  </Link>
                  <form
                    action={async () => {
                      "use server";
                      await signOut({ redirectTo: "/" });
                    }}
                    className="w-full sm:w-44"
                  >
                    <button
                      type="submit"
                      className="h-11 w-full rounded-full border border-zinc-300 text-sm font-medium text-zinc-700 transition hover:border-zinc-950 hover:text-zinc-950"
                    >
                      ออกจากระบบ
                    </button>
                  </form>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="inline-flex h-11 w-full items-center justify-center rounded-full bg-zinc-950 px-5 text-sm font-medium text-white transition hover:bg-zinc-800 sm:w-44"
                  >
                    เข้าสู่ระบบ
                  </Link>
                  <Link
                    href="/register"
                    className="inline-flex h-11 w-full items-center justify-center rounded-full border border-zinc-300 px-5 text-sm font-medium text-zinc-700 transition hover:border-zinc-950 hover:text-zinc-950 sm:w-44"
                  >
                    สมัครสมาชิก
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
