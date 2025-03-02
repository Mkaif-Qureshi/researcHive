import { useState, useEffect } from 'react';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

export function useSearchPapers() {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState({});
  const [papers, setPapers] = useState([]);
  const [totalResults, setTotalResults] = useState(0);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Helper function to delay execution
  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  // Helper function to make the API request with retry logic
  const makeRequest = async (url, retryCount = 0) => {
    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (err) {
      // If we haven't exceeded max retries and it's a network error or 5xx error
      if (retryCount < MAX_RETRIES &&
        (err.message.includes('Failed to fetch') ||
          err.message.includes('API error: 5'))) {
        await delay(RETRY_DELAY * (retryCount + 1)); // Exponential backoff
        return makeRequest(url, retryCount + 1);
      }
      throw err;
    }
  };

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

      const data = await makeRequest(url);

      // Update state with the fetched data
      setPapers(data.data || []);
      setTotalResults(data.total || 0);
      setOffset(searchOffset);

      // Update state variables if new values were provided
      if (newQuery !== null) setQuery(newQuery);
      if (newFilters !== null) setFilters(newFilters);

      return data;
    } catch (err) {
      const errorMessage = err.message.includes('Failed to fetch')
        ? 'Network error: Please check your internet connection'
        : `Error: ${err.message}`;
      setError(errorMessage);
      // Keep the previous papers if it's just a network error
      if (!err.message.includes('Failed to fetch')) {
        setPapers([]);
        setTotalResults(0);
      }
      return null;
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    searchPapers(null, null, offset + 10);
  };

  // Cleanup effect
  useEffect(() => {
    return () => {
      setPapers([]);
      setError(null);
    };
  }, []);

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