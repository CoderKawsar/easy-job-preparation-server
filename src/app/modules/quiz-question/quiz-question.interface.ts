import { Types } from "mongoose";
import { ENUM_QUIZ_OPTIONS } from "../../enums/quiz_options";

export interface IQuizQuestion {
  question: string;
  a: string;
  b: string;
  c: string;
  d: string;
  correct_answer: ENUM_QUIZ_OPTIONS;
  exam_id?: Types.ObjectId;
}