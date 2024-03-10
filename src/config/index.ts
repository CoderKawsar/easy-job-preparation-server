import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env") });

export default {
  env: process.env.NODE_ENV,
  port: process.env.PORT,
  this_site_url: process.env.THIS_SITE_URL,
  frontend_site_url: process.env.FRONTEND_SITE_URL,
  mongodb: {
    url: process.env.MONGODB_URL,
  },
  link_security: {
    key: process.env.LINK_SECURITY_KEY,
    iv: process.env.LINK_SECURITY_IV,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    bcrypt_salt_rounds: process.env.BCRYPT_SALT_ROUNDS,
    refresh_secret: process.env.JWT_REFRESH_SECRET,
    expires_in: process.env.JWT_EXPIRES_IN,
    refresh_expires_in: process.env.JWT_REFRESH_EXPIRES_IN,
  },
  link_security: {
    key: process.env.LINK_SECURITY_KEY,
    iv: process.env.LINK_SECURITY_IV,
  },
  cloudinary: {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  },
  bkash: {
    user_name: process.env.BKASH_USERNAME,
    password: process.env.BKASH_PASSWORD,
    app_key: process.env.BKASH_APP_KEY,
    app_secret_key: process.env.BKASH_APP_SECRET_KEY,
    grand_token_url: process.env.BKASH_GRANT_TOKEN_URL,
    create_payment_url: process.env.BKASH_CREATE_PAYMENT_URL,
    execute_payment_url: process.env.BKASH_EXECUTE_PAYMENT_URL,
    refund_transaction_url: process.env.BKASH_REFUND_TRANSACTION_URL,
    search_transaction_url: process.env.BKASH_SEARCH_TRAN_URL,
    query_payment_url: process.env.BKASH_QUERY_PAYMENT_URL,
  },
  nagad: {
    merchant_id: process.env.NAGAD_MERCHANT_ID,
    merchant_number: process.env.NAGAD_MERCHANT_NUMBER,
    public_key: process.env.NAGAD_PUBLIC_KEY,
    private_key: process.env.NAGAD_PRIVATE_KEY,
    base_url: process.env.NAGAD_BASE_URL,
  },
  firebase_messaging_key: process.env.FIREBASE_MESSAGING_KEY,
};
