import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import { PaymentService } from "./payment.service";
import sendResponse from "../../../shared/sendResponse";
import httpStatus from "http-status";
import config from "../../../config";
import ApiError from "../../../errors/ApiError";

const paymentCreate = catchAsync(async (req: Request, res: Response) => {
  const result = await PaymentService.paymentCreate(req.body);

  const appToken = req.headers["x-my-app-token"];

  if (appToken !== config.mobile.communication_key) {
    throw new ApiError(httpStatus.OK, "Unauthorized!");
  }

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Payment added successfully!",
    data: result,
  });
});

export const PaymentController = {
  paymentCreate,
};
