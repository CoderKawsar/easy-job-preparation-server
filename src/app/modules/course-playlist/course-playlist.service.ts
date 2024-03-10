import httpStatus from "http-status";
import ApiError from "../../../errors/ApiError";
import { SubCategory } from "../sub-category/sub-category.model";
import { ICoursePlaylist } from "./course-playlist.interface";
import { CoursePlaylist } from "./course-playlist.model";
import { Course } from "../course/course.model";
import { IPaginationOptions } from "../../../interfaces/pagination";
import { IGenericResponse } from "../../../interfaces/common";
import { coursePlaylistSearchableFields } from "./course-playlist.constants";
import { paginationHelpers } from "../../helpers/paginationHelpers";
import { SortOrder } from "mongoose";
import { ICourseFilters } from "../course/course.interface";
import encryptLink from "../../helpers/protectLink";


// create CoursePlaylist
const createCoursePlaylist = async (
  payload: ICoursePlaylist
): Promise<ICoursePlaylist> => {
  // to check if the sub-category is present of the provided sub-category-id
  const { course_id } = payload;
  const course = await Course.findById(course_id);
  if (!course) {
    throw new ApiError(httpStatus.OK, "Course not found!");
  }

  const { playlist_link, ...others } = payload;
  const encryptedPlaylistLink = encryptLink(playlist_link);
  payload = {
    playlist_link: encryptedPlaylistLink,
    ...others,
  };

  const result = await CoursePlaylist.create(payload);
  return result;
};

// get all CoursePlaylists
const getAllCoursePlaylists = async (
  filters: ICourseFilters,
  paginationOptions: IPaginationOptions
): Promise<IGenericResponse<ICoursePlaylist[]>> => {
  const { searchTerm, ...filtersData } = filters;

  const andConditions = [];

  if (searchTerm) {
    andConditions.push({
      $or: coursePlaylistSearchableFields.map((field) => ({
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

  let result = await CoursePlaylist.find(whereConditions)
    .sort(sortConditions)
    .skip(skip)
    .limit(limit)
    .populate({
      path: "course_id",
      select: "title author routine _id",
      populate: {
        path: "sub_category_id",
        select: "title _id",
        populate: {
          path: "category_id",
          select: "title _id",
        },
      },
    });
  const total = await CoursePlaylist.countDocuments(whereConditions);

  return {
    meta: {
      page,
      limit,
      total,
    },
    data: result,
  };
};

// get playlists of a course
const getPlaylistsOfACourse = async (
  course_id: string
): Promise<ICoursePlaylist[]> => {
  const result = await CoursePlaylist.find({
    course_id,
  });
  return result;
};

// get Course Playlist
const getSingleCoursePlaylist = async (
  id: string
): Promise<ICoursePlaylist | null> => {
  const result = await CoursePlaylist.findById(id).populate({
    path: "course_id",
    populate: {
      path: "sub_category_id",
      select: "title _id",
      populate: {
        path: "category_id",
        select: "title _id",
      },
    },
  });

  // if the Course Playlist is not found, throw error
  if (!result) {
    throw new ApiError(httpStatus.OK, "Course playlist not found!");
  }

  return result;
};

// update Course Playlist
const updateCoursePlaylist = async (
  id: string,
  payload: Partial<ICoursePlaylist>
): Promise<ICoursePlaylist | null> => {
  if (payload.playlist_link) {
    const { playlist_link, ...others } = payload;
    const encryptedPlaylistLink = encryptLink(playlist_link);
    payload = {
      playlist_link: encryptedPlaylistLink,
      ...others,
    };
  }
  // updating CoursePlaylist
  const result = await CoursePlaylist.findOneAndUpdate({ _id: id }, payload, {
    new: true,
  });

  // if the CoursePlaylist you want to update was not present, i.e. not updated, throw error
  if (!result) {
    throw new ApiError(
      httpStatus.OK,
      "Couldn't update. CoursePlaylist not found!"
    );
  }

  return result;
};

// delete user
const deleteCoursePlaylist = async (id: string) => {
  // find and delete CoursePlaylist in one operation
  const result = await CoursePlaylist.findOneAndDelete({ _id: id });

  // if the CoursePlaylist you want to delete was not present, i.e. not deleted, throw error
  if (!result) {
    throw new ApiError(
      httpStatus.OK,
      "Couldn't delete. CoursePlaylist not found!"
    );
  }

  return result;
};

export const CoursePlaylistService = {
  createCoursePlaylist,
  getAllCoursePlaylists,
  getPlaylistsOfACourse,
  getSingleCoursePlaylist,
  updateCoursePlaylist,
  deleteCoursePlaylist,
};
