"use client";

import { 
  createContext, 
  useContext, 
  useState, 
  useCallback, 
  ReactNode,
  useReducer
} from "react";
import { 
  CustomizationParameters, 
  BackgroundType,
  Style,
  Accessory,
  BackgroundOption
} from "@/types/customization";

// --- State Definition ---
interface CustomizationState {
  past: CustomizationParameters[];
  present: CustomizationParameters;
  future: CustomizationParameters[];
  availableStyles: Style[];
  availableAccessories: Accessory[];
  availableBackgrounds: BackgroundOption[];
  isLoading: boolean;
  isPreviewGenerating: boolean;
  isSaving: boolean;
  previewUrl: string | null;
}

// --- Action Definitions ---
type Action =
  | { type: 'SET_PARAMETERS'; payload: CustomizationParameters }
  | { type: 'UPDATE_PARAMETER'; payload: { key: keyof CustomizationParameters; value: CustomizationParameters[keyof CustomizationParameters] } }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'SET_AVAILABLE_STYLES'; payload: Style[] }
  | { type: 'SET_AVAILABLE_ACCESSORIES'; payload: Accessory[] }
  | { type: 'SET_AVAILABLE_BACKGROUNDS'; payload: BackgroundOption[] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_PREVIEW_GENERATING'; payload: boolean }
  | { type: 'SET_SAVING'; payload: boolean }
  | { type: 'SET_PREVIEW_URL'; payload: string | null };

// --- Reducer Function ---
function customizationReducer(state: CustomizationState, action: Action): CustomizationState {
  const { past, present, future } = state;

  switch (action.type) {
    case 'SET_PARAMETERS':
      // Only update history if the new state is different from the present
      if (JSON.stringify(action.payload) === JSON.stringify(present)) {
        return state;
      }
      return {
        ...state,
        past: [...past, present],
        present: action.payload,
        future: [], // Clear future on new action
      };
      
    case 'UPDATE_PARAMETER': {
      const { key, value } = action.payload;
      const newState = { ...present, [key]: value };
      // Only update history if the new state is different
      if (JSON.stringify(newState) === JSON.stringify(present)) {
          return state;
      }
      return {
          ...state,
          past: [...past, present],
          present: newState,
          future: [],
      };
    }
      
    case 'UNDO': {
      if (past.length === 0) {
        return state; // Nothing to undo
      }
      const previous = past[past.length - 1];
      const newPast = past.slice(0, past.length - 1);
      return {
        ...state,
        past: newPast,
        present: previous,
        future: [present, ...future],
      };
    }
      
    case 'REDO': {
      if (future.length === 0) {
        return state; // Nothing to redo
      }
      const next = future[0];
      const newFuture = future.slice(1);
      return {
        ...state,
        past: [...past, present],
        present: next,
        future: newFuture,
      };
    }
      
    // --- Other state updates (don't affect history) ---
    case 'SET_AVAILABLE_STYLES':
      return { ...state, availableStyles: action.payload };
    case 'SET_AVAILABLE_ACCESSORIES':
      return { ...state, availableAccessories: action.payload };
    case 'SET_AVAILABLE_BACKGROUNDS':
      return { ...state, availableBackgrounds: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_PREVIEW_GENERATING':
      return { ...state, isPreviewGenerating: action.payload };
    case 'SET_SAVING':
      return { ...state, isSaving: action.payload };
    case 'SET_PREVIEW_URL':
      return { ...state, previewUrl: action.payload };
      
    default:
      return state;
  }
}

// --- Context Definition ---
interface CustomizationContextType {
  // State Accessors
  parameters: CustomizationParameters;
  availableStyles: Style[];
  availableAccessories: Accessory[];
  availableBackgrounds: BackgroundOption[];
  isLoading: boolean;
  isPreviewGenerating: boolean;
  isSaving: boolean;
  previewUrl: string | null;
  canUndo: boolean;
  canRedo: boolean;
  
  // Actions/Dispatchers
  setParameters: (params: CustomizationParameters) => void;
  updateParameter: <K extends keyof CustomizationParameters>(
    key: K, 
    value: CustomizationParameters[K]
  ) => void;
  selectStyle: (styleId: string) => void;
  selectBackground: (background: { type: BackgroundType; value: string } | null) => void;
  toggleAccessory: (accessoryId: string, isSelected: boolean) => void;
  adjustStyleIntensity: (value: number) => void;
  generatePreview: () => Promise<void>;
  saveCustomization: () => Promise<void>;
  undo: () => void;
  redo: () => void;
}

const CustomizationContext = createContext<CustomizationContextType | undefined>(undefined);

// --- Provider Component ---
interface CustomizationProviderProps {
  children: ReactNode;
  petId: string;
  initialParameters?: CustomizationParameters;
  initialStyles?: Style[];
  initialAccessories?: Accessory[];
  initialBackgrounds?: BackgroundOption[];
  onSave?: (params: CustomizationParameters) => Promise<void>;
  onPreview?: (params: CustomizationParameters) => Promise<string>;
}

export function CustomizationProvider({
  children,
  petId,
  initialParameters,
  initialStyles = [],
  initialAccessories = [],
  initialBackgrounds = [],
  onSave,
  onPreview
}: CustomizationProviderProps) {
  
  const defaultInitialState: CustomizationParameters = {
      styleId: null,
      background: null,
      accessories: [],
      styleIntensity: 50,
  };

  const initialState: CustomizationState = {
    past: [],
    present: initialParameters || defaultInitialState,
    future: [],
    availableStyles: initialStyles,
    availableAccessories: initialAccessories,
    availableBackgrounds: initialBackgrounds,
    isLoading: false,
    isPreviewGenerating: false,
    isSaving: false,
    previewUrl: null,
  };

  const [state, dispatch] = useReducer(customizationReducer, initialState);
  const { 
    present: parameters, 
    past, 
    future, 
    availableStyles,
    availableAccessories,
    availableBackgrounds,
    isLoading,
    isPreviewGenerating,
    isSaving,
    previewUrl
  } = state;

  const canUndo = past.length > 0;
  const canRedo = future.length > 0;

  // --- Memoized Action Dispatchers ---
  const setParametersCallback = useCallback((params: CustomizationParameters) => {
    dispatch({ type: 'SET_PARAMETERS', payload: params });
  }, [dispatch]);

  const updateParameterCallback = useCallback(<K extends keyof CustomizationParameters>(
    key: K, 
    value: CustomizationParameters[K]
  ) => {
    dispatch({ type: 'UPDATE_PARAMETER', payload: { key, value } });
  }, [dispatch]);

  const selectStyle = useCallback((styleId: string) => {
    dispatch({ type: 'UPDATE_PARAMETER', payload: { key: 'styleId', value: styleId } });
  }, [dispatch]);

  const selectBackground = useCallback((background: { type: BackgroundType; value: string } | null) => {
    dispatch({ type: 'UPDATE_PARAMETER', payload: { key: 'background', value: background } });
  }, [dispatch]);

  const toggleAccessory = useCallback((accessoryId: string, isSelected: boolean) => {
    const currentAccessories = parameters.accessories || [];
    const newAccessories = isSelected
      ? [...currentAccessories, accessoryId]
      : currentAccessories.filter((id) => id !== accessoryId);
    dispatch({ type: 'UPDATE_PARAMETER', payload: { key: 'accessories', value: newAccessories } });
  }, [dispatch, parameters.accessories]);

  const adjustStyleIntensity = useCallback((value: number) => {
    dispatch({ type: 'UPDATE_PARAMETER', payload: { key: 'styleIntensity', value } });
  }, [dispatch]);

  const undo = useCallback(() => {
    dispatch({ type: 'UNDO' });
  }, [dispatch]);

  const redo = useCallback(() => {
    dispatch({ type: 'REDO' });
  }, [dispatch]);

  // --- Async Actions (Preview/Save) ---
  const generatePreviewCallback = useCallback(async () => {
    if (!onPreview) return;
    
    try {
      dispatch({ type: 'SET_PREVIEW_GENERATING', payload: true });
      dispatch({ type: 'SET_PREVIEW_URL', payload: null });
      const url = await onPreview(parameters);
      dispatch({ type: 'SET_PREVIEW_URL', payload: url });
    } catch (error) {
      console.error("Error generating preview:", error);
      // TODO: Add error handling/notification
      dispatch({ type: 'SET_PREVIEW_URL', payload: null }); // Clear on error
    } finally {
      dispatch({ type: 'SET_PREVIEW_GENERATING', payload: false });
    }
  }, [parameters, onPreview, dispatch]);

  const saveCustomizationCallback = useCallback(async () => {
    if (!onSave) return;
    
    try {
      dispatch({ type: 'SET_SAVING', payload: true });
      await onSave(parameters);
      // TODO: Add success notification
      // TODO: Maybe reset history after successful save?
    } catch (error) {
      console.error("Error saving customization:", error);
      // TODO: Add error handling/notification
    } finally {
      dispatch({ type: 'SET_SAVING', payload: false });
    }
  }, [parameters, onSave, dispatch]);

  // --- Context Value ---
  const contextValue: CustomizationContextType = {
    // State Accessors
    parameters,
    availableStyles,
    availableAccessories,
    availableBackgrounds,
    isLoading,
    isPreviewGenerating,
    isSaving,
    previewUrl,
    canUndo,
    canRedo,
    
    // Actions/Dispatchers
    setParameters: setParametersCallback,
    updateParameter: updateParameterCallback,
    selectStyle,
    selectBackground,
    toggleAccessory,
    adjustStyleIntensity,
    generatePreview: generatePreviewCallback,
    saveCustomization: saveCustomizationCallback,
    undo,
    redo,
  };

  return (
    <CustomizationContext.Provider value={contextValue}>
      {children}
    </CustomizationContext.Provider>
  );
}

// --- Custom Hook ---
export function useCustomization() {
  const context = useContext(CustomizationContext);
  
  if (context === undefined) {
    throw new Error("useCustomization must be used within a CustomizationProvider");
  }
  
  return context;
} 