import { z } from "zod";

export const CommitSchema = z.object({
  contents: z.string().or(z.number().array()),
  expiration: z.string().datetime(),
});

export const RetrieveSchema = z.object({
  code: z.string(),
});
