import { create } from "zustand";
import { persist } from "zustand/middleware";
import { toast } from '../utils/toast';
import { useAuthStore } from "./authStore";

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [], // Array of { packageId, packageData }
      appliedPromoCode: null, // { code, discount_amount_cents, discount_type, discount_value }

      addItem: (packageId, packageData, coursePackages = []) => {
        const { items } = get();
        
        // Check if item already in cart
        if (items.find(item => item.packageId === packageId)) {
          toast.info("Produkt już jest w koszyku");
          return false;
        }

        // Verify order - check if previous section is purchased or in cart
        const { purchasedCourses } = useAuthStore.getState();
        const packageIndex = coursePackages.findIndex(pkg => pkg.id === packageId);
        
        if (packageIndex > 0) {
          const previousPackage = coursePackages[packageIndex - 1];
          const previousInCart = items.some(item => item.packageId === previousPackage.id);
          const previousPurchased = purchasedCourses.includes(previousPackage.id);
          
          if (!previousInCart && !previousPurchased) {
            toast.error("Musisz najpierw kupić poprzednią sekcję");
            return false;
          }
        }

        // Add item to cart
        const newItem = {
          packageId,
          packageData: {
            id: packageData.id,
            title: packageData.title,
            section_title: packageData.section_title,
            price_cents: packageData.price_cents,
          }
        };

        set({ items: [...items, newItem] });
        toast.success("Produkt dodany do koszyka");
        return true;
      },

      removeItem: (packageId) => {
        const { items } = get();
        const updatedItems = items.filter(item => item.packageId !== packageId);
        set({ items: updatedItems });
        toast.info("Produkt usunięty z koszyka");
      },

      clearCart: () => {
        set({ items: [], appliedPromoCode: null });
      },

      getItems: () => {
        return get().items;
      },

      getTotalPrice: () => {
        const { items } = get();
        return items.reduce((total, item) => total + item.packageData.price_cents, 0);
      },

      // Promo code functions
      applyPromoCode: (promoCodeData) => {
        set({ appliedPromoCode: promoCodeData });
      },

      removePromoCode: () => {
        set({ appliedPromoCode: null });
      },

      getPromoDiscount: () => {
        const { appliedPromoCode, items } = get();
        if (!appliedPromoCode) return 0;

        // Jeśli mamy już obliczoną discount_amount_cents z Edge Function, użyjmy jej (ale konwertujmy z groszy na złote)
        if (appliedPromoCode.discount_amount_cents !== undefined) {
          return appliedPromoCode.discount_amount_cents / 100; // Konwersja groszy → złote
        }

        // Fallback: oblicz na podstawie discount_value (które jest w złotych)
        const total = items.reduce((sum, item) => sum + item.packageData.price_cents, 0);
        
        if (appliedPromoCode.discount_type === 'percentage') {
          return total * appliedPromoCode.discount_value / 100; // total w złotych, discount_value to procent
        } else {
          // Fixed amount (w złotych)
          return Math.min(appliedPromoCode.discount_value, total);
        }
      },

      getTotalWithDiscount: () => {
        const total = get().getTotalPrice();
        const discount = get().getPromoDiscount();
        return Math.max(0, total - discount);
      },

      getItemCount: () => {
        return get().items.length;
      },

      isInCart: (packageId) => {
        const { items } = get();
        return items.some(item => item.packageId === packageId);
      },

      // Validate cart order before checkout
      validateCartOrder: (coursePackages = []) => {
        const { items } = get();
        const { purchasedCourses } = useAuthStore.getState();
        
        if (items.length === 0) return { valid: false, message: "Koszyk jest pusty" };

        // Sort items by order in coursePackages
        const sortedItems = items
          .map(item => ({
            ...item,
            index: coursePackages.findIndex(pkg => pkg.id === item.packageId)
          }))
          .sort((a, b) => a.index - b.index);

        // Check if sequence is valid
        for (let i = 0; i < sortedItems.length; i++) {
          if (i > 0) {
            const previousPackage = coursePackages[sortedItems[i].index - 1];
            const previousInCart = sortedItems.slice(0, i).some(item => item.packageId === previousPackage.id);
            const previousPurchased = purchasedCourses.includes(previousPackage.id);
            
            if (!previousInCart && !previousPurchased) {
              return {
                valid: false,
                message: `Musisz najpierw kupić sekcję: ${previousPackage.title}`
              };
            }
          }
        }

        return { valid: true };
      },
    }),
    {
      name: "cart-storage",
      partialize: (state) => ({
        items: state.items,
        appliedPromoCode: state.appliedPromoCode,
      }),
    }
  )
);

