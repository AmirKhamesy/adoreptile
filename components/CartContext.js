import { createContext, useEffect, useState } from "react";

export const CartContext = createContext({});

export function CartContextProvider({ children }) {
  const ls = typeof window !== "undefined" ? window.localStorage : null;
  const [cartProducts, setCartProducts] = useState([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize cart from localStorage
  useEffect(() => {
    if (ls && !isInitialized) {
      const storedCart = ls.getItem("cart");
      if (storedCart) {
        try {
          setCartProducts(JSON.parse(storedCart));
        } catch (err) {
          console.error("Error parsing cart from localStorage:", err);
          ls.removeItem("cart");
        }
      }
      setIsInitialized(true);
    }
  }, []);

  // Update localStorage when cart changes
  useEffect(() => {
    if (ls && isInitialized) {
      if (cartProducts?.length > 0) {
        ls.setItem("cart", JSON.stringify(cartProducts));
      } else {
        ls.removeItem("cart");
      }
    }
  }, [cartProducts, isInitialized]);

  function addProduct(productId) {
    setCartProducts((prev) => [...prev, productId]);
  }

  function addMultipleProducts(productId, quantity) {
    setCartProducts((prev) => [...prev, ...Array(quantity).fill(productId)]);
  }

  function removeProduct(productId) {
    setCartProducts((prev) => {
      const pos = prev.indexOf(productId);
      if (pos !== -1) {
        return prev.filter((value, index) => index !== pos);
      }
      return prev;
    });
  }

  function clearCart() {
    setCartProducts([]);
  }

  return (
    <CartContext.Provider
      value={{
        cartProducts,
        setCartProducts,
        addProduct,
        addMultipleProducts,
        removeProduct,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
