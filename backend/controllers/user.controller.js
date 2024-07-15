import bcrypt from "bcryptjs";
import { v2 as cloudinary } from "cloudinary";

// models
import Notification from "../models/notification.model.js";
import User from "../models/user.model.js";

export const getUserProfile = async (req, res) => {
  const { username } = req.params; //get username as the parameter 

  try {
    const user = await User.findOne({ username }).select("-password"); //find the user with that user name 
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json(user); //send the user details 
  } catch (error) {
    console.log("Error in getUserProfile: ", error.message);
    res.status(500).json({ error: error.message });
  }
};
//req.user is from the middleware in the jwt token in the cookie 
export const followUnfollowUser = async (req, res) => {
  try {
    const { id } = req.params; //id is the other users id which we would like to follow or unfollow
    const userToModify = await User.findById(id);//the other user, whose followers increase or decrease
    const currentUser = await User.findById(req.user._id);//ourself, whose following increase or decrease

    if (id === req.user._id.toString()) { //if the id is same as my id , i cannot follow myself
      return res.status(400).json({ error: "You can't follow/unfollow yourself" });
    }

    if (!userToModify || !currentUser) // if user doesnt exist
      return res.status(400).json({ error: "User not found" });

    const isFollowing = currentUser.following.includes(id); //if the following array includes the current id, then i can unfollow the user

    if (isFollowing) {
      // Unfollow the user
      // from my following array the entry has to be removed using pull when i unfollow
      // and from the other user from the followers array we have to remove the entry using pull
      await User.findByIdAndUpdate(id, { $pull: { followers: req.user._id } }); //pull used to remove the particular entry from the array 
      await User.findByIdAndUpdate(req.user._id, { $pull: { following: id } });
    
      res.status(200).json({ message: "User unfollowed successfully" });
    } else {
      // Follow the user by pushing my id to the other users follower array
      //and push other users id to the my following array 
      await User.findByIdAndUpdate(id, { $push: { followers: req.user._id } });
      await User.findByIdAndUpdate(req.user._id, { $push: { following: id } });
      // Send notification to the user
      //when i follow another user , notification has to be sent to him saying that i have followed
      const newNotification = new Notification({
        type: "follow",
        from: req.user._id,
        to: userToModify._id,
      });

      // await newNotification.save(); //the notification is saved in the model

      res.status(200).json({ message: "User followed successfully" });
    }
  } catch (error) {
    console.log("Error in followUnfollowUser: ", error.message);
    res.status(500).json({ error: error.message });
  }
};

//show the suggested users , who im not following already and not my account
export const getSuggestedUsers = async (req, res) => {
  try {
    const userId = req.user._id; //my id 

    const usersFollowedByMe = await User.findById(userId).select("following");//selects the users followed by me 
//ids of the user that iam already following, find my id and select the following ids
    const users = await User.aggregate([ //aggregate function is to find many based on certain conditions
      {
        $match: {
          _id: { $ne: userId }, //id not equal to my id 
        },
      },
      { $sample: { size: 10 } }, //sample size has to be 10
    ]);
    //filtered users are those who follow me , but i dont follow them 
    const filteredUsers = users.filter(
      (user) => !usersFollowedByMe.following.includes(user._id) //not followed by me but their following includes my id 
    ); //filter is used to create a new array based on the condition

    const suggestedUsers = filteredUsers.slice(0, 4); //only 5 results i want

    suggestedUsers.forEach((user) => (user.password = null));// the users that are being suggested  should have a password of null

    res.status(200).json(suggestedUsers);
  } catch (error) {
    console.log("Error in getSuggestedUsers: ", error.message);
    res.status(500).json({ error: error.message });
  }
};

export const updateUser = async (req, res) => {//user can update all these info
  const { fullName, email, username, currentPassword, newPassword, bio, link } =
    req.body;
    //if user needs to update the password first needs to pass the current password then pass the new one 
  let { profileImg, coverImg } = req.body;

  const userId = req.user._id;

  try {
    let user = await User.findById(userId); //user is let as we have to update so not set to const
    if (!user) return res.status(404).json({ message: "User not found" });

    if (
      (!newPassword && currentPassword) ||
      (!currentPassword && newPassword)
    ) {
      return res
        .status(400)
        .json({
          error: "Please provide both current password and new password",
        });
    }

    if (currentPassword && newPassword) { //if both current password and new password are given
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) // checks whether the current entered password is correct
        return res.status(400).json({ error: "Current password is incorrect" });
      if (newPassword.length < 6) {
        return res
          .status(400)
          .json({ error: "Password must be at least 6 characters long" });
      }
      //hash and store the new password 
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }
//cloudinary has upload and destroy methods 

    if (profileImg) { // if user wants change the profile image 
      if (user.profileImg) { //if user already has one profile image
        await cloudinary.uploader.destroy( //delete existing image and free up resources
          user.profileImg.split("/").pop().split(".")[0] // splits url based on the / and . then oth index is id of image 
          // extracts the image ID from the URL to identify which image to delete.
          //split url based on / pops the last item then takes first element (the image ID) to be used for deletion.
        );
      }

      const uploadedResponse = await cloudinary.uploader.upload(profileImg);  //upload the new image 
      profileImg = uploadedResponse.secure_url; //the images are maintained with urls in the cloudinary , the
      // uploaded image is given a secure url  based on which the image is called or is used
    }

    if (coverImg) {
      if (user.coverImg) {
        await cloudinary.uploader.destroy(
          user.coverImg.split("/").pop().split(".")[0]
        );
      }

      const uploadedResponse = await cloudinary.uploader.upload(coverImg);
      coverImg = uploadedResponse.secure_url;
    }

    //updates reflected in db
    //if user has given then update or else keep the same 
    user.fullName = fullName || user.fullName;
    user.email = email || user.email;
    user.username = username || user.username;
    user.bio = bio || user.bio;
    user.link = link || user.link;
    user.profileImg = profileImg || user.profileImg;
    user.coverImg = coverImg || user.coverImg;

    user = await user.save();

    // password should be null in response
    user.password = null;

    return res.status(200).json(user);
  } catch (error) {
    console.log("Error in updateUser: ", error.message);
    res.status(500).json({ error: error.message });
  }
};
