import { z } from "zod";

const timeSchema = z.string().regex(/^\d{2}:\d{2}$/, "Please choose a valid time.");
const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Please choose a valid date.");

export const bookingInputSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(2, "Meeting title must be at least 2 characters long.")
      .max(80, "Meeting title must be 80 characters or fewer."),
    roomId: z.string().trim().min(1, "Please select a room."),
    date: dateSchema,
    startTime: timeSchema,
    endTime: timeSchema,
    invitees: z
      .array(z.string().trim().min(1).max(60))
      .max(12, "Invite up to 12 people for one booking.")
      .default([]),
    todayISO: dateSchema.optional(),
  })
  .superRefine((value, context) => {
    const todayISO = value.todayISO ?? new Date().toISOString().slice(0, 10);

    if (value.date < todayISO) {
      context.addIssue({
        code: "custom",
        message: "Booking date cannot be in the past.",
        path: ["date"],
      });
    }

    if (value.startTime >= value.endTime) {
      context.addIssue({
        code: "custom",
        message: "End time must be after start time.",
        path: ["endTime"],
      });
    }
  });

export type BookingInput = z.infer<typeof bookingInputSchema>;
