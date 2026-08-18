import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./admin.css";

/**
 * Interface text is set in Inter rather than the site's Nunito Sans. Nunito is
 * a rounded humanist face built for reading at 16px and up; at the 12–14px a
 * dense dashboard actually runs at, its wide apertures and soft terminals cost
 * legibility. Inter is drawn for exactly this. The brand face (Sora) is kept
 * for page titles and figures, so the dashboard still reads as the same
 * product. Admin-only — the public site is untouched.
 */
const ui = Inter({
  subsets: ["latin"],
  variable: "--font-ui",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className={`admin-root ${ui.variable}`}>{children}</div>;
}
