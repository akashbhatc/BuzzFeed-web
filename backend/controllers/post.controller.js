import Notification from "../models/notification.model.js";
import Post from "../models/post.model.js";
import User from "../models/user.model.js";
import { v2 as cloudinary } from "cloudinary";

//a user can create post , delete post , comment on self or others post , like or unlike the posts , getall posts , get all post
// from following persons , get users post when searched , get the posts that are already liked by me

export const createPost = async (req, res) => { 
	try {
		//when creating a post it requires the image the caption and the userid 
		const { text } = req.body;
		let { img } = req.body;
		const userId = req.user._id.toString(); // the already logged in user , who is performing the request , his id 

		const user = await User.findById(userId);
		if (!user) return res.status(404).json({ message: "User not found" });

		if (!text && !img) {
			return res.status(400).json({ error: "Post must have text or image" });
		}

		if (img) { //if the post has image it has to be uploaded to the cloudinary and get the secureurl 
			const uploadedResponse = await cloudinary.uploader.upload(img);
			img = uploadedResponse.secure_url;
		}

		const newPost = new Post({
			user: userId,
			text,
			img,
		});
		//create the new post 
		await newPost.save();
		res.status(201).json(newPost);
	} catch (error) {
		res.status(500).json({ error: "Internal server error" });
		console.log("Error in createPost controller: ", error);
	}
};

export const deletePost = async (req, res) => {
	try {
		const post = await Post.findById(req.params.id); //get the post id from the database
		if (!post) {
			return res.status(404).json({ error: "Post not found" });
		}
 
		if (post.user.toString() !== req.user._id.toString()) {  // if the post user id and the current user id doesnt match 
			return res.status(401).json({ error: "You are not authorized to delete this post" });
		}

		if (post.img) { // if the post has the image then removed from the clodinary too
			const imgId = post.img.split("/").pop().split(".")[0];
			await cloudinary.uploader.destroy(imgId);
		}

		await Post.findByIdAndDelete(req.params.id); //find the post by the id and delete it

		res.status(200).json({ message: "Post deleted successfully" });
	} catch (error) {
		console.log("Error in deletePost controller: ", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

export const commentOnPost = async (req, res) => {
	try {
		const { text } = req.body; //the comment text 
		const postId = req.params.id; //the post to which we are commenting
		const userId = req.user._id; // my id who is going to comment
		//check whther the post exist and text  exist for the comment
		if (!text) {
			return res.status(400).json({ error: "Text field is required" });
		}
		const post = await Post.findById(postId);

		if (!post) {
			return res.status(404).json({ error: "Post not found" });
		}

		const comment = { user: userId, text }; //comment for a post has userid and the text which is to be stored 

		post.comments.push(comment); // the comment is pushed into the comment object inside post object
		await post.save();

		res.status(200).json(post);
	} catch (error) {
		console.log("Error in commentOnPost controller: ", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

export const likeUnlikePost = async (req, res) => {
	try {
		const userId = req.user._id;
		const { id } = req.params; //get the post id from the params
		//id is the post id 

		const post = await Post.findById(id);

		if (!post) {
			return res.status(404).json({ error: "Post not found" });
		}

		const userLikedPost = post.likes.includes(userId); // if already liked the post
		// if i have already liked the post then pull from the post likes of the user and pull from the user.likedPost 
		if (userLikedPost) {
			// Unlike post
			await Post.updateOne({ _id: id }, { $pull: { likes: userId } });// the user id will be maintained whomever likes the post in the post collection
			await User.updateOne({ _id: userId }, { $pull: { likedPosts: id } });// the post id that has been liked by me will be maintained in the user collection

			const updatedLikes = post.likes.filter((id) => id.toString() !== userId.toString()); //show all the remaining like after 
			//the unlike  ,,, This ensures that the userId is excluded from the new updatedLikes array
			res.status(200).json(updatedLikes);
		} else {
			// Like post
			post.likes.push(userId); //push the current id who has liked 
			await User.updateOne({ _id: userId }, { $push: { likedPosts: id } });//push the current liked post id to my db
			await post.save();

			const notification = new Notification({
				from: userId,
				to: post.user,
				type: "like",
			});
			//send notification of like to a post 
			await notification.save();

			const updatedLikes = post.likes;
			res.status(200).json(updatedLikes);
		}
	} catch (error) {
		console.log("Error in likeUnlikePost controller: ", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

export const getAllPosts = async (req, res) => {
	try {
		const posts = await Post.find()
			.sort({ createdAt: -1 }) // sort by -1 just sorts by the latest post at the top and older to the bottom 
			//the post has user attribute which has only the id , so by using the populate method we get all the info about the user from the id
			.populate({
				path: "user",
				select: "-password",
			})//the entire user object will be populated used to get the user name and others from the user id 
			.populate({
				path: "comments.user", // populate the user info who has commented 
				select: "-password",
			});
			//The populate method allows you to reference documents in other collections and automatically
			// replace the specified paths in the document with documents from other collections

		if (posts.length === 0) {
			return res.status(200).json([]);
		}

		res.status(200).json(posts);
	} catch (error) {
		console.log("Error in getAllPosts controller: ", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

export const getLikedPosts = async (req, res) => { //to get whether the user has liked the post 
	const userId = req.params.id; //userid passed as param

	try {
		const user = await User.findById(userId);
		if (!user) return res.status(404).json({ error: "User not found" });

		const likedPosts = await Post.find({ _id: { $in: user.likedPosts } }) // if the post id is found in the user.likedposts then populate info 
			.populate({
				path: "user",
				select: "-password",
			})
			.populate({
				path: "comments.user",
				select: "-password",
			});

		res.status(200).json(likedPosts);
	} catch (error) {
		console.log("Error in getLikedPosts controller: ", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

export const getFollowingPosts = async (req, res) => {
	try {
		const userId = req.user._id; //req.user._id is the current logged in user 
		const user = await User.findById(userId);
		if (!user) return res.status(404).json({ error: "User not found" });

		const following = user.following; //get all the ids of users that im following
		//for find certain condition has to be given here the user is checked with the following array
		const feedPosts = await Post.find({ user: { $in: following } }) //find all the posts from the ones that i follow ,
		//the post has a user field , find only those posts where those entries are in the following object 
			.sort({ createdAt: -1 })
			.populate({
				path: "user",
				select: "-password",
			})
			.populate({
				path: "comments.user",
				select: "-password",
			});

		res.status(200).json(feedPosts);
	} catch (error) {
		console.log("Error in getFollowingPosts controller: ", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

export const getUserPosts = async (req, res) => {
	try {
		const { username } = req.params; 

		const user = await User.findOne({ username });
		if (!user) return res.status(404).json({ error: "User not found" });

		const posts = await Post.find({ user: user._id }) //get those posts where user field of the post is 
		//equal to the requested user id 
			.sort({ createdAt: -1 })
			.populate({
				path: "user",
				select: "-password",
			})
			.populate({
				path: "comments.user",
				select: "-password",
			});

		res.status(200).json(posts);
	} catch (error) {
		console.log("Error in getUserPosts controller: ", error);
		res.status(500).json({ error: "Internal server error" });
	}
};
