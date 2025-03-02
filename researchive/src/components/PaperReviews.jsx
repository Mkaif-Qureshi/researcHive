import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Star, ThumbsUp } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { backend_url } from '../../backendUrl';

const ReviewCard = ({ review, isUserReview = false }) => {
    const [showFullComment, setShowFullComment] = useState(false);
    const shouldTruncate = review.comment?.length > 300;
    const displayedComment = shouldTruncate && !showFullComment
        ? `${review.comment.slice(0, 300)}...`
        : review.comment;

    return (
        <Card className={isUserReview ? 'border-primary' : ''}>
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-2">
                            <CardTitle className="text-base">
                                {isUserReview ? 'Your Review' : review.userId.name}
                            </CardTitle>
                            {isUserReview && (
                                <Badge variant="outline" className="text-primary">You</Badge>
                            )}
                        </div>
                        <CardDescription>{new Date(review.createdAt).toLocaleDateString()}</CardDescription>
                    </div>
                </div>
            </CardHeader>
            {review.status === 'completed' && (
                <CardContent className="space-y-4">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center">
                            <Star className="h-4 w-4 text-yellow-500 mr-1" />
                            <span className="font-medium">{review.rating}/5</span>
                        </div>
                        <div className="flex items-center text-muted-foreground">
                            <ThumbsUp className="h-4 w-4 mr-1" />
                            <span>{review.helpful || 0}</span>
                        </div>
                    </div>

                    <div>
                        <Label>Comments</Label>
                        <p className="mt-1 text-sm text-muted-foreground">
                            {displayedComment}
                        </p>
                        {shouldTruncate && (
                            <Button
                                variant="link"
                                className="px-0 text-primary"
                                onClick={() => setShowFullComment(!showFullComment)}
                            >
                                {showFullComment ? 'Show less' : 'Read more'}
                            </Button>
                        )}
                    </div>
                </CardContent>
            )}
            {isUserReview && review.status === 'completed' && (
                <CardFooter>
                    <Button variant="outline" size="sm">Edit Review</Button>
                </CardFooter>
            )}
        </Card>
    );
};

const PaperReviews = ({ paperId, userReview, onEditReview }) => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const response = await fetch(`${backend_url}/api/reviews/${paperId}`);
                if (response.ok) {
                    const data = await response.json();
                    if (data.success) {
                        setReviews(data.reviews);
                    } else {
                        setError('Failed to fetch reviews');
                    }
                } else {
                    setError('Failed to fetch reviews');
                }
            } catch (error) {
                setError('Error fetching reviews');
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchReviews();
    }, [paperId]);

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold mb-1">Reviews</h3>
                <p className="text-sm text-muted-foreground">
                    {/* Assuming you can calculate reviewsReceived and totalReviewers from paper */}
                    {/* Example: {paperId.reviewsReceived} of {paperId.totalReviewers} reviews completed */}
                    {/* Replace with dynamic values if needed */}
                    {/* e.g. {reviews.length} reviews received */}
                    {reviews.length} reviews received
                </p>
            </div>

            <ScrollArea className="h-[600px] pr-4">
                <div className="space-y-6">
                    {/* User's review at the top if it exists */}
                    {userReview && (
                        <>
                            <ReviewCard review={userReview} isUserReview={true} />
                            <Separator />
                        </>
                    )}

                    {/* Show loading or error messages */}
                    {loading ? (
                        <p>Loading reviews...</p>
                    ) : error ? (
                        <p className="text-red-500">{error}</p>
                    ) : (
                        <div className="space-y-4">
                            {reviews.map((review) => (
                                <ReviewCard key={review._id} review={review} />
                            ))}
                        </div>
                    )}
                </div>
            </ScrollArea>
        </div>
    );
};

export default PaperReviews;
