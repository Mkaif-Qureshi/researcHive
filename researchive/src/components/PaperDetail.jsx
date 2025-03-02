// src/components/PaperDetail.jsx

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { FileText, Users, Calendar, Book, ExternalLink, ArrowLeft } from 'lucide-react';
import AuthorCard from './AuthorCard';
import CollaborationPanel from './CollaborationPanel';

const PaperDetail = ({ paper, onBack }) => {
  if (!paper) {
    return null;
  }

  return (
    <div className="space-y-6">
      {onBack && (
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Search
        </Button>
      )}

      <Card className="w-full">
        <CardHeader>
          <div className="flex flex-wrap gap-2 mb-2">
            {paper.year && (
              <Badge variant="outline">
                <Calendar className="mr-1 h-3 w-3" />
                {paper.year}
              </Badge>
            )}
            {paper.citationCount !== undefined && (
              <Badge variant="secondary">
                <Users className="mr-1 h-3 w-3" />
                {paper.citationCount} citations
              </Badge>
            )}
            {paper.venue && (
              <Badge variant="default">
                <Book className="mr-1 h-3 w-3" />
                {paper.venue}
              </Badge>
            )}
            {paper.isOpenAccess && (
              <Badge variant="success">Open Access</Badge>
            )}
          </div>
          <CardTitle className="text-2xl">{paper.title}</CardTitle>
          {paper.authors && (
            <CardDescription>
              By {paper.authors.map(author => author.name).join(', ')}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          {paper.abstract && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Abstract</h3>
              <p>{paper.abstract}</p>
            </div>
          )}

          {paper.tldr && (
            <div className="bg-muted p-4 rounded-md">
              <h3 className="text-sm font-semibold mb-1">TLDR:</h3>
              <p>{paper.tldr.text}</p>
            </div>
          )}

          <div>
            <h3 className="text-lg font-semibold mb-2">Fields of Study</h3>
            <div className="flex flex-wrap gap-2">
              {paper.fieldsOfStudy?.map(field => (
                <Badge key={field} variant="outline">
                  {field}
                </Badge>
              ))}
            </div>
          </div>

          <Separator />

          <Tabs defaultValue="authors">
            <TabsList>
              <TabsTrigger value="authors">Authors</TabsTrigger>
              <TabsTrigger value="references">References</TabsTrigger>
              <TabsTrigger value="citations">Citations</TabsTrigger>
              <TabsTrigger value="collaborate">Collaborate</TabsTrigger>
            </TabsList>

            <TabsContent value="authors" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {paper.authors?.map(author => (
                  <AuthorCard key={author.authorId} author={author} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="references">
              <div className="space-y-2">
                {paper.references?.length > 0 ? (
                  paper.references.map(ref => (
                    <Card key={ref.paperId} className="p-2">
                      <p className="font-medium">{ref.title}</p>
                      {ref.authors && <p className="text-sm text-muted-foreground">By {ref.authors.map(a => a.name).join(', ')}</p>}
                    </Card>
                  ))
                ) : (
                  <p className="text-muted-foreground">No references available</p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="citations">
              <div className="space-y-2">
                {paper.citations?.length > 0 ? (
                  paper.citations.map(citation => (
                    <Card key={citation.paperId} className="p-2">
                      <p className="font-medium">{citation.title}</p>
                      {citation.authors && <p className="text-sm text-muted-foreground">By {citation.authors.map(a => a.name).join(', ')}</p>}
                    </Card>
                  ))
                ) : (
                  <p className="text-muted-foreground">No citations available</p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="collaborate">
              <CollaborationPanel paperId={paper.paperId} paperTitle={paper.title} />
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex flex-col items-start gap-3">
          {paper.url && (
            <Button asChild>
              <a href={paper.url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" />
                View on Semantic Scholar
              </a>
            </Button>
          )}
          {paper.openAccessPdf?.url && (
            <Button variant="outline" asChild>
              <a href={paper.openAccessPdf.url} target="_blank" rel="noopener noreferrer">
                <FileText className="mr-2 h-4 w-4" />
                Download PDF
              </a>
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default PaperDetail;