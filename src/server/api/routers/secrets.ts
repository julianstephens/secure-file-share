import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { Vault, vault } from "@/utils/crypto";
import { CommitSchema, RetrieveSchema } from "@/utils/schemas";
import { TRPCError } from "@trpc/server";

export const secretsRouter = createTRPCRouter({
  commit: protectedProcedure
    .input(CommitSchema)
    .mutation(async ({ input, ctx }) => {
      const encryptedData = vault.encrypt(input.contents);
      if (!encryptedData) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "unable to encrypt data",
        });
      }

      const { link, expiresAt } = await ctx.db.secret.create({
        data: {
          content: encryptedData,
          expiresAt: input.expiration,
          link: Vault.uuid(),
        },
        select: {
          link: true,
          expiresAt: true,
        },
      });
      return { data: { link, expiresAt } };
    }),
  retrieve: protectedProcedure
    .input(RetrieveSchema)
    .query(async ({ input: { link }, ctx }) => {
      const data = await ctx.db.secret.findUnique({
        where: {
          link,
        },
        select: {
          content: true,
        },
      });
      if (!data) throw new TRPCError({ code: "NOT_FOUND" });

      const decrypted = vault.decrypt(data.content);

      return {
        data: {
          content: decrypted,
        },
      };
    }),
});
