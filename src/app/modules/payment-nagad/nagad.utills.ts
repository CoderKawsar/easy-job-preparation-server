import crypto from "crypto";
import * as fs from "fs";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

export function formatKey(key: string, type: "PUBLIC" | "PRIVATE") {
  return /begin/i.test(key)
    ? key.trim()
    : `-----BEGIN ${type} KEY-----\n${key.trim()}\n-----END ${type} KEY-----`;
}

export function genKeys(
  privKeyPath: string,
  pubKeyPath: string,
  isPath: boolean
): { publicKey: string; privateKey: string } {
  if (!isPath) {
    return {
      privateKey: formatKey(privKeyPath, "PRIVATE"),
      publicKey: formatKey(pubKeyPath, "PUBLIC"),
    };
  }

  const fsPrivKey = fs.readFileSync(privKeyPath, { encoding: "utf-8" });
  const fsPubKey = fs.readFileSync(pubKeyPath, { encoding: "utf-8" });
  return {
    publicKey: formatKey(fsPubKey, "PUBLIC"),
    privateKey: formatKey(fsPrivKey, "PRIVATE"),
  };
}

function encrypt<T>(data: T, pubKey: string): string {
  const signerObject = crypto.publicEncrypt(
    {
      key: pubKey,
      padding: crypto.constants.RSA_PKCS1_PADDING,
    },
    Buffer.from(JSON.stringify(data))
  );
  return signerObject.toString("base64");
}

function decrypt<T>(data: string, privKey: string): T {
  const decrypted = crypto
    .privateDecrypt(
      {
        key: privKey,
        padding: crypto.constants.RSA_PKCS1_PADDING,
      },
      Buffer.from(data, "base64")
    )
    .toString();
  return JSON.parse(decrypted);
}

function sign(data: string | Record<string, string>, privKey: string): string {
  const signerObject = crypto.createSign("SHA256");
  signerObject.update(JSON.stringify(data));
  signerObject.end();
  return signerObject.sign(privKey, "base64");
}

function getTimeStamp() {
  dayjs.extend(utc);
  dayjs.extend(timezone);

  const timestamp = dayjs().tz("Asia/Dhaka").format("YYYYMMDDHHmmss");

  return timestamp;
}

function createHash(string: string): string {
  return crypto.createHash("sha1").update(string).digest("hex").toUpperCase();
}

export const NagadUtills = {
  encrypt,
  decrypt,
  sign,
  getTimeStamp,
  createHash,
};
