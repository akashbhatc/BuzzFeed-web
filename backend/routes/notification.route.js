import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import { deleteNotifications, getNotifications } from "../controllers/notification.controller.js";

const router = express.Router(); //express router is used for routing purpose

//get the notification and delete all of them
router.get("/", protectRoute, getNotifications); 
router.delete("/", protectRoute, deleteNotifications);

export default router;
