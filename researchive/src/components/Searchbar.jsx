import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

const Searchbar = ({ onSearch, loading }) => {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(inputValue);
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-lg items-center space-x-2">
      <Input
        type="text"
        placeholder="Search for research papers..."
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        className="flex-1"
      />
      <Button type="submit" disabled={loading} variant="button">
        {loading ? (
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
        ) : (
          <Search className="h-4 w-4 mr-2" />
        )}
        Search
      </Button>
    </form>
  );
};

export default Searchbar;