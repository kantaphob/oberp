import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET || "vPWcL5Fk/7H0RcEI8iRw3cA3SVymPzZdP5InvoC5L10=",
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/portal/:path*",
    // add any other protected routes
  ],
};
