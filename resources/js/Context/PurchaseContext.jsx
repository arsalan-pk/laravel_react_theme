import React, { createContext, useContext, useMemo } from 'react';
import useCartBase from './useCartBase';

const PurchaseContext = createContext();

const PurchaseProvider = ({ children }) => {
  const { cartState, addToCart, removeFromCart, updateProductQuantity, emptyCart } = useCartBase('purchase_cart');

  const { cartTotal, totalQuantity, totalProfit } = useMemo(() => {
    return cartState.reduce(
      (acc, item) => {
        const price = parseFloat(item.price)
        const quantity = parseFloat(item.quantity)
        const cost = parseFloat(item.cost)
        const itemTotal = cost * quantity;
        const itemProfit = (price - cost) * quantity;

        acc.cartTotal += itemTotal;
        acc.totalQuantity += quantity;
        acc.totalProfit += itemProfit;

        return acc;
      },
      { cartTotal: 0, totalQuantity: 0, totalProfit: 0 }
    );
  }, [cartState]);

  return (
    <PurchaseContext.Provider
      value={{
        cartState,
        cartTotal,
        totalQuantity,
        totalProfit,
        addToCart,
        removeFromCart,
        updateProductQuantity,
        emptyCart,
      }}
    >
      {children}
    </PurchaseContext.Provider>
  );
};

const usePurchase = () => {
  const context = useContext(PurchaseContext);
  if (!context) {
    throw new Error('usePurchase must be used within a PurchaseProvider');
  }
  return context;
};

export { PurchaseProvider, usePurchase };
