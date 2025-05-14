'use client';

import { useState, useEffect, useRef } from 'react';
import { Input } from './input';
import { Loader2 } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';

interface AddressAutocompleteProps {
  onAddressSelect: (address: Address) => void;
  defaultValue?: string;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  id?: string;
  name?: string;
}

export interface Address {
  address1: string;
  address2?: string;
  city: string;
  region: string;
  zip: string;
  country: string;
}

export function AddressAutocomplete({
  onAddressSelect,
  defaultValue = '',
  className,
  placeholder = 'Start typing your address...',
  disabled = false,
  required = false,
  id,
  name,
}: AddressAutocompleteProps) {
  const [query, setQuery] = useState(defaultValue);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debouncedQuery = useDebounce(query, 300);
  
  // Handle outside clicks to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current && 
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Fetch address suggestions based on the query
  useEffect(() => {
    // Skip if query is too short
    if (!debouncedQuery || debouncedQuery.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    
    const fetchSuggestions = async () => {
      setIsLoading(true);
      try {
        // In a real implementation, you would call an API service here
        // For demo purposes, we're using mock suggestions
        const mockSuggestions = getMockSuggestions(debouncedQuery);
        setSuggestions(mockSuggestions);
        setShowSuggestions(mockSuggestions.length > 0);
      } catch (error) {
        console.error('Error fetching address suggestions:', error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSuggestions();
  }, [debouncedQuery]);
  
  const handleSelectSuggestion = (suggestion: string) => {
    setQuery(suggestion);
    setShowSuggestions(false);
    
    // In a real implementation, you would fetch the full address details
    // For demo purposes, we're using mock address details
    const mockAddress = parseMockAddress(suggestion);
    onAddressSelect(mockAddress);
  };
  
  return (
    <div className="relative">
      <Input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => debouncedQuery.length >= 3 && suggestions.length > 0 && setShowSuggestions(true)}
        placeholder={placeholder}
        className={className}
        disabled={disabled}
        required={required}
        id={id}
        name={name}
        autoComplete="off"
      />
      
      {isLoading && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        </div>
      )}
      
      {showSuggestions && suggestions.length > 0 && (
        <div 
          ref={suggestionsRef}
          className="absolute z-10 mt-1 w-full bg-background border rounded-md shadow-md overflow-hidden"
        >
          <ul className="py-1 max-h-60 overflow-auto">
            {suggestions.map((suggestion, index) => (
              <li
                key={index}
                className="px-3 py-2 hover:bg-accent cursor-pointer text-sm"
                onClick={() => handleSelectSuggestion(suggestion)}
              >
                {suggestion}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// Helper functions for mock data (replace with real API in production)
function getMockSuggestions(query: string): string[] {
  // Simplified mock implementation
  const allSuggestions = [
    '123 Main St, San Francisco, CA 94105, USA',
    '456 Market St, San Francisco, CA 94105, USA',
    '789 Mission St, San Francisco, CA 94103, USA',
    '321 Castro St, San Francisco, CA 94114, USA',
    '555 Montgomery St, San Francisco, CA 94111, USA',
    '100 California St, San Francisco, CA 94111, USA',
    '200 Broadway St, New York, NY 10007, USA',
    '300 Park Ave, New York, NY 10022, USA',
    '150 5th Ave, New York, NY 10010, USA',
    '444 Madison Ave, New York, NY 10022, USA',
  ];
  
  return allSuggestions.filter(suggestion => 
    suggestion.toLowerCase().includes(query.toLowerCase())
  );
}

function parseMockAddress(suggestion: string): Address {
  // Parse a suggestion string into address components
  // This is a simplified version - a real implementation would use a proper API
  const parts = suggestion.split(', ');
  
  if (parts.length < 4) {
    return {
      address1: parts[0] || '',
      city: parts[1] || '',
      region: parts[2]?.split(' ')[0] || '',
      zip: parts[2]?.split(' ')[1] || '',
      country: parts[3] || 'USA',
    };
  }
  
  return {
    address1: parts[0] || '',
    city: parts[1] || '',
    region: parts[2]?.split(' ')[0] || '',
    zip: parts[2]?.split(' ')[1] || '',
    country: parts[3] || '',
  };
} 