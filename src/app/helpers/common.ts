import { Request } from "express";
import config from "../../config";

export const asyncForEach = async (array: any[], callback: any) => {
  if (!Array.isArray(array)) {
    throw new Error("Expected an array");
  }
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
};

export function isJSON(str: any) {
  try {
    JSON.parse(str);
    return true;
  } catch (error) {
    return false;
  }
}

export function isObject(input: any) {
  return typeof input === "object" && !Array.isArray(input);
}

export function isVerfiedMobileApp(req: Request) {
  const appToken = req.headers["x-my-app-token"];
  const userAgent = req.headers["user-agent"];

  if (!userAgent?.includes("Android")) return false;

  if (appToken !== config.mobile.communication_key) return false;

  return true;
}
