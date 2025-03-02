// src/components/CollaborationPanel.jsx

import { useState } from 'react';
import { usePeerReview } from '../hooks/usePeerReview';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { AlertCircle, CheckCircle2, Users, Star, Send } from 'lucide-react';
import PaperReviews from './PaperReviews';

const CollaborationPanel = ({ paper }) => {
  const { loading, error, findReviewers, checkConflictOfInterest } = usePeerReview();
  const [reviewText, setReviewText] = useState('');
  const [reviewScore, setReviewScore] = useState(0);

  // Mock user's review data (in a real app, this would come from an API)
  const userReview = null; // Set to null to simulate no review submitted yet

  if (!paper) {
    return (
      <div className="text-center text-muted-foreground py-8">
        Select a paper to view collaboration options
      </div>
    );
  }

  const handleSubmitReview = () => {
    // In a real app, this would submit the review to an API
    console.log('Submitting review:', { reviewText, reviewScore });
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