import mongoose from "mongoose";

// Create review schema
const reviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    paperId: {
      type: String,
      required: true,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
      maxLength: 500, // Example length for the comment
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
  },
  { timestamps: true } // Adds createdAt and updatedAt fields
);

// Create and export model
const Review = mongoose.model("Review", reviewSchema);
export default Review;
