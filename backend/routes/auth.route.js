import express from "express";
import { getMe, login, logout, signup } from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/protectRoute.js";

const router = express.Router();

router.get("/me", protectRoute, getMe); //route to get my /logged in user info /profile, once the protectroute function is completed since it is a middleware calls the next function that is getme
router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

export default router;