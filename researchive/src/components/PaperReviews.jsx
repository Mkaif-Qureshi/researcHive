import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Star, ThumbsUp, MessageSquare } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

const ReviewCard = ({ review, isUserReview = false }) => {
    const [showFullComment, setShowFullComment] = useState(false);
    const shouldTruncate = review.comments?.length > 300;
    const displayedComment = shouldTruncate && !showFullComment
        ? `${review.comments.slice(0, 300)}...`
        : review.comments;

    return (
        <Card className={isUserReview ? 'border-primary' : ''}>
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-2">
                            <CardTitle className="text-base">
                                {isUserReview ? 'Your Review' : review.reviewer}
                            </CardTitle>
                            {isUserReview && (
                                <Badge variant="outline" className="text-primary">You</Badge>
                            )}
                        </div>
                        <CardDescription>{new Date(review.date).toLocaleDateString()}</CardDescription>
                    </div>
                    {/* <div className="flex items-center gap-2">
                        {review.status === 'completed' ? (
                            <Badge variant="success">Completed</Badge>
                        ) : (
                            <Badge variant="secondary">Pending</Badge>
                        )}
                    </div> */}
                </div>
            </CardHeader>
            {review.status === 'completed' && (
                <CardContent className="space-y-4">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center">
                            <Star className="h-4 w-4 text-yellow-500 mr-1" />
                            <span className="font-medium">{review.score}/5</span>
                        </div>
                        <div className="flex items-center text-muted-foreground">
                            <ThumbsUp className="h-4 w-4 mr-1" />
                            <span>{review.helpful || 0}</span>
                        </div>
                        {/* <div className="flex items-center text-muted-foreground">
                            <MessageSquare className="h-4 w-4 mr-1" />
                            <span>{review.comments_count || 0}</span>
                        </div> */}
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

const PaperReviews = ({ paper, userReview, onEditReview }) => {
    // Mock data for other reviews
    const otherReviews = [
        {
            id: 1,
            reviewer: 'Dr. Sarah Chen',
            score: 4,
            comments: 'This paper presents a novel approach to deep learning architectures. The methodology is sound and the results are well-documented. However, there are some areas that could benefit from more detailed explanation, particularly in the experimental setup section. The authors should consider adding more details about the hyperparameter selection process and the baseline models used for comparison.',
            date: '2024-02-28',
            status: 'completed',
            helpful: 12,
            comments_count: 3
        },
        {
            id: 2,
            reviewer: 'Prof. James Wilson',
            score: 5,
            comments: 'An excellent contribution to the field. The paper is well-structured and the arguments are presented clearly. The theoretical foundation is solid and the empirical results strongly support the main claims. The discussion section effectively addresses potential limitations and future research directions.',
            date: '2024-02-27',
            status: 'completed',
            helpful: 8,
            comments_count: 2
        },
        {
            id: 3,
            reviewer: 'Dr. Maria Garcia',
            score: null,
            comments: null,
            date: '2024-02-28',
            status: 'pending'
        }
    ];

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold mb-1">Reviews</h3>
                <p className="text-sm text-muted-foreground">
                    {paper.reviewsReceived} of {paper.totalReviewers} reviews completed
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

                    {/* Other reviews */}
                    <div className="space-y-4">
                        {otherReviews.map((review) => (
                            <ReviewCard key={review.id} review={review} />
                        ))}
                    </div>
                </div>
            </ScrollArea>
        </div>
    );
};

export default PaperReviews; 