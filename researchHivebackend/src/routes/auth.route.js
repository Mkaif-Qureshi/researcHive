import express from "express";
import {checkAuth, loginByEmail, loginByMobile, logout, signup, updateProfilePic, updateUserData } from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

//signup
router.post("/signup", signup);

//login
router.post("/login-by-email", loginByEmail);
router.post("/login-by-mobile", loginByMobile);

//logout
router.post("/logout", logout);


//now update method
router.put("/update-profile-pic" , protectRoute , updateProfilePic) // only authenticated can do so create middleware

//update other data
router.put("/update-user-data" , protectRoute , updateUserData)

//last check authorized or not?
router.get("/check" , protectRoute , checkAuth)

export default router;
