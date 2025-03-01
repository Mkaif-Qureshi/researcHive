// Import mongoose
import mongoose from "mongoose";

// Create schema
const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    mobile_number: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minLength: 8,
    },
    profile_pic: {
      type: String,
      default: "",
      maxLength: 300,
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
    },
    age: {
      type: Number,
      min: 0,
    },
    role: {
      type: String,
      required: true,
      enum: ["Reviewer", "Researcher", "Both"], // Ensures valid role assignment
    },
    expertise: {
      type: String,
      trim: true,
    },
    ongoing_projects: {
      type: [String],
      default: [],
    },
    institutions: {
      type: [String],
      default: [],
    },
    interests: {
      type: [String],
      default: [],
    },
    social_links: {
      type: [String],
      default: [],
    },
    visibility: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true } // Adds createdAt and updatedAt fields
);

// Create and export model
const User = mongoose.model("User", userSchema);
export default User;
