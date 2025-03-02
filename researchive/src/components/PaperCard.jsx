import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Book, Users, FileText, ExternalLink, Save } from 'lucide-react';
import { backend_url } from '../../backendUrl';
import { toast } from 'sonner';

const PaperCard = ({ paper, onViewDetails }) => {
  const handleSave = async () => {
    try {
      // Sending the complete paper object to the backend to be saved in the user's saved_papers array
      const response = await fetch(`${backend_url}/api/auth/update-saved-papers`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ paper }),
      });

      let data = await response.json();

      if (response.ok) {
        toast.success('Paper saved successfully');
      } else {
        toast.success(data.message || 'Error saving the paper');
      }
    } catch (err) {
      console.error('Error while saving the paper:', err);
      toast.success(err.message || 'Error saving the paper');
    }
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
      <CardFooter className="flex justify-between">
        <Button variant="outline" size="sm" onClick={() => onViewDetails(paper.paperId)}>
          <FileText className="mr-2 h-4 w-4" />
          Details
        </Button>
        {paper.url && (
          <Button variant="ghost" size="sm" asChild>
            <a href={paper.url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-2 h-4 w-4" />
              View
            </a>
          </Button>
        )}
        {/* Save Button */}
        <Button variant="outline" size="sm" onClick={handleSave}>
          <Save className="mr-2 h-4 w-4" />
          Save
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PaperCard;
