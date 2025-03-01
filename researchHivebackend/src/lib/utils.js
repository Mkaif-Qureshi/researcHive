import jwt from "jsonwebtoken";
export const generateToken = (userId, res) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    //options
    expiresIn: "7d",
  });

  //send cookie in response with name as jwt
  res.cookie("jwt", token, {
    //options to make it more secure
    maxAge: 7 * 24 * 60 * 60 * 1000, //in milliseconds
    httpOnly: true, //prevents XSS attacks and cross-site scripting attacks
    sameSite: "strict", //CSRF attacks cross-site request forgery attacks
    secure: process.env.NODE_ENV !== "development",
  });

  return token;
};
