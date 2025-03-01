// src/components/AuthorCard.jsx

import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ExternalLink } from 'lucide-react';

const AuthorCard = ({ author }) => {
  const getInitials = (name) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card>
      <CardContent className="p-4 flex items-center space-x-4">
        <Avatar>
          <AvatarFallback>{getInitials(author.name)}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="font-medium">{author.name}</div>
          {author.affiliations && (
            <div className="text-sm text-muted-foreground">{author.affiliations.join('; ')}</div>
          )}
          <div className="flex items-center mt-2 space-x-4 text-xs text-muted-foreground">
            {author.paperCount !== undefined && (
              <div>Papers: {author.paperCount}</div>
            )}
            {author.citationCount !== undefined && (
              <div>Citations: {author.citationCount}</div>
            )}
            {author.hIndex !== undefined && (
              <div>h-index: {author.hIndex}</div>
            )}
          </div>
        </div>
        {author.url && (
          <a 
            href={author.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-primary"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        )}
      </CardContent>
    </Card>
  );
};

export default AuthorCard;