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
  let encryptedLink = cipher.update(originalLink, "utf-8", "hex");
  encryptedLink += cipher.final("hex");
  return encryptedLink;
}

export default encryptLink;
