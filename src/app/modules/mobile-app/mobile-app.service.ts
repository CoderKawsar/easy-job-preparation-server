import axios from "axios";
import config from "../../../config";

const messageToAll = async (message: string) => {
  const result = await axios.post(
    "https://fcm.googleapis.com/fcm/send",
    {
      to: "/topics/all",
      data: {
        message: message,
      },
    },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: config.mobile.firebase_messaging_key,
      },
    }
  );

  return result;
};

export const MobileAppService = {
  messageToAll,
};
