import cloudinary from "../lib/cloudinary.js";
import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";

export const signup = async (req, res) => {
  const {
    name,
    email,
    mobile_number,
    password,
    role,
    profile_pic,
    gender,
    age,
    expertise,
    institutions,
    interests,
    social_links,
    visibility,
  } = req.body;

  console.log(
    email,
    mobile_number,
    password,
    role,
    profile_pic,
    gender,
    age,
    expertise,
    institutions,
    interests,
    social_links,
    visibility
  );

  try {
    // Validate input fields
    if (password.trim().length < 8) {
      return res
        .status(400)
        .json({ message: "Password must be at least 8 characters" });
    }
    if (mobile_number.trim().length !== 13) {
      return res.status(400).json({ message: "Invalid Mobile Number" });
    }
    if (!name.trim()) {
      return res.status(400).json({ message: "Name cannot be empty" });
    }
    if (!email.trim()) {
      return res.status(400).json({ message: "Email cannot be empty" });
    }
    if (!role.trim()) {
      return res.status(400).json({ message: "Role cannot be empty" });
    }

    // Check if user already exists
    const user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Handle profile picture upload if provided
    let profilePicUrl = "";
    if (profile_pic) {
      // Upload the profile picture to Cloudinary
      const uploadRes = await cloudinary.uploader.upload(profile_pic);
      profilePicUrl = uploadRes.secure_url;
    }

    // Create new user
    const newUser = new User({
      name,
      email,
      mobile_number,
      password: hashedPassword,
      role,
      profile_pic: profilePicUrl, // Save the profile picture URL in the database
      gender,
      age,
      expertise,
      institutions,
      interests,
      social_links,
      visibility,
    });

    // Save the user to the database
    await newUser.save();

    // // Generate JWT token
    // generateToken(newUser._id, res);

    // Return success response
    res.status(201).json({
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      mobile_number: newUser.mobile_number,
      profilePic: newUser.profile_pic,
      role: newUser.role,
      gender: newUser.gender,
      age: newUser.age,
      expertise: newUser.expertise,
      institutions: newUser.institutions,
      interests: newUser.interests,
      social_links: newUser.social_links,
      visibility: newUser.visibility,
    });
  } catch (err) {
    console.error(`Error in signup: ${err.message}`);
    res.status(500).json({ message: `Internal Server error: ${err.message}` });
  }
};

export const loginByEmail = async (req, res) => {
  //grab
  const { email, password } = req.body;

  try {
    //find if user exist
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    //exist user
    //bool value
    const isCorrect = await bcrypt.compare(password, user.password);
    if (!isCorrect) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    //correct password then generate token
    generateToken(user._id, res);
    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      mobile_number: user.mobile_number,
      profilePic: user.profile_pic,
      gender: user.gender,
    });
  } catch (err) {
    console.log(`Error in login : ${err.message}`);
    res.status(500).json({ message: `Internal Server error ${err}` });
  }
};
export const loginByMobile = async (req, res) => {
  //grab
  const { mobile_number, password } = req.body;

  try {
    //find if user exist
    const user = await User.findOne({ mobile_number });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    //exist user
    //bool value
    const isCorrect = await bcrypt.compare(password, user.password);
    if (!isCorrect) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    //correct password then generate token
    generateToken(user._id, res);
    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      mobile_number: user.mobile_number,
      profilePic: user.profile_pic,
      gender: user.$isDeletedgender,
    });
  } catch (err) {
    console.log(`Error in login : ${err.message}`);
    res.status(500).json({ message: `Internal Server error ${err}` });
  }
};

export const logout = (req, res) => {
  //during logout just clear out the cookie
  try {
    res.cookie("jwt", "", { maxAge: 0 }); //0ms
    res.status(200).json({ message: "Logged out successfully." });
  } catch (err) {
    console.log(`Error in logout : ${err.message}`);
    res.status(500).json({ message: `Internal Server error ${err}` });
  }
};

export const updateProfilePic = async (req, res) => {
  try {
    //grab
    const { profilePic , userId } = req.body;

    if (!profilePic) {
      res.status(400).json({ message: "Profile pic is required" });
    }

    //upload to cloudinary
    const uploadRes = await cloudinary.uploader.upload(profilePic);

    //update user in database
    const updatedUser = User.findByIdAndUpdate(
      userId,
      { profile_pic: uploadRes.secure_url },
      { new: true }
    ); //secure_url given by clodinary
    //on new : true gives updated object
    return res.status(200).json({ message: "Updated user profile picture" });
  } catch (err) {
    console.log(`Error in Update Profile Pic : ${err.message}`);
    res.status(500).json({ message: `Internal Server error ${err}` });
  }
};

export const updateUserData = async (req, res) => {
  try {
    // Extract the fields from the request body
    const {
      gender,
      age,
      expertise,
      ongoing_projects,
      institution,
      interests,
      social_links,
    } = req.body;

    const userId = req.user._id; // Assuming user ID is stored in the request user object

    if (!gender.trim()) {
      return res.status(400).json({ message: "Gender cannot be empty" });
    }
    if (!age || age <= 0) {
      return res.status(400).json({ message: "Age must be a valid number" });
    }
    if (!expertise.trim()) {
      return res.status(400).json({ message: "Expertise cannot be empty" });
    }
    if (!ongoing_projects.trim()) {
      return res
        .status(400)
        .json({ message: "Ongoing projects cannot be empty" });
    }
    if (!institution.trim()) {
      return res.status(400).json({ message: "Institution cannot be empty" });
    }
    if (!interests.trim()) {
      return res.status(400).json({ message: "Interests cannot be empty" });
    }

    // Prepare the update object
    const updateData = {
      gender,
      age,
      expertise,
      ongoing_projects,
      institution,
      interests,
      social_links: social_links || [], // Default to empty array if not provided // Default to true if not provided
    };

    // Update the user data
    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
    });

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      message: "User profile updated successfully",
      user: updatedUser,
    });
  } catch (err) {
    console.log(`Error in Update User Data: ${err.message}`);
    res.status(500).json({ message: `Internal Server error: ${err.message}` });
  }
};

//check authentication
//current user
export const checkAuth = async (req, res) => {
  res.status(200).json(req.user); //send protect route user only
  try {
  } catch (err) {
    console.log(`Error in Checking Authorization : ${err.message}`);
    res.status(500).json({ message: `Internal Server error ${err}` });
  }
};
