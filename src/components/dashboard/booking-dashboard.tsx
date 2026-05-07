"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cancelBookingAction, createBookingAction, updateBookingAction } from "@/app/dashboard/actions";
import { BookingTopNavigation } from "@/components/dashboard/booking-top-navigation";
import { Icon } from "@/components/dashboard/icons";
import type { Booking, CalendarDay, CalendarEvent, DashboardData } from "@/lib/dashboard-data";
import { collaboratorOptions } from "@/lib/dashboard-data";

type ViewMode = "list" | "calendar";

type BookingDashboardProps = {
  userName: string;
  userEmail: string;
};

type BookingDraft = {
  title: string;
  roomId: string;
  date: string;
  startTime: string;
  endTime: string;
  guestNames: string[];
};

function getDefaultDraft(dashboardData: DashboardData): BookingDraft {
  return {
    title: "Weekly Sync with Design Team",
    roomId: dashboardData.roomOptions[0]?.id ?? "",
    date: dashboardData.todayISO,
    startTime: "10:00",
    endTime: "11:00",
    guestNames: ["Maya Chen", "Noah Kim"],
  };
}

export function BookingDashboard({
  dashboardData,
  userName,
  userEmail,
}: BookingDashboardProps & { dashboardData: DashboardData }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [draft, setDraft] = useState<BookingDraft>(() => getDefaultDraft(dashboardData));
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [cancelTarget, setCancelTarget] = useState<Booking | null>(null);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);

  const displayName = userName || userEmail || "Reserve teammate";
  const hasConflict = hasDraftConflict(draft, dashboardData.bookings);

  const nextBooking = useMemo(() => dashboardData.bookings[0], [dashboardData.bookings]);

  function updateDraft<K extends keyof BookingDraft>(field: K, value: BookingDraft[K]) {
    setDraft((current) => ({ ...current, [field]: value }));
  }

  function createBooking() {
    setActionError(null);
    setActionMessage(null);
    startTransition(async () => {
      const result = await createBookingAction({
        title: draft.title,
        roomId: draft.roomId,
        date: draft.date,
        startTime: draft.startTime,
        endTime: draft.endTime,
        invitees: draft.guestNames,
      });

      if (result.error) {
        setActionError(result.error);
        return;
      }

      setIsModalOpen(false);
      setDraft(getDefaultDraft(dashboardData));
      setActionMessage("Booking created successfully.");
      router.refresh();
    });
  }

  function requestCancel(booking: Booking) {
    if (!canCancelBooking(booking, dashboardData.todayISO)) {
      return;
    }

    setCancelTarget(booking);
    setActionError(null);
    setActionMessage(null);
  }

  function requestEdit(booking: Booking) {
    setSelectedBooking(null);
    setCancelTarget(null);
    setActionError(null);
    setActionMessage(null);
    setDraft({
      title: booking.title,
      roomId: booking.roomId,
      date: booking.dateISO,
      startTime: booking.startTime,
      endTime: booking.endTime,
      guestNames: booking.invitees,
    });
    setEditingBooking(booking);
    setIsModalOpen(true);
  }

  function submitBooking() {
    if (editingBooking) {
      updateExistingBooking(editingBooking.id);
      return;
    }

    createBooking();
  }

  function updateExistingBooking(bookingId: string) {
    setActionError(null);
    setActionMessage(null);
    startTransition(async () => {
      const result = await updateBookingAction({
        bookingId,
        title: draft.title,
        roomId: draft.roomId,
        date: draft.date,
        startTime: draft.startTime,
        endTime: draft.endTime,
        invitees: draft.guestNames,
      });

      if (result.error) {
        setActionError(result.error);
        return;
      }

      setEditingBooking(null);
      setIsModalOpen(false);
      setDraft(getDefaultDraft(dashboardData));
      setActionMessage("Booking updated successfully.");
      router.refresh();
    });
  }

  function confirmCancel() {
    if (!cancelTarget) {
      return;
    }

    setActionError(null);
    setActionMessage(null);
    startTransition(async () => {
      const result = await cancelBookingAction(cancelTarget.id);

      if (result.error) {
        setActionError(result.error);
        return;
      }

      if (selectedBooking?.id === cancelTarget.id) {
        setSelectedBooking(null);
      }
      setCancelTarget(null);
      setActionMessage("Booking cancelled successfully.");
      router.refresh();
    });
  }

  return (
    <main className="booking-shell min-h-screen bg-white text-[var(--booking-text)]">
      <BookingTopNavigation active="bookings" onCreateBooking={() => setIsModalOpen(true)} signedInName={displayName} />

      <section className="booking-canvas mx-auto flex w-full max-w-[1280px] flex-col gap-12 px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-4">
            <ViewSwitcher viewMode={viewMode} onChange={setViewMode} />
            <button className="booking-primary-button rounded-xl px-8 py-3.5" onClick={() => setIsModalOpen(true)} type="button">
              <Icon name="plus" />
              Book a Room
            </button>
          </div>
        </div>

        {actionMessage ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-semibold text-emerald-700">
            {actionMessage}
          </div>
        ) : null}

        <section className="grid gap-4 lg:grid-cols-12">
          <FeaturedRoom />
          <aside className="grid gap-4 lg:col-span-4">
            <SmartBookingCard />
            <RecentActivityCard activities={dashboardData.recentActivities} />
          </aside>
        </section>

        <UpcomingBookingsTable
          bookings={dashboardData.bookings}
          todayISO={dashboardData.todayISO}
          onCancelBooking={requestCancel}
          onViewBooking={setSelectedBooking}
        />
        <BookingCalendar
          bookings={dashboardData.bookings}
          calendarDays={dashboardData.calendarDays}
          calendarBasePath="/dashboard"
          events={dashboardData.events}
          activeView={viewMode}
          monthLabel={dashboardData.monthLabel}
          nextMonth={dashboardData.nextMonth}
          nextBookingTitle={nextBooking?.title ?? "No bookings yet"}
          onViewBooking={setSelectedBooking}
          previousMonth={dashboardData.previousMonth}
        />
      </section>

      <div className="booking-orb booking-orb-red" />
      <div className="booking-orb booking-orb-green" />

      {isModalOpen ? (
        <CreateBookingModal
          draft={draft}
          actionError={actionError}
          hasConflict={hasConflict}
          isPending={isPending}
          mode={editingBooking ? "edit" : "create"}
          roomOptions={dashboardData.roomOptions}
          onChange={updateDraft}
          onClose={() => {
            setEditingBooking(null);
            setIsModalOpen(false);
            setDraft(getDefaultDraft(dashboardData));
          }}
          onSubmit={submitBooking}
        />
      ) : null}

      {selectedBooking ? (
        <BookingInformationModal
          booking={selectedBooking}
          todayISO={dashboardData.todayISO}
          onCancelBooking={requestCancel}
          onEditBooking={requestEdit}
          onClose={() => setSelectedBooking(null)}
        />
      ) : null}

      {cancelTarget ? (
        <CancelBookingModal
          booking={cancelTarget}
          actionError={actionError}
          onClose={() => setCancelTarget(null)}
          isPending={isPending}
          onConfirm={confirmCancel}
        />
      ) : null}
    </main>
  );
}

