// src/hooks/usePaperDetail.js

import { useState } from 'react';

export function usePaperDetail() {
  const [paper, setPaper] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPaperDetails = async (paperId) => {
    try {
      setLoading(true);
      setError(null);

      if (!paperId) {
        setPaper(null);
        return null;
      }

      const url = `https://api.semanticscholar.org/graph/v1/paper/${paperId}?fields=url,abstract,authors,year,citationCount,references,citations,fieldsOfStudy,openAccessPdf,tldr,venue,publicationTypes,referenceCount,influentialCitationCount`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      setPaper(data);
      return data;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    paper,
    loading,
    error,
    fetchPaperDetails
  };
}