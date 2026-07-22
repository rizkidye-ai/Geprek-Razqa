import { NextResponse } from "next/server";
import { auth } from "@/auth";

const roleAccess: Record<string, string[]> = {
  "/": ["ADMIN", "KASIR", "DAPUR"],
  "/kasir": ["ADMIN", "KASIR"],
  "/pesanan": ["ADMIN", "KASIR", "DAPUR"],
  "/meja": ["ADMIN", "KASIR"],
  "/menu": ["ADMIN"],
  "/stok": ["ADMIN", "KASIR"],
  "/laporan": ["ADMIN"],
  "/pegawai": ["ADMIN"],
  "/pengaturan": ["ADMIN"],
  "/struk": ["ADMIN", "KASIR"],
  "/keuangan": ["ADMIN"],
};

function matchPath(pathname: string) {
  const keys = Object.keys(roleAccess).sort((a, b) => b.length - a.length);
  return keys.find((k) => (k === "/" ? pathname === "/" : pathname.startsWith(k)));
}

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;

  if (pathname.startsWith("/login")) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL("/", req.url));
    }
    return NextResponse.next();
  }

  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const matched = matchPath(pathname);
  if (matched) {
    const allowed = roleAccess[matched];
    const role = req.auth?.user?.role;
    if (role && !allowed.includes(role)) {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};