function ViewSwitcher({ viewMode, onChange }: { viewMode: ViewMode; onChange: (mode: ViewMode) => void }) {
  return (
    <div aria-label="View mode" className="inline-flex rounded-xl border border-[var(--booking-border)] bg-[var(--booking-soft)] p-1" role="group">
      {(["list", "calendar"] as const).map((mode) => (
        <button
          aria-pressed={viewMode === mode}
          className={`booking-switch-button ${viewMode === mode ? "booking-switch-button-active" : ""}`}
          key={mode}
          onClick={() => onChange(mode)}
          type="button"
        >
          <Icon name={mode === "list" ? "list" : "calendar"} />
          {mode === "list" ? "List" : "Calendar"}
        </button>
      ))}
    </div>
  );
}

function FeaturedRoom() {
  return (
    <article className="booking-feature-card relative min-h-[320px] overflow-hidden rounded-3xl border border-[var(--booking-border)] lg:col-span-8 lg:min-h-[400px]" id="rooms">
      <div className="booking-room-image absolute inset-0" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
      <div className="absolute bottom-8 left-8 max-w-sm text-white">
        <p className="inline-flex rounded-full bg-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.05em] backdrop-blur-md">Available Now</p>
        <h1 className="mt-3 text-2xl font-semibold tracking-[-0.04em]">The Glass Pavilion</h1>
        <p className="mt-1 text-sm text-white/90">Up to 12 people - Floor 14 - Tech-enabled</p>
      </div>
    </article>
  );
}

