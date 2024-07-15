import jwt from "jsonwebtoken";

export const generateTokenAndSetCookie = (userId, res) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, { //the token in the cookie is stored after encoding with the secret 
    expiresIn: "15d",
  });//token has to be created based on the user id and the jwt secret  which expires in 15 days 
//token generated stored inside the cookie and sent to the browser
  res.cookie("jwt", token, {
    maxAge: 15 * 24 * 60 * 60 * 1000, //till how much time session should remain active,15 days here
    httpOnly: true, // prevent XSS attacks cross-site scripting attacks
    sameSite: "strict", // CSRF attacks cross-site request forgery attacks
  });
};