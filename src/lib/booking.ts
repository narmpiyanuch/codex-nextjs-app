import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import type {
  Booking,
  BookingAccent,
  CalendarDay,
  CalendarEvent,
  DashboardData,
  Room,
  RoomAvailability,
  RoomImage,
  RoomOption,
} from "@/lib/dashboard-data";
import { fallbackRecentActivities } from "@/lib/dashboard-data";
import { bookingInputSchema } from "@/lib/validations/booking";

const demoRooms = [
  {
    slug: "glass-pavilion",
    name: "The Glass Pavilion",
    capacity: 12,
    floor: "Floor 14",
    amenities: ["Video wall", "Auto shades", "Whiteboard"],
    image: "city" as const,
  },
  {
    slug: "executive-suite",
    name: "Executive Suite",
    capacity: 10,
    floor: "Floor 20",
    amenities: ["Private lounge", "Catering", "City view"],
    image: "suite" as const,
  },
  {
    slug: "workshop-02",
    name: "Workshop 02",
    capacity: 16,
    floor: "Floor 8",
    amenities: ["Moveable walls", "Sticky wall", "Hybrid kit"],
    image: "workshop" as const,
  },
  {
    slug: "sky-lounge",
    name: "Sky Lounge",
    capacity: 8,
    floor: "Floor 18",
    amenities: ["Soft seating", "Display", "Coffee bar"],
    image: "city" as const,
  },
];

const demoBookings = [
  {
    title: "Product Roadmap",
    roomSlug: "sky-lounge",
    startAt: new Date("2026-05-12T10:00:00.000Z"),
    endAt: new Date("2026-05-12T11:30:00.000Z"),
    invitees: ["Maya Chen", "Noah Kim"],
  },
  {
    title: "Q4 Strategy Review",
    roomSlug: "executive-suite",
    startAt: new Date("2026-05-13T14:00:00.000Z"),
    endAt: new Date("2026-05-13T15:00:00.000Z"),
    invitees: ["HR Team"],
  },
  {
    title: "Design Sprint",
    roomSlug: "workshop-02",
    startAt: new Date("2026-05-14T11:15:00.000Z"),
    endAt: new Date("2026-05-14T12:15:00.000Z"),
    invitees: ["Design Guild"],
  },
];

const today = new Date("2026-05-07T00:00:00.000Z");
const todayISO = "2026-05-07";

const bookingInclude = {
  invitees: true,
  room: true,
} as const;

export async function getDashboardData(userId: string, month?: string): Promise<DashboardData> {
  await ensureRooms();
  await ensureDemoBookings(userId);

  const [rooms, bookings] = await Promise.all([
    prisma.room.findMany({ orderBy: { capacity: "desc" } }),
    prisma.booking.findMany({
      include: bookingInclude,
      orderBy: { startAt: "asc" },
      where: {
        status: "CONFIRMED",
        userId,
      },
    }),
  ]);

  const viewBookings = bookings.map(formatBooking);
  const monthDate = getMonthDate(viewBookings, month);
  const monthKey = formatMonthKey(monthDate);
  const calendarBookings = viewBookings.filter((booking) => booking.dateISO.startsWith(monthKey));

  return {
    bookings: viewBookings,
    calendarDays: buildCalendarDays(monthDate),
    events: calendarBookings.map(formatCalendarEvent),
    monthLabel: formatMonthLabel(monthDate),
    nextMonth: shiftMonth(monthDate, 1),
    previousMonth: shiftMonth(monthDate, -1),
    recentActivities: buildRecentActivities(viewBookings),
    roomOptions: rooms.map(formatRoomOption),
    rooms: rooms.map((room) => formatRoom(room, bookings)),
    todayISO,
  };
}

export async function createBooking(input: {
  userId: string;
  title: string;
  roomId: string;
  date: string;
  startTime: string;
  endTime: string;
  invitees: string[];
}) {
  const parsed = bookingInputSchema.safeParse({ ...input, todayISO });

  if (!parsed.success) {
    return {
      ok: false as const,
      message: parsed.error.issues[0]?.message ?? "Invalid booking details.",
    };
  }

  const startAt = new Date(`${parsed.data.date}T${parsed.data.startTime}:00.000Z`);
  const endAt = new Date(`${parsed.data.date}T${parsed.data.endTime}:00.000Z`);

  const conflict = await prisma.booking.findFirst({
    where: {
      roomId: parsed.data.roomId,
      status: "CONFIRMED",
      startAt: { lt: endAt },
      endAt: { gt: startAt },
    },
  });

  if (conflict) {
    return { ok: false as const, message: "This room is already booked during that time." };
  }

  const booking = await prisma.booking.create({
    data: {
      title: parsed.data.title,
      startAt,
      endAt,
      roomId: parsed.data.roomId,
      userId: input.userId,
      invitees: {
        create: parsed.data.invitees
          .map((name) => name.trim())
          .filter(Boolean)
          .map((name) => ({ name })),
      },
    },
    include: bookingInclude,
  });

  return { ok: true as const, booking: formatBooking(booking) };
}

