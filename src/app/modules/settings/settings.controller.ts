import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import httpStatus from "http-status";
import { SettingsService } from "./settings.service";
import pick from "../../../shared/pick";
import { paginationFields } from "../../constants/pagination";
import { settingsFilterableFields } from "./settings.constants";

const addSettings = catchAsync(async (req: Request, res: Response) => {
  const result = await SettingsService.addSettings(req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Settings added successfully!",
    data: result,
  });
});

const addOrEditShippingCharge = catchAsync(
  async (req: Request, res: Response) => {
    const result = await SettingsService.addOrEditShippingCharge(req.body);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Shipping charge added/updated successfully!",
      data: result,
    });
  }
);

const getAllSettings = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, settingsFilterableFields);
  const paginationOptions = pick(req.query, paginationFields);

  const result = await SettingsService.getAllSettings(
    filters,
    paginationOptions
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "All Settings fetched successfully!",
    data: result,
  });
});

const getShippingChargeInsideDhaka = catchAsync(
  async (req: Request, res: Response) => {
    const result = await SettingsService.getShippingChargeInsideDhaka();

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Shipping charge inside Dhaka fetched successfully!",
      data: result,
    });
  }
);

const getShippingChargeOutsideDhaka = catchAsync(
  async (req: Request, res: Response) => {
    const result = await SettingsService.getShippingChargeOutsideDhaka();

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Shipping charge outside Dhaka fetched successfully!",
      data: result,
    });
  }
);

const getSingleSettings = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await SettingsService.getSingleSettings(id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Settings fetched successfully!",
    data: result,
  });
});

const updateSettings = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const payload = req.body;
  const result = await SettingsService.updateSettings(id, payload);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Settings updated in successfully!",
    data: result,
  });
});
const deleteSettings = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await SettingsService.deleteSettings(id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Settings deleted in successfully!",
    data: result,
  });
});

export const SettingsController = {
  addSettings,
  addOrEditShippingCharge,
  getAllSettings,
  getShippingChargeInsideDhaka,
  getShippingChargeOutsideDhaka,
  getSingleSettings,
  updateSettings,
  deleteSettings,
};
