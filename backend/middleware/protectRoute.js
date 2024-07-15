//protect route is basically a middle ware for authenticated user task performance 
import User from "../models/user.model.js";
import jwt from "jsonwebtoken"; //used to authenticate and give the session token 
// a jwt contains a header(metadata), signature , payload(userid and other info)
//this function is used to deal with token validation and session validation etc
//authorized or not 
export const protectRoute = async (req, res, next) => {  //since it is a middleware funciton the next function is called after this functions exxecution
	try {
		const token = req.cookies.jwt; //get the jwt in the browser cookies 
		if (!token) {
			return res.status(401).json({ error: "Unauthorized: No Token Provided" });
		}

		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		//the session token is stored by encoding with the help of the jwtsecret, therefore we have to decode and verify that it is a valid token with the server
		if (!decoded) {
			return res.status(401).json({ error: "Unauthorized: Invalid Token" });
		}

		const user = await User.findById(decoded.userId).select("-password");

		if (!user) {
			return res.status(404).json({ error: "User not found" });
		}

		req.user = user; //entire user details is added to the request and goes to the next function where it will be used 
		next(); //next function called
	} catch (err) {
		console.log("Error in protectRoute middleware", err.message);
		return res.status(500).json({ error: "Internal Server Error" });
	}
};
