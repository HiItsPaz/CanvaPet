import { useState, useCallback, useEffect } from 'react';

interface SelectionHistoryOptions<T> {
  maxHistory?: number;
  initialSelection?: T | null;
  onSelectionChange?: (newSelection: T | null) => void;
  persistKey?: string; // For localStorage persistence
}

interface SelectionHistoryState<T> {
  current: T | null;
  history: T[];
  recentlyViewed: T[];
  frequency: Record<string, number>; // For analytics - how often each item is selected
}

/**
 * Custom hook to manage selection history with frequency tracking and recently viewed items
 * 
 * @param options Configuration options for the selection history
 * @returns Object with selection state and methods to manage it
 */
export function useSelectionHistory<T extends { id: string }>(
  options: SelectionHistoryOptions<T> = {}
) {
  const {
    maxHistory = 10,
    initialSelection = null,
    onSelectionChange,
    persistKey
  } = options;

  // Initialize state, optionally restoring from localStorage
  const [state, setState] = useState<SelectionHistoryState<T>>(() => {
    const defaultState: SelectionHistoryState<T> = {
      current: initialSelection,
      history: initialSelection ? [initialSelection] : [],
      recentlyViewed: initialSelection ? [initialSelection] : [],
      frequency: initialSelection ? { [initialSelection.id]: 1 } : {}
    };

    // Try to restore from localStorage if persistKey is provided
    if (persistKey && typeof window !== 'undefined') {
      try {
        const savedState = localStorage.getItem(`selection_history_${persistKey}`);
        if (savedState) {
          return JSON.parse(savedState);
        }
      } catch (error) {
        console.error('Error restoring selection history from localStorage:', error);
      }
    }

    return defaultState;
  });

  // Extract state properties
  const { current, history, recentlyViewed, frequency } = state;

  // Persist to localStorage when state changes
  useEffect(() => {
    if (persistKey && typeof window !== 'undefined') {
      try {
        localStorage.setItem(
          `selection_history_${persistKey}`,
          JSON.stringify(state)
        );
      } catch (error) {
        console.error('Error saving selection history to localStorage:', error);
      }
    }
  }, [state, persistKey]);

  // Select an item
  const select = useCallback((item: T | null) => {
    setState(prevState => {
      // Skip if selecting the same item
      if (item?.id === prevState.current?.id) return prevState;

      // Update frequency map
      const newFrequency = { ...prevState.frequency };
      if (item) {
        newFrequency[item.id] = (newFrequency[item.id] || 0) + 1;
      }
      
      // Update history - add to beginning, remove duplicates, limit length
      const newHistory = item 
        ? [item, ...prevState.history.filter(h => h.id !== item.id)].slice(0, maxHistory)
        : prevState.history;
      
      // Update recently viewed - similar to history but separate
      const newRecentlyViewed = item && !prevState.recentlyViewed.some(v => v.id === item.id)
        ? [item, ...prevState.recentlyViewed].slice(0, maxHistory)
        : prevState.recentlyViewed;
      
      return {
        current: item,
        history: newHistory,
        recentlyViewed: newRecentlyViewed,
        frequency: newFrequency
      };
    });
    
    // Call the optional callback
    if (onSelectionChange) {
      onSelectionChange(item);
    }
  }, [maxHistory, onSelectionChange]);
  
  // View an item (update recently viewed without changing selection)
  const view = useCallback((item: T) => {
    if (!item) return;
    
    setState(prevState => {
      // Update recently viewed - add to beginning, remove duplicates, limit length
      const newRecentlyViewed = [
        item, 
        ...prevState.recentlyViewed.filter(v => v.id !== item.id)
      ].slice(0, maxHistory);
      
      return {
        ...prevState,
        recentlyViewed: newRecentlyViewed
      };
    });
  }, [maxHistory]);
  
  // Clear selection history
  const clearHistory = useCallback(() => {
    setState(prevState => ({
      ...prevState,
      history: prevState.current ? [prevState.current] : [],
    }));
  }, []);
  
  // Clear recently viewed
  const clearRecentlyViewed = useCallback(() => {
    setState(prevState => ({
      ...prevState,
      recentlyViewed: prevState.current ? [prevState.current] : [],
    }));
  }, []);
  
  // Get popular items based on selection frequency
  const getPopularItems = useCallback((limit: number = 5): T[] => {
    const entries = Object.entries(frequency);
    const sortedIds = entries
      .sort((a, b) => b[1] - a[1]) // Sort by frequency, descending
      .map(entry => entry[0]); // Extract IDs
    
    // Get the corresponding items from history
    const uniqueItems = [...history, ...recentlyViewed]
      .filter((item, index, self) => self.findIndex(i => i.id === item.id) === index);
    
    // Return items in order of frequency
    return sortedIds
      .map(id => uniqueItems.find(item => item.id === id))
      .filter((item): item is T => !!item) // Type guard
      .slice(0, limit);
  }, [frequency, history, recentlyViewed]);
  
  return {
    selectedItem: current,
    history,
    recentlyViewed,
    frequency,
    select,
    view,
    clearHistory,
    clearRecentlyViewed,
    getPopularItems,
    hasSelection: !!current
  };
} 