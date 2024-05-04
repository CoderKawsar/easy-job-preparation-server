import { Router } from "express";
import { UserRoutes } from "../modules/user/user.route";
import { ShippingAddressRoutes } from "../modules/shipping-address/shipping-address.route";
import { QuestionRoutes } from "../modules/question/question.route";
import { ExamRoutes } from "../modules/exam/exam.route";
import { CategoryRoutes } from "../modules/category/category.route";
import { SubCategoryRoutes } from "../modules/sub-category/sub-category.route";
import { CourseRoutes } from "../modules/course/course.route";
import { CoursePlaylistRoutes } from "../modules/course-playlist/course-playlist.route";
import { ExamPaymentRoutes } from "../modules/exam-payment/exam-payment.route";
import { BookRoutes } from "../modules/book/book.route";
import { ExamResultRoutes } from "../modules/exam-result/exam-result.route";
import { CartRoutes } from "../modules/cart/cart.route";
import { SubscriptionRoutes } from "../modules/subscription/subscription.route";
import { OrderRoutes } from "../modules/order/order.route";
import { OrderStatusRoutes } from "../modules/order-status/order-status.route";
import { SubscriptionHistoryRoutes } from "../modules/subscription-history/subscription-history.route";
import { OrderDetailsStatusRoutes } from "../modules/order-details/order-details.route";
import { BkashRoutes } from "../modules/payment-bkash/bkash.route";
import { SettingsRoutes } from "../modules/settings/settings.route";
import { NagadPaymentRoutes } from "../modules/payment-nagad/nagad.route";
import { NoticeRoutes } from "../modules/notice/notice.route";
import { MobileAppRoutes } from "../modules/mobile-app/mobile-app.route";
import { SubjectRoutes } from "../modules/subject/subject.route";
import { PaymentRoutes } from "../modules/payment/payment.route";

const router = Router();

const moduleRoutes = [
  { path: "/users", route: UserRoutes },
  { path: "/shipping-addresses", route: ShippingAddressRoutes },
  { path: "/notices", route: NoticeRoutes },
  { path: "/categories", route: CategoryRoutes },
  { path: "/sub-categories", route: SubCategoryRoutes },
  { path: "/courses", route: CourseRoutes },
  { path: "/course-playlists", route: CoursePlaylistRoutes },
  { path: "/exams", route: ExamRoutes },
  { path: "/exam-payments", route: ExamPaymentRoutes },
  { path: "/questions", route: QuestionRoutes },
  { path: "/exam-results", route: ExamResultRoutes },
  { path: "/books", route: BookRoutes },
  { path: "/subjects", route: SubjectRoutes },
  { path: "/carts", route: CartRoutes },
  { path: "/subscriptions", route: SubscriptionRoutes },
  { path: "/subscription-histories", route: SubscriptionHistoryRoutes },
  { path: "/orders", route: OrderRoutes },
  { path: "/order-details", route: OrderDetailsStatusRoutes },
  { path: "/order-statuses", route: OrderStatusRoutes },
  { path: "/payments", route: PaymentRoutes },
  { path: "/bkash", route: BkashRoutes },
  { path: "/nagad", route: NagadPaymentRoutes },
  { path: "/settings", route: SettingsRoutes },
  { path: "/mobile-app", route: MobileAppRoutes },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
