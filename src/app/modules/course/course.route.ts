import { Router } from "express";
import { CourseController } from "./course.controller";
import validateRequest from "../../middlewares/validateRequest";
import authRole from "../../middlewares/authRole";
import { ENUM_USER_ROLE } from "../../enums/user";
import { CourseValidation } from "./course.validation";

const router = Router();

// create Course
router.post(
  "/",
  authRole(ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.ADMIN),
  validateRequest(CourseValidation.createCourseSchema),
  CourseController.createCourse
);

// get all courses
router.get("/", CourseController.getAllCourses);

// get single Course
router.get("/:id", CourseController.getSingleCourse);

// update single Course
router.patch(
  "/:id",
  authRole(ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.ADMIN),
  validateRequest(CourseValidation.updateCourseZodSchema),
  CourseController.updateCourse
);

// delete Course
router.delete(
  "/:id",
  authRole(ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.ADMIN),
  CourseController.deleteCourse
);

export const CourseRoutes = router;