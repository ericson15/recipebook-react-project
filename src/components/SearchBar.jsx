
import { Search } from 'lucide-react';

function SearchBar({ value, onChange, onSearch }) {
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSearch();
      }}
      className="flex gap-2 w-full"
    >
      
<input
  type="text"
  value={value}
  onChange={(event) => onChange(event.target.value)}
  placeholder="Search for a recipe..."
  className="flex-1 min-w-0 px-4 py-3 border border-stone-300 rounded-lg bg-white text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-400"
/>


      <button
        type="submit"
        className="bg-orange-500 text-white px-5 py-3 rounded-lg flex items-center gap-2"
      >
        <Search size={18} />
        Search
      </button>
    </form>
  );
}

export default SearchBar;
