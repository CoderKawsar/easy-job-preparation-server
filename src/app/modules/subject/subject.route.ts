import { Router } from "express";
import validateRequest from "../../middlewares/validateRequest";
import authRole from "../../middlewares/authRole";
import { ENUM_USER_ROLE } from "../../enums/user";
import { SubjectValidation } from "./subject.validation";
import { SubjectController } from "./subject.controller";

const router = Router();

// create Subject
router.post(
  "/",
  authRole(ENUM_USER_ROLE.SUPER_ADMIN),
  validateRequest(SubjectValidation.addOrUpdateSubjectZodSchema),
  SubjectController.addSubject
);

// get all Subjects
router.get("/", SubjectController.getAllSubjects);

// get single Subject
router.get(
  "/:id",
  authRole(ENUM_USER_ROLE.SUPER_ADMIN),
  SubjectController.getSingleSubject
);

// update single Subject
router.patch(
  "/:id",
  authRole(ENUM_USER_ROLE.SUPER_ADMIN),
  validateRequest(SubjectValidation.addOrUpdateSubjectZodSchema),
  SubjectController.updateSubject
);

// delete single Subject
router.delete(
  "/:id",
  authRole(ENUM_USER_ROLE.SUPER_ADMIN),
  SubjectController.deleteSubject
);

export const SubjectRoutes = router;
