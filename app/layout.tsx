import type { Metadata } from "next";
import { Noto_Sans_Khmer } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";

const notoSansKhmer = Noto_Sans_Khmer({
  subsets: ["khmer"],
  display: "swap",
  variable: "--font-noto-sans-khmer",
});

export const metadata: Metadata = {
  title: { default: "Tools — Simple online tools", template: "%s | Tools" },
  description: "Simple online tools for everyday work.",
};
export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale?: string }>;
}>) {
  const { locale } = await params;
  const content = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ? (
    <ClerkProvider>{children}</ClerkProvider>
  ) : (
    children
  );
  return (
    <html lang={locale === "km" ? "km" : "en"}>
      <body className={notoSansKhmer.variable}>{content}</body>
    </html>
  );
}
