import httpStatus from "http-status";
import ApiError from "../../../errors/ApiError";
import { IBook, IBookFilters } from "./book.interface";
import { Book } from "./book.model";
import { IPaginationOptions } from "../../../interfaces/pagination";
import { bookSearchableFields } from "./book.constants";
import { paginationHelpers } from "../../helpers/paginationHelpers";
import { SortOrder } from "mongoose";
import { IGenericResponse } from "../../../interfaces/common";
import { IUploadFile } from "../../../interfaces/file";
import { Request } from "express";
import { FileUploadHelper } from "../../helpers/fileUploadHelper";
import { BookUtills } from "./book.utills";
import { LinkProtectionHelpers } from "../../helpers/protectLink";

// create Book
const addBook = async (req: Request): Promise<IBook> => {
  if (req.file) {
    const file = req.file as IUploadFile;
    const uploadedImage = await FileUploadHelper.uploadToCloudinary(file);

    if (uploadedImage) {
      req.body.cover_page = uploadedImage.secure_url;
    }
  }

  const { pdf_link, ...others } = req.body;
  if (pdf_link) {
    const encryptedPdfLink = LinkProtectionHelpers.encrypt(pdf_link);
    req.body = {
      pdf_link: encryptedPdfLink,
      ...others,
    };
  }

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

// get books of a subject
const getBooksOfASubject = async (
  subject_id: string,
  filters: IBookFilters,
  paginationOptions: IPaginationOptions
): Promise<IGenericResponse<IBook[]>> => {
  const baseQuery = { subject_id };

  return await BookUtills.filterSingleIdFromArrayField(
    baseQuery,
    filters,
    paginationOptions
  );
};

const getBooksOfACategory = async (
  category_id: string,
  filters: IBookFilters,
  paginationOptions: IPaginationOptions
): Promise<IGenericResponse<IBook[]>> => {
  const baseQuery = { category_id };

  return await BookUtills.filterSingleIdFromArrayField(
    baseQuery,
    filters,
    paginationOptions
  );
};

const getBooksOfASubCategory = async (
  sub_category_id: string,
  filters: IBookFilters,
  paginationOptions: IPaginationOptions
): Promise<IGenericResponse<IBook[]>> => {
  const baseQuery = { sub_category_id };

  return await BookUtills.filterSingleIdFromArrayField(
    baseQuery,
    filters,
    paginationOptions
  );
};

// get books of a course
const getBooksOfACourse = async (
  course_id: string,
  filters: IBookFilters,
  paginationOptions: IPaginationOptions
): Promise<IGenericResponse<IBook[]>> => {
  const baseQuery = { course_id };

  return await BookUtills.filterSingleIdFromArrayField(
    baseQuery,
    filters,
    paginationOptions
  );
};

const getBooksOfAProstuti = async (
  prostuti_title: string,
  filters: IBookFilters,
  paginationOptions: IPaginationOptions
): Promise<IGenericResponse<IBook[]>> => {
  const { searchTerm, ...filtersData } = filters;

  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelpers.calculatePagination(paginationOptions);

  const pipeline = [
    {
      $unwind: "$sub_category_id", // Unwind sub_category_id for matching
    },
    {
      $lookup: {
        from: "subcategories",
        localField: "sub_category_id",
        foreignField: "_id",
        as: "sub_category_id",
      },
    },
    {
      $match: {
        "sub_category_id.title": prostuti_title, // Filter by prostuti title
        ...filtersData, // Apply other filters if provided
      },
    },
    {
      $project: {
        title: 1,
        writer: 1,
        price: 1,
        description: 1,
        discount_price: 1,
        cover_page: 1,
        format: 1,
        sample_pdf_link: 1,
        pdf_link: 1,
        category_id: 1,
        sub_category_id: "$sub_category_id._id",
        course_id: 1,
        subject_id: 1,
        createdAt: 1,
      },
    },
  ];

  const intermediatoryBooks = await Book.aggregate(pipeline);

  const distinctBooks = intermediatoryBooks.reduce((acc, book) => {
    // Check if the book's _id already exists in the accumulator
    const existingBook = acc.find((existing: IBook) =>
      existing._id.equals(book._id)
    );

    // If not found, add the book to the accumulator
    if (!existingBook) {
      acc.push(book);
    }

    return acc;
  }, []);

  let result: IBook[] = [];

  // Sort the books
  if (sortBy && sortOrder) {
    // @ts-ignore
    const sortFunction = (a, b) => {
      const fieldA = a[sortBy];
      const fieldB = b[sortBy];

      // Handle different data types
      if (typeof fieldA === "string") {
        return fieldA.localeCompare(fieldB, undefined, { numeric: true }); // Case-insensitive, numeric comparison (optional)
      } else if (fieldA instanceof Date && fieldB instanceof Date) {
        return fieldA.getTime() - fieldB.getTime(); // Sort by date in milliseconds
      } else {
        // Assume numeric comparison for other data types
        return fieldA - fieldB;
      }
    };

    result = distinctBooks.sort(sortFunction);

    // Reverse order for descending sort
    if (sortOrder === "desc") {
      result.reverse();
    }
  } else {
    result = distinctBooks; // No sorting required, use original array
  }

  const beforePagination = [...result];
  const paginatedBooks = beforePagination.splice(skip, skip + limit);

  const total = distinctBooks?.length;

  return {
    meta: {
      page,
      limit,
      total,
    },
    data: paginatedBooks,
  };
};

// get single Book
const getSingleBook = async (
  id: string,
  verifiedMobile: boolean
): Promise<IBook | null> => {
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

  const booksData = JSON.parse(JSON.stringify(result));

  if (verifiedMobile && result?.pdf_link) {
    booksData.pdf_link = LinkProtectionHelpers.decrypt(
      result?.pdf_link as string
    );
  }

  return booksData;
};

// update Book
const updateBook = async (req: Request): Promise<IBook | null> => {
  // find book of given id
  const book = await Book.findById(req.params.id);
  if (!book) {
    throw new ApiError(httpStatus.OK, "Book not found!");
  }

  let payload = req.body;

  // if image is given, upload new, and delete old one
  if (req.file) {
    const file = req.file as IUploadFile;
    const uploadedImage = await FileUploadHelper.uploadToCloudinary(file);

    if (uploadedImage) {
      payload.cover_page = uploadedImage.secure_url;
    }
    if (book.cover_page) {
      // delete that book cover page from cloudinary
      FileUploadHelper.deleteFromCloudinary(book?.cover_page as string);
    }
  }

  if (req.body.pdf_link) {
    const { pdf_link, ...others } = payload;
    const encryptedPdfLink = LinkProtectionHelpers.encrypt(pdf_link);
    payload = {
      pdf_link: encryptedPdfLink,
      ...others,
    };
  }

  // updating book
  const result = await Book.findOneAndUpdate({ _id: req.params.id }, payload, {
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
  getBooksOfACategory,
  getBooksOfASubCategory,
  getBooksOfASubject,
  getBooksOfACourse,
  getBooksOfAProstuti,
  getSingleBook,
  updateBook,
  deleteBook,
};
