import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import httpStatus from "http-status";
import { CoursePlaylistService } from "./course-playlist.service";
import { SubscriptionHistory } from "../subscription-history/subscription-history.model";
import ApiError from "../../../errors/ApiError";
import pick from "../../../shared/pick";
import { coursePlaylistFilterableFields } from "./course-playlist.constants";
import { paginationFields } from "../../constants/pagination";

const createCoursePlaylist = catchAsync(async (req: Request, res: Response) => {
  const result = await CoursePlaylistService.createCoursePlaylist(req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Course playlist added successfully!",
    data: result,
  });
});

const getAllCoursePlaylists = catchAsync(
  async (req: Request, res: Response) => {
    const filters = pick(req.query, coursePlaylistFilterableFields);
    const paginationOptions = pick(req.query, paginationFields);
    const result = await CoursePlaylistService.getAllCoursePlaylists(
      filters,
      paginationOptions
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "All course playlists fetched successfully!",
      data: result,
    });
  }
);

const getPlaylistsOfACourse = catchAsync(
  async (req: Request, res: Response) => {
    const user_id = req.user?.userId;
    const { course_id } = req.params;

    const currentDate = new Date();
    const subscribed = await SubscriptionHistory.find({
      user_id,
      course_id,
      expire_date: { $gte: currentDate },
    });

    if (!subscribed.length) {
      throw new ApiError(
        httpStatus.OK,
        "No subscription found. You haven't bought this course!"
      );
    }

    const result = await CoursePlaylistService.getPlaylistsOfACourse(course_id);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Course playlists fetched successfully!",
      data: result,
    });
  }
);

const getSingleCoursePlaylist = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await CoursePlaylistService.getSingleCoursePlaylist(id);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Course playlist fetched successfully!",
      data: result,
    });
  }
);

const updateCoursePlaylist = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const payload = req.body;
  const result = await CoursePlaylistService.updateCoursePlaylist(id, payload);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Course playlist updated in successfully!",
    data: result,
  });
});
const deleteCoursePlaylist = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await CoursePlaylistService.deleteCoursePlaylist(id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Course playlist deleted in successfully!",
    data: result,
  });
});

export const CoursePlaylistController = {
  createCoursePlaylist,
  getAllCoursePlaylists,
  getPlaylistsOfACourse,
  getSingleCoursePlaylist,
  updateCoursePlaylist,
  deleteCoursePlaylist,
};
