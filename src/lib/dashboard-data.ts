export type BookingStatus = "CONFIRMED" | "CANCELLED";
export type BookingAccent = "red" | "green" | "pink";
export type RoomImage = "city" | "suite" | "workshop";

export type Booking = {
  id: string;
  roomId: string;
  roomName: string;
  roomImage: RoomImage;
  date: string;
  dateISO: string;
  endTime: string;
  startTime: string;
  time: string;
  title: string;
  status: BookingStatus;
  actionLabel: string;
  accent: BookingAccent;
  invitees: string[];
};

export type Activity = {
  id: string;
  label: string;
  tone: "green" | "pink";
};

export type CalendarEvent = {
  id: string;
  bookingId: string;
  day: number;
  title: string;
  tone: "red" | "green";
};

export type CalendarDay = {
  key: string;
  day: number;
  dateISO: string;
  inCurrentMonth: boolean;
  isToday: boolean;
};

export type RoomAvailability = "available" | "busy" | "soon";

export type Room = {
  id: string;
  name: string;
  capacity: number;
  floor: string;
  amenities: string[];
  availability: RoomAvailability;
  nextSlot: string;
  image: RoomImage;
};

export type RoomOption = {
  id: string;
  label: string;
};

export type DashboardData = {
  bookings: Booking[];
  calendarDays: CalendarDay[];
  events: CalendarEvent[];
  monthLabel: string;
  nextMonth: string;
  previousMonth: string;
  recentActivities: Activity[];
  roomOptions: RoomOption[];
  rooms: Room[];
  todayISO: string;
};

export const collaboratorOptions = [
  { email: "maya.chen@example.com", name: "Maya Chen", role: "Design Lead" },
  { email: "noah.kim@example.com", name: "Noah Kim", role: "Product Manager" },
  { email: "aria.patel@example.com", name: "Aria Patel", role: "Engineering Manager" },
  { email: "leo.martin@example.com", name: "Leo Martin", role: "Frontend Engineer" },
  { email: "sara.nguyen@example.com", name: "Sara Nguyen", role: "People Partner" },
  { email: "tom.wilson@example.com", name: "Tom Wilson", role: "Operations" },
];

export const fallbackRecentActivities: Activity[] = [
  { id: "design-sync", label: "Design Sync ended 10m ago", tone: "green" },
  { id: "board-room", label: "Board Room booked for 2 PM", tone: "pink" },
];
