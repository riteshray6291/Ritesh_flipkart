import axios from "axios";

const API_URL = (
    import.meta.env.VITE_API_URL || "https://fakestoreapi.com"
).replace(/\/$/, "");

export const fetchProducts = async () => {
    const response = await axios.get(`${API_URL}/products`);
    return response.data;
};

export const fetchFakeStoreProduct = async (productId) => {
    const response = await axios.get(`${API_URL}/products/${productId}`);
    return response.data;
};

export const fetchProductById = async (productId) => {
    if (/^\d+$/.test(productId)) {
        return fetchFakeStoreProduct(productId);
    }

    if (/^[a-f\d]{24}$/i.test(productId)) {
        const serverUrl = import.meta.env.VITE_SERVER_URL;
        if (!serverUrl) {
            throw new Error("VITE_SERVER_URL is required for MongoDB products");
        }

        const response = await axios.get(
            `${serverUrl}/api/v1/product/${productId}`
        );
        return response.data?.product;
    }

    return null;
};
