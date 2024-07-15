import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import {
	commentOnPost,
	likeUnlikePost,
	createPost,
	deletePost,

	getAllPosts,
	getFollowingPosts,
	getLikedPosts,
	getUserPosts
} from "../controllers/post.controller.js";

const router = express.Router();

router.get("/all", protectRoute, getAllPosts); // to get all the Post,
router.get("/following", protectRoute, getFollowingPosts); //to get all the post from the people that i follow
router.get("/likes/:id", protectRoute, getLikedPosts); // fetches all the post that some user has liked  
router.get("/user/:username", protectRoute, getUserPosts); // fetches all the post by a particular user

//create,like ,comment, delete posts 
router.post("/create", protectRoute, createPost);
router.post("/like/:id", protectRoute, likeUnlikePost);
router.post("/comment/:id", protectRoute, commentOnPost);
router.delete("/:id", protectRoute, deletePost);

export default router;
