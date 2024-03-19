import config from "../../../config";
import {
  IClientType,
  IConfirmPaymentArgs,
  ICreatePaymentArgs,
  INagadCreatePaymentBody,
  INagadCreatePaymentDecryptedResponse,
  INagadCreatePaymentResponse,
  INagadPaymentURL,
  INagadPaymentVerificationResponse,
  INagadSensitiveData,
} from "./nagad.interface";
import { nagadGet, nagadPost } from "./nagad.request";
import { NagadUtills, genKeys } from "./nagad.utills";

async function confirmPayment(
  data: IConfirmPaymentArgs,
  clientType: IClientType
): Promise<INagadPaymentURL> {
  const { amount, challenge, ip, orderId, paymentReferenceId, productDetails } =
    data;
  const { privateKey, publicKey } = genKeys(
    config.nagad.private_key as string,
    config.nagad.public_key as string,
    false
  );

  const sensitiveData = {
    merchantId: config.nagad.merchant_id as string,
    orderId,
    amount,
    currencyCode: "050",
    challenge,
  };

  const payload = {
    paymentRefId: paymentReferenceId,
    sensitiveData: NagadUtills.encrypt(sensitiveData, publicKey),
    signature: NagadUtills.sign(sensitiveData, privateKey),
    merchantCallbackURL: `${config.frontend_site_url}/nagad`,
    additionalMerchantInfo: {
      ...productDetails,
    },
  };

  const newIP = ip === "::1" || ip === "127.0.0.1" ? "34.16.127.175" : ip;
  return await nagadPost<INagadPaymentURL>(
    `${config.nagad.base_url}/api/dfs/check-out/complete/${paymentReferenceId}`,
    payload,
    {
      "X-KM-Api-Version": "v-0.2.0",
      "X-KM-IP-V4": newIP,
      "X-KM-Client-Type": clientType,
    }
  );
}

const createPayment = async (
  createPaymentConfig: ICreatePaymentArgs
): Promise<string> => {
  const { amount, ip, orderId, productDetails, clientType } =
    createPaymentConfig;
  const { privateKey, publicKey } = genKeys(
    config.nagad.private_key as string,
    config.nagad.public_key as string,
    false
  );

  const endpoint = `${config.nagad.base_url}/api/dfs/check-out/initialize/${config.nagad.merchant_id}/${orderId}`;
  const timestamp = NagadUtills.getTimeStamp();

  const sensitive: INagadSensitiveData = {
    merchantId: config.nagad.merchant_id as string,
    datetime: timestamp,
    orderId,
    challenge: NagadUtills.createHash(orderId),
  };

  const payload: INagadCreatePaymentBody = {
    accountNumber: config.nagad.merchant_number as string,
    dateTime: timestamp,
    sensitiveData: NagadUtills.encrypt(sensitive, publicKey),
    signature: NagadUtills.sign(sensitive, privateKey),
  };

  const newIP = ip === "::1" || ip === "127.0.0.1" ? "34.16.127.175" : ip;

  const { sensitiveData } = await nagadPost<INagadCreatePaymentResponse>(
    endpoint,
    payload,
    {
      "X-KM-Api-Version": "v-0.2.0",
      "X-KM-IP-V4": newIP,
      "X-KM-Client-Type": clientType,
    }
  );

  const decrypted = NagadUtills.decrypt<INagadCreatePaymentDecryptedResponse>(
    sensitiveData,
    privateKey
  );

  const { paymentReferenceId, challenge } = decrypted;
  const confirmArgs: IConfirmPaymentArgs = {
    paymentReferenceId,
    challenge,
    orderId,
    amount,
    productDetails,
    ip: newIP,
  };

  const { callBackUrl } = await confirmPayment(confirmArgs, clientType);
  return callBackUrl;
};

const verifyPayment = async (payload: {
  ip: string;
  clientType: IClientType;
  paymentRefId: string;
}): Promise<INagadPaymentVerificationResponse> => {
  const { ip, clientType, paymentRefId } = payload;
  return await nagadGet<INagadPaymentVerificationResponse>(
    `${config.nagad.base_url}/api/dfs/verify/payment/${paymentRefId}`,
    {
      "X-KM-Api-Version": "v-0.2.0",
      "X-KM-IP-V4": ip,
      "X-KM-Client-Type": clientType,
    }
  );
};

export const NagadService = {
  createPayment,
  verifyPayment,
};
