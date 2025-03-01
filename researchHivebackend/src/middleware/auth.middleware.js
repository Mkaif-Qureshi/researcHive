import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const protectRoute = async (req, res) => {
  try {
    //check if token is there or not
    const token = req.cookies.jwt; //in cookies to pick cookies we need cookie parser

    if (!token) {
      return res
        .status(401)
        .json({ message: "Unauthorized. No Token is provided" });
    }

    //decode the token and find out user._id from it
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded) {
      return res
        .status(401)
        .json({ message: "Unauthorized. Token is invalid" });
    }
    //find user in database
    const user = await User.findById(decoded.userId).select("-password"); //-password means dont send password but all other data

    if (!user) {
      return res
        .status(404)
        .json({ message: "User not Found" });
    }

    //user authenticated
    req.user = user //set the authenticated user in request
    next() //calls the next function which is present in the route like update profile

  } catch (err) {
    console.log(`Error in Authorization middleware : ${err.message}`);
    res.status(500).json({ message: `Internal Server error ${err}` });
  }
};
