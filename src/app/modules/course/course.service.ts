import httpStatus from "http-status";
import ApiError from "../../../errors/ApiError";
import { ICourse, ICourseFilters } from "./course.interface";
import { Course } from "./course.model";
import { v4 as uuidv4 } from "uuid";
import { SubCategory } from "../sub-category/sub-category.model";
import { IPaginationOptions } from "../../../interfaces/pagination";
import { IGenericResponse } from "../../../interfaces/common";
import { courseSearchableFields } from "./course.constants";
import { paginationHelpers } from "../../helpers/paginationHelpers";
import mongoose, { SortOrder } from "mongoose";
import { Request } from "express";
import { IUploadFile } from "../../../interfaces/file";
import { FileUploadHelper } from "../../helpers/fileUploadHelper";
import { ISubscriptionHistory } from "../subscription-history/subscription-history.interface";
import { User } from "../user/user.model";
import { Subscription } from "../subscription/subscription.model";
import { Payment } from "../payment/payment.model";
import { SubscriptionHistory } from "../subscription-history/subscription-history.model";
import { Types } from "mongoose";
import { ISubscription } from "../subscription/subscription.interface";
import { PaymentUtills } from "../payment/payment.utills";
import { Category } from "../category/category.model";

// create Course
const createCourse = async (req: Request): Promise<ICourse> => {
  // to check if the sub-category is present of the provided sub-category-id
  const { sub_category_id, category_id } = req.body;
  if (sub_category_id) {
    const subCategory = await SubCategory.findById(sub_category_id).populate(
      "category_id"
    );
    if (!subCategory) {
      throw new ApiError(httpStatus.OK, "Sub category not found!");
    }
    // @ts-ignore
    req.body.category_id = subCategory.category_id._id.toString();
  } else if (category_id) {
    // if the category present in providing category id
    const category = await Category.findById(category_id);
    if (!category) {
      throw new ApiError(httpStatus.OK, "Category not found!");
    }
  }

  if (req.file) {
    const file = req.file as IUploadFile;

    const uploadedImage = await FileUploadHelper.uploadToCloudinary(file);

    if (uploadedImage) {
      req.body.banner = uploadedImage.secure_url;
    }
  }

  let result;
  if (sub_category_id) {
    result = (await Course.create(req.body)).populate({
      path: "sub_category_id",
      select: "title _id",
      populate: {
        path: "category_id",
        select: "title _id",
      },
    });
  } else {
    delete req.body.sub_category_id;
    result = (await Course.create(req.body)).populate({
      path: "category_id",
      select: "title _id",
    });
  }
  return result;
};

// buy a course
const BuyACourse = async (
  payload: ISubscriptionHistory
): Promise<ISubscriptionHistory> => {
  // to check if the course is present of the provided course-id
  const { user_id, subscription_id, trx_id } = payload;

  const user = await User.findById(user_id);
  if (!user) {
    throw new ApiError(httpStatus.OK, "User not found!");
  }
  const subscription = await Subscription.findById(subscription_id).populate(
    "course_id"
  );
  if (!subscription) {
    throw new ApiError(httpStatus.OK, "Subscription not found!");
  }

  const validPayment = await Payment.findOne({ trxID: trx_id });
  if (!validPayment) {
    throw new ApiError(httpStatus.OK, "Invalid transaction id!");
  }

  if (Number(subscription?.cost) !== Number(validPayment?.amount)) {
    throw new ApiError(httpStatus.OK, "Invalid payment amount!");
  }

  // check if your subscription day left
  const today: number = new Date().getTime();
  const alreadyHaveSubscription: ISubscriptionHistory[] | null =
    await SubscriptionHistory.find({
      user_id,
      course_id: subscription?.course_id?._id,
      expire_date: { $gt: today },
    });
  // finding the subscription that has most number of days
  const latestSubscription = alreadyHaveSubscription?.sort(
    (a: ISubscriptionHistory, b: ISubscriptionHistory) =>
      b.expire_date.getTime() - a.expire_date.getTime()
  )?.[0];

  let expire_date = new Date();
  expire_date.setMonth(
    expire_date.getMonth() + subscription.subscription_duration_in_months
  );
  if (alreadyHaveSubscription?.length) {
    // Calculate the number of days left for the subscription
    const daysLeft = Math.floor(
      (latestSubscription.expire_date.getTime() - today) / (1000 * 60 * 60 * 24)
    );
    expire_date.setDate(expire_date.getDate() + daysLeft);
  }

  // setting payload for creating subscription history
  payload.course_id = subscription.course_id;
  payload.amount = subscription.cost;
  payload.expire_date = expire_date;
  payload.is_active = payload?.is_active || true;

  const result = await SubscriptionHistory.create(payload);
  return result;
};

