import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import httpStatus from "http-status";
import { SubCategoryService } from "./sub-category.service";
import pick from "../../../shared/pick";
import { subCategoryFilterableFields } from "./sub-category.constants";
import { paginationFields } from "../../constants/pagination";

const createSubCategory = catchAsync(async (req: Request, res: Response) => {
  const result = await SubCategoryService.createSubCategory(req);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "SubCategory added successfully!",
    data: result,
  });
});

const getAllSubCategories = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, subCategoryFilterableFields);
  const paginationOptions = pick(req.query, paginationFields);
  const result = await SubCategoryService.getAllSubCategories(
    filters,
    paginationOptions
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "All SubCategories fetched successfully!",
    data: result,
  });
});

const getAllUniqueSubCategories = catchAsync(
  async (req: Request, res: Response) => {
    const result = await SubCategoryService.getAllUniqueSubCategories();

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "All Unique SubCategories fetched successfully!",
      data: result,
    });
  }
);

const getSingleSubCategory = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await SubCategoryService.getSingleSubCategory(id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "SubCategory fetched successfully!",
    data: result,
  });
});

const updateSubCategory = catchAsync(async (req: Request, res: Response) => {
  const result = await SubCategoryService.updateSubCategory(req);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "SubCategory updated in successfully!",
    data: result,
  });
});
const deleteSubCategory = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await SubCategoryService.deleteSubCategory(id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "SubCategory deleted in successfully!",
    data: result,
  });
});

export const SubCategoryController = {
  createSubCategory,
  getAllSubCategories,
  getAllUniqueSubCategories,
  getSingleSubCategory,
  updateSubCategory,
  deleteSubCategory,
};
