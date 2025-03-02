import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import PaperCard from '@/components/PaperCard';

const SavedPages = () => {
  const { currentUser } = useAuth(); // Destructuring currentUser from useAuth hook
  console.log(currentUser)
  const [papers, setPapers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // If currentUser exists, we grab their saved papers
    if (currentUser) {
      setPapers(currentUser.saved_papers || []);
    }
  }, [currentUser]); // Re-run this effect if currentUser changes

  console.log(papers)

  // Filter papers based on search term
  const filteredPapers = papers.filter(paper =>
    paper.abstract.toLowerCase().includes(searchTerm.toLowerCase()) ||
    paper.authors.some(author => author.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleViewDetails = (paperId) => {
    // Handle viewing paper details
    console.log(`View details for paper with id: ${paperId}`);
    // You can implement a modal or redirect to a details page
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto mt-10">
        
        <div className="mb-6 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search papers by title or author..."
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        {filteredPapers.length > 0 ? (
          <div className="space-y-4">
            {filteredPapers.map((paper) => (
              <PaperCard
                key={paper.paperId}  // Assuming paperId is unique
                paper={paper}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            {searchTerm ? (
              <p className="text-gray-600">No papers match your search criteria.</p>
            ) : (
              <p className="text-gray-600">You haven't saved any research papers yet.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedPages;
