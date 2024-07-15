import path from "path"; //module which is used to work in a file path //eg ; path.join(__dirname, "public")
import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser"; //used to parse the client browser cookies
import { v2 as cloudinary } from "cloudinary"; //cloud based content management (images and videos)

import authRoutes from "./routes/auth.route.js";
import userRoutes from "./routes/user.route.js";
import postRoutes from "./routes/post.route.js";
import notificationRoutes from "./routes/notification.route.js";

import connectMongoDB from "./db/connectMongoDB.js";

dotenv.config(); // configure dotenv , to read dotenv file three steps to be followed , import , config and process.env read 

cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET,
});
//configure the cloudinary by giving the details, by which upload and delete of images can be done 

const app = express();
const PORT = process.env.PORT || 5000; //if not found use 5000 port 
const __dirname = path.resolve();

//app.use is used for the middlewares 
app.use(express.json({ limit: "5mb" })); // middleware to parse req.body
// limit shouldn't be too high to prevent DOS
app.use(express.urlencoded({ extended: true })); // to parse form data(urlencoded) - if the data is being sent in url encoded form we have to parse that

app.use(cookieParser()); //this middleware is used to parse the browser cookies helps in getting the jwt token related info 

app.use("/api/auth", authRoutes); // goes to api/auth then further slash in the authRoutes 
app.use("/api/users", userRoutes); // goes to api/users then further slash in the authRoutes 
app.use("/api/posts", postRoutes);
app.use("/api/notifications", notificationRoutes);


//Serves static files, Sends the index.html file for all routes that don't match any other static files.
if (process.env.NODE_ENV === "production") {
	app.use(express.static(path.join(__dirname, "/frontend/dist")));
	//app.use to use middleware , express.static is a built-in middleware function to serve static files, such as images, CSS files, JavaScript files,
	app.get("*", (req, res) => {
		res.sendFile(path.resolve(__dirname, "frontend","dist", "index.html")); v//resolve is just like multiple path.join
		// by using resolve goes to frontend/dist/index.html 
	});
}

app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
	connectMongoDB(); //mongodb has to be connected with the server that's why calls the function 
});
