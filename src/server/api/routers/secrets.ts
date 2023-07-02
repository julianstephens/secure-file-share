import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { Vault, vault } from "@/utils/crypto";
import { CommitSchema, RetrieveSchema } from "@/utils/schemas";
import { TRPCError } from "@trpc/server";

export const secretsRouter = createTRPCRouter({
  commit: protectedProcedure
    .input(CommitSchema)
    .mutation(async ({ input, ctx }) => {
      const { link, expiresAt } = await ctx.db.secret.create({
        data: {
          content: Buffer.from(vault.encrypt(input.contents)),
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
      debugger;
      if (!data) throw new TRPCError({ code: "NOT_FOUND" });

      return {
        data: {
          content: vault.decrypt(data.content),
        },
      };
    }),
});
