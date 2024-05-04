import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import httpStatus from "http-status";
import { SubjectService } from "./subject.service";
import pick from "../../../shared/pick";
import { paginationFields } from "../../constants/pagination";
import { subjectFilterableFields } from "./subject.constants";

const addSubject = catchAsync(async (req: Request, res: Response) => {
  const result = await SubjectService.addSubject(req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Subject added successfully!",
    data: result,
  });
});

const getAllSubjects = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, subjectFilterableFields);
  const paginationOptions = pick(req.query, paginationFields);

  const result = await SubjectService.getAllSubjects(
    filters,
    paginationOptions
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "All Subjects fetched successfully!",
    data: result,
  });
});

const getSingleSubject = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await SubjectService.getSingleSubject(id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Subject fetched successfully!",
    data: result,
  });
});

const updateSubject = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const payload = req.body;
  const result = await SubjectService.updateSubject(id, payload);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Subject updated in successfully!",
    data: result,
  });
});

const deleteSubject = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await SubjectService.deleteSubject(id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Subject deleted in successfully!",
    data: result,
  });
});

export const SubjectController = {
  addSubject,
  getAllSubjects,
  getSingleSubject,
  updateSubject,
  deleteSubject,
};
