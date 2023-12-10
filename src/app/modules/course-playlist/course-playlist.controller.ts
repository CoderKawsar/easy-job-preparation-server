import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import httpStatus from "http-status";
import { CoursePlaylistService } from "./course-playlist.service";

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
    const result = await CoursePlaylistService.getAllCoursePlaylists();

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "All course playlists fetched successfully!",
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
  getSingleCoursePlaylist,
  updateCoursePlaylist,
  deleteCoursePlaylist,
};