export async function updateBooking(input: {
  bookingId: string;
  userId: string;
  title: string;
  roomId: string;
  date: string;
  startTime: string;
  endTime: string;
  invitees: string[];
}) {
  const parsed = bookingInputSchema.safeParse({ ...input, todayISO });

  if (!parsed.success) {
    return {
      ok: false as const,
      message: parsed.error.issues[0]?.message ?? "Invalid booking details.",
    };
  }

  const existingBooking = await prisma.booking.findFirst({
    where: {
      id: input.bookingId,
      userId: input.userId,
    },
  });

  if (!existingBooking) {
    return { ok: false as const, message: "Booking not found." };
  }

  if (existingBooking.startAt <= today) {
    return { ok: false as const, message: "Only future bookings can be edited." };
  }

  const startAt = new Date(`${parsed.data.date}T${parsed.data.startTime}:00.000Z`);
  const endAt = new Date(`${parsed.data.date}T${parsed.data.endTime}:00.000Z`);

  const conflict = await prisma.booking.findFirst({
    where: {
      id: { not: input.bookingId },
      roomId: parsed.data.roomId,
      status: "CONFIRMED",
      startAt: { lt: endAt },
      endAt: { gt: startAt },
    },
  });

  if (conflict) {
    return { ok: false as const, message: "This room is already booked during that time." };
  }

  const booking = await prisma.booking.update({
    data: {
      title: parsed.data.title,
      startAt,
      endAt,
      roomId: parsed.data.roomId,
      invitees: {
        deleteMany: {},
        create: parsed.data.invitees
          .map((name) => name.trim())
          .filter(Boolean)
          .map((name) => ({ name })),
      },
    },
    include: bookingInclude,
    where: { id: input.bookingId },
  });

  return { ok: true as const, booking: formatBooking(booking) };
}

export async function cancelBooking(input: { bookingId: string; userId: string }) {
  const booking = await prisma.booking.findFirst({
    include: bookingInclude,
    where: {
      id: input.bookingId,
      userId: input.userId,
    },
  });

  if (!booking) {
    return { ok: false as const, message: "Booking not found." };
  }

  if (booking.startAt <= today) {
    return { ok: false as const, message: "Only future bookings can be cancelled." };
  }

  await prisma.booking.update({
    data: { status: "CANCELLED" },
    where: { id: booking.id },
  });

  return { ok: true as const, bookingId: booking.id };
}

export function canCancelBooking(booking: Booking, todayISO: string) {
  return booking.status === "CONFIRMED" && booking.dateISO > todayISO;
}

function ensureRooms() {
  return prisma.$transaction(
    demoRooms.map((room) =>
      prisma.room.upsert({
        create: {
          slug: room.slug,
          name: room.name,
          capacity: room.capacity,
          floor: room.floor,
          amenities: JSON.stringify(room.amenities),
          image: room.image,
        },
        update: {
          name: room.name,
          capacity: room.capacity,
          floor: room.floor,
          amenities: JSON.stringify(room.amenities),
          image: room.image,
        },
        where: { slug: room.slug },
      }),
    ),
  );
}

async function ensureDemoBookings(userId: string) {
  const existingCount = await prisma.booking.count({ where: { userId } });

  if (existingCount > 0) {
    return;
  }

  const rooms = await prisma.room.findMany();
  const roomBySlug = new Map(rooms.map((room) => [room.slug, room]));

  await prisma.$transaction(
    demoBookings.flatMap((booking) => {
      const room = roomBySlug.get(booking.roomSlug);

      if (!room) {
        return [];
      }

      return prisma.booking.create({
        data: {
          title: booking.title,
          startAt: booking.startAt,
          endAt: booking.endAt,
          roomId: room.id,
          userId,
          invitees: {
            create: booking.invitees.map((name) => ({ name })),
          },
        },
      });
    }),
  );
}

type BookingWithRelations = Prisma.BookingGetPayload<{ include: typeof bookingInclude }>;

function formatBooking(booking: BookingWithRelations): Booking {
  return {
    id: booking.id,
    roomId: booking.room.id,
    roomName: booking.room.name,
    roomImage: coerceRoomImage(booking.room.image),
    date: formatDate(booking.startAt),
    dateISO: toISODate(booking.startAt),
    endTime: formatInputTime(booking.endAt),
    startTime: formatInputTime(booking.startAt),
    time: `${formatTime(booking.startAt)} - ${formatTime(booking.endAt)}`,
    title: booking.title,
    status: booking.status === "CANCELLED" ? "CANCELLED" : "CONFIRMED",
    actionLabel: booking.status === "CANCELLED" ? "Cancelled" : "Organized by you",
    accent: getBookingAccent(booking.room.image),
    invitees: booking.invitees.map((invitee) => invitee.name),
  };
}

