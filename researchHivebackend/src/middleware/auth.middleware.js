import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const protectRoute = async (req, res, next) => {  // Add next as the 3rd parameter
  try {
    //check if token is there or not
    const token = req.cookies.jwt; //
    //  in cookies to pick cookies we need cookie-parser
    console.log('token')

    console.log(token)

    if (!token) {
      return res
        .status(401)
        .json({ message: "Unauthorized. No Token is provided" });
    }

    //decode the token and find out user._id from it
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    console.log(decoded)

    if (!decoded) {
      return res
        .status(401)
        .json({ message: "Unauthorized. Token is invalid" });
    }


    //find user in database
    const user = await User.findById(decoded.userId).select("-password"); // -password means don't send password but all other data

    if (!user) {
      return res
        .status(404)
        .json({ message: "User not Found" });
    }

    // user authenticated
    req.user = user; // set the authenticated user in the request
    next(); // this will pass control to the next middleware function or route handler

  } catch (err) {
    console.log(`Error in Authorization middleware : ${err.message}`);
    res.status(500).json({ message: `Internal Server error ${err}` });
  }
};
