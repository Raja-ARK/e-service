import type en from "./messages/en.json";
import type { routing } from "./routing";

declare module "next-intl" {
  interface AppConfig {
    Locale: routing["locales"][number];
    Messages: en;
  }
}
