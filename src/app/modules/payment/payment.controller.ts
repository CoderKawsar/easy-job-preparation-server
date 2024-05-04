import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import { PaymentService } from "./payment.service";
import sendResponse from "../../../shared/sendResponse";
import httpStatus from "http-status";
import ApiError from "../../../errors/ApiError";
import { isVerfiedMobileApp } from "../../helpers/common";

const paymentCreate = catchAsync(async (req: Request, res: Response) => {
  const result = await PaymentService.paymentCreate(req.body);

  if (isVerfiedMobileApp(req)) {
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
