import { sendKafkaEvent } from '@/actions/track-user';
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
  addToCart: (product: CartItem, user: any, location: any, deviceInfo: string) => void;
  removeFromCart: (productId: string, user: any, location: any, deviceInfo: string) => void;
  updateQuantity: (productId: string, newQuantity: number) => void;
  clearCart: () => void;
  addToWishlist: (product: CartItem, user: any, location: any, deviceInfo: string) => void;
  removeFromWishlist: (productId: string, user: any, location: any, deviceInfo: string) => void;

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
        addToWishlist: (product, user, location, deviceInfo) => {
          const { wishlist } = get();
          if (!wishlist.some((item) => item.id === product.id)) {
            set((state) => ({
              wishlist: [...state.wishlist, product],
            }));
          }

          if (user?.id && location && deviceInfo) {
            sendKafkaEvent({
              userId: user?.id,
              productId: product?.id,
              shopId: product?.Shop?.id,
              action: 'add_to_wishlist',
              country: location?.country || 'Unknown',
              city: location?.city || 'Unknown',
              device: deviceInfo || 'Unknown Device',
            });
          }
        },

        removeFromWishlist: (productId, user, location, deviceInfo) => {
          const removeProduct = get().cart.find((item) => item.id === productId);

          set((state) => ({
            wishlist: state.wishlist.filter((item) => item.id !== productId),
          }));

          if (user?.id && location && deviceInfo && removeProduct) {
            sendKafkaEvent({
              userId: user?.id,
              productId: removeProduct?.id,
              shopId: removeProduct?.Shop?.id,
              action: 'remove_from_wishlist',
              country: location?.country || 'Unknown',
              city: location?.city || 'Unknown',
              device: deviceInfo || 'Unknown Device',
            });
          }
        },

        addToCart: (product, user, location, deviceInfo) => {
          const { cart } = get();
          const existingItem = cart.find((item) => item.id === product.id);

          if (existingItem) {
            const updatedCart = cart.map((item) =>
              item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
            );
            set({ cart: updatedCart });
          } else {
            set((state) => ({
              cart: [...state.cart, { ...product, quantity: 1 }],
            }));
          }

          if (user?.id && location && deviceInfo) {
            sendKafkaEvent({
              userId: user?.id,
              productId: product?.id,
              shopId: product?.Shop?.id,
              action: 'add_to_cart',
              country: location?.country || 'Unknown',
              city: location?.city || 'Unknown',
              device: deviceInfo || 'Unknown Device',
            });
          }
        },

        removeFromCart: (productId, user, location, deviceInfo) => {
          const removeProduct = get().cart.find((item) => item.id === productId);

          set((state) => ({
            cart: state.cart.filter((item) => item.id !== productId),
          }));

          if (user?.id && location && deviceInfo && removeProduct) {
            sendKafkaEvent({
              userId: user?.id,
              productId: removeProduct?.id,
              shopId: removeProduct?.Shop?.id,
              action: 'remove_from_cart',
              country: location?.country || 'Unknown',
              city: location?.city || 'Unknown',
              device: deviceInfo || 'Unknown Device',
            });
          }
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
