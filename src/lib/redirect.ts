import { NextResponse } from "next/server";

/**
 * Redirect to a path on this site with a relative Location header. Behind Hostinger's proxy
 * `req.url` is the internal address (http://0.0.0.0:3000/…), so `new URL(path, req.url)`
 * would send the browser there; a relative Location keeps it on the domain it came from.
 * Only pass paths on this site (starting with a single "/").
 */
export function redirectTo(path: string, status: 302 | 303 | 307 = 307) {
  return new NextResponse(null, { status, headers: { Location: path } });
}
