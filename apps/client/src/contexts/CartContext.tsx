"use client";

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { cartApi, type CartItem as ApiCartItem, type AddToCartRequest } from '@/lib/api';
import { useAuth } from './AuthContext';

// Local cart item for guest users
export interface LocalCartItem {
  id: string;
  productId: string;
  variantId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

// Combined cart item type
export type CartItem = LocalCartItem | ApiCartItem;

interface CartState {
  items: CartItem[];
  isLoading: boolean;
  error: string | null;
  totalItems: number;
  totalPrice: number;
}

type CartAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_ITEMS'; payload: CartItem[] }
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'UPDATE_ITEM'; payload: { productId: string; variantId: string; quantity: number } }
  | { type: 'REMOVE_ITEM'; payload: { productId: string; variantId: string } }
  | { type: 'CLEAR_CART' };

interface CartContextType extends CartState {
  addToCart: (item: AddToCartRequest & { name: string; price: number; image?: string }) => Promise<void>;
  updateQuantity: (productId: string, variantId: string, quantity: number) => Promise<void>;
  removeFromCart: (productId: string, variantId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const STORAGE_KEY = 'propscholar_cart';

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    
    case 'SET_ITEMS':
      const items = action.payload;
      const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
      const totalPrice = items.reduce((sum, item) => {
        const price = 'price' in item ? item.price : (item.variant?.comparePrice || 0);
        return sum + (price * item.quantity);
      }, 0);
      return { ...state, items, totalItems, totalPrice };
    
    case 'ADD_ITEM':
      const existingIndex = state.items.findIndex(item => {
        const productId = 'productId' in item ? item.productId : item.product._id;
        const variantId = 'variantId' in item ? item.variantId : item.variant._id;
        const newProductId = 'productId' in action.payload ? action.payload.productId : action.payload.product._id;
        const newVariantId = 'variantId' in action.payload ? action.payload.variantId : action.payload.variant._id;
        return productId === newProductId && variantId === newVariantId;
      });

      let newItems: CartItem[];
      if (existingIndex >= 0) {
        newItems = state.items.map((item, index) => 
          index === existingIndex 
            ? { ...item, quantity: item.quantity + action.payload.quantity }
            : item
        );
      } else {
        newItems = [...state.items, action.payload];
      }

      const newTotalItems = newItems.reduce((sum, item) => sum + item.quantity, 0);
      const newTotalPrice = newItems.reduce((sum, item) => {
        const price = 'price' in item ? item.price : (item.variant?.comparePrice || 0);
        return sum + (price * item.quantity);
      }, 0);

      return { 
        ...state, 
        items: newItems, 
        totalItems: newTotalItems, 
        totalPrice: newTotalPrice 
      };

    case 'UPDATE_ITEM':
      const updatedItems = state.items.map(item => {
        const productId = 'productId' in item ? item.productId : item.product._id;
        const variantId = 'variantId' in item ? item.variantId : item.variant._id;
        
        if (productId === action.payload.productId && variantId === action.payload.variantId) {
          return { ...item, quantity: action.payload.quantity };
        }
        return item;
      }).filter(item => item.quantity > 0);

      const updatedTotalItems = updatedItems.reduce((sum, item) => sum + item.quantity, 0);
      const updatedTotalPrice = updatedItems.reduce((sum, item) => {
        const price = 'price' in item ? item.price : (item.variant?.comparePrice || 0);
        return sum + (price * item.quantity);
      }, 0);

      return { 
        ...state, 
        items: updatedItems, 
        totalItems: updatedTotalItems, 
        totalPrice: updatedTotalPrice 
      };

    case 'REMOVE_ITEM':
      const filteredItems = state.items.filter(item => {
        const productId = 'productId' in item ? item.productId : item.product._id;
        const variantId = 'variantId' in item ? item.variantId : item.variant._id;
        return !(productId === action.payload.productId && variantId === action.payload.variantId);
      });

      const filteredTotalItems = filteredItems.reduce((sum, item) => sum + item.quantity, 0);
      const filteredTotalPrice = filteredItems.reduce((sum, item) => {
        const price = 'price' in item ? item.price : (item.variant?.comparePrice || 0);
        return sum + (price * item.quantity);
      }, 0);

      return { 
        ...state, 
        items: filteredItems, 
        totalItems: filteredTotalItems, 
        totalPrice: filteredTotalPrice 
      };

    case 'CLEAR_CART':
      return { ...state, items: [], totalItems: 0, totalPrice: 0 };

    default:
      return state;
  }
}

