import { Router } from "express";
import { ExamController } from "./exam.controller";
import validateRequest from "../../middlewares/validateRequest";
import authRole from "../../middlewares/authRole";
import { ENUM_USER_ROLE } from "../../enums/user";
import { ExamValidation } from "./exam.validation";
import { ExamPaymentValidation } from "../exam-payment/exam-payment.validation";
import authPermission from "../../middlewares/authPermission";

const router = Router();

// create exam
router.post(
  "/",
  authRole(ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.ADMIN),
  authPermission("exam"),
  validateRequest(ExamValidation.createExamZodSchema),
  ExamController.createExam
);

// Buy an exam
router.post(
  "/buy-an-exam",
  authRole(
    ENUM_USER_ROLE.SUPER_ADMIN,
    ENUM_USER_ROLE.ADMIN,
    ENUM_USER_ROLE.STUDENT
  ),
  validateRequest(ExamPaymentValidation.createExamPaymentZodSchema),
  ExamController.BuyAnExam
);

// get all exams
router.get("/", ExamController.getAllExams);

// get exams of a sub category
router.get(
  "/sub-category/:sub_category_id",
  ExamController.getSubCategoryExams
);

// get exams of a category
router.get("/category/:category_id", ExamController.getCategoryExams);

// get all due exams
router.get(
  "/my-due-exams",
  authRole(ENUM_USER_ROLE.STUDENT),
  ExamController.getMyDueExams
);

// get single exam
router.get("/:id", ExamController.getSingleExam);

// update single exam
router.patch(
  "/:id",
  authRole(ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.ADMIN),
  authPermission("exam"),
  validateRequest(ExamValidation.updateExamZodSchema),
  ExamController.updateExam
);

// delete single exam
router.delete(
  "/:id",
  authRole(ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.ADMIN),
  authPermission("exam"),
  ExamController.deleteExam
);

export const ExamRoutes = router;
