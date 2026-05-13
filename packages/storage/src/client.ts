import { env } from "@e-service/env/server";
import { Files } from "files-sdk";
import { fs } from "files-sdk/fs";

let _storage: Files | null = null;

export function getStorage(): Files {
  if (_storage) return _storage;

  const root = env.STORAGE_ROOT ?? "./uploads";
  const urlBaseUrl = env.STORAGE_PUBLIC_URL ?? undefined;

  _storage = new Files({
    adapter: fs({ root, urlBaseUrl }),
  });

  return _storage;
}
