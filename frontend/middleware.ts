import createMiddleware from "next-intl/middleware";

export default createMiddleware({
  locales: ["bn", "en"],
  defaultLocale: "bn",
});

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
