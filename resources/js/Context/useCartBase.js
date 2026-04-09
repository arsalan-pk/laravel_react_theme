import { useReducer, useEffect, useMemo } from 'react';
import dayjs from 'dayjs';

// Define a generic cart reducer
const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_TO_CART': {
      const cart = [...state];
      const existingProductIndex =
        action.payload.add_new_item === true
          ? -1
          : cart.findIndex(
            (item) =>
              item.id === action.payload.id &&
              item.batch_number === action.payload.batch_number &&
              (item.product_type !== 'custom' && item.product_type !== 'reload')
          );

      if (existingProductIndex !== -1) {
        // Item found, so just increase its quantity
        cart[existingProductIndex].quantity =
          parseFloat(cart[existingProductIndex].quantity) + 1;
      } else {
        const productToAdd = { ...action.payload, quantity: action.payload.quantity };
        cart.push(productToAdd);
      }
      return cart;
    }

    case 'REMOVE_FROM_CART': {
      const cart = [...state];
      cart.splice(action.payload.index, 1);
      return cart;
    }

    case 'UPDATE_PRODUCT_QUANTITY': {
      const cart = [...state];
      let existingProductIndex = action.payload.cart_index;

      if (existingProductIndex !== -1) {
        const currentItem = cart[existingProductIndex];
        const currentQuantity = parseFloat(currentItem.quantity);
        const newQuantity = parseFloat(action.payload.newQuantity);

        cart[existingProductIndex].quantity = newQuantity;

        // For return sales: quantities are negative, only remove if quantity becomes 0 or positive
        // For regular sales: quantities are positive, remove if quantity becomes 0 or negative
        const isReturnSale = currentQuantity < 0 || newQuantity < 0;

        if (isReturnSale) {
          // Return sale: remove only if quantity becomes 0 or positive (invalid)
          if (newQuantity >= 0) {
            cart.splice(existingProductIndex, 1);
          }
        } else {
          // Regular sale: remove if quantity becomes 0 or negative
          if (newQuantity <= 0) {
            cart.splice(existingProductIndex, 1);
          }
        }
      }

      return cart;
    }

    case 'UPDATE_CART_ITEM': {
      const cart = [...state];
      let existingProductIndex = action.payload.cart_index;
      if (!['reload', 'custom'].includes(action.payload.product_type) && !existingProductIndex) {
        existingProductIndex = cart.findIndex(
          (item) =>
            item.id === action.payload.id &&
            item.batch_number === action.payload.batch_number
        );
      }

      if (existingProductIndex !== -1) {
        const currentItem = cart[existingProductIndex];
        const currentQuantity = parseFloat(currentItem.quantity);
        const updatedItem = {
          ...cart[existingProductIndex],
          ...action.payload,
        };
        const newQuantity = parseFloat(updatedItem.quantity);

        cart[existingProductIndex] = updatedItem;

        // For return sales: quantities are negative, only remove if quantity becomes 0 or positive
        // For regular sales: quantities are positive, remove if quantity becomes 0
        const isReturnSale = currentQuantity < 0 || newQuantity < 0;

        if (isReturnSale) {
          // Return sale: remove only if quantity becomes 0 or positive (invalid)
          if (newQuantity >= 0) {
            cart.splice(existingProductIndex, 1);
          }
        } else {
          // Regular sale: remove if quantity becomes 0 or negative (match UPDATE_PRODUCT_QUANTITY logic)
          if (newQuantity <= 0) {
            cart.splice(existingProductIndex, 1);
          }
        }
      }

      return cart;
    }

    case 'EMPTY_CART': {
      return [];
    }

    case 'HOLD_CART': {
      const heldCarts = JSON.parse(localStorage.getItem('heldCarts')) || {};
      const currentDateTime = dayjs().format('YYYY-MM-DD HH:mm:ss');
      const newKey = currentDateTime; // Unique key for the held cart
      heldCarts[newKey] = [...state];
      localStorage.setItem('heldCarts', JSON.stringify(heldCarts));
      return []; // Clear the current cart state
    }

    case 'SET_HELD_CART_TO_CART': {
      return [...action.payload.cart];
    }

    default:
      return state;
  }
};

// Custom hook for cart logic, common for both sales and purchase contexts
// State key can be both purchase_cart or sales_cart
const useCartBase = (initialStateKey) => {
  const persistedState = localStorage.getItem(initialStateKey);
  const [cartState, dispatch] = useReducer(cartReducer, persistedState ? JSON.parse(persistedState) : []);

  const addToCart = (item, quantity = 1, isReturnSale = false) => {
    // Check if product is stock managed and out of stock (skip check for return sales)
    if (!isReturnSale && item.is_stock_managed === 1 && (item.quantity <= 0 || item.stock_quantity <= 0)) {
      // Return false to indicate failure, but don't throw error here
      // Let the calling component handle the error message
      return false;
    }
    dispatch({ type: 'ADD_TO_CART', payload: { ...item, quantity } });
    return true;
  };

  const removeFromCart = (index) => {
    dispatch({
      type: 'REMOVE_FROM_CART',
      payload: { index }, // product should contain at least id and batch_number
    });
  };

  const updateProductQuantity = (itemId, batchNumber, newQuantity, cart_index) => {
    dispatch({
      type: 'UPDATE_PRODUCT_QUANTITY',
      payload: { id: itemId, batch_number: batchNumber, newQuantity, cart_index },
    });
  };

  const updateCartItem = (item) => {
    dispatch({
      type: 'UPDATE_CART_ITEM',
      payload: item,
    });
  };

  const holdCart = () => {
    dispatch({ type: 'HOLD_CART' });
  };

  const emptyCart = () => {
    dispatch({ type: 'EMPTY_CART' });
  };


  // Set a held cart as the current cart by retrieving the cart items using a key
  const setHeldCartToCart = (key) => {
    const heldCarts = JSON.parse(localStorage.getItem('heldCarts')) || {};
    const cart = heldCarts[key] || [];
    if (cart.length > 0) {
      // Set the current cart to the retrieved cart
      dispatch({ type: 'SET_HELD_CART_TO_CART', payload: { cart } });

      // Remove the held cart from localStorage
      delete heldCarts[key];
      localStorage.setItem('heldCarts', JSON.stringify(heldCarts));
    }
  };

  const removeHeldItem = (key) => {
    const heldCarts = JSON.parse(localStorage.getItem('heldCarts')) || {};
    delete heldCarts[key];
    localStorage.setItem('heldCarts', JSON.stringify(heldCarts));
  };

  useEffect(() => {
    localStorage.setItem(initialStateKey, JSON.stringify(cartState));
  }, [cartState, initialStateKey]);

  return { cartState, addToCart, removeFromCart, updateProductQuantity, emptyCart, updateCartItem, holdCart, setHeldCartToCart, removeHeldItem };
};

export default useCartBase;
