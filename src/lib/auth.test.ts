import { beforeEach, describe, expect, it, vi } from "vitest";

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}));

vi.mock("@/lib/prisma", () => ({
  prisma: prismaMock,
}));

import { createUser, getUserByEmail } from "@/lib/auth";

describe("auth data helpers", () => {
  beforeEach(() => {
    prismaMock.user.findUnique.mockReset();
    prismaMock.user.create.mockReset();
  });

  it("normalizes email before lookup", async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);

    await getUserByEmail("User@Example.com");

    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
      where: { email: "user@example.com" },
    });
  });

  it("rejects duplicate email registration", async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: "existing-user",
      email: "user@example.com",
    });

    const result = await createUser({
      name: "Test User",
      email: "user@example.com",
      password: "password123",
    });

    expect(result).toEqual({
      ok: false,
      message: "An account with this email already exists.",
    });
    expect(prismaMock.user.create).not.toHaveBeenCalled();
  });

  it("creates a user with a hashed password", async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);
    prismaMock.user.create.mockImplementation(async ({ data }) => ({
      id: "new-user",
      ...data,
    }));

    const result = await createUser({
      name: "Test User",
      email: "User@Example.com",
      password: "password123",
    });

    expect(result.ok).toBe(true);
    expect(prismaMock.user.create).toHaveBeenCalledTimes(1);

    const createArg = prismaMock.user.create.mock.calls[0]?.[0];
    expect(createArg?.data.name).toBe("Test User");
    expect(createArg?.data.email).toBe("user@example.com");
    expect(createArg?.data.password).toBeDefined();
    expect(createArg?.data.password).not.toBe("password123");
  });
});
