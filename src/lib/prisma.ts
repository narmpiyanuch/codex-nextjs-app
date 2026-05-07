import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });
}

function hasCurrentBookingDelegates(client: PrismaClient | undefined): client is PrismaClient {
  const maybeClient = client as
    | (PrismaClient & {
        booking?: unknown;
        invitee?: unknown;
        room?: unknown;
      })
    | undefined;

  return !!maybeClient?.booking && !!maybeClient.invitee && !!maybeClient.room;
}

export const prisma = hasCurrentBookingDelegates(globalForPrisma.prisma)
  ? globalForPrisma.prisma
  : createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
