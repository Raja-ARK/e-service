"use client";

import type { Locale } from "@e-service/i18n";
import { NextIntlClientProvider } from "@e-service/i18n";
import type en from "@e-service/i18n/messages/en";
import { ToastProvider } from "@e-service/ui/components/ui/toast";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { queryClient } from "@/utils/orpc";

const Providers = ({
  children,
  messages,
  locale,
}: {
  children: React.ReactNode;
  messages: typeof en;
  locale: Locale;
}) => {
  return (
    <NuqsAdapter>
      <NextIntlClientProvider messages={messages} locale={locale}>
        <NextThemesProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <QueryClientProvider client={queryClient}>
            {children}
            <ReactQueryDevtools />
            <ToastProvider />
          </QueryClientProvider>
        </NextThemesProvider>
      </NextIntlClientProvider>
    </NuqsAdapter>
  );
};

export default Providers;
