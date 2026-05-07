import { NextResponse } from "next/server";
import { createUser } from "@/lib/auth";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    name?: string;
    email?: string;
    password?: string;
  };

  const result = await createUser({
    name: body.name ?? "",
    email: body.email ?? "",
    password: body.password ?? "",
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.message }, { status: 400 });
  }

  return NextResponse.json(
    {
      message: "Account created successfully.",
      user: {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
      },
    },
    { status: 201 },
  );
}
