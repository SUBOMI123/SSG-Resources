import { NextResponse } from "next/server";

import { buildAdminSessionCookie, createFirstAdmin } from "@/lib/admin-auth";
import { ADMIN_SESSION_COOKIE } from "@/lib/session";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      name?: string;
      email?: string;
      password?: string;
    };

    const result = await createFirstAdmin({
      name: body.name ?? "",
      email: body.email ?? "",
      password: body.password ?? "",
    });

    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    const token = await buildAdminSessionCookie({
      userId: result.admin.id,
      email: result.admin.email,
    });

    const response = NextResponse.json({ success: true });
    response.cookies.set(ADMIN_SESSION_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 14,
    });

    return response;
  } catch (error) {
    console.error("Failed to create admin", error);
    return NextResponse.json({ error: "Failed to complete admin setup." }, { status: 500 });
  }
}
