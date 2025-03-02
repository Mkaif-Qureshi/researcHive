// src/components/PaperCard.jsx

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Book, Users, FileText, ExternalLink, Layout } from 'lucide-react';
import { toast } from 'sonner';

const PaperCard = ({ paper, onViewDetails, onAddToKanban }) => {
  const handleAddToKanban = () => {
    onAddToKanban?.(paper);
    toast.success('Added to Kanban Board', {
      description: `"${paper.title}" has been added to your Kanban board.`,
      duration: 3000,
    });
  };

  return (
    <Card className="w-full hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle className="line-clamp-2 text-lg">{paper.title}</CardTitle>
        <div className="flex flex-wrap gap-2 mt-2">
          {paper.year && (
            <Badge variant="outline">{paper.year}</Badge>
          )}
          {paper.citationCount !== undefined && (
            <Badge variant="secondary">
              <Users className="mr-1 h-3 w-3" />
              {paper.citationCount} citations
            </Badge>
          )}
          {paper.isOpenAccess && (
            <Badge variant="success">Open Access</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {paper.abstract && (
          <p className="text-sm text-muted-foreground line-clamp-3">
            {paper.abstract}
          </p>
        )}
        {paper.tldr && (
          <div className="bg-muted p-2 rounded-md">
            <h4 className="text-xs font-semibold">TLDR:</h4>
            <p className="text-xs">{paper.tldr.text}</p>
          </div>
        )}
        <div className="flex flex-wrap gap-1">
          {paper.fieldsOfStudy?.map(field => (
            <Badge key={field} variant="outline" className="text-xs">
              {field}
            </Badge>
          ))}
        </div>
        {paper.authors && paper.authors.length > 0 && (
          <div className="text-sm">
            <span className="font-medium">Authors: </span>
            <span className="text-muted-foreground">
              {paper.authors.slice(0, 3).map(author => author.name).join(', ')}
              {paper.authors.length > 3 ? ` and ${paper.authors.length - 3} more` : ''}
            </span>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between gap-2">
        <Button variant="outline" size="sm" onClick={() => onViewDetails(paper.paperId)}>
          <FileText className="mr-2 h-4 w-4" />
          Details
        </Button>
        <Button
  variant="secondary"
  size="sm"
  onClick={handleAddToKanban}
  className="hover:bg-primary/20 transition-colors active:scale-95"
>
  <Layout className="mr-2 h-4 w-4" />
  Add to Kanban
</Button>

        {paper.url && (
          <Button variant="ghost" size="sm" asChild>
            <a href={paper.url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-2 h-4 w-4" />
              View
            </a>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default PaperCard;