function formatRoomOption(room: { id: string; name: string; capacity: number }) {
  return {
    id: room.id,
    label: `${room.name} (Capacity: ${room.capacity})`,
  } satisfies RoomOption;
}

function formatRoom(
  room: { id: string; name: string; capacity: number; floor: string; amenities: string; image: string },
  bookings: Array<{ roomId: string; startAt: Date; endAt: Date }>,
): Room {
  const nextBooking = bookings.find((booking) => booking.roomId === room.id && booking.endAt > today);
  const availability = getRoomAvailability(nextBooking?.startAt);

  return {
    id: room.id,
    name: room.name,
    capacity: room.capacity,
    floor: room.floor,
    amenities: parseAmenities(room.amenities),
    availability,
    nextSlot: getNextSlot(availability, nextBooking?.startAt),
    image: coerceRoomImage(room.image),
  };
}

function formatCalendarEvent(booking: Booking): CalendarEvent {
  return {
    id: `${booking.id}-event`,
    bookingId: booking.id,
    day: Number(booking.dateISO.slice(-2)),
    title: booking.title,
    tone: booking.accent === "green" ? "green" : "red",
  };
}

function buildCalendarDays(monthDate: Date): CalendarDay[] {
  const year = monthDate.getUTCFullYear();
  const month = monthDate.getUTCMonth();
  const firstOfMonth = new Date(Date.UTC(year, month, 1));
  const start = new Date(firstOfMonth);
  start.setUTCDate(firstOfMonth.getUTCDate() - firstOfMonth.getUTCDay());

  return Array.from({ length: 35 }, (_, index) => {
    const date = new Date(start);
    date.setUTCDate(start.getUTCDate() + index);
    const dateISO = toISODate(date);

    return {
      key: dateISO,
      day: date.getUTCDate(),
      dateISO,
      inCurrentMonth: date.getUTCMonth() === month,
      isToday: dateISO === toISODate(today),
    };
  });
}

function buildRecentActivities(bookings: Booking[]) {
  if (bookings.length === 0) {
    return fallbackRecentActivities;
  }

  return bookings.slice(0, 2).map((booking, index) => ({
    id: `activity-${booking.id}`,
    label: `${booking.title} booked for ${booking.time.split(" - ")[0]}`,
    tone: index === 0 ? ("green" as const) : ("pink" as const),
  }));
}

function getMonthDate(bookings: Booking[], month?: string) {
  if (month && /^\d{4}-\d{2}$/.test(month)) {
    return new Date(`${month}-01T00:00:00.000Z`);
  }

  const firstBooking = bookings[0];
  return firstBooking ? new Date(`${firstBooking.dateISO}T00:00:00.000Z`) : today;
}

function getRoomAvailability(nextBookingStart?: Date): RoomAvailability {
  if (!nextBookingStart) {
    return "available";
  }

  const minutesUntil = (nextBookingStart.getTime() - today.getTime()) / 60000;

  if (minutesUntil <= 60) {
    return "soon";
  }

  return "busy";
}

function getNextSlot(availability: RoomAvailability, nextBookingStart?: Date) {
  if (availability === "available" || !nextBookingStart) {
    return "Available now";
  }

  if (availability === "soon") {
    return "Booked within the next hour";
  }

  return `Busy from ${formatTime(nextBookingStart)}`;
}

function getBookingAccent(roomImage: string): BookingAccent {
  if (roomImage === "workshop") {
    return "green";
  }

  if (roomImage === "suite") {
    return "pink";
  }

  return "red";
}

function coerceRoomImage(image: string): RoomImage {
  return image === "suite" || image === "workshop" ? image : "city";
}

function parseAmenities(value: string) {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

function formatMonthLabel(date: Date) {
  return new Intl.DateTimeFormat("en-US", { month: "long", timeZone: "UTC", year: "numeric" }).format(date);
}

function formatMonthKey(date: Date) {
  return date.toISOString().slice(0, 7);
}

function shiftMonth(date: Date, amount: number) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + amount, 1)).toISOString().slice(0, 7);
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", { day: "numeric", month: "short", timeZone: "UTC", year: "numeric" }).format(date);
}

function formatTime(date: Date) {
  return new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", timeZone: "UTC" }).format(date);
}

function formatInputTime(date: Date) {
  return date.toISOString().slice(11, 16);
}

function toISODate(date: Date) {
  return date.toISOString().slice(0, 10);
}
