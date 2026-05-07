import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { registerSchema } from "@/lib/validations/auth";

export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });
}

export async function createUser(input: {
  name: string;
  email: string;
  password: string;
}) {
  const parsed = registerSchema.safeParse(input);

  if (!parsed.success) {
    return {
      ok: false as const,
      message: parsed.error.issues[0]?.message ?? "Invalid registration details.",
    };
  }

  const email = parsed.data.email.toLowerCase();
  const existingUser = await getUserByEmail(email);

  if (existingUser) {
    return {
      ok: false as const,
      message: "An account with this email already exists.",
    };
  }

  const hashedPassword = await hashPassword(parsed.data.password);

  const user = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email,
      password: hashedPassword,
    },
  });

  return { ok: true as const, user };
}
