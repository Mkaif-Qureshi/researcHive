import express from "express";
import { createReview, deleteReview, getReviewsByPaper } from "../controllers/review.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

// Create a new review (Only authenticated users)
router.post("/create", protectRoute, createReview);

// Delete a review (Only authenticated users)
router.delete("/:id", protectRoute, deleteReview);

// Get all reviews for a particular paper
router.get("/:paperId", getReviewsByPaper);

export default router;