// get total price/cost of a sub category
const GetTotalCostsOfSubCategory = async (sub_category_id: string) => {
  const sub_category = await SubCategory.findById(sub_category_id);
  if (!sub_category) {
    throw new ApiError(httpStatus.OK, "Sub category not found!");
  }

  const result = await Course.aggregate([
    {
      $match: {
        sub_category_id: new Types.ObjectId(sub_category_id),
      },
    },
    {
      $lookup: {
        from: "subscriptions", // name of the Subscription collection in MongoDB
        localField: "_id",
        foreignField: "course_id",
        as: "subscription",
      },
    },
    {
      $unwind: "$subscription",
    },
    {
      $project: {
        "subscription.subscription_duration_in_months": 1,
        "subscription.cost": 1,
        "subscription.course_id": 1,
      },
    },
    {
      $group: {
        _id: "$subscription.subscription_duration_in_months",
        total_cost: { $sum: "$subscription.cost" },
        subscriptions: { $push: "$subscription" },
      },
    },
    {
      $project: {
        subscription_duration_in_months: "$_id",
        total_cost: 1,
        subscriptions: 1,
        _id: 0,
      },
    },
    {
      $sort: {
        subscription_duration_in_months: 1,
      },
    },
  ]);

  return result;
};

const BuyAllCoursesOfASubCategory = async (payload: {
  user_id: string;
  sub_category_id: string;
  subscription_duration_in_months: string;
  trx_id?: string;
  payment_ref_id?: string;
}) => {
  const {
    user_id,
    sub_category_id,
    subscription_duration_in_months,
    trx_id,
    payment_ref_id,
  } = payload;

  const user = await User.findById(user_id);
  if (!user) {
    throw new ApiError(httpStatus.OK, "User not found!");
  }

  const sub_category = await SubCategory.findById(sub_category_id);
  if (!sub_category) {
    throw new ApiError(httpStatus.OK, "Sub category not found!");
  }

  // checking validity of transaction id
  const validPayment = await PaymentUtills.validPayment({
    trx_id,
    payment_ref_id,
  });

  // using aggregation pipeline, merge subscriptions and course and group
  const courseSubscriptions = await Course.aggregate([
    {
      $match: {
        sub_category_id: new Types.ObjectId(sub_category_id),
      },
    },
    {
      $lookup: {
        from: "subscriptions", // name of the Subscription collection in MongoDB
        localField: "_id",
        foreignField: "course_id",
        as: "subscription",
      },
    },
    {
      $unwind: "$subscription",
    },
    {
      $match: {
        "subscription.subscription_duration_in_months":
          subscription_duration_in_months,
      },
    },
    {
      $group: {
        _id: "$subscription.subscription_duration_in_months",
        subscriptions: { $push: "$subscription" },
        total_cost: { $sum: "$subscription.cost" },
      },
    },
  ]);
  // if the amount of payment needed is paid
  if (
    courseSubscriptions.length &&
    Number(courseSubscriptions[0]?.total_cost) !== Number(validPayment?.amount)
  ) {
    throw new ApiError(
      httpStatus.OK,
      `Invalid payment amount! You had to pay ${courseSubscriptions[0]?.total_cost} taka!`
    );
  }

  if (courseSubscriptions.length < 1) {
    throw new ApiError(
      httpStatus.OK,
      "No course subscription found for your desired sub category"
    );
  }

  // mapping subscriptions and creating subscriptions histories
  let today: number = new Date().getTime();
  const subscriptionPromises =
    courseSubscriptions.length &&
    courseSubscriptions[0].subscriptions.map(
      async (subscription: ISubscription) => {
        // creating payload to create subscription history
        let subscriptionHistoryPayload: Partial<ISubscriptionHistory> = {
          user_id: new mongoose.Types.ObjectId(user_id),
          subscription_id: subscription?._id,
          course_id: subscription?.course_id,
          amount: subscription?.cost,
          trx_id: trx_id ? `${trx_id}-bundle-${uuidv4().substring(0, 5)}` : "",
          payment_ref_id: payment_ref_id
            ? `${payment_ref_id}-bundle-${uuidv4().substring(0, 5)}`
            : "",
          is_active: true,
        };
        let expire_date = new Date();
        expire_date.setMonth(
          expire_date.getMonth() + subscription.subscription_duration_in_months
        );

        // check if your subscription day left
        const alreadyHaveSubscription: ISubscriptionHistory[] | null =
          await SubscriptionHistory.find({
            user_id,
            course_id: subscription?.course_id,
            expire_date: { $gt: today },
          });

        // finding the subscription that has most number of days
        const latestSubscription = alreadyHaveSubscription?.sort(
          (a: ISubscriptionHistory, b: ISubscriptionHistory) =>
            b.expire_date.getTime() - a.expire_date.getTime()
        )?.[0];

        if (alreadyHaveSubscription?.length) {
          // Calculate the number of days left for the subscription
          const daysLeft = Math.floor(
            (latestSubscription.expire_date.getTime() - today) /
              (1000 * 60 * 60 * 24)
          );
          expire_date.setDate(expire_date.getDate() + daysLeft);
        }
        subscriptionHistoryPayload.expire_date = expire_date;

        await SubscriptionHistory.create(subscriptionHistoryPayload);
      }
    );
  await Promise.all(subscriptionPromises);

  return courseSubscriptions[0];
};

