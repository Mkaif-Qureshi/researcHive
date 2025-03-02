import Review from "../models/review.model.js";

// Create a new review
export const createReview = async (req, res) => {
  try {
    const { paperId, comment, rating } = req.body;
    const userId = req.user._id; // Extracted from the authenticated user

    const newReview = await Review.create({
      userId,
      paperId,
      comment,
      rating,
    });

    res
      .status(201)
      .json({ success: true, message: "Review added", review: newReview });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete a review
export const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const review = await Review.findById(id);
    if (!review) {
      return res
        .status(404)
        .json({ success: false, message: "Review not found" });
    }

    // Check if the review belongs to the authenticated user
    if (review.userId.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({
          success: false,
          message: "Not authorized to delete this review",
        });
    }

    await review.deleteOne();
    res.status(200).json({ success: true, message: "Review deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all reviews for a particular paper
export const getReviewsByPaper = async (req, res) => {
  try {
    const { paperId } = req.params;

    // Fetch reviews and populate user details (name, profilePic, role)
    const reviews = await Review.find({ paperId }).populate(
      "userId",
      "name profile_pic role"
    ); // Select only required fields

    res.status(200).json({ success: true, reviews });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
