import { describe, expect, it } from "vitest";
import { bookingInputSchema } from "@/lib/validations/booking";

describe("booking validation schema", () => {
  it("accepts a valid future booking", () => {
    const result = bookingInputSchema.safeParse({
      title: "Design Review",
      roomId: "room-1",
      date: "2026-05-12",
      startTime: "10:00",
      endTime: "11:00",
      invitees: ["Maya Chen"],
      todayISO: "2026-05-07",
    });

    expect(result.success).toBe(true);
  });

  it("rejects a past booking date", () => {
    const result = bookingInputSchema.safeParse({
      title: "Retro",
      roomId: "room-1",
      date: "2026-05-01",
      startTime: "10:00",
      endTime: "11:00",
      invitees: [],
      todayISO: "2026-05-07",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe("Booking date cannot be in the past.");
    }
  });

  it("rejects an end time that is not after the start time", () => {
    const result = bookingInputSchema.safeParse({
      title: "Planning",
      roomId: "room-1",
      date: "2026-05-12",
      startTime: "11:00",
      endTime: "10:00",
      invitees: [],
      todayISO: "2026-05-07",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe("End time must be after start time.");
    }
  });
});
