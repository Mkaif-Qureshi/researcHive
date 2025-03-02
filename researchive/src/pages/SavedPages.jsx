import React, { useState } from 'react';
import { ExternalLink, Clock, Trash2, Search } from 'lucide-react';

const SavedPages = () => {
  const [papers, setPapers] = useState([
    {
      id: '1',
      title: 'Advances in Neural Information Processing Systems',
      author: 'Geoffrey Hinton, Yann LeCun',
      link: 'https://papers.neurips.cc/paper/2020/file/1457c0d6bfcb4ab1d292c78e1156c979-Paper.pdf',
      savedAt: new Date('2023-10-15T14:30:00')
    },
    {
      id: '2',
      title: 'Attention Is All You Need',
      author: 'Ashish Vaswani, Noam Shazeer, et al.',
      link: 'https://arxiv.org/abs/1706.03762',
      savedAt: new Date('2023-11-02T09:15:00')
    },
    {
      id: '3',
      title: 'Deep Residual Learning for Image Recognition',
      author: 'Kaiming He, Xiangyu Zhang, et al.',
      link: 'https://arxiv.org/abs/1512.03385',
      savedAt: new Date('2023-11-10T16:45:00')
    },
    {
      id: '4',
      title: 'BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding',
      author: 'Jacob Devlin, Ming-Wei Chang, et al.',
      link: 'https://arxiv.org/abs/1810.04805',
      savedAt: new Date('2023-12-05T11:20:00')
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');

  const filteredPapers = papers.filter(paper => 
    paper.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    paper.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (date) => {
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const removePaper = (id) => {
    setPapers(papers.filter(paper => paper.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Saved Research Papers</h1>
        
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
              <div 
                key={paper.id} 
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
              >
                <div className="p-5">
                  <h2 className="text-xl font-semibold text-gray-800 mb-2">{paper.title}</h2>
                  <p className="text-gray-600 mb-3">{paper.author}</p>
                  
                  <div className="flex items-center text-gray-500 mb-4">
                    <Clock className="h-4 w-4 mr-1" />
                    <span className="text-sm">{formatDate(paper.savedAt)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <a 
                      href={paper.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      <span>View Paper</span>
                    </a>
                    
                    <button 
                      onClick={() => removePaper(paper.id)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                      aria-label="Delete paper"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
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