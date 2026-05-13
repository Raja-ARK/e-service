export type { StoredFile } from "files-sdk";
export { FilesError } from "files-sdk";
export { getStorage } from "./client";

import { getStorage } from "./client";

export type UploadOptions = {
  contentType?: string;
  metadata?: Record<string, string>;
  cacheControl?: string;
};

export type UrlOptions = {
  expiresIn?: number;
  responseContentDisposition?: string;
};

export type SignedUploadUrlOptions = {
  expiresIn: number;
  contentType?: string;
  maxSize?: number;
  minSize?: number;
};

export type ListOptions = {
  prefix?: string;
  limit?: number;
  cursor?: string;
};

export const uploadFile = (
  key: string,
  body: File | Blob | ReadableStream | ArrayBuffer | string,
  options?: UploadOptions,
) => getStorage().upload(key, body, options);

export const downloadFile = (key: string) => getStorage().download(key);

export const downloadFileAsStream = (key: string) =>
  getStorage().download(key, { as: "stream" });

export const getFileUrl = (key: string, options?: UrlOptions) =>
  getStorage().url(key, options);

export const getSignedUploadUrl = (
  key: string,
  options: SignedUploadUrlOptions,
) => getStorage().signedUploadUrl(key, options);

export const deleteFile = (key: string) => getStorage().delete(key);

export const listFiles = (options?: ListOptions) => getStorage().list(options);

export const getFileMeta = (key: string) => getStorage().head(key);
