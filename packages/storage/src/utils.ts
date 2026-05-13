export const generateKey = (
  file: File,
  prefix?: string,
  customKey?: string,
): string => {
  if (customKey) return customKey;
  const ext = file.name.includes(".") ? file.name.split(".").pop() : "";
  const uuid = crypto.randomUUID();
  const base = ext ? `${uuid}.${ext}` : uuid;
  return prefix ? `${prefix.replace(/\/$/, "")}/${base}` : `files/${base}`;
};
