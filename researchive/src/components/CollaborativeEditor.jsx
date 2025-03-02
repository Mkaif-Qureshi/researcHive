import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Users } from 'lucide-react';

const ETHERPAD_URL = 'http://localhost:9001';

const CollaborativeEditor = ({ paper }) => {
    const padId = `paper_${paper.id}`;
    const [userName, setUserName] = useState('');
    const [isJoined, setIsJoined] = useState(false);
    const [activeUsers, setActiveUsers] = useState([]);

    // Add user to active users when they join
    const handleJoin = () => {
        if (userName.trim()) {
            setActiveUsers(prev => [...prev, userName.trim()]);
            setIsJoined(true);
        }
    };

    // Create the Etherpad URL with user name
    const getEditorUrl = () => {
        const baseUrl = `${ETHERPAD_URL}/p/${padId}`;
        const params = new URLSearchParams({
            userName: userName,
            showControls: true,
            showChat: true,
            showLineNumbers: true,
            useMonospaceFont: false
        });
        return `${baseUrl}?${params.toString()}`;
    };

    if (!isJoined) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Join Collaborative Session</CardTitle>
                    <CardDescription>
                        Enter your name to start collaborating on the paper
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="userName">Your Name</Label>
                            <Input
                                id="userName"
                                value={userName}
                                onChange={(e) => setUserName(e.target.value)}
                                placeholder="Enter your name"
                                onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
                            />
                        </div>
                        <Button onClick={handleJoin} disabled={!userName.trim()}>
                            Join Session
                        </Button>

                        <div className="text-sm text-muted-foreground">
                            <p className="font-medium">Testing Instructions:</p>
                            <ol className="list-decimal list-inside space-y-1 mt-2">
                                <li>Open this page in another browser window</li>
                                <li>Enter a different name in each window</li>
                                <li>Join the session in both windows</li>
                                <li>Start collaborating in real-time!</li>
                            </ol>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle>Real-time Editor</CardTitle>
                        <CardDescription>
                            Collaborating as {userName}
                        </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <div className="flex gap-2">
                            {activeUsers.map((user, index) => (
                                <Badge key={index} variant="secondary">
                                    {user}
                                </Badge>
                            ))}
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="relative rounded-lg overflow-hidden border bg-white h-[600px]">
                    <iframe
                        src={getEditorUrl()}
                        className="w-full h-full"
                        title="Collaborative Editor"
                    />
                </div>

                <Button
                    variant="ghost"
                    className="mt-4"
                    onClick={() => {
                        setIsJoined(false);
                        setUserName('');
                        setActiveUsers(prev => prev.filter(user => user !== userName));
                    }}
                >
                    Leave Session
                </Button>
            </CardContent>
        </Card>
    );
};

export default CollaborativeEditor; 