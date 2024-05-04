import { SortOrder } from "mongoose";
import { bookSearchableFields } from "./book.constants";
import { Book } from "./book.model";
import { paginationHelpers } from "../../helpers/paginationHelpers";
import { IPaginationOptions } from "../../../interfaces/pagination";
import { IBookFilters } from "./book.interface";

const filterSingleIdFromArrayField = async (
  baseQuery: { [key: string]: string },
  filters: IBookFilters,
  paginationOptions: IPaginationOptions
) => {
  const { searchTerm, ...filtersData } = filters;
  const dynamicFilters = [];

  if (searchTerm) {
    dynamicFilters.push({
      $or: bookSearchableFields.map((field) => ({
        [field]: {
          $regex: searchTerm,
          $options: "i",
        },
      })),
    });
  }

  if (Object.keys(filtersData).length) {
    dynamicFilters.push({
      $and: Object.entries(filtersData).map(([field, value]) => ({
        [field]: value,
      })),
    });
  }

  // Combine base filter with dynamic filters (if any)
  const whereConditions =
    dynamicFilters.length > 0
      ? { ...baseQuery, $and: dynamicFilters }
      : baseQuery;

  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelpers.calculatePagination(paginationOptions);

  const sortConditions: { [key: string]: SortOrder } = {};
  if (sortBy && sortOrder) {
    sortConditions[sortBy] = sortOrder;
  }

  const result = await Book.find(whereConditions)
    .sort(sortConditions)
    .skip(skip)
    .limit(limit);

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

export const BookUtills = {
  filterSingleIdFromArrayField,
};
