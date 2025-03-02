import { useState, useEffect } from 'react';
// import { usePeerReview } from '../hooks/usePeerReview';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { AlertCircle, CheckCircle2, Users, Star, Send } from 'lucide-react';
import PaperReviews from './PaperReviews';
import { usePeerReview } from '@/hooks/usePeerReview';
import { useAuth } from '@/context/AuthContext';
import { backend_url } from '../../backendUrl';
import { toast } from 'sonner';

const CollaborationPanel = ({ paper }) => {
  const { currentUser } = useAuth();
  const { loading, error, findReviewers, checkConflictOfInterest } = usePeerReview();
  const [reviewText, setReviewText] = useState('');
  const [reviewScore, setReviewScore] = useState(0);
  const [reviews, setReviews] = useState([]); // State to hold all reviews

  const userReview = null; // Set to null to simulate no review submitted yet

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await fetch(`${backend_url}/api/review/${paper.paperId}`);
        const data = await response.json();
        if (data.success) {
          setReviews(data.reviews); // Populate reviews when the component mounts
        } else {
          console.error('Failed to fetch reviews');
        }
      } catch (error) {
        console.error('Error fetching reviews:', error);
      }
    };
    fetchReviews();
  }, [paper?.paperId]); // Fetch reviews whenever paperId changes

  if (!paper) {
    return (
      <div className="text-center text-muted-foreground py-8">
        Select a paper to view collaboration options
      </div>
    );
  }

  const handleSubmitReview = async () => {
    if (!reviewText || !reviewScore) return;

    try {
      const response = await fetch(`${backend_url}/api/review/create`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paperId: paper.paperId, // Ensure this is the correct paper ID
          comment: reviewText,
          rating: reviewScore,
        }),
      });

      if (response.ok) {
        const newReview = await response.json(); // Get the new review from the server response
        const updatedReview = {
          ...newReview.review, // Spread the existing review data
          user_id: currentUser._id, // Add user ID
          user_name: currentUser.name, // Add user name (or any other relevant user data)
          user_role: currentUser.role, // Add user role (if applicable)
          user_profile_pic: currentUser.profile_pic, // Add user's profile picture (if available)
      };
  
      // Add the new review (with user information) to the top of the list
      setReviews([updatedReview, ...reviews]);
  // Add the new review to the top of the list
        toast.success('Review submitted successfully for paper id: ' + paper.paperId);
        setReviewText('');
        setReviewScore(0);
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to submit review');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Something went wrong!');
    }
  };

  return (
    <div className="space-y-4">
      <Tabs defaultValue="review" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="review">Review</TabsTrigger>
          <TabsTrigger value="discuss">Discuss</TabsTrigger>
        </TabsList>

        <TabsContent value="review" className="space-y-6">
          {/* Review Submission Form */}
          {!userReview && (
            <Card>
              <CardHeader>
                <CardTitle>Submit Your Review</CardTitle>
                <CardDescription>
                  Provide your expert review for this paper
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Review Comments</Label>
                  <Textarea
                    placeholder="Enter your detailed review..."
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    className="min-h-[200px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Score (1-5)</Label>
                  <div className="flex space-x-2">
                    {[1, 2, 3, 4, 5].map((score) => (
                      <Button
                        key={score}
                        variant={reviewScore === score ? 'default' : 'outline'}
                        onClick={() => setReviewScore(score)}
                        className="w-10 h-10 p-0"
                      >
                        {score}
                      </Button>
                    ))}
                  </div>
                </div>

                <Button
                  className="w-full"
                  onClick={handleSubmitReview}
                  disabled={!reviewText || !reviewScore}
                >
                  <Send className="mr-2 h-4 w-4" />
                  Submit Review
                </Button>
              </CardContent>
            </Card>
          )}

          {/* All Reviews Section */}
          <PaperReviews
            paper={paper}
            userReview={userReview}
            reviews={reviews} // Pass the reviews state as a prop to PaperReviews
            onEditReview={() => {
              // Handle edit review
              console.log('Edit review clicked');
            }}
          />
        </TabsContent>

        <TabsContent value="discuss">
          <Card>
            <CardHeader>
              <CardTitle>Discussion</CardTitle>
              <CardDescription>
                Collaborate with other reviewers and authors
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground py-4">
                Discussion features coming soon...
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CollaborationPanel;
