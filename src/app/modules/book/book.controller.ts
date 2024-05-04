import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import httpStatus from "http-status";
import { BookService } from "./book.service";
import pick from "../../../shared/pick";
import { bookFilterableFields } from "./book.constants";
import { paginationFields } from "../../constants/pagination";
import config from "../../../config";
import { isVerfiedMobileApp } from "../../helpers/common";

const addBook = catchAsync(async (req: Request, res: Response) => {
  const result = await BookService.addBook(req);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Book added successfully!",
    data: result,
  });
});

const getAllBooks = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, bookFilterableFields);
  const paginationOptions = pick(req.query, paginationFields);

  const result = await BookService.getAllBooks(filters, paginationOptions);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "All Books fetched successfully!",
    data: result,
  });
});

const getAllBooksOfASubject = catchAsync(
  async (req: Request, res: Response) => {
    const { subject_id } = req.params;

    const filters = pick(req.query, bookFilterableFields);
    const paginationOptions = pick(req.query, paginationFields);

    const result = await BookService.getBooksOfASubject(
      subject_id,
      filters,
      paginationOptions
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Books fetched successfully!",
      data: result.data,
      meta: result.meta,
    });
  }
);

const getAllBooksOfACategory = catchAsync(
  async (req: Request, res: Response) => {
    const { category_id } = req.params;

    const filters = pick(req.query, bookFilterableFields);
    const paginationOptions = pick(req.query, paginationFields);

    const result = await BookService.getBooksOfACategory(
      category_id,
      filters,
      paginationOptions
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Books fetched successfully!",
      data: result.data,
      meta: result.meta,
    });
  }
);

const getAllBooksOfASubCategory = catchAsync(
  async (req: Request, res: Response) => {
    const { sub_category_id } = req.params;

    const filters = pick(req.query, bookFilterableFields);
    const paginationOptions = pick(req.query, paginationFields);

    const result = await BookService.getBooksOfASubCategory(
      sub_category_id,
      filters,
      paginationOptions
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Books fetched successfully!",
      data: result.data,
      meta: result.meta,
    });
  }
);

const getAllBooksOfACourse = catchAsync(async (req: Request, res: Response) => {
  const { course_id } = req.params;

  const filters = pick(req.query, bookFilterableFields);
  const paginationOptions = pick(req.query, paginationFields);

  const result = await BookService.getBooksOfACourse(
    course_id,
    filters,
    paginationOptions
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Books fetched successfully!",
    data: result.data,
    meta: result.meta,
  });
});

const getBooksOfAProstuti = catchAsync(async (req: Request, res: Response) => {
  const { prostuti_title } = req.params;

  const filters = pick(req.query, bookFilterableFields);
  const paginationOptions = pick(req.query, paginationFields);

  const result = await BookService.getBooksOfAProstuti(
    prostuti_title,
    filters,
    paginationOptions
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Books fetched successfully!",
    data: result.data,
    meta: result.meta,
  });
});

const getSingleBook = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  let verifiedMobile = isVerfiedMobileApp(req);

  const result = await BookService.getSingleBook(id, verifiedMobile);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Book fetched successfully!",
    data: result,
  });
});

const updateBook = catchAsync(async (req: Request, res: Response) => {
  const result = await BookService.updateBook(req);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Book updated in successfully!",
    data: result,
  });
});
const deleteBook = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await BookService.deleteBook(id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Book deleted in successfully!",
    data: result,
  });
});

export const BookController = {
  addBook,
  getAllBooks,
  getAllBooksOfACategory,
  getAllBooksOfASubCategory,
  getAllBooksOfASubject,
  getAllBooksOfACourse,
  getBooksOfAProstuti,
  getSingleBook,
  updateBook,
  deleteBook,
};