// get all courses
const getAllCourses = async (
  filters: ICourseFilters,
  paginationOptions: IPaginationOptions
): Promise<IGenericResponse<ICourse[]>> => {
  const { searchTerm, ...filtersData } = filters;

  const andConditions = [];

  if (searchTerm) {
    andConditions.push({
      $or: courseSearchableFields.map((field) => ({
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

  let result = await Course.find(whereConditions)
    .sort(sortConditions)
    .skip(skip)
    .limit(limit)
    .populate([
      {
        path: "sub_category_id",
        select: "title _id",
        populate: {
          path: "category_id",
          select: "title _id",
        },
      },
      {
        path: "category_id", // Conditional population for root category_id
        select: "title _id",
      },
    ])
    .select("-createdAt -updatedAt -__v -study_materials");

  const total = await Course.countDocuments(whereConditions);

  return {
    meta: {
      page,
      limit,
      total,
    },
    data: result,
  };
};

const getAllRoutines = async () => {
  const result = await Course.aggregate([
    {
      $project: {
        routine: 1,
        sub_category_id: 1,
        category_id: 1,
        title: 1,
      },
    },
    {
      $group: {
        _id: "$sub_category_id",
        course: {
          $push: "$$ROOT",
        },
      },
    },

    {
      $lookup: {
        from: "subcategories",
        localField: "_id",
        foreignField: "_id",
        as: "sub_category",
      },
    },
    {
      $unwind: "$sub_category",
    },

    {
      $lookup: {
        from: "categories",
        localField: "course.category_id",
        foreignField: "_id",
        as: "category",
      },
    },
    {
      $unwind: "$category",
    },
    {
      $project: {
        sub_category_id: "$sub_category._id",
        sub_category_title: "$sub_category.title",
        category_id: "$category._id",
        category_title: "$category.title",
        course: {
          $map: {
            input: "$course",
            as: "course",
            in: {
              _id: "$$course._id",
              title: "$$course.title",
              routine: "$$course.routine",
            },
          },
        },
      },
    },
  ]);

  return result;
};

// get Course
const getSingleCourse = async (id: string): Promise<ICourse | null> => {
  const result = await Course.findById(id)
    .populate([
      {
        path: "sub_category_id",
        select: "title _id",
        populate: {
          path: "category_id",
          select: "title _id",
        },
      },
      {
        path: "category_id",
        select: "title _id",
      },
    ])
    .select("-createdAt -updatedAt -__v -study_materials");
  // if the Course is not found, throw error
  if (!result) {
    throw new ApiError(httpStatus.OK, "Course not found!");
  }

  return result;
};

// update Course
const updateCourse = async (req: Request): Promise<ICourse | null> => {
  // find course of given id
  const course = await Course.findById(req.params.id);
  if (!course) {
    throw new ApiError(httpStatus.OK, "Course not found!");
  }

  // if image is given, upload new, and delete old one
  if (req.file) {
    const file = req.file as IUploadFile;
    const uploadedImage = await FileUploadHelper.uploadToCloudinary(file);

    if (uploadedImage) {
      req.body.banner = uploadedImage.secure_url;
    }
    if (course.banner) {
      // delete that course banner image from cloudinary
      FileUploadHelper.deleteFromCloudinary(course?.banner as string);
    }
  }

  if (req.body.category_id && !req.body.sub_category_id)
    delete req.body.sub_category_id;

  // updating course
  const result = await Course.findOneAndUpdate(
    { _id: req.params.id },
    req.body,
    {
      new: true,
    }
  );

  return result;
};

// delete course
const deleteCourse = async (id: string) => {
  const course = await Course.findById(id);

  if (!course) {
    throw new ApiError(httpStatus.OK, "Course not found!");
  } else {
    if (course.banner) {
      // delete that course banner from cloudinary
      FileUploadHelper.deleteFromCloudinary(course?.banner as string);
    }
  }

  // find and delete course in one operation
  const result = await Course.findByIdAndDelete(id);
  return result;
};

export const CourseService = {
  createCourse,
  BuyACourse,
  BuyAllCoursesOfASubCategory,
  getAllCourses,
  GetTotalCostsOfSubCategory,
  getAllRoutines,
  getSingleCourse,
  updateCourse,
  deleteCourse,
};