function SmartBookingCard() {
  return (
    <article className="flex min-h-[192px] flex-col justify-between rounded-3xl border border-[var(--booking-border)] bg-[var(--booking-alert)] p-8">
      <div>
        <Icon className="h-8 w-8 text-[var(--booking-brand)]" name="sparkles" />
        <h2 className="mt-3 font-semibold">Smart Booking</h2>
        <p className="mt-2 max-w-sm text-sm leading-5 text-[var(--booking-muted)]">Our AI suggests the best room based on your team&apos;s usual preferences and group size.</p>
      </div>
      <button className="mt-4 inline-flex items-center gap-1 text-left text-sm font-semibold text-[var(--booking-brand)]" type="button">
        Try AI Assistant
        <Icon className="h-3.5 w-3.5" name="chevronRight" />
      </button>
    </article>
  );
}

function RecentActivityCard({ activities }: { activities: DashboardData["recentActivities"] }) {
  return (
    <article className="relative min-h-[182px] overflow-hidden rounded-3xl bg-[#222] p-8 text-white">
      <Icon className="absolute -bottom-8 -right-5 h-36 w-36 rotate-12 text-white/10" name="history" />
      <h2 className="font-semibold">Recent Activity</h2>
      <div className="mt-4 space-y-3">
        {activities.map((activity) => (
          <div className="flex items-center gap-3 text-xs font-semibold text-white/80" key={activity.id}>
            <span className={`h-2 w-2 rounded-full ${activity.tone === "green" ? "bg-[#008a05]" : "bg-[#ffb2b6]"}`} />
            {activity.label}
          </div>
        ))}
      </div>
    </article>
  );
}

function UpcomingBookingsTable({
  bookings,
  todayISO,
  onCancelBooking,
  onViewBooking,
}: {
  bookings: Booking[];
  todayISO: string;
  onCancelBooking: (booking: Booking) => void;
  onViewBooking: (booking: Booking) => void;
}) {
  return (
    <section className="overflow-hidden rounded-3xl border border-[var(--booking-border)] bg-white shadow-sm" id="bookings">
      <div className="flex items-center justify-between border-b border-[var(--booking-border)] px-5 py-6 sm:px-8">
        <h2 className="text-[22px] font-semibold tracking-[-0.04em]">Upcoming Bookings</h2>
        <button className="inline-flex items-center gap-2 text-sm text-[var(--booking-muted)]" type="button">
          <Icon className="h-4 w-4" name="filter" />
          Filter by Room
        </button>
      </div>

      <div className="overflow-x-auto">
        {bookings.length > 0 ? (
          <table className="w-full min-w-[820px] border-collapse text-left">
            <thead className="bg-[rgba(247,247,247,0.5)] text-xs uppercase text-[var(--booking-muted)]">
              <tr>
                <th className="px-8 py-4 font-semibold">Room Name</th>
                <th className="px-8 py-4 font-semibold">Date</th>
                <th className="px-8 py-4 font-semibold">Time</th>
                <th className="px-8 py-4 font-semibold">Booking Title</th>
                <th className="px-8 py-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr className="border-t border-[var(--booking-border)]" key={booking.id}>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <span className={`booking-room-thumb booking-room-thumb-${booking.roomImage}`} />
                      <span className="font-semibold">{booking.roomName}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-sm">{booking.date}</td>
                  <td className="px-8 py-6 text-sm">{booking.time}</td>
                  <td className="px-8 py-6"><BookingBadge accent={booking.accent}>{booking.title}</BookingBadge></td>
                  <td className="px-8 py-6">
                    <div className="flex justify-end gap-3">
                      <button
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--booking-text)] hover:text-[var(--booking-brand)]"
                        onClick={() => onViewBooking(booking)}
                        type="button"
                      >
                        <Icon className="h-4 w-4" name="eye" />
                        View
                      </button>
                      {canCancelBooking(booking, todayISO) ? (
                        <button
                          className="text-sm font-semibold text-[var(--booking-brand)]"
                          onClick={() => onCancelBooking(booking)}
                          type="button"
                        >
                          Cancel
                        </button>
                      ) : (
                        <span className="text-sm text-[var(--booking-muted)]">{booking.actionLabel}</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="px-8 py-14 text-center">
            <Icon className="mx-auto h-10 w-10 text-[var(--booking-brand)]" name="calendar" />
            <h3 className="mt-4 text-xl font-semibold tracking-[-0.04em]">No bookings yet</h3>
            <p className="mt-2 text-sm text-[var(--booking-muted)]">Create your first room booking and it will appear in this list and calendar.</p>
          </div>
        )}
      </div>

      <button className="w-full border-t border-[var(--booking-border)] py-4 text-sm text-[var(--booking-muted)]" type="button">View All Bookings</button>
    </section>
  );
}

