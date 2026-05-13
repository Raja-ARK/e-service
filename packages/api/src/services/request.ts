import type { CreateRequestInput } from "../types/request";

export const createRequest = async ({
  input,
}: {
  input: CreateRequestInput;
}) => {
  console.log({ input });
  return {};
};
