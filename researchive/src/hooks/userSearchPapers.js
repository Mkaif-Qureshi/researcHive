import { useState, useEffect } from 'react';

export function useSearchPapers() {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState({});
  const [papers, setPapers] = useState([]);
  const [totalResults, setTotalResults] = useState(0);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const searchPapers = async (newQuery = null, newFilters = null, newOffset = 0) => {
    try {
      setLoading(true);
      setError(null);
      
      // Use new values or current state
      const searchQuery = newQuery !== null ? newQuery : query;
      const searchFilters = newFilters !== null ? newFilters : filters;
      const searchOffset = newOffset !== null ? newOffset : offset;
      
      if (!searchQuery) {
        setPapers([]);
        setTotalResults(0);
        setLoading(false);
        return;
      }

      // Build the API URL with query parameters
      let url = `https://api.semanticscholar.org/graph/v1/paper/search?query=${encodeURIComponent(searchQuery)}`;
      
      // Add offset parameter
      url += `&offset=${searchOffset}`;
      
      // Add limit parameter
      url += '&limit=10';
      
      // Add year filter if specified
      if (searchFilters.year) {
        url += `&year=${searchFilters.year}`;
      }
      
      // Add openAccessPdf filter if true
      if (searchFilters.openAccessPdf) {
        url += '&openAccessPdf';
      }
      
      // Add fieldsOfStudy filter if specified
      if (searchFilters.fieldsOfStudy && searchFilters.fieldsOfStudy.length > 0) {
        url += `&fieldsOfStudy=${searchFilters.fieldsOfStudy.join(',')}`;
      }
      
      // Add fields parameter to specify return fields
      url += '&fields=url,abstract,authors,year,citationCount,fieldsOfStudy,openAccessPdf,tldr';
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      console.log("before")
      const data = await response.json();
      console.log("search api called")
      console.log(data)
      
      // Update state with the fetched data
      setPapers(data.data || []);
      setTotalResults(data.total || 0);
      setOffset(searchOffset);
      
      // Update state variables if new values were provided
      if (newQuery !== null) setQuery(newQuery);
      if (newFilters !== null) setFilters(newFilters);
      
      return data;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    searchPapers(null, null, offset + 10);
  };

  return {
    query,
    setQuery,
    filters,
    setFilters,
    papers,
    totalResults,
    offset,
    loading,
    error,
    searchPapers,
    loadMore
  };
}