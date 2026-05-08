import "@e-service/env/web";
import createNextIntlPlugin from "@e-service/i18n/plugin";
import type { NextConfig } from "next";

const withNextIntl = createNextIntlPlugin({
  experimental: {
    createMessagesDeclaration: [
      "../../packages/i18n/src/messages/en.json",
      "../../packages/i18n/src/messages/ar.json",
    ],
  },
});

const nextConfig: NextConfig = {
  typedRoutes: true,
  reactCompiler: true,
};

export default withNextIntl(nextConfig);
