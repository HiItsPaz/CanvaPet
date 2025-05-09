import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface CartItem {
  id: string; // Unique ID for the cart item (e.g., `${blueprintId}-${variantId}-${portraitId}`)
  blueprintId: number;
  variantId: number;
  portraitId: string; // ID of the portrait used for customization
  portraitImageUrl: string; // URL of the image to be printed
  productTitle: string;
  variantTitle: string;
  quantity: number;
  price: number; // Price per item in cents
}

interface CartState {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'id' | 'quantity'>) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  getItemCount: () => number;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (newItem) => set((state) => {
        // Generate a unique ID based on blueprint, variant, and portrait
        const itemId = `${newItem.blueprintId}-${newItem.variantId}-${newItem.portraitId}`;
        const existingItemIndex = state.items.findIndex(item => item.id === itemId);

        if (existingItemIndex > -1) {
          // Item already exists, increase quantity
          const updatedItems = [...state.items];
          updatedItems[existingItemIndex] = {
            ...updatedItems[existingItemIndex],
            quantity: updatedItems[existingItemIndex].quantity + 1,
          };
          return { items: updatedItems };
        } else {
          // Add new item
          return { items: [...state.items, { ...newItem, id: itemId, quantity: 1 }] };
        }
      }),
      
      removeItem: (itemId) => set((state) => ({
        items: state.items.filter(item => item.id !== itemId),
      })),
      
      updateQuantity: (itemId, quantity) => set((state) => {
        if (quantity <= 0) {
          // Remove item if quantity is 0 or less
          return { items: state.items.filter(item => item.id !== itemId) };
        }
        return {
          items: state.items.map(item => 
            item.id === itemId ? { ...item, quantity } : item
          ),
        };
      }),
      
      clearCart: () => set({ items: [] }),

      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      },

      getTotalPrice: () => {
         return get().items.reduce((total, item) => total + (item.price * item.quantity), 0);
      },
    }),
    {
      name: 'canvapet-cart-storage', // Name of the item in storage
      storage: createJSONStorage(() => localStorage), // Use localStorage
    }
  )
); 