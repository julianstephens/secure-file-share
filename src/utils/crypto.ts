import { env } from "@/env.mjs";
import crypto from "crypto";
import CryptoJS from "crypto-js";

export class Vault {
  #key;

  constructor() {
    this.#key = CryptoJS.enc.Hex.parse(
      Vault.bytesToHex(new TextEncoder().encode(env.HASH_KEY))
    );
  }

  static uuid = () => {
    const split = crypto.randomUUID().split("-");
    return `${split[0]}${split[1]}`;
  };

  static bytesToHex = (bytes: Uint8Array) => {
    bytes.reduce((acc: string[], curr) => {
      const d = curr < 0 ? curr + 256 : curr;
      return [...acc, (d >>> 4).toString(16), (d & 0xf).toString(16)];
    }, []);
    return bytes.join("");
  };

  static hexToBytes = (hex: string) => {
    const bytes = [];
    for (let i = 0; i < hex.length; i += 2) {
      bytes.push(parseInt(hex.substring(i, 2), 16));
    }
    return new Uint8Array(bytes).buffer;
  };

  encrypt = (text: string) => {
    const bytes = new TextEncoder().encode(text);
    const encryptedWA = CryptoJS.AES.encrypt(
      CryptoJS.enc.Hex.parse(Vault.bytesToHex(bytes)),
      this.#key,
      { mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.NoPadding }
    );
    return Vault.hexToBytes(CryptoJS.enc.Hex.stringify(encryptedWA.ciphertext));
  };

  decrypt = (encrypted: Uint8Array) => {
    const encryptedWA = Vault.bytesToHex(encrypted);
    return CryptoJS.AES.decrypt(encryptedWA, this.#key).toString(
      CryptoJS.enc.Utf8
    );
  };
}

export const vault = new Vault();
