import crypto from "crypto";
import config from "../../config";

const key = config.link_security.key as string;
const iv = config.link_security.iv as string;

// Utility function to encrypt a link
function encryptLink(originalLink: string) {
  const cipher = crypto.createCipheriv(
    "aes-128-cbc",
    Buffer.from(key, "hex"),
    Buffer.from(iv, "hex")
  );

  let encryptedLink = cipher.update(originalLink, "utf8", "hex");
  encryptedLink += cipher.final("hex");

  return encryptedLink;
}

// Utility function to decrypt a link
function decryptLink(encryptedLink: string) {
  const decipher = crypto.createDecipheriv(
    "aes-128-cbc",
    Buffer.from(key, "hex"),
    Buffer.from(iv, "hex")
  );
  let decryptedLink = decipher.update(encryptedLink, "hex", "utf-8");
  decryptedLink += decipher.final("utf-8");
  return decryptedLink;
}

export const LinkProtectionHelpers = {
  encrypt: encryptLink,
  decrypt: decryptLink,
};
