import type en from "@e-service/i18n/messages/en";
import type { routing } from "@e-service/i18n/routing";

declare module "next-intl" {
  interface AppConfig {
    Locale: (typeof routing)["locales"][number];
    Messages: typeof en;
  }
}
