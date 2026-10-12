import { useContext, createContext, useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { useAuth } from "./auth";

const CartContext = createContext();
const serverUrl = (
    import.meta.env.VITE_SERVER_URL ||
    import.meta.env.VITE_API ||
    "http://localhost:8080"
).replace(/\/$/, "");
const cartUrl = `${serverUrl}/api/v1/user/cart`;

// eslint-disable-next-line react/prop-types
const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    const [saveLaterItems, setSaveLaterItems] = useState([]);
    const { auth } = useAuth();

    const persist = useCallback(async (nextCart, nextLater) => {
        if (!auth?.token) {
            toast.info("Sign in to save your cart.");
            return false;
        }
        try {
            const response = await axios.put(
                cartUrl,
                { cartItems: nextCart, saveLaterItems: nextLater },
                { headers: { Authorization: auth.token } }
            );
            setCartItems(response.data.cartItems);
            setSaveLaterItems(response.data.saveLaterItems);
            return true;
        } catch (error) {
            toast.error(error.response?.data?.message || "Unable to save your cart.");
            return false;
        }
    }, [auth?.token]);

    useEffect(() => {
        let cancelled = false;
        const loadCart = async () => {
            if (!auth?.token) {
                setCartItems([]);
                setSaveLaterItems([]);
                return;
            }
            try {
                const response = await axios.get(cartUrl, {
                    headers: { Authorization: auth.token },
                });
                if (cancelled) return;

                let nextCart = response.data.cartItems || [];
                let nextLater = response.data.saveLaterItems || [];
                // One-time transfer of carts created before MongoDB persistence was enabled.
                const legacyCart = JSON.parse(localStorage.getItem("cart") || "[]");
                const legacyLater = JSON.parse(localStorage.getItem("saveLater") || "[]");
                if (!nextCart.length && !nextLater.length && (legacyCart.length || legacyLater.length)) {
                    nextCart = legacyCart;
                    nextLater = legacyLater;
                    const saved = await axios.put(
                        cartUrl,
                        { cartItems: nextCart, saveLaterItems: nextLater },
                        { headers: { Authorization: auth.token } }
                    );
                    nextCart = saved.data.cartItems;
                    nextLater = saved.data.saveLaterItems;
                }
                if (!cancelled) {
                    setCartItems(nextCart);
                    setSaveLaterItems(nextLater);
                    localStorage.removeItem("cart");
                    localStorage.removeItem("saveLater");
                }
            } catch (error) {
                if (!cancelled) toast.error(error.response?.data?.message || "Unable to load your cart.");
            }
        };
        loadCart();
        return () => { cancelled = true; };
    }, [auth?.token]);

    const addItems = async (product, quantity = 1) => {
        const existingIndex = cartItems.findIndex((item) => item.productId === product?.productId);
        const nextCart = existingIndex >= 0
            ? cartItems.map((item, index) => index === existingIndex ? { ...item, quantity } : item)
            : [{ ...product, quantity }, ...cartItems];
        if (await persist(nextCart, saveLaterItems) && existingIndex < 0) {
            toast.success("Product Added To Cart", { style: { top: "40px" } });
        }
    };

    const removeItems = (product) => persist(
        cartItems.filter((item) => item.productId !== product.productId),
        saveLaterItems
    );

    const addLater = (product) => {
        const nextCart = cartItems.filter((item) => item.productId !== product.productId);
        const nextLater = [product, ...saveLaterItems.filter((item) => item.productId !== product.productId)];
        persist(nextCart, nextLater).then((saved) => saved && toast.success("Product Saved To Later", { style: { top: "40px" } }));
    };

    const moveToCart = (product) => {
        const existingIndex = cartItems.findIndex((item) => item.productId === product.productId);
        const nextCart = existingIndex >= 0
            ? cartItems.map((item, index) => index === existingIndex ? { ...item, quantity: product.quantity } : item)
            : [{ ...product }, ...cartItems];
        persist(nextCart, saveLaterItems.filter((item) => item.productId !== product.productId));
    };

    const removeLater = (product) => persist(
        cartItems,
        saveLaterItems.filter((item) => item.productId !== product.productId)
    );

    const replaceCartItems = useCallback((items) => persist(items, saveLaterItems), [persist, saveLaterItems]);

    return (
        <CartContext.Provider value={[
            cartItems,
            replaceCartItems,
            addItems,
            removeItems,
            saveLaterItems,
            addLater,
            moveToCart,
            removeLater,
        ]}>
            {children}
        </CartContext.Provider>
    );
};

const useCart = () => useContext(CartContext);
export { CartProvider, useCart };
