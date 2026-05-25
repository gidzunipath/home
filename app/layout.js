import localFont from "next/font/local";
import "./globals.css";
import AppProviders from "./components/AppProviders";
import ConditionalSiteChrome from "./components/ConditionalSiteChrome";
import SiteFooter from "./components/SiteFooter";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata = {
  title: "GIDZ UniPath - Your Gateway to German Excellence",
  description:
    "Premium education consultancy specializing in German university admissions for Sri Lankan students. Experience world-class education with German precision and Apple-like attention to detail.",
  keywords: [
    "German education",
    "university admissions",
    "student visa",
    "Germany",
    "Sri Lanka",
    "premium consultancy",
  ],
  author: "GIDZ UniPath Education Team",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-appleGray-50`}
      >
        <AppProviders>
          <ConditionalSiteChrome footer={<SiteFooter />}>
            {children}
          </ConditionalSiteChrome>
        </AppProviders>
      </body>
    </html>
  );
}
