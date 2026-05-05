import { getLocale, getMessages } from "@e-service/i18n/server";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import type { ReactNode } from "react";
import Providers from "@/components/providers";
import "../index.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "E Service",
  description: "E Service Digital Platform",
};

const RootLayout = async ({ children }: { children: ReactNode }) => {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      dir={locale === "ar" ? "rtl" : "ltr"}
      suppressHydrationWarning
    >
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers messages={messages} locale={locale}>
          <div className="grid h-svh grid-rows-[auto_1fr]">{children}</div>
        </Providers>
      </body>
    </html>
  );
};

export default RootLayout;
