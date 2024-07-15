import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import { followUnfollowUser, getSuggestedUsers, getUserProfile, updateUser } from "../controllers/user.controller.js";

const router = express.Router();

router.get("/profile/:username", protectRoute, getUserProfile); //get user based on the username 
router.get("/suggested", protectRoute, getSuggestedUsers); // get suggested users
router.post("/follow/:id", protectRoute, followUnfollowUser); //follow and unfollow user with id 
router.post("/update", protectRoute, updateUser); // update my own profile 

export default router;
