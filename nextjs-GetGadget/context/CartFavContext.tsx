"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";

type CartFavContextType = {
  cartVersion: number;
  favVersion: number;
  bumpCart: () => void;
  bumpFav: () => void;
};

const CartFavContext = createContext<CartFavContextType>({
  cartVersion: 0,
  favVersion: 0,
  bumpCart: () => {},
  bumpFav: () => {},
});

export function CartFavProvider({ children }: { children: ReactNode }) {
  const [cartVersion, setCartVersion] = useState(0);
  const [favVersion, setFavVersion] = useState(0);

  const bumpCart = useCallback(() => setCartVersion((v) => v + 1), []);
  const bumpFav = useCallback(() => setFavVersion((v) => v + 1), []);

  return (
    <CartFavContext.Provider value={{ cartVersion, favVersion, bumpCart, bumpFav }}>
      {children}
    </CartFavContext.Provider>
  );
}

export function useCartFav() {
  return useContext(CartFavContext);
}
