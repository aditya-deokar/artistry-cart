import { ArtProduct } from '@/types/products';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// ---------------- TYPES ----------------
export type CartItem = ArtProduct & {
  quantity: number;
};

export type Address = {
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault?: boolean;
};

export type DiscountCode = {
  id: string;
  publicName: string;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'FREE_SHIPPING';
  discountValue: number;
  discountCode: string;
  minimumOrderAmount?: number;
  maximumDiscountAmount?: number;
};

export interface StoreState {
  cart: CartItem[];
  wishlist: CartItem[];
  appliedCoupon: DiscountCode | null;
  address: Address | null;
}

export interface StoreActions {
  addToCart: (product: CartItem) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, newQuantity: number) => void;
  clearCart: () => void;
  addToWishlist: (product: CartItem) => void;
  removeFromWishlist: (productId: string) => void;

  applyCoupon: (coupon: DiscountCode) => void;
  removeCoupon: () => void;

  setAddress: (address: Address) => void;
  clearAddress: () => void;

  // Clear all state (for logout)
  clearWishlist: () => void;
  clearAll: () => void;
}

// ---------------- STORE ----------------
export type Store = StoreState & {
  actions: StoreActions;
};

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      // --- STATE ---
      cart: [],
      wishlist: [],
      appliedCoupon: null,
      address: null,

      // --- ACTIONS ---
      actions: {
        addToWishlist: (product) => {
          const { wishlist } = get();
          if (!wishlist.some((item) => item.id === product.id)) {
            set((state) => ({
              wishlist: [...state.wishlist, product],
            }));
          }
        },

        removeFromWishlist: (productId) => {
          set((state) => ({
            wishlist: state.wishlist.filter((item) => item.id !== productId),
          }));
        },

        addToCart: (product) => {
          const { cart } = get();
          const existingItem = cart.find((item) => item.id === product.id);

          if (existingItem) {
            const updatedCart = cart.map((item) =>
              item.id === product.id ? { ...item, quantity: item.quantity + product.quantity } : item
            );
            set({ cart: updatedCart });
          } else {
            set((state) => ({
              cart: [...state.cart, product],
            }));
          }
        },

        removeFromCart: (productId) => {
          set((state) => ({
            cart: state.cart.filter((item) => item.id !== productId),
          }));
        },

        updateQuantity: (productId, newQuantity) => {
          if (newQuantity <= 0) {

            set((state) => ({
              cart: state.cart.filter((item) => item.id !== productId),
            }));
          } else {
            set((state) => ({
              cart: state.cart.map((item) =>
                item.id === productId ? { ...item, quantity: newQuantity } : item
              ),
            }));
          }
        },

        clearCart: () => {
          set({ cart: [] });
        },

        applyCoupon: (coupon) => {
          set({ appliedCoupon: coupon });
        },
        removeCoupon: () => {
          set({ appliedCoupon: null });
        },


        setAddress: (address) => {
          set({ address });
        },
        clearAddress: () => {
          set({ address: null });
        },

        clearWishlist: () => {
          set({ wishlist: [] });
        },

        // Clear all store data (for logout)
        clearAll: () => {
          set({
            cart: [],
            wishlist: [],
            appliedCoupon: null,
            address: null,
          });
        },
      },
    }),
    {
      name: 'artistry-cart-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state): Partial<Store> => ({
        cart: state.cart,
        wishlist: state.wishlist,
        appliedCoupon: state.appliedCoupon,
        address: state.address,
      }),
    }
  )
);
