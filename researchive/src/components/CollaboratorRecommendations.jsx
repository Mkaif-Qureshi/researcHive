import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { UserPlus, Star, BookOpen, CheckCircle, XCircle } from 'lucide-react';
import { backend_url } from '../../backendUrl';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';

const CollaboratorCard = ({ collaborator, onSendRequest, isPending }) => {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center gap-4">
                <Avatar className="h-12 w-12">
                    <AvatarImage src={collaborator.avatarUrl} />
                    <AvatarFallback>{collaborator.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                    <CardTitle className="text-base">{collaborator.name}</CardTitle>
                    <CardDescription>{collaborator.affiliation}</CardDescription>
                </div>
                <div>
                    {isPending ? (
                        <Badge variant="secondary">Request Sent</Badge>
                    ) : (
                        <Button size="sm" onClick={() => onSendRequest(collaborator.id)}>
                            <UserPlus className="h-4 w-4 mr-2" />
                            Invite
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Star className="h-4 w-4" />
                        <span>Expertise: {collaborator.expertise.join(', ')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <BookOpen className="h-4 w-4" />
                        <span>{collaborator.publicationCount} publications</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

const CollaboratorRecommendations = ({ paper }) => {
    const { currentUser } = useAuth();
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pendingRequests, setPendingRequests] = useState(new Set());

    // Fetch recommended collaborators when paper changes
    useEffect(() => {
        const fetchRecommendations = async () => {
            try {
                setLoading(true);
                const response = await fetch(`${backend_url}/api/collaborators/recommend`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        paperId: paper.paperId,
                        keywords: paper.keywords,
                        abstract: paper.abstract,
                    }),
                });

                if (response.ok) {
                    const data = await response.json();
                    setRecommendations(data.recommendations);
                } else {
                    toast.error('Failed to fetch recommendations');
                }
            } catch (error) {
                console.error('Error fetching recommendations:', error);
                toast.error('Something went wrong!');
            } finally {
                setLoading(false);
            }
        };

        if (paper) {
            fetchRecommendations();
        }
    }, [paper]);

    const handleSendRequest = async (collaboratorId) => {
        try {
            const response = await fetch(`${backend_url}/api/collaborations/request`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    paperId: paper.paperId,
                    collaboratorId,
                }),
            });

            if (response.ok) {
                setPendingRequests(prev => new Set([...prev, collaboratorId]));
                toast.success('Collaboration request sent successfully!');
            } else {
                toast.error('Failed to send collaboration request');
            }
        } catch (error) {
            console.error('Error sending collaboration request:', error);
            toast.error('Something went wrong!');
        }
    };

    if (loading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-[120px] w-full" />
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold mb-1">Recommended Collaborators</h3>
                <p className="text-sm text-muted-foreground">
                    Based on research interests and expertise
                </p>
            </div>

            <div className="space-y-4">
                {recommendations.map((collaborator) => (
                    <CollaboratorCard
                        key={collaborator.id}
                        collaborator={collaborator}
                        onSendRequest={handleSendRequest}
                        isPending={pendingRequests.has(collaborator.id)}
                    />
                ))}
            </div>
        </div>
    );
};

export default CollaboratorRecommendations; 