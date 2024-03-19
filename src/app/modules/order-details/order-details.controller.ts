import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import httpStatus from "http-status";
import { paginationFields } from "../../constants/pagination";
import pick from "../../../shared/pick";
import { OrderDetailsService } from "./order-details.service";
import { orderDetailsFilterableFields } from "./order-details.constants";

const createOrderDetails = catchAsync(async (req: Request, res: Response) => {
  const result = await OrderDetailsService.createOrderDetails(req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Order details added successfully!",
    data: result,
  });
});

const getAllOrderDetails = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, orderDetailsFilterableFields);
  const paginationOptions = pick(req.query, paginationFields);
  const result = await OrderDetailsService.getAllOrderDetails(
    filters,
    paginationOptions
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "All order details fetched successfully!",
    data: result,
  });
});

const getMyOrderDetails = catchAsync(async (req: Request, res: Response) => {
  const user_id = req.user?.userId;

  const result = await OrderDetailsService.getMyOrderDetails(user_id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Order details fetched successfully!",
    data: result,
  });
});

const getSingleOrderDetails = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const user_id = req?.user?.userId;
    const result = await OrderDetailsService.getSingleOrderDetails(id, user_id);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Order details fetched successfully!",
      data: result,
    });
  }
);

const updateOrderDetails = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const payload = req.body;
  const result = await OrderDetailsService.updateOrderDetails(id, payload);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Order details updated in successfully!",
    data: result,
  });
});
const deleteOrderDetails = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await OrderDetailsService.deleteOrderDetails(id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Order details deleted in successfully!",
    data: result,
  });
});

export const OrderDetailsController = {
  createOrderDetails,
  getAllOrderDetails,
  getMyOrderDetails,
  getSingleOrderDetails,
  updateOrderDetails,
  deleteOrderDetails,
};