function BookingBadge({ accent, children }: { accent: Booking["accent"]; children: React.ReactNode }) {
  const className = accent === "green" ? "bg-emerald-50 text-emerald-700" : accent === "pink" ? "bg-pink-100 text-[var(--booking-brand)]" : "bg-rose-50 text-[var(--booking-brand)]";
  return <span className={`rounded-full px-3 py-1 text-xs font-semibold ${className}`}>{children}</span>;
}

function BookingCalendar({
  calendarDays,
  calendarBasePath,
  events,
  bookings,
  activeView,
  monthLabel,
  nextMonth,
  nextBookingTitle,
  onViewBooking,
  previousMonth,
}: {
  calendarDays: CalendarDay[];
  calendarBasePath: string;
  events: CalendarEvent[];
  bookings: Booking[];
  activeView: ViewMode;
  monthLabel: string;
  nextMonth: string;
  nextBookingTitle: string;
  onViewBooking: (booking: Booking) => void;
  previousMonth: string;
}) {
  return (
    <section className="rounded-3xl border border-[var(--booking-border)] bg-white p-5 shadow-sm sm:p-8" id="schedule">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-[22px] font-semibold tracking-[-0.04em]">{monthLabel}</h2>
          <p className="mt-1 text-sm text-[var(--booking-muted)]">{activeView === "calendar" ? "Calendar view selected" : "Select a date to see availability"}</p>
        </div>
        <div className="flex gap-4">
          <Link aria-label="Previous month" className="booking-calendar-arrow" href={`${calendarBasePath}?month=${previousMonth}#schedule`}>
            <Icon name="chevronLeft" />
          </Link>
          <Link aria-label="Next month" className="booking-calendar-arrow" href={`${calendarBasePath}?month=${nextMonth}#schedule`}>
            <Icon name="chevronRight" />
          </Link>
        </div>
      </div>

      <div className="mt-8 overflow-hidden rounded-2xl border border-[var(--booking-border)] bg-[var(--booking-border)]">
        <div className="grid min-w-[760px] grid-cols-7 gap-px overflow-x-auto">
          {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((day) => (
            <div className="bg-[var(--booking-soft)] p-4 text-center text-xs font-semibold text-[var(--booking-muted)]" key={day}>{day}</div>
          ))}
          {calendarDays.map((day) => (
            <div className={`min-h-[120px] bg-white p-3 ${day.isToday ? "booking-active-day" : ""}`} key={day.key}>
              <p className={`text-base ${!day.inCurrentMonth ? "text-[rgba(106,106,106,0.5)]" : day.isToday ? "font-bold text-[var(--booking-brand)]" : "text-[var(--booking-text)]"}`}>{day.day}</p>
              <div className="mt-3 space-y-1">
                {events.filter((event) => event.day === day.day && day.inCurrentMonth).slice(0, 2).map((event) => {
                  const booking = bookings.find((item) => item.id === event.bookingId);

                  return (
                    <button
                      className={`w-full truncate rounded px-1 py-1 text-left text-[10px] text-white ${event.tone === "green" ? "bg-[var(--booking-green)]" : "bg-[var(--booking-brand)]"}`}
                      disabled={!booking}
                      key={event.id}
                      onClick={() => {
                        if (booking) {
                          onViewBooking(booking);
                        }
                      }}
                      type="button"
                    >
                      {event.title}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
      <p className="mt-4 text-sm text-[var(--booking-muted)]">Next booking: <span className="font-semibold text-[var(--booking-text)]">{nextBookingTitle}</span></p>
    </section>
  );
}

function CreateBookingModal({
  actionError,
  draft,
  hasConflict,
  isPending,
  mode,
  roomOptions,
  onChange,
  onClose,
  onSubmit,
}: {
  actionError: string | null;
  draft: BookingDraft;
  hasConflict: boolean;
  isPending: boolean;
  mode: "create" | "edit";
  roomOptions: DashboardData["roomOptions"];
  onChange: <K extends keyof BookingDraft>(field: K, value: BookingDraft[K]) => void;
  onClose: () => void;
  onSubmit: () => void;
}) {
  const [isInviteeOpen, setIsInviteeOpen] = useState(false);
  const selectedInvitees = draft.guestNames;

  function toggleInvitee(name: string) {
    const nextInvitees = selectedInvitees.includes(name)
      ? selectedInvitees.filter((invitee) => invitee !== name)
      : [...selectedInvitees, name];

    onChange("guestNames", nextInvitees);
  }

  function removeInvitee(name: string) {
    onChange("guestNames", selectedInvitees.filter((invitee) => invitee !== name));
  }

  return (
    <div aria-modal="true" className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/35 px-4 py-12 backdrop-blur-sm" role="dialog">
      <div className="w-full max-w-xl overflow-hidden rounded-[28px] bg-white shadow-2xl">
        <div className="grid grid-cols-[40px_1fr_40px] items-center border-b border-[var(--booking-border)] px-6 py-6">
          <button aria-label="Close modal" className="booking-modal-icon" onClick={onClose} type="button">
            <Icon name="close" />
          </button>
          <h2 className="text-center text-[22px] font-semibold tracking-[-0.04em]">{mode === "edit" ? "Edit Booking" : "Create Booking"}</h2>
          <span />
        </div>

        <div className="max-h-[68vh] overflow-y-auto px-6 py-8 sm:px-8">
          {hasConflict ? (
            <div className="mb-8 flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-900">
              <Icon className="mt-0.5 h-5 w-5 shrink-0" name="warning" />
              <div>
                <p className="font-semibold">Potential conflict</p>
                <p className="mt-1 text-sm leading-6">Studio A already has a booking around this time. You can still create it for this prototype, but production should block or suggest another room.</p>
              </div>
            </div>
          ) : null}

          {actionError ? (
            <div className="mb-8 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {actionError}
            </div>
          ) : null}

          <div className="grid gap-6">
            <FormField label="Meeting Title">
              <input className="booking-input" onChange={(event) => onChange("title", event.target.value)} value={draft.title} />
            </FormField>
            <FormField label="Select Room">
              <select className="booking-input" onChange={(event) => onChange("roomId", event.target.value)} value={draft.roomId}>
                {roomOptions.map((room) => <option key={room.id} value={room.id}>{room.label}</option>)}
              </select>
            </FormField>
            <div className="grid gap-6 sm:grid-cols-2">
              <FormField label="Date"><input className="booking-input" onChange={(event) => onChange("date", event.target.value)} type="date" value={draft.date} /></FormField>
              <FormField label="Start Time"><input className="booking-input" onChange={(event) => onChange("startTime", event.target.value)} type="time" value={draft.startTime} /></FormField>
              <FormField label="End Time"><input className="booking-input" onChange={(event) => onChange("endTime", event.target.value)} type="time" value={draft.endTime} /></FormField>
            </div>
            <FormField label="Invitees">
              <div className="relative">
                <button
                  aria-expanded={isInviteeOpen}
                  className="booking-input flex items-center justify-between gap-3 text-left"
                  onClick={() => setIsInviteeOpen((current) => !current)}
                  type="button"
                >
                  <span className={selectedInvitees.length ? "font-semibold text-[var(--booking-text)]" : "text-[var(--booking-muted)]"}>
                    {selectedInvitees.length ? `${selectedInvitees.length} invitee${selectedInvitees.length > 1 ? "s" : ""} selected` : "Select invitees"}
                  </span>
                  <span className="text-sm font-bold text-[var(--booking-brand)]">{isInviteeOpen ? "Hide" : "Choose"}</span>
                </button>

                {isInviteeOpen ? (
                  <div className="absolute left-0 right-0 top-[calc(100%+10px)] z-30 max-h-72 overflow-y-auto rounded-2xl border border-[var(--booking-border)] bg-white p-2 shadow-2xl">
                    {collaboratorOptions.map((person) => {
                      const isSelected = selectedInvitees.includes(person.name);

                      return (
                        <button
                          className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition ${isSelected ? "bg-[var(--booking-alert)]" : "hover:bg-[var(--booking-soft)]"}`}
                          key={person.email}
                          onClick={() => toggleInvitee(person.name)}
                          type="button"
                        >
                          <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${isSelected ? "bg-[var(--booking-brand)] text-white" : "bg-[var(--booking-soft)] text-[var(--booking-text)]"}`}>
                            {person.name.split(" ").map((part) => part[0]).join("")}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block font-semibold text-[var(--booking-text)]">{person.name}</span>
                            <span className="block truncate text-xs text-[var(--booking-muted)]">{person.role} - {person.email}</span>
                          </span>
                          <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border text-[10px] font-bold ${isSelected ? "border-[var(--booking-brand)] bg-[var(--booking-brand)] text-white" : "border-[var(--booking-border)] text-transparent"}`}>
                            OK
                          </span>
                        </button>
                      );
                    })}
                  </div>
                ) : null}

                <div className="mt-3 flex min-h-10 flex-wrap gap-2">
                  {selectedInvitees.length ? selectedInvitees.map((invitee) => (
                    <span className="flex items-center gap-2 rounded-full border border-[var(--booking-border)] bg-[var(--booking-soft)] px-3 py-2 text-sm font-semibold" key={invitee}>
                      {invitee}
                      <button aria-label={`Remove ${invitee}`} className="text-[var(--booking-muted)] hover:text-[var(--booking-brand)]" onClick={() => removeInvitee(invitee)} type="button">
                        x
                      </button>
                    </span>
                  )) : (
                    <span className="text-sm text-[var(--booking-muted)]">No invitees selected yet.</span>
                  )}
                </div>
              </div>
            </FormField>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-[var(--booking-border)] px-6 py-6 sm:px-8">
          <button className="rounded-xl border border-[var(--booking-border)] px-6 py-3 text-sm font-semibold" onClick={onClose} type="button">Cancel</button>
          <button className="booking-primary-button rounded-xl px-10 py-3 disabled:cursor-not-allowed disabled:opacity-60" disabled={isPending} onClick={onSubmit} type="button">
            <Icon name="plus" />
            {isPending ? (mode === "edit" ? "Saving..." : "Creating...") : mode === "edit" ? "Save Changes" : "Create Booking"}
          </button>
        </div>
      </div>
    </div>
  );
}

function BookingInformationModal({
  booking,
  todayISO,
  onCancelBooking,
  onEditBooking,
  onClose,
}: {
  booking: Booking;
  todayISO: string;
  onCancelBooking: (booking: Booking) => void;
  onEditBooking: (booking: Booking) => void;
  onClose: () => void;
}) {
  const canCancel = canCancelBooking(booking, todayISO);

  return (
    <div aria-modal="true" className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/35 px-4 py-12 backdrop-blur-sm" role="dialog">
      <div className="w-full max-w-2xl overflow-hidden rounded-[28px] bg-white shadow-2xl">
        <div className="relative min-h-48 overflow-hidden bg-[#222] p-8 text-white">
          <div className={`booking-room-hero booking-room-hero-${booking.roomImage} absolute inset-0 h-full opacity-45`} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/35 to-black/10" />
          <button aria-label="Close booking information" className="booking-modal-icon absolute right-6 top-6 z-10 bg-white/15 backdrop-blur-md hover:bg-white/25" onClick={onClose} type="button">
            <Icon name="close" />
          </button>
          <div className="relative z-10 max-w-lg">
            <BookingBadge accent={booking.accent}>{booking.status === "CANCELLED" ? "Cancelled" : "Upcoming"}</BookingBadge>
            <h2 className="mt-5 text-4xl font-semibold tracking-[-0.06em]">{booking.title}</h2>
            <p className="mt-3 text-sm text-white/80">{booking.roomName} - {booking.date} - {booking.time}</p>
          </div>
        </div>

        <div className="grid gap-6 px-6 py-8 sm:grid-cols-2 sm:px-8">
          <InfoTile label="Room" value={booking.roomName} />
          <InfoTile label="Booking Date" value={booking.date} />
          <InfoTile label="Time" value={booking.time} />
          <InfoTile label="Status" value={canCancel ? "Cancelable before start date" : booking.actionLabel} />
          <div className="rounded-2xl border border-[var(--booking-border)] bg-[var(--booking-alert)] p-5 sm:col-span-2">
            <div className="flex gap-3">
              <Icon className="mt-0.5 h-5 w-5 shrink-0 text-[var(--booking-brand)]" name="sparkles" />
              <div>
                <p className="font-semibold">Booking note</p>
                <p className="mt-1 text-sm leading-6 text-[var(--booking-muted)]">
                  This booking is part of the prototype flow. In the next backend phase this modal can load organizer, invitees, room equipment, and change history from Prisma.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-[var(--booking-border)] px-6 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <button className="rounded-xl border border-[var(--booking-border)] px-6 py-3 text-sm font-semibold" onClick={onClose} type="button">
            Close
          </button>
          <div className="flex flex-col gap-3 sm:flex-row">
            {canCancel ? (
              <button className="rounded-xl border border-[var(--booking-border)] px-6 py-3 text-sm font-semibold" onClick={() => onEditBooking(booking)} type="button">
                Edit Booking
              </button>
            ) : null}
            {canCancel ? (
              <button className="booking-danger-button rounded-xl px-6 py-3" onClick={() => onCancelBooking(booking)} type="button">
                Cancel Booking
              </button>
            ) : (
              <span className="text-sm font-semibold text-[var(--booking-muted)]">This booking cannot be cancelled from the prototype.</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function CancelBookingModal({
  actionError,
  booking,
  isPending,
  onClose,
  onConfirm,
}: {
  actionError: string | null;
  booking: Booking;
  isPending: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <div aria-modal="true" className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 px-4 py-8 backdrop-blur-sm" role="dialog">
      <div className="w-full max-w-md overflow-hidden rounded-[28px] bg-white shadow-2xl">
        <div className="bg-[var(--booking-alert)] px-7 py-7">
          <div className="flex items-start gap-4">
            <div className="rounded-full bg-white p-3 text-[var(--booking-brand)] shadow-sm">
              <Icon className="h-6 w-6" name="warning" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold tracking-[-0.05em]">Cancel this booking?</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--booking-muted)]">
                {booking.title} at {booking.roomName} is still before its booking date. Please confirm before removing it from the list and calendar.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4 px-7 py-6">
          {actionError ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {actionError}
            </div>
          ) : null}
          <InfoTile label="Booking" value={booking.title} />
          <InfoTile label="Date and time" value={`${booking.date} - ${booking.time}`} />
        </div>

        <div className="flex items-center justify-between border-t border-[var(--booking-border)] px-7 py-6">
          <button className="rounded-xl border border-[var(--booking-border)] px-5 py-3 text-sm font-semibold" onClick={onClose} type="button">
            Keep Booking
          </button>
          <button className="booking-danger-button rounded-xl px-5 py-3 disabled:cursor-not-allowed disabled:opacity-60" disabled={isPending} onClick={onConfirm} type="button">
            {isPending ? "Cancelling..." : "Confirm Cancel"}
          </button>
        </div>
      </div>
    </div>
  );
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[var(--booking-border)] bg-white p-5">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--booking-muted)]">{label}</p>
      <p className="mt-2 text-base font-semibold text-[var(--booking-text)]">{value}</p>
    </div>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-[var(--booking-text)]">
      {label}
      {children}
    </label>
  );
}

function canCancelBooking(booking: Booking, todayISO: string) {
  return booking.status === "CONFIRMED" && booking.dateISO > todayISO;
}

function hasDraftConflict(draft: BookingDraft, bookings: Booking[]) {
  return bookings.some((booking) => {
    if (
      booking.status !== "CONFIRMED" ||
      booking.roomId !== draft.roomId ||
      booking.dateISO !== draft.date
    ) {
      return false;
    }

    return draft.startTime < booking.endTime && draft.endTime > booking.startTime;
  });
}
