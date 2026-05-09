import { auth } from "@/lib/auth/auth";
import { createMiddleware } from "@tanstack/react-start";
import { redirect } from "@tanstack/react-router";

export const isAuthRoute = (path: string) =>
  ["/login", "/register", "/two-factor"].includes(path);

export const authMiddleware = createMiddleware().server(
  async ({ next, request }) => {
    const session = await auth.api.getSession({ headers: request.headers });

    const { pathname } = new URL(request.url);

    if (session?.user) {
      if (!isAuthRoute(pathname)) {
        return await next();
      }
      if (isAuthRoute(pathname)) {
        throw redirect({ to: "/dashboard" });
      }
    }
    if (!session?.user && !isAuthRoute(pathname) && request.url !== "/") {
      throw redirect({ to: "/login" });
    }

    return await next({
      context: {
        user: session?.user,
        image: session?.user?.image,
        session: session,
      },
    });
  },
);
