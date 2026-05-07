import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { BookingTopNavigation } from "@/components/dashboard/booking-top-navigation";
import { Icon } from "@/components/dashboard/icons";
import { getDashboardData } from "@/lib/booking";

export default async function SchedulePage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const { month } = await searchParams;
  const dashboardData = await getDashboardData(session.user.id, month);
  const displayName = session.user.name || session.user.email || "Reserve teammate";

  return (
    <main className="booking-shell min-h-screen bg-white text-[var(--booking-text)]">
      <BookingTopNavigation active="schedule" signedInName={displayName} />

      <section className="booking-canvas mx-auto grid w-full max-w-[1280px] gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_360px] lg:px-8 lg:py-16">
        <div className="space-y-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-[var(--booking-brand)]">Schedule</p>
              <h1 className="mt-3 text-5xl font-semibold tracking-[-0.06em] sm:text-6xl">Your room calendar.</h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--booking-muted)]">A fuller schedule surface for checking date availability before creating or adjusting bookings.</p>
            </div>
            <div className="flex gap-3">
              <a aria-label="Previous month" className="booking-calendar-arrow border border-[var(--booking-border)]" href={`/dashboard/schedule?month=${dashboardData.previousMonth}#schedule`}><Icon name="chevronLeft" /></a>
              <a aria-label="Next month" className="booking-calendar-arrow border border-[var(--booking-border)]" href={`/dashboard/schedule?month=${dashboardData.nextMonth}#schedule`}><Icon name="chevronRight" /></a>
            </div>
          </div>

          <section className="rounded-3xl border border-[var(--booking-border)] bg-white p-4 shadow-sm sm:p-8" id="schedule">
            <div className="flex items-center justify-between pb-6">
              <div>
                <h2 className="text-2xl font-semibold tracking-[-0.04em]">{dashboardData.monthLabel}</h2>
                <p className="text-sm text-[var(--booking-muted)]">Team room availability overview</p>
              </div>
              <span className="rounded-full bg-[var(--booking-alert)] px-4 py-2 text-sm font-bold text-[var(--booking-brand)]">{dashboardData.bookings.length} active bookings</span>
            </div>

            <div className="overflow-hidden rounded-2xl border border-[var(--booking-border)] bg-[var(--booking-border)]">
              <div className="grid min-w-[860px] grid-cols-7 gap-px overflow-x-auto">
                {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((day) => (
                  <div className="bg-[var(--booking-soft)] p-4 text-center text-xs font-semibold text-[var(--booking-muted)]" key={day}>{day}</div>
                ))}
                {dashboardData.calendarDays.map((day) => (
                  <div className={`min-h-[132px] bg-white p-3 ${day.isToday ? "booking-active-day" : ""}`} key={day.key}>
                    <p className={`text-base ${!day.inCurrentMonth ? "text-[rgba(106,106,106,0.5)]" : day.isToday ? "font-bold text-[var(--booking-brand)]" : "text-[var(--booking-text)]"}`}>{day.day}</p>
                    <div className="mt-3 space-y-1.5">
                      {dashboardData.events.filter((event) => event.day === day.day && day.inCurrentMonth).map((event) => (
                        <div className={`truncate rounded px-2 py-1.5 text-[11px] font-semibold text-white ${event.tone === "green" ? "bg-[var(--booking-green)]" : "bg-[var(--booking-brand)]"}`} key={event.id}>{event.title}</div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>

        <aside className="space-y-5">
          <div className="rounded-3xl border border-[var(--booking-border)] bg-[#222] p-7 text-white">
            <Icon className="h-8 w-8 text-white/70" name="calendar" />
            <h2 className="mt-5 text-xl font-semibold tracking-[-0.04em]">Today&apos;s rhythm</h2>
            <p className="mt-2 text-sm leading-6 text-white/65">Schedule data now comes from Prisma bookings, so the calendar reflects real room reservations and cancellations.</p>
          </div>

          <div className="rounded-3xl border border-[var(--booking-border)] bg-white p-7 shadow-sm">
            <h2 className="text-xl font-semibold tracking-[-0.04em]">Upcoming</h2>
            <div className="mt-5 space-y-4">
              {dashboardData.bookings.map((booking) => (
                <div className="rounded-2xl border border-[var(--booking-border)] p-4" key={booking.id}>
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold">{booking.title}</p>
                    <span className="rounded-full bg-rose-50 px-2.5 py-1 text-xs font-bold text-[var(--booking-brand)]">{booking.roomName}</span>
                  </div>
                  <p className="mt-2 text-sm text-[var(--booking-muted)]">{booking.date} - {booking.time}</p>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </section>

      <div className="booking-orb booking-orb-red" />
      <div className="booking-orb booking-orb-green" />
    </main>
  );
}
