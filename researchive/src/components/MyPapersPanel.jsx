import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { PlusCircle, Upload, FileText, Users, Calendar, Book, Star, Clock, CheckCircle, XCircle, Circle } from 'lucide-react';
import { usePeerReview } from '@/hooks/userPeerReview';

const ReviewDialog = ({ paper, isOpen, onClose }) => {
    // Mock reviews data
    const reviews = [
        {
            id: 1,
            reviewer: 'Reviewer A',
            score: 4,
            comments: 'This is a well-written paper with strong methodology. However, some improvements could be made in the discussion section.',
            date: '2024-02-28',
            status: 'completed'
        },
        {
            id: 2,
            reviewer: 'Reviewer B',
            score: null,
            comments: null,
            date: '2024-02-28',
            status: 'pending'
        },
        {
            id: 3,
            reviewer: 'Reviewer C',
            score: null,
            comments: null,
            date: '2024-02-28',
            status: 'pending'
        }
    ];

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Reviews for "{paper.title}"</DialogTitle>
                    <DialogDescription>
                        {paper.reviewsReceived} of {paper.totalReviewers} reviews received
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-6">
                    {reviews.map((review) => (
                        <Card key={review.id}>
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle className="text-base">{review.reviewer}</CardTitle>
                                        <CardDescription>{new Date(review.date).toLocaleDateString()}</CardDescription>
                                    </div>
                                    {review.status === 'completed' ? (
                                        <Badge variant="success">Completed</Badge>
                                    ) : (
                                        <Badge variant="secondary">Pending</Badge>
                                    )}
                                </div>
                            </CardHeader>
                            {review.status === 'completed' && (
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label>Score</Label>
                                        <div className="flex items-center mt-1">
                                            <Star className="h-4 w-4 text-yellow-500 mr-1" />
                                            <span>{review.score}/5</span>
                                        </div>
                                    </div>
                                    <div>
                                        <Label>Comments</Label>
                                        <p className="mt-1 text-sm text-muted-foreground">{review.comments}</p>
                                    </div>
                                </CardContent>
                            )}
                        </Card>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    );
};

const ProgressDialog = ({ paper, isOpen, onClose }) => {
    // Mock progress data
    const progress = {
        submissionDate: new Date(paper.submittedAt),
        reviewsDue: new Date(new Date(paper.submittedAt).getTime() + 30 * 24 * 60 * 60 * 1000),
        reviewsCompleted: paper.reviewsReceived,
        totalReviewers: paper.totalReviewers,
        steps: [
            { id: 1, name: 'Submission', status: 'completed', date: paper.submittedAt },
            { id: 2, name: 'Editor Assignment', status: 'completed', date: '2024-02-29' },
            { id: 3, name: 'Reviewer Assignment', status: 'completed', date: '2024-03-01' },
            { id: 4, name: 'Reviews in Progress', status: 'in_progress' },
            { id: 5, name: 'Decision', status: 'pending' }
        ]
    };

    const getStepIcon = (status) => {
        switch (status) {
            case 'completed':
                return <CheckCircle className="h-5 w-5 text-green-500" />;
            case 'in_progress':
                return <Clock className="h-5 w-5 text-blue-500" />;
            default:
                return <Circle className="h-5 w-5 text-gray-300" />;
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Review Progress</DialogTitle>
                    <DialogDescription>
                        Track the review progress of your paper
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-6">
                    <div>
                        <h4 className="font-medium mb-2">Review Status</h4>
                        <Progress value={(progress.reviewsCompleted / progress.totalReviewers) * 100} className="h-2" />
                        <p className="text-sm text-muted-foreground mt-2">
                            {progress.reviewsCompleted} of {progress.totalReviewers} reviews completed
                        </p>
                    </div>

                    <div>
                        <h4 className="font-medium mb-4">Timeline</h4>
                        <div className="space-y-4">
                            {progress.steps.map((step) => (
                                <div key={step.id} className="flex items-start gap-3">
                                    {getStepIcon(step.status)}
                                    <div>
                                        <p className="font-medium">{step.name}</p>
                                        {step.date && (
                                            <p className="text-sm text-muted-foreground">
                                                {new Date(step.date).toLocaleDateString()}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h4 className="font-medium mb-2">Important Dates</h4>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>Submission Date:</span>
                                <span>{progress.submissionDate.toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span>Reviews Due:</span>
                                <span>{progress.reviewsDue.toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

const MyPapersPanel = () => {
    const { loading, error, submitPaper } = usePeerReview();
    const [showSubmitForm, setShowSubmitForm] = useState(false);
    const [selectedPaper, setSelectedPaper] = useState(null);
    const [showReviews, setShowReviews] = useState(false);
    const [showProgress, setShowProgress] = useState(false);
    const [paperData, setPaperData] = useState({
        title: '',
        abstract: '',
        authors: [{ name: '', affiliation: '' }],
        keywords: [],
        venue: ''
    });
    const [submittedPapers] = useState([
        {
            id: 'mock-1',
            title: 'Deep Learning in Neural Networks: A Comprehensive Survey',
            status: 'under_review',
            submittedAt: '2024-02-28T10:00:00Z',
            reviewsReceived: 1,
            totalReviewers: 3
        },
        {
            id: 'mock-2',
            title: 'Attention Mechanisms in Natural Language Processing',
            status: 'pending_reviewer',
            submittedAt: '2024-03-01T15:30:00Z',
            reviewsReceived: 0,
            totalReviewers: 3
        }
    ]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const result = await submitPaper(paperData);
        if (result?.success) {
            setShowSubmitForm(false);
            // In a real app, you would update the submittedPapers list
        }
    };

    const handleViewReviews = (paper) => {
        setSelectedPaper(paper);
        setShowReviews(true);
    };

    const handleTrackProgress = (paper) => {
        setSelectedPaper(paper);
        setShowProgress(true);
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            under_review: { label: 'Under Review', variant: 'default' },
            pending_reviewer: { label: 'Pending Reviewers', variant: 'secondary' },
            revision_needed: { label: 'Revision Needed', variant: 'warning' },
            accepted: { label: 'Accepted', variant: 'success' },
            rejected: { label: 'Rejected', variant: 'destructive' }
        };

        const config = statusConfig[status] || statusConfig.under_review;
        return <Badge variant={config.variant}>{config.label}</Badge>;
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">My Papers</h2>
                <Button onClick={() => setShowSubmitForm(true)}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Submit New Paper
                </Button>
            </div>

            {showSubmitForm ? (
                <Card>
                    <CardHeader>
                        <CardTitle>Submit Paper for Review</CardTitle>
                        <CardDescription>
                            Fill in the details of your paper to submit it for peer review
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">Paper Title</Label>
                                <Input
                                    id="title"
                                    value={paperData.title}
                                    onChange={(e) => setPaperData(prev => ({ ...prev, title: e.target.value }))}
                                    placeholder="Enter the title of your paper"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="abstract">Abstract</Label>
                                <Textarea
                                    id="abstract"
                                    value={paperData.abstract}
                                    onChange={(e) => setPaperData(prev => ({ ...prev, abstract: e.target.value }))}
                                    placeholder="Enter your paper's abstract"
                                    required
                                    className="min-h-[150px]"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Authors</Label>
                                {paperData.authors.map((author, index) => (
                                    <div key={index} className="flex gap-2">
                                        <Input
                                            placeholder="Author name"
                                            value={author.name}
                                            onChange={(e) => {
                                                const newAuthors = [...paperData.authors];
                                                newAuthors[index].name = e.target.value;
                                                setPaperData(prev => ({ ...prev, authors: newAuthors }));
                                            }}
                                        />
                                        <Input
                                            placeholder="Affiliation"
                                            value={author.affiliation}
                                            onChange={(e) => {
                                                const newAuthors = [...paperData.authors];
                                                newAuthors[index].affiliation = e.target.value;
                                                setPaperData(prev => ({ ...prev, authors: newAuthors }));
                                            }}
                                        />
                                    </div>
                                ))}
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setPaperData(prev => ({
                                        ...prev,
                                        authors: [...prev.authors, { name: '', affiliation: '' }]
                                    }))}
                                >
                                    Add Author
                                </Button>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="venue">Target Venue</Label>
                                <Input
                                    id="venue"
                                    value={paperData.venue}
                                    onChange={(e) => setPaperData(prev => ({ ...prev, venue: e.target.value }))}
                                    placeholder="Conference or journal name"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="keywords">Keywords</Label>
                                <Input
                                    id="keywords"
                                    placeholder="Enter keywords separated by commas"
                                    onChange={(e) => setPaperData(prev => ({
                                        ...prev,
                                        keywords: e.target.value.split(',').map(k => k.trim())
                                    }))}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="paper-file">Upload Paper (PDF)</Label>
                                <Input id="paper-file" type="file" accept=".pdf" required />
                            </div>
                        </form>
                    </CardContent>
                    <CardFooter className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => setShowSubmitForm(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSubmit} disabled={loading}>
                            <Upload className="mr-2 h-4 w-4" />
                            Submit for Review
                        </Button>
                    </CardFooter>
                </Card>
            ) : (
                <div className="space-y-4">
                    {submittedPapers.map(paper => (
                        <Card key={paper.id}>
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <CardTitle>{paper.title}</CardTitle>
                                        <CardDescription>
                                            Submitted on {new Date(paper.submittedAt).toLocaleDateString()}
                                        </CardDescription>
                                    </div>
                                    {getStatusBadge(paper.status)}
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center space-x-4">
                                    <div className="flex items-center">
                                        <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                                        <span>{paper.reviewsReceived}/{paper.totalReviewers} reviews received</span>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="flex justify-end space-x-2">
                                <Button variant="outline" onClick={() => handleViewReviews(paper)}>
                                    <FileText className="mr-2 h-4 w-4" />
                                    View Reviews
                                </Button>
                                <Button onClick={() => handleTrackProgress(paper)}>
                                    Track Progress
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}

            {error && (
                <div className="bg-destructive/10 text-destructive p-4 rounded-md">
                    {error}
                </div>
            )}

            {selectedPaper && (
                <>
                    <ReviewDialog
                        paper={selectedPaper}
                        isOpen={showReviews}
                        onClose={() => setShowReviews(false)}
                    />
                    <ProgressDialog
                        paper={selectedPaper}
                        isOpen={showProgress}
                        onClose={() => setShowProgress(false)}
                    />
                </>
            )}
        </div>
    );
};

export default MyPapersPanel; 