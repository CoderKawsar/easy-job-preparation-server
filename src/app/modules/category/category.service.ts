import httpStatus from "http-status";
import ApiError from "../../../errors/ApiError";
import { ICategory } from "./category.interface";
import { Category } from "./category.model";
import { Request } from "express";
import { IUploadFile } from "../../../interfaces/file";
import { FileUploadHelper } from "../../helpers/fileUploadHelper";
import mongoose from "mongoose";

// create category
const createCategory = async (req: Request) => {
  if (req.file) {
    const file = req.file as IUploadFile;
    const uploadedImage = await FileUploadHelper.uploadToCloudinary(file);

    if (uploadedImage) {
      req.body.icon = uploadedImage.secure_url;
    }
  }

  const result = await Category.create(req.body);
  return result;
};

// get all categories
const getAllCategories = async (): Promise<ICategory[]> => {
  const categoriesWithSubcategories = await Category.aggregate([
    {
      $lookup: {
        from: "subcategories", // The name of the subcategories collection
        localField: "_id",
        foreignField: "category_id",
        as: "subCategories",
      },
    },
    {
      $project: {
        _id: 1,
        title: 1,
        icon: 1,
        subCategories: {
          _id: 1,
          title: 1,
          icon: 1,
        },
      },
    },
  ]);

  let predefinedCategories = [
    "বিসিএস",
    "বি.সি.এস.",
    "বি.সি.এস",
    "BCS",
    "B.C.S.",
    "B.C.S",
    "ব্যাংক",
    "Bank",
    "প্রাইমারি",
    "প্রাইমারী",
    "Primary",
    "এনটিআরসিএ",
    "এন.টি.আর.সি.এ",
    "এন.টি.আর.সি.এ.",
    "এনটি আরসি এ",
    "NTRCA",
    "N.T.R.C.A.",
    "N.T.R.C.A",
    "প্রোগ্রামিং",
    "Programming",
    "অন্যান্য",
    "Others",
  ];

  let sortedCategories = categoriesWithSubcategories.sort((a, b) => {
    let indexA = predefinedCategories.indexOf(a.title);
    let indexB = predefinedCategories.indexOf(b.title);

    // If not found in predefinedCategories, push to the end
    if (indexA === -1) indexA = predefinedCategories.length;
    if (indexB === -1) indexB = predefinedCategories.length;

    // Special handling for "অন্যান্য"
    if (a.title === "অন্যান্য") return 1;
    if (b.title === "অন্যান্য") return -1;

    return indexA - indexB;
  });

  return sortedCategories;
};

/*
// get all categories(another way)
const getAllCategories = async (): Promise<ICategory[]> => {
  const categories: ICategory[] = await Category.find({});

  // if there is no category, throw error
  if (!categories.length) {
    throw new ApiError(httpStatus.OK, "No category found!");
  }

  // sorting categories as per rasel vai's requirement(my way)
  let sortedCategories: ICategory[] = [];

  if (categories && categories?.length) {
    await asyncForEach(categories, async (category: ICategory) => {
      const subCategory = await SubCategory.find({
        category_id: category._id,
      }).select("_id title icon");
      if (subCategory) {
        category.subCategory = subCategory;
        console.log(category.subCategory, "sub-cat");
        console.log(category, "cat");
      }

      // switch (category.title) {
      //   case "বিসিএস":
      //   case "বি.সি.এস.":
      //   case "বি.সি.এস":
      //     sortedCategories.unshift(category);
      //     break;
      //   case "ব্যাংক":
      //     sortedCategories.splice(1, 0, category);
      //     break;
      //   case "প্রাইমারী":
      //   case "প্রাইমারি":
      //     sortedCategories.splice(2, 0, category);
      //     break;
      //   case "এনটিআরসিএ":
      //   case "এনটিআরসিএ":
      //   case "এন.টি.আর.সি.এ.":
      //   case "এন.টি.আর.সি.এ":
      //   case "এনটি আরসি এ":
      //     sortedCategories.splice(3, 0, category);
      //     break;
      //   case "প্রোগ্রামিং":
      //     sortedCategories.splice(4, 0, category);
      //     break;
      //   case "অন্যান্য":
      //     sortedCategories[categories.length] = category;
      //     break;
      //   default:
      //     sortedCategories.splice(5, 0, category);
      //     break;
      // }
    });
  }

  // sortedCategories = sortedCategories.filter(Boolean);
  return categories;
  */

// get category
const getSingleCategory = async (id: string): Promise<ICategory | null> => {
  const categoryWithSubcategories = await Category.aggregate([
    {
      $match: { _id: new mongoose.Types.ObjectId(id) },
    },
    {
      $lookup: {
        from: "subcategories",
        localField: "_id",
        foreignField: "category_id",
        as: "subCategories",
      },
    },
    {
      $project: {
        _id: 1,
        title: 1,
        icon: 1,
        subCategories: {
          _id: 1,
          title: 1,
          icon: 1,
        },
      },
    },
  ]);

  // if the category is not found, throw error
  if (!categoryWithSubcategories.length) {
    throw new ApiError(httpStatus.OK, "Category not found!");
  }

  return categoryWithSubcategories[0];
};

// update category
const updateCategory = async (req: Request): Promise<ICategory | null> => {
  // find category of given id
  const category = await Category.findById(req.params.id);
  if (!category) {
    throw new ApiError(httpStatus.OK, "Category not found!");
  }

  // if image is given, upload new, and delete old one
  if (req.file) {
    const file = req.file as IUploadFile;
    const uploadedImage = await FileUploadHelper.uploadToCloudinary(file);

    if (uploadedImage) {
      req.body.icon = uploadedImage.secure_url;
    }
    if (category.icon) {
      // delete that category icon from cloudinary
      FileUploadHelper.deleteFromCloudinary(category?.icon as string);
    }
  }

  // updating category
  const result = await Category.findOneAndUpdate(
    { _id: req.params.id },
    req.body,
    {
      new: true,
    }
  );
  return result;
};

// delete category
const deleteCategory = async (id: string) => {
  const category = await Category.findById(id);

  if (!category) {
    throw new ApiError(httpStatus.OK, "Category not found!");
  } else {
    if (category.icon) {
      // delete that category icon from cloudinary
      FileUploadHelper.deleteFromCloudinary(category?.icon as string);
    }
  }

  // find and delete category in one operation
  const result = await Category.findByIdAndDelete(id);
  return result;
};

export const CategoryService = {
  createCategory,
  getAllCategories,
  getSingleCategory,
  updateCategory,
  deleteCategory,
};
