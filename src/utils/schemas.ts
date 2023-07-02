import { z } from "zod";

export const CommitSchema = z.object({
  contents: z.string(),
  expiration: z.string().datetime(),
});

export const RetrieveSchema = z.object({
  link: z.string(),
});
