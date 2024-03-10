import httpStatus from "http-status";
import ApiError from "../../../errors/ApiError";
import { Course } from "../course/course.model";
import { IBook, IBookFilters } from "./book.interface";
import { Book } from "./book.model";
import { IPaginationOptions } from "../../../interfaces/pagination";
import { bookSearchableFields } from "./book.constants";
import { paginationHelpers } from "../../helpers/paginationHelpers";
import mongoose, { SortOrder } from "mongoose";
import { IGenericResponse } from "../../../interfaces/common";
import { IUploadFile } from "../../../interfaces/file";
import { Request } from "express";
import { FileUploadHelper } from "../../helpers/fileUploadHelper";
import encryptLink from "../../helpers/encryptLink";


// create Book
const addBook = async (req: Request): Promise<IBook> => {
  // if the provided course_id have the course or not in db
  const { course_id } = req.body;
  if (course_id) {
    const course = await Course.findById(course_id);
    if (!course) {
      throw new ApiError(httpStatus.OK, "Course not found!");
    }
  }

  if (req.file) {
    const file = req.file as IUploadFile;
    const uploadedImage = await FileUploadHelper.uploadToCloudinary(file);

    if (uploadedImage) {
      req.body.cover_page = uploadedImage.secure_url;
    }
  }

  const { pdf_link, ...others } = req.body;
  const encryptedPdfLink = encryptLink(pdf_link);
  req.body = {
    pdf_link: encryptedPdfLink,
    ...others,
  };
  const result = await Book.create(req.body);
  return result;
};

// get all Books
const getAllBooks = async (
  filters: IBookFilters,
  paginationOptions: IPaginationOptions
): Promise<IGenericResponse<IBook[]>> => {
  const { searchTerm, ...filtersData } = filters;

  const andConditions = [];

  if (searchTerm) {
    andConditions.push({
      $or: bookSearchableFields.map((field) => ({
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

  const result = await Book.find(whereConditions)
    .sort(sortConditions)
    .skip(skip)
    .limit(limit)
    .populate({
      path: "course_id",
      select: "title membership_type title",
      populate: {
        path: "sub_category_id",
        select: "title",
        populate: {
          path: "category_id",
          select: "title",
        },
      },
    });
  const total = await Book.countDocuments(whereConditions);

  return {
    meta: {
      page,
      limit,
      total,
    },
    data: result,
  };
};

// const getAllBooksOfASubCategory = async (
//   sub_category_id: string
// ): Promise<IBook[]> => {
//   const allBooks = await Book.find({}).populate({
//     path: "course_id",
//     populate: {
//       path: "sub_category_id",
//       populate: {
//         path: "category_id",
//       },
//     },
//   });

//   let result: IBook[] = [];
//   if (allBooks?.length) {
//     result = allBooks?.filter(
//       (book) =>
//         // @ts-ignore
//         book?.course_id?.sub_category_id?._id.toString() === sub_category_id
//     );
//   }
//   return result;
// };

const getAllBooksOfASubCategory = async (
  sub_category_id: string
): Promise<IBook[]> => {
  const result = await Book.aggregate([
    {
      $lookup: {
        from: "courses",
        localField: "course_id",
        foreignField: "_id",
        as: "courses",
      },
    },
    {
      $unwind: "$courses",
    },
    {
      $match: {
        "courses.sub_category_id": new mongoose.Types.ObjectId(sub_category_id),
      },
    },
    {
      $project: {
        courses: 0, // Exclude the 'courses' field
      },
    },
  ]);

  return result;
};

// get books of a course
const getBooksOfACourse = async (course_id: string): Promise<IBook[]> => {
  const result = await Book.aggregate([
    {
      $match: {
        course_id: {
          $elemMatch: { $eq: new mongoose.Types.ObjectId(course_id) },
        },
      },
    },
  ]);
  return result;
};

// get single Book
const getSingleBook = async (id: string): Promise<IBook | null> => {
  const result = await Book.findById(id).populate({
    path: "course_id",
    select: "title membership_type title",
    populate: {
      path: "sub_category_id",
      select: "title",
      populate: {
        path: "category_id",
        select: "title",
      },
    },
  });

  if (!result) {
    throw new ApiError(httpStatus.OK, "Book not found!");
  }

  return result;
};

// update Book
const updateBook = async (req: Request): Promise<IBook | null> => {
  // find book of given id
  const book = await Book.findById(req.params.id);
  if (!book) {
    throw new ApiError(httpStatus.OK, "Book not found!");
  }

  // if image is given, upload new, and delete old one
  if (req.file) {
    const file = req.file as IUploadFile;
    const uploadedImage = await FileUploadHelper.uploadToCloudinary(file);

    if (uploadedImage) {
      req.body.cover_page = uploadedImage.secure_url;
    }
    if (book.cover_page) {
      // delete that book cover page from cloudinary
      FileUploadHelper.deleteFromCloudinary(book?.cover_page as string);
    }
  }

  if (req.body.pdf_link) {
    const { pdf_link, ...others } = req.body;
    const encryptedPdfLink = encryptLink(pdf_link);
    req.body = {
      pdf_link: encryptedPdfLink,
      ...others,
    };
  }

  // updating book
  const result = await Book.findOneAndUpdate({ _id: req.params.id }, req.body, {
    new: true,
  });

  return result;
};

// delete Book
const deleteBook = async (id: string) => {
  const book = await Book.findById(id);

  if (!book) {
    throw new ApiError(httpStatus.OK, "Book not found!");
  } else {
    if (book.cover_page) {
      // delete that book cover page from cloudinary
      FileUploadHelper.deleteFromCloudinary(book?.cover_page as string);
    }
  }

  // find and delete book in one operation
  const result = await Book.findByIdAndDelete(id);
  return result;
};

export const BookService = {
  addBook,
  getAllBooks,
  getAllBooksOfASubCategory,
  getBooksOfACourse,
  getSingleBook,
  updateBook,
  deleteBook,
};
