import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    // 如果用户已登录，允许访问
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/login",
    },
  }
);

// 配置需要保护的路由
export const config = {
  matcher: [
    // 保护首页和 API（除了 auth 和 health）
    "/",
    "/api/analyze/:path*",
    // 不保护的路由：/login, /api/auth/*, /api/health
  ],
};
