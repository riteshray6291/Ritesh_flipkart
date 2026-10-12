import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { useCart } from "../../../context/cart";
import { useAuth } from "../../../context/auth";
import axios from "axios";
import Spinner from "./../../../components/Spinner";
import SeoData from "../../../SEO/SeoData";

const OrderSuccess = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const isCashOnDelivery = searchParams.get("payment") === "cod";
    const [time, setTime] = useState(3);
    const [cartItems, setCartItems] = useCart();
    const { auth } = useAuth();
    const [sessionId, setSessionId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [hasSavedPayment, setHasSavedPayment] = useState(false); // Add a flag to prevent multiple API calls

    // Payment session and shipping details are kept with the signed-in account.
    useEffect(() => {
        if (!auth?.token || isCashOnDelivery) return;
        axios.get(`${import.meta.env.VITE_SERVER_URL}/api/v1/user/pending-payment-session`, {
            headers: { Authorization: auth.token },
        }).then(({ data }) => setSessionId(data.sessionId))
            .catch((error) => console.error("Unable to load payment session:", error));
    }, [auth?.token, isCashOnDelivery]);

    // After order placement, remove items from cart and save details to the database
    useEffect(() => {
        const savePayment = async () => {
            try {
                if (isCashOnDelivery) {
                    setHasSavedPayment(true);
                    setLoading(false);
                    return;
                }
                setLoading(true);
                const shipping = await axios.get(
                    `${import.meta.env.VITE_SERVER_URL}/api/v1/user/shipping-info`,
                    { headers: { Authorization: auth?.token } }
                );
                const payment = await axios.post(
                    `${
                        import.meta.env.VITE_SERVER_URL
                    }/api/v1/user/payment-success`,
                    {
                        sessionId: sessionId,
                        orderItems: cartItems,
                        shippingInfo: shipping.data.shippingInfo,
                    },
                    {
                        headers: {
                            Authorization: auth?.token,
                        },
                    }
                );

                if (payment.status === 200) {
                    setCartItems([]); // Clear cart items
                    setLoading(false);
                    setHasSavedPayment(true); // Mark the payment as saved to prevent further API calls
                }
            } catch (error) {
                console.log(error);
            }
        };

        if (isCashOnDelivery) {
            setHasSavedPayment(true);
            setLoading(false);
        } else if (sessionId && cartItems.length > 0 && !hasSavedPayment) {
            savePayment(); // Ensure the API call is only triggered once
        }
    }, [sessionId, auth?.token, cartItems, hasSavedPayment, setCartItems, isCashOnDelivery]);

    // Timer to redirect after 3 sec
    let intervalId = useRef(null);
    useEffect(() => {
        intervalId.current = setInterval(() => {
            if (!loading)
                setTime((prev) => {
                    let temp = prev - 1;
                    if (temp === 0) {
                        clearInterval(intervalId.current);
                        navigate("/user/orders");
                    }
                    return temp;
                });
        }, 1000);
        return () => clearInterval(intervalId.current);
    }, [loading, navigate]);

    return (
        <>
            <SeoData title={`Transaction Successful`} />
            <main className="w-full p-8 relative min-h-[60vh]">
                {loading ? (
                    <Spinner />
                ) : (
                    <div className="flex flex-col gap-2 items-center justify-center sm:w-4/6 m-auto bg-white shadow rounded p-6 min-h-[60vh]">
                        <div className="flex gap-4 items-center">
                            <h1 className="text-2xl font-semibold">
                                {isCashOnDelivery ? "Order placed" : "Transaction Successful"}
                            </h1>
                            <CheckCircleOutlineIcon className="text-primaryBlue" />
                        </div>
                        <p className="mt-4 text-lg text-gray-800">
                            {isCashOnDelivery
                                ? "Cash on Delivery selected. Pay the delivery partner when your order arrives."
                                : `Redirecting to orders in ${time} sec`}
                        </p>
                        <Link
                            to="/user/orders"
                            className="bg-primaryBlue mt-2 py-2.5 px-6 text-white uppercase shadow hover:shadow-lg rounded-sm"
                        >
                            go to orders
                        </Link>
                    </div>
                )}
            </main>
        </>
    );
};

export default OrderSuccess;
