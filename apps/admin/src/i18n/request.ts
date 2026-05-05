import { type Locale, routing } from "@e-service/i18n";
import { loadMessages } from "@e-service/i18n/messages/load";
import { getRequestConfig } from "@e-service/i18n/server";
import { cookies } from "next/headers";

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get("locale")?.value as Locale | undefined;
  const locale = routing.locales.includes(cookieLocale as Locale)
    ? (cookieLocale as Locale)
    : routing.defaultLocale;

  return {
    locale,
    messages: await loadMessages(locale),
  };
});
