import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import { MobileAppService } from "./mobile-app.service";
import sendResponse from "../../../shared/sendResponse";
import httpStatus from "http-status";

const messageToAll = catchAsync(async (req: Request, res: Response) => {
  const { message } = req.body;
  const result = await MobileAppService.messageToAll(message);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Order details added successfully!",
    data: result,
  });
});

export const MobileAppController = {
  messageToAll,
};
