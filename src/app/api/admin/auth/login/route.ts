import { NextResponse } from "next/server";

import { authenticateAdmin, buildAdminSessionCookie, hasAdminUsers } from "@/lib/admin-auth";
import { ADMIN_SESSION_COOKIE } from "@/lib/session";

export async function POST(request: Request) {
  try {
    if (!(await hasAdminUsers())) {
      return NextResponse.json(
        { error: "No admin account has been set up yet. Create one first." },
        { status: 400 },
      );
    }

    const body = (await request.json()) as {
      email?: string;
      password?: string;
    };

    const result = await authenticateAdmin({
      email: body.email ?? "",
      password: body.password ?? "",
    });

    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 401 });
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
    console.error("Failed to sign in admin", error);
    return NextResponse.json({ error: "Failed to sign in." }, { status: 500 });
  }
}
