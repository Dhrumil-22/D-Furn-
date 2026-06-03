import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import Sidebar from "@/components/Sidebar";
import ThemeProvider from "@/components/ThemeProvider";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "DFurn ERP",
  description: "Enterprise Resource Planning for DFurn",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  let userRole = 'SUPERADMIN'; // Default fallback

  if (token) {
    const decoded = await verifyToken(token);
    if (decoded) {
      userRole = decoded.role;
    }
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@flaticon/flaticon-uicons@3.3.1/css/all/all.min.css" />
      </head>
      <body className={outfit.className}>
        <ThemeProvider>
          <div className="layout-container">
            <Sidebar userRole={userRole} />
            <main className="main-content">
              {children}
            </main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
