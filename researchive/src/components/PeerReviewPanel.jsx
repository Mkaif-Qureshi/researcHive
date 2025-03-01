import { useState } from 'react';
import { usePeerReview } from '../hooks/usePeerReview';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertCircle, CheckCircle2, Users, Star, Clock } from 'lucide-react';

const PeerReviewPanel = ({ paper }) => {
    const { loading, error, submitPaper, findReviewers, checkConflictOfInterest, getReviewerPool } = usePeerReview();
    const [reviewerCriteria, setReviewerCriteria] = useState({
        expertise: ['AI', 'Machine Learning'],
        availability: 'high',
        minReviews: 3,
        maxReviews: 5
    });
    const [reviewers, setReviewers] = useState([]);
    const [selectedReviewer, setSelectedReviewer] = useState(null);
    const [conflicts, setConflicts] = useState({});

    const handleSubmitForReview = async () => {
        const result = await submitPaper({
            title: paper.title,
            abstract: paper.abstract,
            authors: paper.authors,
            keywords: paper.fieldsOfStudy,
            venue: paper.venue
        });

        if (result) {
            // Handle successful submission
            console.log('Paper submitted for review:', result);
        }
    };

    const handleFindReviewers = async () => {
        const matchedReviewers = await findReviewers(paper.paperId, reviewerCriteria);
        if (matchedReviewers) {
            setReviewers(matchedReviewers);
        }
    };

    const handleCheckConflict = async (reviewerId) => {
        const authorId = paper.authors[0]?.authorId; // Using first author for example
        if (!authorId) return;

        const conflict = await checkConflictOfInterest(authorId, reviewerId);
        if (conflict) {
            setConflicts(prev => ({
                ...prev,
                [reviewerId]: conflict
            }));
        }
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Peer Review Management</CardTitle>
                    <CardDescription>
                        Submit your paper for review and find suitable reviewers
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="submit">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="submit">Submit</TabsTrigger>
                            <TabsTrigger value="find">Find Reviewers</TabsTrigger>
                            <TabsTrigger value="manage">Manage</TabsTrigger>
                        </TabsList>

                        <TabsContent value="submit" className="space-y-4">
                            <div className="space-y-4">
                                <div>
                                    <h3 className="font-medium mb-2">Paper Details</h3>
                                    <div className="space-y-2">
                                        <p><strong>Title:</strong> {paper.title}</p>
                                        <p><strong>Authors:</strong> {paper.authors?.map(a => a.name).join(', ')}</p>
                                        <p><strong>Fields:</strong> {paper.fieldsOfStudy?.join(', ')}</p>
                                    </div>
                                </div>

                                <Button
                                    onClick={handleSubmitForReview}
                                    disabled={loading}
                                >
                                    Submit for Review
                                </Button>
                            </div>
                        </TabsContent>

                        <TabsContent value="find" className="space-y-4">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Required Expertise</Label>
                                    <div className="flex flex-wrap gap-2">
                                        {paper.fieldsOfStudy?.map(field => (
                                            <Badge
                                                key={field}
                                                variant={reviewerCriteria.expertise.includes(field) ? 'default' : 'outline'}
                                                className="cursor-pointer"
                                                onClick={() => {
                                                    setReviewerCriteria(prev => ({
                                                        ...prev,
                                                        expertise: prev.expertise.includes(field)
                                                            ? prev.expertise.filter(f => f !== field)
                                                            : [...prev.expertise, field]
                                                    }));
                                                }}
                                            >
                                                {field}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Number of Reviews</Label>
                                    <div className="flex items-center space-x-4">
                                        <Input
                                            type="number"
                                            value={reviewerCriteria.minReviews}
                                            onChange={(e) => setReviewerCriteria(prev => ({
                                                ...prev,
                                                minReviews: parseInt(e.target.value)
                                            }))}
                                            className="w-20"
                                        />
                                        <span>to</span>
                                        <Input
                                            type="number"
                                            value={reviewerCriteria.maxReviews}
                                            onChange={(e) => setReviewerCriteria(prev => ({
                                                ...prev,
                                                maxReviews: parseInt(e.target.value)
                                            }))}
                                            className="w-20"
                                        />
                                    </div>
                                </div>

                                <Button
                                    onClick={handleFindReviewers}
                                    disabled={loading}
                                >
                                    Find Reviewers
                                </Button>
                            </div>

                            {reviewers.length > 0 && (
                                <ScrollArea className="h-[300px]">
                                    <div className="space-y-2">
                                        {reviewers.map(reviewer => (
                                            <Card key={reviewer.id} className="p-4">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h4 className="font-medium">{reviewer.name}</h4>
                                                        <p className="text-sm text-muted-foreground">
                                                            {reviewer.institution}
                                                        </p>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <Star className="h-4 w-4" />
                                                            <span>{reviewer.rating}</span>
                                                            <Users className="h-4 w-4 ml-2" />
                                                            <span>{reviewer.completedReviews} reviews</span>
                                                        </div>
                                                    </div>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleCheckConflict(reviewer.id)}
                                                    >
                                                        Check Conflicts
                                                    </Button>
                                                </div>
                                                {conflicts[reviewer.id] && (
                                                    <div className="mt-2 p-2 bg-destructive/10 rounded-md flex items-center gap-2">
                                                        <AlertCircle className="h-4 w-4 text-destructive" />
                                                        <span className="text-sm text-destructive">
                                                            Potential conflict detected
                                                        </span>
                                                    </div>
                                                )}
                                            </Card>
                                        ))}
                                    </div>
                                </ScrollArea>
                            )}
                        </TabsContent>

                        <TabsContent value="manage">
                            <div className="text-center text-muted-foreground py-8">
                                Review management features will be available after submission
                            </div>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>

            {error && (
                <div className="bg-destructive/10 text-destructive p-4 rounded-md">
                    {error}
                </div>
            )}
        </div>
    );
};

export default PeerReviewPanel; 