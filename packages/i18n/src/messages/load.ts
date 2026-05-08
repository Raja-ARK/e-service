import type { AbstractIntlMessages } from "next-intl";
import type { Locale } from "../routing";

export async function loadMessages(
  locale: Locale,
): Promise<AbstractIntlMessages> {
  switch (locale) {
    case "ar":
      return (await import("./ar.json")).default;
    default:
      return (await import("./en.json")).default;
  }
}
