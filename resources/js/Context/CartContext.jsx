// src/CartContext.jsx

import React, { createContext, useContext, useReducer, useEffect, useMemo  } from 'react';

const CartContext = createContext();

const initialState = [];

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_TO_CART': {
      const cart = [...state]; // Copy the current state (cart)
      
      // Check if the product with the same id and batch_number already exists
      const existingProductIndex = cart.findIndex(
        (item) =>
          item.id === action.payload.id &&
          item.batch_number === action.payload.batch_number
      );

      if (existingProductIndex !== -1) {
        // If the product already exists, update its quantity
        cart[existingProductIndex].quantity = 
          parseFloat(cart[existingProductIndex].quantity) + 1;
      } else {
        // If the product doesn't exist, set its quantity to 1 and add to cart
        const productToAdd = { ...action.payload, quantity: 1 };
        cart.push(productToAdd);
      }

      return cart; // Return the updated cart
    }

    case 'REMOVE_FROM_CART': {
      // Remove the item based on id and batch_number
      return state.filter(
        (item) =>
          !(item.id === action.payload.id && item.batch_number === action.payload.batch_number)
      );
    }

    case 'UPDATE_PRODUCT_QUANTITY': {
      const cart = [...state]; // Copy the current state (cart)

      // Find the product to update
      const existingProductIndex = cart.findIndex(
        (item) =>
          item.id === action.payload.id &&
          item.batch_number === action.payload.batch_number
      );

      if (existingProductIndex !== -1) {
        // Update the quantity of the existing product
        cart[existingProductIndex].quantity = action.payload.newQuantity;

        // If quantity becomes 0 or less, remove the item from the cart
        if (action.payload.newQuantity == 0) {
          cart.splice(existingProductIndex, 1);
        }
      }

      return cart; // Return the updated cart
    }

    case 'EMPTY_CART': {
      // Return an empty cart (i.e., empty array)
      return [];
    }

    default:
      return state; // Return the current state if no action matches
  }
};


const CartProvider = ({ children }) => {
  const persistedState = localStorage.getItem('cart');
  const [cartState, dispatch] = useReducer(cartReducer, persistedState ? JSON.parse(persistedState) : initialState);

  const addToCart = (item) => {
    dispatch({ type: 'ADD_TO_CART', payload: item });
  };

  const removeFromCart = (product) => {
    dispatch({
      type: 'REMOVE_FROM_CART',
      payload: product, // This product should contain at least id and batch_number
    });
  };

   // Function to update product quantity
   const updateProductQuantity = (itemId, batchNumber, newQuantity) => {
    dispatch({
      type: 'UPDATE_PRODUCT_QUANTITY',
      payload: { id: itemId, batch_number: batchNumber, newQuantity },
    });
  };

  // Empty the cart
  const emptyCart = () => {
    dispatch({ type: 'EMPTY_CART' });
  };

 const { cartTotal, totalQuantity, totalProfit } = useMemo(() => {
    return cartState.reduce((acc, item) => {
      const itemTotal = item.price * item.quantity;
      const itemProfit = (item.price - item.cost) * item.quantity; // Ensure you have 'cost' property

      acc.cartTotal += itemTotal;
      acc.totalQuantity += item.quantity;
      acc.totalProfit += itemProfit;

      return acc;
    }, { cartTotal: 0, totalQuantity: 0, totalProfit: 0 });
  }, [cartState]);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartState));
  }, [cartState]);

  return (
    <CartContext.Provider value={{ cartState, cartTotal, totalQuantity, totalProfit, addToCart, removeFromCart, updateProductQuantity, emptyCart}}>
      {children}
    </CartContext.Provider>
  );
};

const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export { CartProvider, useCart };