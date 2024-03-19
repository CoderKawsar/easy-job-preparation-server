import httpStatus from "http-status";
import ApiError from "../../../errors/ApiError";
import { Course } from "../course/course.model";
import { IExam, IExamFilters } from "./exam.interface";
import { Exam } from "./exam.model";
import { IPaginationOptions } from "../../../interfaces/pagination";
import { examSearchableFields } from "./exam.constants";
import { paginationHelpers } from "../../helpers/paginationHelpers";
import { IGenericResponse } from "../../../interfaces/common";
import mongoose, { SortOrder } from "mongoose";
import { ExamPayment } from "../exam-payment/exam-payment.model";
import { ExamResult } from "../exam-result/exam-result.model";
import { IExamPayment } from "../exam-payment/exam-payment.interface";
import { User } from "../user/user.model";
import { Payment } from "../payment/payment.model";

// create exam
const createExam = async (payload: IExam): Promise<IExam> => {
  // if the provided course_id have the course or not in db
  const { course_id } = payload;
  if (course_id) {
    const course = await Course.findById(course_id);
    if (!course) {
      throw new ApiError(httpStatus.OK, "Course not found!");
    }
  }

  const result = await Exam.create(payload);

  return result;
};

// Buy an exam
const BuyAnExam = async (payload: IExamPayment): Promise<IExamPayment> => {
  // if the provided user_id have the user or not in db
  const { user_id, exam_id } = payload;
  const user = await User.findById(user_id);
  if (!user) {
    throw new ApiError(httpStatus.OK, "User not found!");
  }
  // if the provided exam_id have the exam or not in db
  const exam = await Exam.findById(exam_id);
  if (!exam) {
    throw new ApiError(httpStatus.OK, "Exam not found!");
  }

  const validPayment = await Payment.findOne({ trxID: payload?.trx_id });

  if (!validPayment) {
    throw new ApiError(httpStatus.OK, "Invalid transaction id!");
  }

  if (Number(exam?.fee) > Number(validPayment?.amount)) {
    throw new ApiError(httpStatus.OK, "Invalid payment amount!");
  }

  const result = await ExamPayment.create(payload);

  return result;
};

// get all exams
const getAllExams = async (
  filters: IExamFilters,
  paginationOptions: IPaginationOptions
): Promise<IGenericResponse<IExam[]>> => {
  const { searchTerm, ...filtersData } = filters;

  const andConditions = [];

  if (searchTerm) {
    andConditions.push({
      $or: examSearchableFields.map((field) => ({
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

  const result = await Exam.find(whereConditions)
    .sort(sortConditions)
    .skip(skip)
    .limit(limit)
    .populate("course_id");
  const total = await Exam.countDocuments(whereConditions);

  return {
    meta: {
      page,
      limit,
      total,
    },
    data: result,
  };
};

const getSubCategoryExams = async (sub_category_id: string) => {
  const exams = await Exam.aggregate([
    {
      $lookup: {
        from: "courses",
        localField: "course_id",
        foreignField: "_id",
        as: "course",
      },
    },
    {
      $unwind: "$course",
    },
    {
      $match: {
        "course.sub_category_id": new mongoose.Types.ObjectId(sub_category_id),
      },
    },
    {
      $project: {
        _id: 1,
        title: 1,
        total_marks: 1,
        duration_in_minutes: 1,
        fee: 1,
        is_active: 1,
        exam_type: 1,
        course: {
          _id: 1,
          title: 1,
        },
      },
    },
  ]);

  return exams;
};

const getCategoryExams = async (category_id: string) => {
  const exams = await Exam.aggregate([
    {
      $lookup: {
        from: "courses",
        localField: "course_id",
        foreignField: "_id",
        as: "course",
      },
    },
    {
      $unwind: "$course",
    },
    {
      $match: {
        "course.category_id": new mongoose.Types.ObjectId(category_id),
      },
    },
    {
      $project: {
        _id: 1,
        title: 1,
        total_marks: 1,
        duration_in_minutes: 1,
        fee: 1,
        is_active: 1,
        exam_type: 1,
      },
    },
  ]);

  return exams;
};

// get all due exams
const getMyDueExams = async (user_id: string): Promise<string[] | null> => {
  const dueExamIds: string[] = [];

  const examsPayed = await ExamPayment.find({
    user_id,
  });
  for (const examPayed of examsPayed) {
    const examResult = await ExamResult.findOne({
      user_id,
      exam_id: examPayed?.exam_id,
    }).select("exam_id answer");

    if (!examResult || !examResult?.answer) {
      dueExamIds.push(examPayed?.exam_id.toString());
    }
  }

  if (!dueExamIds.length) {
    throw new ApiError(httpStatus.OK, "No exam due for you!");
  }

  return dueExamIds;
};

// get single exam
const getSingleExam = async (id: string): Promise<IExam | null> => {
  const result = await Exam.findById(id).populate("course_id");

  if (!result) {
    throw new ApiError(httpStatus.OK, "Exam not found!");
  }

  return result;
};

// update exam
const updateExam = async (
  id: string,
  payload: Partial<IExam>
): Promise<IExam | null> => {
  const result = await Exam.findByIdAndUpdate(id, payload, {
    new: true,
  });

  return result;
};

// delete exam
const deleteExam = async (id: string) => {
  const result = await Exam.findByIdAndDelete(id);
  return result;
};

export const ExamService = {
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
