import { useReducer, useCallback } from 'react';
import { GalleryPortrait } from "@/types/gallery";
import { PortraitRevision } from "@/lib/ai/openai";

interface PortraitRevisionHistoryState {
  past: GalleryPortrait[];
  present: GalleryPortrait | null; // Use GalleryPortrait type, can be null initially
  future: GalleryPortrait[];
}

// Define action types
type PortraitHistoryAction = 
  | { type: 'SET_INITIAL_HISTORY'; payload: { original: GalleryPortrait, revisions: PortraitRevision[] } } // Action to set initial history
  | { type: 'ADD_VERSION'; payload: GalleryPortrait } // Action to add a new version
  | { type: 'SET_PRESENT_VERSION'; payload: string } // Action to set a specific version by ID
  | { type: 'UNDO' } // Action to undo
  | { type: 'REDO' }; // Action to redo 

// Implement the reducer function
function portraitHistoryReducer(state: PortraitRevisionHistoryState, action: PortraitHistoryAction): PortraitRevisionHistoryState {
  const { past, present, future } = state;

  switch (action.type) {
    case 'SET_INITIAL_HISTORY': {
      const { original, revisions } = action.payload;

      // Map PortraitRevision to a GalleryPortrait-compatible structure
      const mappedRevisions: GalleryPortrait[] = revisions
        .map(revision => ({
          id: revision.id,
          user_id: revision.user_id, // Assuming user_id is needed and available
          created_at: revision.created_at, // Use revision creation date
          processed_image_url: revision.image_versions?.processed_image_url || undefined, // Use processed_image_url from revision
          // Include other fields from GalleryPortrait if necessary, or keep minimal
          // For now, keeping minimal fields needed for history/display
        }))
        .filter(rev => rev.processed_image_url !== undefined); // Only include revisions with a processed image

      // Combine original and mapped revisions, sort by creation date
      const allVersions = [original, ...mappedRevisions]
        .filter(Boolean) // Filter out any null/undefined
        .sort((a, b) => new Date(a.created_at || '').getTime() - new Date(b.created_at || '').getTime());

      const initialPresent = allVersions.pop() || null; // Set the latest as present
      const initialPast = allVersions as GalleryPortrait[]; // Remaining are past

      return {
        past: initialPast,
        present: initialPresent,
        future: [],
      };
    }

    case 'ADD_VERSION': {
      const newVersion = action.payload;
      if (!present) {
        return { ...state, present: newVersion };
      }
      if (newVersion?.id === present?.id) { // Prevent adding the same version twice
           return state;
      }
       // Check if the version already exists in past or future to avoid duplicates
       const existsInHistory = past.some(v => v?.id === newVersion?.id) || future.some(v => v?.id === newVersion?.id);

       if (existsInHistory) {
            return state; // Version already exists, do nothing
       }

      // Add current present to past, set new version as present, clear future
      return {
        past: [...past, present].filter(Boolean) as GalleryPortrait[], // Ensure past only contains valid portraits
        present: newVersion,
        future: [],
      };
    }

    case 'SET_PRESENT_VERSION': {
        // Simplified logic: sort all versions chronologically and split into past, present, and future based on selected ID
        const versionIdToSet = action.payload;
        // Combine all existing versions
        const allVersions = [...past, ...(present ? [present] : []), ...future].filter(Boolean) as GalleryPortrait[];
        // Sort versions by creation date ascending
        const sortedVersions = allVersions.sort(
          (a, b) => new Date(a.created_at || '').getTime() - new Date(b.created_at || '').getTime()
        );
        const idx = sortedVersions.findIndex((v) => v.id === versionIdToSet);
        if (idx === -1) {
          return state; // Specified version not found
        }
        // Partition into past, present, and future
        const newPast = sortedVersions.slice(0, idx);
        const newPresent = sortedVersions[idx];
        const newFuture = sortedVersions.slice(idx + 1);
        return {
          past: newPast,
          present: newPresent,
          future: newFuture,
        };
    }

    case 'UNDO': {
      if (past.length === 0 || !present) {
        return state; // Nothing to undo
      }
      const previous = past[past.length - 1];
      const newPast = past.slice(0, past.length - 1);
      return {
        past: newPast,
        present: previous,
        future: [present, ...future].filter(Boolean) as GalleryPortrait[], // Ensure future only contains valid portraits
      };
    }

    case 'REDO': {
      if (future.length === 0 || !present) {
        return state; // Nothing to redo
      }
      const next = future[0];
      const newFuture = future.slice(1);
      return {
        past: [...past, present].filter(Boolean) as GalleryPortrait[], // Ensure past only contains valid portraits
        present: next,
        future: newFuture,
      };
    }

    default:
      return state;
  }
}

// Define the initial state
const initialState: PortraitRevisionHistoryState = {
  past: [],
  present: null,
  future: [],
};

// Create the custom hook
export function usePortraitRevisionHistory() {
  const [state, dispatch] = useReducer(portraitHistoryReducer, initialState);

  // Define action creator functions
  const setInitialHistory = useCallback((original: GalleryPortrait, revisions: PortraitRevision[]) => {
    dispatch({ type: 'SET_INITIAL_HISTORY', payload: { original, revisions } });
  }, [dispatch]);

  const addVersion = useCallback((version: GalleryPortrait) => {
    dispatch({ type: 'ADD_VERSION', payload: version });
  }, [dispatch]);

  const setPresentVersion = useCallback((versionId: string) => {
      dispatch({ type: 'SET_PRESENT_VERSION', payload: versionId });
  }, [dispatch]);

  const undo = useCallback(() => {
    dispatch({ type: 'UNDO' });
  }, [dispatch]);

  const redo = useCallback(() => {
    dispatch({ type: 'REDO' });
  }, [dispatch]);

  const canUndo = state.past.length > 0;
  const canRedo = state.future.length > 0;

  return {
    ...state,
    setInitialHistory,
    addVersion,
    setPresentVersion,
    undo,
    redo,
    canUndo,
    canRedo,
  };
} 