import httpStatus from "http-status";
import ApiError from "../../../errors/ApiError";
import { ISubCategory, ISubCategoryFilters } from "./sub-category.interface";
import { SubCategory } from "./sub-category.model";
import { Category } from "../category/category.model";
import { IPaginationOptions } from "../../../interfaces/pagination";
import { subCategorySearchableFields } from "./sub-category.constants";
import { paginationHelpers } from "../../helpers/paginationHelpers";
import { SortOrder } from "mongoose";
import { IGenericResponse } from "../../../interfaces/common";
import { Request } from "express";
import { IUploadFile } from "../../../interfaces/file";
import { FileUploadHelper } from "../../helpers/fileUploadHelper";

// create SubCategory
const createSubCategory = async (req: Request): Promise<ISubCategory> => {
  // check if the category found of payload category_id
  const category = await Category.findById(req.body.category_id);
  if (!category) {
    throw new ApiError(httpStatus.OK, "Category not found of your category id");
  }

  if (req.file) {
    const file = req.file as IUploadFile;
    const uploadedImage = await FileUploadHelper.uploadToCloudinary(file);

    if (uploadedImage) {
      req.body.icon = uploadedImage.secure_url;
    }
  }

  const result = (await SubCategory.create(req.body)).populate("category_id");
  return result;
};

// get all sub-categories
const getAllSubCategories = async (
  filters: ISubCategoryFilters,
  paginationOptions: IPaginationOptions
): Promise<IGenericResponse<ISubCategory[]>> => {
  const { searchTerm, ...filtersData } = filters;

  const andConditions = [];

  if (searchTerm) {
    andConditions.push({
      $or: subCategorySearchableFields.map((field) => ({
        [field]: {
          $regex: searchTerm,
          $options: "i",
        },
      })),
    });
  }

  if (Object.keys(filtersData).length) {
    andConditions.push({
      $and: Object.entries(filtersData).map(([field, value]) => ({
        [field]: value,
      })),
    });
  }

  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelpers.calculatePagination(paginationOptions);

  const sortConditions: { [key: string]: SortOrder } = {};
  if (sortBy && sortOrder) {
    sortConditions[sortBy] = sortOrder;
  }

  const whereConditions =
    andConditions.length > 0 ? { $and: andConditions } : {};

  const result = await SubCategory.find(whereConditions)
    .sort(sortConditions)
    .skip(skip)
    .limit(limit)
    .populate({
      path: "category_id",
      select: "-createdAt -updatedAt -__v",
    })
    .select("-createdAt -updatedAt -__v");
  const total = await SubCategory.countDocuments(whereConditions);

  return {
    meta: {
      page,
      limit,
      total,
    },
    data: result,
  };
};

// get all unique SubCategories
const getAllUniqueSubCategories = async () => {
  const result = await SubCategory.distinct("title");

  let predefinedSubcategories = ["প্রিলিমিনারি", "লিখিত", "ভাইভা", "অন্যান্য"];

  let sortedSubcategories = result.sort((a, b) => {
    let indexA = predefinedSubcategories.indexOf(a);
    let indexB = predefinedSubcategories.indexOf(b);

    // If not found in predefinedCategories, push to the end
    if (indexA === -1) indexA = predefinedSubcategories.length;
    if (indexB === -1) indexB = predefinedSubcategories.length;

    // Special handling for "অন্যান্য"
    if (a === "অন্যান্য") return 1;
    if (b === "অন্যান্য") return -1;

    return indexA - indexB;
  });

  return sortedSubcategories;
};

// get SubCategory
const getSingleSubCategory = async (
  id: string
): Promise<ISubCategory | null> => {
  const result = await SubCategory.findById(id)
    .populate({
      path: "category_id",
      select: "-createdAt -updatedAt -__v",
    })
    .select("-createdAt -updatedAt -__v");

  // if the SubCategory is not found, throw error
  if (!result) {
    throw new ApiError(httpStatus.OK, "SubCategory not found!");
  }

  return result;
};

// update Sub-category
const updateSubCategory = async (
  req: Request
): Promise<ISubCategory | null> => {
  // find sub-category of given id
  const subCategory = await SubCategory.findById(req.params.id);
  if (!subCategory) {
    throw new ApiError(httpStatus.OK, "Sub-category not found!");
  }

  // if image is given, upload new, and delete old one
  if (req.file) {
    const file = req.file as IUploadFile;
    const uploadedImage = await FileUploadHelper.uploadToCloudinary(file);

    if (uploadedImage) {
      req.body.icon = uploadedImage.secure_url;
    }
    if (subCategory.icon) {
      // delete that sub-category icon from cloudinary
      FileUploadHelper.deleteFromCloudinary(subCategory?.icon as string);
    }
  }

  // if the category_id is to be update, check if the category exists on that category_id
  if (req.body.category_id) {
    const category = await Category.findById(req.body.category_id);
    if (!category) {
      throw new ApiError(
        httpStatus.OK,
        "Category not found on given category_id!"
      );
    }
  }

  // updating sub-category
  const result = await SubCategory.findOneAndUpdate(
    { _id: req.params.id },
    req.body,
    {
      new: true,
    }
  );

  return result;
};

// delete sub category
const deleteSubCategory = async (id: string) => {
  const subCategory = await SubCategory.findById(id);

  if (!subCategory) {
    throw new ApiError(httpStatus.OK, "Sub-category not found!");
  } else {
    if (subCategory.icon) {
      // delete that sub-category icon from cloudinary
      FileUploadHelper.deleteFromCloudinary(subCategory?.icon as string);
    }
  }

  // find and delete sub-category in one operation
  const result = await SubCategory.findByIdAndDelete(id);
  return result;
};

export const SubCategoryService = {
  createSubCategory,
  getAllSubCategories,
  getAllUniqueSubCategories,
  getSingleSubCategory,
  updateSubCategory,
  deleteSubCategory,
};
