"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/auth";
import { createUser } from "@/lib/auth";
import { registerSchema, type AuthActionState } from "@/lib/validations/auth";

export async function registerAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Invalid registration details.",
    };
  }

  const result = await createUser(parsed.data);

  if (!result.ok) {
    return { error: result.message };
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: "/dashboard",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Account created, but automatic login failed." };
    }

    throw error;
  }

  return { success: "Account created successfully." };
}
