import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CustomizationOptions {
  portraitId: string;
  portraitUrl: string;
  scale: number;
  position: { x: number; y: number };
  rotation: number;
}

export interface CartItem {
  id: string;
  blueprintId: number;
  variantId: number;
  title: string;
  image: string;
  price: number;
  options: Record<string, string | number>;
  customization: CustomizationOptions;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (item) => {
        const { items } = get();
        const existingItemIndex = items.findIndex(i => 
          i.blueprintId === item.blueprintId && 
          i.variantId === item.variantId && 
          i.customization.portraitId === item.customization.portraitId
        );
        
        if (existingItemIndex !== -1) {
          // Item already exists, update quantity
          const updatedItems = [...items];
          updatedItems[existingItemIndex].quantity += item.quantity;
          set({ items: updatedItems });
        } else {
          // New item, add to cart
          set({ items: [...items, item] });
        }
      },
      
      removeItem: (id) => {
        const { items } = get();
        set({ items: items.filter(item => item.id !== id) });
      },
      
      updateQuantity: (id, quantity) => {
        const { items } = get();
        const updatedItems = items.map(item => 
          item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item
        );
        set({ items: updatedItems });
      },
      
      clearCart: () => {
        set({ items: [] });
      },
      
      getTotalItems: () => {
        const { items } = get();
        return items.reduce((total, item) => total + item.quantity, 0);
      },
      
      getTotalPrice: () => {
        const { items } = get();
        return items.reduce((total, item) => total + (item.price * item.quantity), 0);
      }
    }),
    {
      name: 'canvapet-cart', // name of the item in localStorage
    }
  )
); 