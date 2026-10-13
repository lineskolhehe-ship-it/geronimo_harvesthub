import { useState } from 'react';
import Button from './Button';

/** Keyword search box + any extra filter controls passed as children. */
export default function SearchBar({ placeholder = 'Search…', onSearch, children }) {
  const [text, setText] = useState('');
  return (
    <form
      className="toolbar"
      onSubmit={(e) => {
        e.preventDefault();
        onSearch(text.trim());
      }}
    >
      <input value={text} onChange={(e) => setText(e.target.value)} placeholder={placeholder} aria-label="Search" />
      {children}
      <Button type="submit" variant="secondary">
        Search
      </Button>
    </form>
  );
}
