import { env } from "@/env.mjs";
import crypto, { type CipherGCMTypes } from "crypto";

export class Vault {
  #algo: CipherGCMTypes = "aes-256-gcm";

  static uuid = () => {
    const split = crypto.randomUUID().split("-");
    if (split[0] == null || split[1] == null)
      throw new Error("unable to generate uuid");
    return `${split[0]}${split[1]}`;
  };

  getKey = (salt: Buffer, iterations: number) => {
    return crypto.pbkdf2Sync(env.HASH_KEY, salt, iterations, 32, "sha512");
  };

  encrypt = (text: string | number[]) => {
    try {
      const iv = crypto.randomBytes(16);
      const salt = crypto.randomBytes(64);
      const iterations =
        Math.floor(Math.random() * (99999 - 10000 + 1)) + 10000;
      const key = this.getKey(salt, Math.floor(iterations * 0.47 + 1337));

      const cipher = crypto.createCipheriv(this.#algo, key, iv);
      const encryptedData = Buffer.concat([
        typeof text === "string"
          ? cipher.update(text, "utf-8")
          : cipher.update(Buffer.from(text)),
        cipher.final(),
      ]);
      const authTag = cipher.getAuthTag();
      return Buffer.concat([
        salt,
        iv,
        authTag,
        Buffer.from(iterations.toString()),
        encryptedData,
      ]);
    } catch (err) {
      console.error("encryption failed");
      console.error(err);
      return void 0;
    }
  };

  decrypt = (encrypted: Buffer) => {
    try {
      const salt = encrypted.subarray(0, 64);
      const iv = encrypted.subarray(64, 80);
      const authTag = encrypted.subarray(80, 96);
      const iterations = parseInt(
        encrypted.subarray(96, 101).toString("utf-8"),
        10
      );
      const encryptedData = encrypted.subarray(101);
      const key = this.getKey(salt, Math.floor(iterations * 0.47 + 1337));

      const decipher = crypto.createDecipheriv(this.#algo, key, iv);
      decipher.setAuthTag(authTag);

      const decrypted =
        // @ts-ignore: TS expects the wrong createDecipher return type here
        decipher.update(encryptedData, undefined, "utf-8") +
        decipher.final("utf-8");

      try {
        return JSON.parse(decrypted) as Record<
          string,
          string | number | boolean
        >;
      } catch {
        return decrypted;
      }
    } catch (err) {
      console.error("decryption failed");
      console.error(err);
      return void 0;
    }
  };
}

export const vault = new Vault();
