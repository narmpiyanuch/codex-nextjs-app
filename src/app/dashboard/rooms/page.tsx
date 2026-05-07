import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { BookingTopNavigation } from "@/components/dashboard/booking-top-navigation";
import { Icon } from "@/components/dashboard/icons";
import { getDashboardData } from "@/lib/booking";
import type { Room, RoomAvailability } from "@/lib/dashboard-data";

const availabilityLabel = {
  available: "Available now",
  busy: "In use",
  soon: "Opening soon",
};

const availabilityClass = {
  available: "bg-emerald-50 text-emerald-700",
  busy: "bg-rose-50 text-[var(--booking-brand)]",
  soon: "bg-amber-50 text-amber-700",
};

const filters = [
  { href: "/dashboard/rooms", label: "All rooms" },
  { href: "/dashboard/rooms?availability=available", label: "Available now" },
  { href: "/dashboard/rooms?capacity=8", label: "8+ people" },
  { href: "/dashboard/rooms?q=video", label: "Video ready" },
  { href: "/dashboard/rooms?q=floor", label: "High floor" },
];

export default async function RoomsPage({
  searchParams,
}: {
  searchParams: Promise<{ availability?: string; capacity?: string; q?: string }>;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const query = await searchParams;
  const dashboardData = await getDashboardData(session.user.id);
  const filteredRooms = filterRooms(dashboardData.rooms, query);
  const displayName = session.user.name || session.user.email || "Reserve teammate";

  return (
    <main className="booking-shell min-h-screen bg-white text-[var(--booking-text)]">
      <BookingTopNavigation active="rooms" signedInName={displayName} />

      <section className="booking-canvas mx-auto flex w-full max-w-[1280px] flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid gap-6 lg:grid-cols-[1fr_360px] lg:items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-[var(--booking-brand)]">Find a Room</p>
            <h1 className="mt-3 max-w-3xl text-5xl font-semibold tracking-[-0.06em] sm:text-6xl">Choose the right space before the calendar fills up.</h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-[var(--booking-muted)]">Browse spaces by capacity, atmosphere, and availability. This is the next step after the main dashboard in the booking flow.</p>
          </div>
          <div className="rounded-3xl border border-[var(--booking-border)] bg-[var(--booking-alert)] p-6">
            <div className="flex items-center gap-3">
              <Icon className="h-7 w-7 text-[var(--booking-brand)]" name="sparkles" />
              <div>
                <p className="font-semibold">Smart match</p>
                <p className="text-sm text-[var(--booking-muted)]">Best fit: The Glass Pavilion for 8-12 people.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 rounded-3xl border border-[var(--booking-border)] bg-[var(--booking-soft)] p-3">
          {filters.map((filter) => (
            <Link className={`rounded-full px-4 py-2 text-sm font-semibold ${isActiveFilter(filter.href, query) ? "bg-white text-[var(--booking-text)] shadow-sm" : "text-[var(--booking-muted)]"}`} href={filter.href} key={filter.href}>
              {filter.label}
            </Link>
          ))}
        </div>

        <form action="/dashboard/rooms" className="grid gap-3 rounded-3xl border border-[var(--booking-border)] bg-white p-4 shadow-sm sm:grid-cols-[1fr_auto]">
          <input
            className="booking-input"
            defaultValue={query.q ?? ""}
            name="q"
            placeholder="Search by room, equipment, or floor..."
          />
          <button className="booking-primary-button rounded-xl px-8 py-3" type="submit">
            Search Rooms
          </button>
        </form>

        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {filteredRooms.map((room) => (
            <article className="overflow-hidden rounded-3xl border border-[var(--booking-border)] bg-white shadow-sm" key={room.id}>
              <div className={`booking-room-hero booking-room-hero-${room.image}`} />
              <div className="space-y-5 p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold tracking-[-0.04em]">{room.name}</h2>
                    <p className="mt-1 text-sm text-[var(--booking-muted)]">{room.floor} - Up to {room.capacity} people</p>
                  </div>
                  <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${availabilityClass[room.availability]}`}>{availabilityLabel[room.availability]}</span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {room.amenities.map((amenity) => (
                    <span className="rounded-full bg-[var(--booking-soft)] px-3 py-1 text-xs font-semibold text-[var(--booking-muted)]" key={amenity}>{amenity}</span>
                  ))}
                </div>

                <div className="flex items-center justify-between border-t border-[var(--booking-border)] pt-5">
                  <p className="text-sm font-semibold text-[var(--booking-muted)]">{room.nextSlot}</p>
                  <Link className="inline-flex items-center gap-1 text-sm font-bold text-[var(--booking-brand)]" href="/dashboard">
                    Book
                    <Icon className="h-3.5 w-3.5" name="chevronRight" />
                  </Link>
                </div>
              </div>
            </article>
          ))}
          {filteredRooms.length === 0 ? (
            <div className="rounded-3xl border border-[var(--booking-border)] bg-white p-8 text-center shadow-sm md:col-span-2 xl:col-span-4">
              <Icon className="mx-auto h-10 w-10 text-[var(--booking-brand)]" name="filter" />
              <h2 className="mt-4 text-xl font-semibold tracking-[-0.04em]">No rooms match those filters</h2>
              <p className="mt-2 text-sm text-[var(--booking-muted)]">Try another capacity, availability, or search term.</p>
            </div>
          ) : null}
        </section>
      </section>

      <div className="booking-orb booking-orb-red" />
      <div className="booking-orb booking-orb-green" />
    </main>
  );
}

function isActiveFilter(
  href: string,
  query: { availability?: string; capacity?: string; q?: string },
) {
  if (href === "/dashboard/rooms") {
    return !query.availability && !query.capacity && !query.q;
  }

  const params = new URLSearchParams(href.split("?")[1] ?? "");
  return (
    (!params.get("availability") || params.get("availability") === query.availability) &&
    (!params.get("capacity") || params.get("capacity") === query.capacity) &&
    (!params.get("q") || params.get("q") === query.q)
  );
}

function filterRooms(
  rooms: Room[],
  query: { availability?: string; capacity?: string; q?: string },
) {
  const capacity = Number(query.capacity ?? 0);
  const search = query.q?.trim().toLowerCase();

  return rooms.filter((room) => {
    const matchesAvailability =
      !query.availability || room.availability === (query.availability as RoomAvailability);
    const matchesCapacity = !capacity || room.capacity >= capacity;
    const matchesSearch =
      !search ||
      [room.name, room.floor, room.nextSlot, ...room.amenities]
        .join(" ")
        .toLowerCase()
        .includes(search);

    return matchesAvailability && matchesCapacity && matchesSearch;
  });
}
