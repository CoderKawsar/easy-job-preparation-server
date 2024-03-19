import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import httpStatus from "http-status";
import { ExamService } from "./exam.service";
import { examFilterableFields } from "./exam.constants";
import pick from "../../../shared/pick";
import { paginationFields } from "../../constants/pagination";
import { ExamPaymentService } from "../exam-payment/exam-payment.service";

const createExam = catchAsync(async (req: Request, res: Response) => {
  const result = await ExamService.createExam(req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Exam added successfully!",
    data: result,
  });
});

const BuyAnExam = catchAsync(async (req: Request, res: Response) => {
  const result = await ExamPaymentService.createExamPayment(req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Exam fee paid(bought) successfully!",
    data: result,
  });
});

const getAllExams = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, examFilterableFields);
  const paginationOptions = pick(req.query, paginationFields);

  const result = await ExamService.getAllExams(filters, paginationOptions);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "All Exams fetched successfully!",
    data: result,
  });
});

const getSubCategoryExams = catchAsync(async (req: Request, res: Response) => {
  const { sub_category_id } = req.params;

  const result = await ExamService.getSubCategoryExams(sub_category_id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Exams of the sub category fetched successfully!",
    data: result,
  });
});

const getCategoryExams = catchAsync(async (req: Request, res: Response) => {
  const { category_id } = req.params;

  const result = await ExamService.getCategoryExams(category_id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Exams of the category fetched successfully!",
    data: result,
  });
});

const getMyDueExams = catchAsync(async (req: Request, res: Response) => {
  const user_id = req?.user?.userId;
  const result = await ExamService.getMyDueExams(user_id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Due exams fetched successfully!",
    data: result,
  });
});

const getSingleExam = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await ExamService.getSingleExam(id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Exam fetched successfully!",
    data: result,
  });
});

const updateExam = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const payload = req.body;
  const result = await ExamService.updateExam(id, payload);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Exam updated in successfully!",
    data: result,
  });
});
const deleteExam = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await ExamService.deleteExam(id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Exam deleted in successfully!",
    data: result,
  });
});

export const ExamController = {
  createExam,
  BuyAnExam,
  getAllExams,
  getSubCategoryExams,
  getCategoryExams,
  getMyDueExams,
  getSingleExam,
  updateExam,
  deleteExam,
};
