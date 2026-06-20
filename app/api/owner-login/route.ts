import { NextRequest, NextResponse } from "next/server";

// The actual password lives only in the OWNER_PASSWORD environment variable
// on the server (set in Vercel project settings, never committed to git,
// never sent to the browser in any form — not even hashed). This route is
// the only thing that ever compares against it. On success it sets a cookie
// equal to OWNER_AUTH_TOKEN (a separate, random secret also only on the
// server) — the cookie's value itself proves nothing to the client; it only
// works because middleware.ts checks it against the same server-side value.
export async function POST(req: NextRequest) {
  const { password } = await req.json().catch(() => ({ password: "" }));
  const real = process.env.OWNER_PASSWORD;
  const token = process.env.OWNER_AUTH_TOKEN;

  if (!real || !token) {
    return NextResponse.json({ ok: false, error: "Server not configured" }, { status: 500 });
  }
  if (password !== real) {
    // Small delay to make brute-forcing slower without a full rate limiter.
    await new Promise(r => setTimeout(r, 600));
    // TEMPORARY debug aid: includes lengths only (never the actual values)
    // to help spot whitespace/truncation issues while this is being
    // debugged. Remove the lengths from this message once login is
    // confirmed working - length alone doesn't expose the password, but
    // there's no reason to leave debug info in a production error forever.
    return NextResponse.json({ ok: false, error: `Wrong password (got ${password.length} chars, expected ${real.length})` }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set("owner_auth", token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
  return res;
}
