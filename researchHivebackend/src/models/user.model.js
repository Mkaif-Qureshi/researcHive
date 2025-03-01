//import mongoose
import mongoose from "mongoose";

//create schema
const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    mobile_number: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
      minLength: 8,
    },
    profile_pic: {
      type: String,
      default: "",
    },
    gender: {
      type: String,
    },
    age: {
      type: Number,
    },
    role: {
      type: String,
      required: true, // Fixed typo from "requried"
    },
    expertise: {
      type: String,
    },
    ongoing_projects: {
      type: String,
    },
    institution: {
      type: String,
    },
    interests: {
      type: String,
    },
    social_links: {
      type: [String], 
      default: [], 
    },
    visibility:{
      type : Boolean,
      default : true,
    },
  },
  { timestamps: true } // Optional: Adds createdAt and updatedAt fields
);

//now create model from this schema
const User = mongoose.model("User", userSchema); //name of model put singular and first letter as uppercase
export default User;

//when name User ----> mongoose updates and names collection as users
//Message ----> messages
