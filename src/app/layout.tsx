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
    icon: "/icon-512.png",
    apple: "/icon-192.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#F5C67E",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${quicksand.variable} antialiased bg-white text-foreground`} style={{ fontFamily: "var(--font-quicksand), sans-serif" }}>
        <AdminProvider>
          <main className="pb-safe max-w-lg mx-auto bg-background min-h-screen">
            {children}
          </main>
          <BottomNav />
        </AdminProvider>
      </body>
    </html>
  );
}
