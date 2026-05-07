"use server";

import { revalidatePath } from "next/cache";
import { auth, signOut } from "@/auth";
import { cancelBooking, createBooking, updateBooking } from "@/lib/booking";

export type BookingActionState = {
  error?: string;
};

export async function createBookingAction(input: {
  title: string;
  roomId: string;
  date: string;
  startTime: string;
  endTime: string;
  invitees: string[];
}): Promise<BookingActionState> {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "Please sign in before creating a booking." };
  }

  const result = await createBooking({ ...input, userId: session.user.id });

  if (!result.ok) {
    return { error: result.message };
  }

  revalidateDashboardPaths();
  return {};
}

export async function cancelBookingAction(bookingId: string): Promise<BookingActionState> {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "Please sign in before cancelling a booking." };
  }

  const result = await cancelBooking({ bookingId, userId: session.user.id });

  if (!result.ok) {
    return { error: result.message };
  }

  revalidateDashboardPaths();
  return {};
}

export async function updateBookingAction(input: {
  bookingId: string;
  title: string;
  roomId: string;
  date: string;
  startTime: string;
  endTime: string;
  invitees: string[];
}): Promise<BookingActionState> {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "Please sign in before editing a booking." };
  }

  const result = await updateBooking({ ...input, userId: session.user.id });

  if (!result.ok) {
    return { error: result.message };
  }

  revalidateDashboardPaths();
  return {};
}

export async function logoutAction() {
  await signOut({ redirectTo: "/login" });
}

function revalidateDashboardPaths() {
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/rooms");
  revalidatePath("/dashboard/schedule");
}
