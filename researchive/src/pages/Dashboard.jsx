import React, { useState, useEffect } from 'react';
import { usePaperDetail } from '../hooks/userPaperDetail.js';
import SearchBar from '../components/SearchBar';
import FilterPanel from '../components/FilterPanel';
import PaperCard from '../components/PaperCard';
import PaperDetail from '../components/PaperDetail';
import CollaborationPanel from '../components/CollaborationPanel';
import MyPapersPanel from '../components/MyPapersPanel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSearchPapers } from '@/hooks/userSearchPapers.js';

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

  // Fetch paper details when selectedPaperId changes
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
    // Re-run the search with current query and new filters
    searchPapers(null, newFilters);
  };

  const handleViewDetails = (paperId) => {
    setSelectedPaperId(paperId);
  };

  const handleBackToSearch = () => {
    setSelectedPaperId(null);
  };

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
                <SearchBar onSearch={handleSearch} />
              </div>

              {searchError && (
                <div className="text-red-500 mb-4">
                  Error: {searchError}
                </div>
              )}

              {searchLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  {papers?.map((paper) => (
                    <PaperCard
                      key={paper.paperId}
                      paper={paper}
                      onViewDetails={handleViewDetails}
                      isSelected={selectedPaperId === paper.paperId}
                    />
                  ))}
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
                      <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                      </div>
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