import { ArtProduct } from '@/types/products';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';


// Define the shape of a single item in the cart, which includes a quantity.
export type CartItem = ArtProduct & {
  quantity: number;
};

// Define the shape of the store's state.
export interface StoreState {
  cart: CartItem[];
  wishlist: ArtProduct[];
}

// Define all the actions that can be performed on the store.
export interface StoreActions {
  addToCart: (product: ArtProduct, user:any , location:any , deviceInfo :string) => void;
  removeFromCart: (productId: string , user :any , location: any, deviceInfo:string) => void;
  updateQuantity: (productId: string, newQuantity: number) => void;
  clearCart: () => void;
  addToWishlist: (product: ArtProduct, user:any , location:any , deviceInfo :string) => void;
  removeFromWishlist: (productId: string , user :any , location: any, deviceInfo:string) => void;
}

// Combine state and actions into the final store type.
// The actions are nested under an 'actions' key as per your component's usage.
export type Store = StoreState & {
  actions: StoreActions;
};


export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      // --- STATE ---
      cart: [],
      wishlist: [],

      // --- ACTIONS ---
      // All actions are grouped under the 'actions' key for organized access.
      actions: {
        
        addToWishlist: (product,user, location, deviceInfo) => {
          const { wishlist } = get();
          // Check if the item is already in the wishlist to avoid duplicates
          if (!wishlist.some(item => item.id === product.id)) {
            set(state => ({
              wishlist: [...state.wishlist, product],
            }));
          }
        },

        /**
         * Removes a product from the wishlist by its ID.
         * @param {string} productId - The ID of the product to remove.
         */
        removeFromWishlist:(productId , user, location, deviceInfo) => {
          set(state => ({
            wishlist: state.wishlist.filter(item => item.id !== productId),
          }));
        },

        /**
         * Adds a product to the cart. If the product already exists,
         * its quantity is incremented.
         * @param {ArtProduct} product - The product to add.
         */
        addToCart: (product, user, location, deviceInfo) => {
          const { cart } = get();
          const existingItem = cart.find(item => item.id === product.id);

          if (existingItem) {
            // If item exists, map over the cart and update the quantity
            const updatedCart = cart.map(item =>
              item.id === product.id
                ? { ...item, quantity: item.quantity + 1 }
                : item
            );
            set({ cart: updatedCart });
          } else {
            // If item is new, add it to the cart with quantity 1
            set(state => ({
              cart: [...state.cart, { ...product, quantity: 1 }],
            }));
          }
        },

        /**
         * Removes a product completely from the cart by its ID.
         * @param {string} productId - The ID of the product to remove.
         */
        removeFromCart: (productId, user, location, deviceInfo) => {
          set(state => ({
            cart: state.cart.filter(item => item.id !== productId),
          }));
        },

        /**
         * Updates the quantity of a specific item in the cart.
         * If quantity is set to 0 or less, the item is removed.
         * @param {string} productId - The ID of the product to update.
         * @param {number} newQuantity - The new quantity.
         */
        updateQuantity: (productId, newQuantity) => {
          if (newQuantity <= 0) {
            // If quantity is 0 or less, remove the item from the cart
            get().actions.removeFromCart(productId, user, location, deviceInfo);
          } else {
            set(state => ({
              cart: state.cart.map(item =>
                item.id === productId
                  ? { ...item, quantity: newQuantity }
                  : item
              ),
            }));
          }
        },

        /**
         * Clears all items from the shopping cart.
         */
        clearCart: () => {
          set({ cart: [] });
        },
      },
    }),
    {
      // Configuration for the persistence middleware
      name: 'artistry-cart-storage', // The key in localStorage
      storage: createJSONStorage(() => localStorage),
      // Only persist the cart and wishlist state, not the actions.
      partialize: (state): Partial<Store> => ({
        cart: state.cart,
        wishlist: state.wishlist,
      }),
    }
  )
);