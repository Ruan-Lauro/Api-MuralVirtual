import { Router } from "express";
const router = Router();

import userRoute from "./routes/userRoute";
import authRoute from "./routes/authRoute";
import groupRoute from "./routes/groupRoute";
import muralRoute from "./routes/muralRoute";
import memberRoute from "./routes/memberRoute";
import postsRoute from "./routes/postsRoute";
import notificationRoute from "./routes/notificationRoute";

router.use("/users", userRoute);
router.use("/auth", authRoute);
router.use("/groups", groupRoute);
router.use("/murals", muralRoute);
router.use("/members", memberRoute);
router.use("/posts", postsRoute);
router.use("/tokenNotification", notificationRoute);

export default router;