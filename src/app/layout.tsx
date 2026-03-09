import type { Metadata, Viewport } from "next";
import { Quicksand } from "next/font/google";
import "./globals.css";
import BottomNav from "@/components/BottomNav";
import { AdminProvider } from "@/components/AdminContext";

const quicksand = Quicksand({
  variable: "--font-quicksand",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Merry & Pippin Growth Tracker",
  description: "Growth tracker for Merry & Pippin, Golden British Shorthairs",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "M&P Growth Tracker",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "48x48" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#D4BC82",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${quicksand.variable} antialiased text-foreground`} style={{ fontFamily: "var(--font-quicksand), sans-serif" }}>
        <AdminProvider>
          <main className="max-w-lg mx-auto bg-background" style={{ paddingBottom: "calc(3.5rem + env(safe-area-inset-bottom, 0px))", minHeight: "100dvh" }}>
            {children}
          </main>
          <BottomNav />
        </AdminProvider>
      </body>
    </html>
  );
}
