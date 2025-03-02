import React, { useState, useEffect } from 'react';
import { useSearchPapers } from '../hooks/useSearchPapers';
import { usePaperDetail } from '../hooks/usePaperDetail';
import SearchBar from '../components/SearchBar';
import FilterPanel from '../components/FilterPanel';
import PaperCard from '../components/PaperCard';
import PaperDetail from '../components/PaperDetail';
import CollaborationPanel from '../components/CollaborationPanel';
import MyPapersPanel from '../components/MyPapersPanel';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { backend_url } from '../../backendUrl';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, Clock, Star, FileText } from 'lucide-react';
import { Card } from '@/components/ui/card';

const DEFAULT_SEARCH_QUERY = "ai ml";

const Dashboard = () => {
  const [selectedPaperId, setSelectedPaperId] = useState(null);
  const {
    papers,
    loading: searchLoading,
    error: searchError,
    searchPapers,
    setQuery,
    setFilters
  } = useSearchPapers();

  const {
    paper: paperDetail,
    loading: detailLoading,
    error: detailError,
    fetchPaperDetails
  } = usePaperDetail();

  // Fetch initial papers when component mounts
  useEffect(() => {
    searchPapers(DEFAULT_SEARCH_QUERY);
  }, []);

  useEffect(() => {
    if (selectedPaperId) {
      fetchPaperDetails(selectedPaperId);
    }
  }, [selectedPaperId]);

  const handleSearch = (query) => {
    setSelectedPaperId(null);
    searchPapers(query);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    searchPapers(DEFAULT_SEARCH_QUERY, newFilters);
  };

  const handleViewDetails = (paperId) => {
    setSelectedPaperId(paperId);
  };

  const handleBackToSearch = () => {
    setSelectedPaperId(null);
  };

  const PaperStats = () => (
    <div className="grid grid-cols-3 gap-4 mb-6">
      <Card className="p-4 flex items-center gap-3">
        <Star className="h-5 w-5 text-primary" />
        <div>
          <h3 className="font-medium">Results</h3>
          <p className="text-sm text-muted-foreground">{papers?.length || 0} papers found</p>
        </div>
      </Card>
      <Card className="p-4 flex items-center gap-3">
        <FileText className="h-5 w-5 text-primary" />
        <div>
          <h3 className="font-medium">Filter</h3>
          <p className="text-sm text-muted-foreground">Use sidebar to refine</p>
        </div>
      </Card>
    </div>
  );

  return (
    <div className="container mx-auto my-7 p-4">
      <Tabs defaultValue="search" className="mb-6">
        <TabsList>
          <TabsTrigger value="search">Search Papers</TabsTrigger>
          <TabsTrigger value="my-papers">My Papers</TabsTrigger>
        </TabsList>

        <TabsContent value="search">
          <div className="grid grid-cols-12 gap-4">
            {/* Left Sidebar - Filters */}
            <div className="col-span-2">
              <FilterPanel
                filters={{
                  year: null,
                  sortBy: 'relevance',
                  limit: 10,
                  openAccessPdf: false,
                  fieldsOfStudy: []
                }}
                onApplyFilters={handleFilterChange}
              />
            </div>

            {/* Main Content Area */}
            <div className="col-span-7">
              <div className="mb-4">
                <SearchBar onSearch={handleSearch} defaultValue={DEFAULT_SEARCH_QUERY} />
              </div>


              {searchError && (
                <div className="text-red-500 mb-4">
                  Error: {searchError}
                </div>
              )}

              {searchLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-[200px] w-full" />
                  ))}
                </div>
              ) : papers?.length > 0 ? (
                <div className="space-y-4">
                  {papers.map((paper) => (
                    <PaperCard
                      key={paper.paperId}
                      paper={paper}
                      onViewDetails={handleViewDetails}
                      isSelected={selectedPaperId === paper.paperId}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  No papers found. Try adjusting your search query or filters.
                </div>
              )}
            </div>

            {/* Right Sidebar - Paper Details and Collaboration */}
            <div className="col-span-3">
              <Tabs defaultValue="details" className="w-full">
                <TabsList className="w-full">
                  <TabsTrigger value="details" className="flex-1">Details</TabsTrigger>
                  <TabsTrigger value="collaboration" className="flex-1">Review</TabsTrigger>
                </TabsList>

                <TabsContent value="details">
                  {selectedPaperId && (
                    detailLoading ? (
                      <Skeleton className="h-[500px] w-full" />
                    ) : detailError ? (
                      <div className="text-red-500 p-4">
                        Error loading paper details: {detailError}
                      </div>
                    ) : paperDetail ? (
                      <PaperDetail
                        paper={paperDetail}
                        onBack={handleBackToSearch}
                      />
                    ) : null
                  )}
                </TabsContent>

                <TabsContent value="collaboration">
                  <CollaborationPanel paper={paperDetail} />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="my-papers">
          <MyPapersPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;