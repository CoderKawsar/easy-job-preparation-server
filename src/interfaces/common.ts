import { IGenericErrorMessage } from "./error";

export type IGenericResponse<T> = {
  meta: {
    page: number;
    limit: number;
    total: number;
  };
  data: T;
};

export type IGenericErrorResponse = {
  statusCode: number;
  message: string;
  errorMessages: IGenericErrorMessage[];
};

export type PipelineStage =
  | { $unwind: string }
  | {
      $lookup: {
        from: string;
        localField: string;
        foreignField: string;
        as: string;
      };
    }
  | { $match: { [key: string]: any } }
  | { $project: { [key: string]: 1 } }
  | { $group: { _id?: string | any; [key: string]: any } }
  | { $sort: { [key: string]: 1 | -1 } }
  | { $replaceRoot?: { newRoot: string } };