const initialState: CartState = {
  items: [],
  isLoading: false,
  error: null,
  totalItems: 0,
  totalPrice: 0,
};

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const { user, isAuthenticated, logout } = useAuth();

  // Load cart on mount and when auth state changes
  useEffect(() => {
    loadCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user]);

  // Save local cart to localStorage whenever it changes
  useEffect(() => {
    if (!isAuthenticated && state.items.length > 0) {
      const localItems = state.items.filter((item): item is LocalCartItem => 'productId' in item);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(localItems));
    }
  }, [state.items, isAuthenticated]);

  const handleAuthError = async () => {
    console.log('Authentication failed, clearing tokens and logging out');
    await logout();
  };

  const loadCart = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      if (isAuthenticated) {
        // Load backend cart
        const response = await cartApi.getCart();
        const backendItems = response.cart;

        // Check for local cart to merge
        const localCartData = localStorage.getItem(STORAGE_KEY);
        if (localCartData) {
          const localItems: LocalCartItem[] = JSON.parse(localCartData);
          
          if (localItems.length > 0) {
            // Merge local cart with backend cart
            await mergeLocalCartWithBackend(localItems);
            localStorage.removeItem(STORAGE_KEY);
            
            // Reload backend cart after merge
            const mergedResponse = await cartApi.getCart();
            dispatch({ type: 'SET_ITEMS', payload: mergedResponse.cart });
          } else {
            dispatch({ type: 'SET_ITEMS', payload: backendItems });
          }
        } else {
          dispatch({ type: 'SET_ITEMS', payload: backendItems });
        }
      } else {
        // Load local cart
        const localCartData = localStorage.getItem(STORAGE_KEY);
        if (localCartData) {
          const localItems: LocalCartItem[] = JSON.parse(localCartData);
          dispatch({ type: 'SET_ITEMS', payload: localItems });
        } else {
          dispatch({ type: 'SET_ITEMS', payload: [] });
        }
      }
    } catch (error: any) {
      console.error('Failed to load cart:', error);
      
      // Handle authentication errors
      if (error?.status === 401 && isAuthenticated) {
        await handleAuthError();
        // Don't set error state for auth failures, just fall back to local cart
        const localCartData = localStorage.getItem(STORAGE_KEY);
        if (localCartData) {
          const localItems: LocalCartItem[] = JSON.parse(localCartData);
          dispatch({ type: 'SET_ITEMS', payload: localItems });
        } else {
          dispatch({ type: 'SET_ITEMS', payload: [] });
        }
      } else {
        dispatch({ type: 'SET_ERROR', payload: 'Failed to load cart' });
        
        // Fallback to local cart if backend fails
        if (isAuthenticated) {
          const localCartData = localStorage.getItem(STORAGE_KEY);
          if (localCartData) {
            const localItems: LocalCartItem[] = JSON.parse(localCartData);
            dispatch({ type: 'SET_ITEMS', payload: localItems });
          }
        }
      }
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const mergeLocalCartWithBackend = async (localItems: LocalCartItem[]) => {
    for (const localItem of localItems) {
      try {
        await cartApi.addToCart({
          productId: localItem.productId,
          variantId: localItem.variantId,
          quantity: localItem.quantity,
        });
      } catch (error: any) {
        console.error('Failed to merge cart item:', error);
        // If auth fails during merge, we'll handle it in the main loadCart function
        if (error?.status === 401) {
          throw error; // Re-throw auth errors to be handled by loadCart
        }
      }
    }
  };

  const addToCart = async (item: AddToCartRequest & { name: string; price: number; image?: string }) => {
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      if (isAuthenticated) {
        // Add to backend cart
        const response = await cartApi.addToCart({
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
        });
        dispatch({ type: 'SET_ITEMS', payload: response.cart });
      } else {
        // Add to local cart
        const localItem: LocalCartItem = {
          id: `${item.productId}-${item.variantId}`,
          productId: item.productId,
          variantId: item.variantId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
        };
        dispatch({ type: 'ADD_ITEM', payload: localItem });
      }
    } catch (error: any) {
      console.error('Failed to add to cart:', error);
      
      // Handle authentication errors gracefully
      if (error?.status === 401 && isAuthenticated) {
        await handleAuthError();
        // Add to local cart instead
        const localItem: LocalCartItem = {
          id: `${item.productId}-${item.variantId}`,
          productId: item.productId,
          variantId: item.variantId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
        };
        dispatch({ type: 'ADD_ITEM', payload: localItem });
      } else {
        dispatch({ type: 'SET_ERROR', payload: 'Failed to add item to cart' });
        throw error;
      }
    }
  };

  const updateQuantity = async (productId: string, variantId: string, quantity: number) => {
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      if (isAuthenticated) {
        // Update backend cart
        const response = await cartApi.updateCartItem({
          productId,
          variantId,
          quantity,
        });
        dispatch({ type: 'SET_ITEMS', payload: response.cart });
      } else {
        // Update local cart
        dispatch({ type: 'UPDATE_ITEM', payload: { productId, variantId, quantity } });
      }
    } catch (error: any) {
      console.error('Failed to update cart:', error);
      
      // Handle authentication errors gracefully
      if (error?.status === 401 && isAuthenticated) {
        await handleAuthError();
        // Update local cart instead
        dispatch({ type: 'UPDATE_ITEM', payload: { productId, variantId, quantity } });
      } else {
        dispatch({ type: 'SET_ERROR', payload: 'Failed to update cart item' });
        throw error;
      }
    }
  };

  const removeFromCart = async (productId: string, variantId: string) => {
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      if (isAuthenticated) {
        // Remove from backend cart
        const response = await cartApi.removeFromCart({
          productId,
          variantId,
        });
        dispatch({ type: 'SET_ITEMS', payload: response.cart });
      } else {
        // Remove from local cart
        dispatch({ type: 'REMOVE_ITEM', payload: { productId, variantId } });
      }
    } catch (error: any) {
      console.error('Failed to remove from cart:', error);
      
      // Handle authentication errors gracefully
      if (error?.status === 401 && isAuthenticated) {
        await handleAuthError();
        // Remove from local cart instead
        dispatch({ type: 'REMOVE_ITEM', payload: { productId, variantId } });
      } else {
        dispatch({ type: 'SET_ERROR', payload: 'Failed to remove cart item' });
        throw error;
      }
    }
  };

  const clearCart = async () => {
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      if (isAuthenticated) {
        // Clear backend cart
        await cartApi.clearCart();
      } else {
        // Clear local cart
        localStorage.removeItem(STORAGE_KEY);
      }
      dispatch({ type: 'CLEAR_CART' });
    } catch (error: any) {
      console.error('Failed to clear cart:', error);
      
      // Handle authentication errors gracefully
      if (error?.status === 401 && isAuthenticated) {
        await handleAuthError();
        // Clear local cart instead
        localStorage.removeItem(STORAGE_KEY);
        dispatch({ type: 'CLEAR_CART' });
      } else {
        dispatch({ type: 'SET_ERROR', payload: 'Failed to clear cart' });
        throw error;
      }
    }
  };

  const refreshCart = async () => {
    await loadCart();
  };

  const value: CartContextType = {
    ...state,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    refreshCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
} 