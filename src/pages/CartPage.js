import React from "react";
import Layout from "../components/Layout/Layout";
import { useCart } from "../context/cart";
import { useAuth } from "../context/auth";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/CartStyles.css";

const CartPage = () => {
  const [auth] = useAuth();
  const [cart, setCart] = useCart();
  const navigate = useNavigate();

  // Function to calculate total price
  const totalPrice = () => {
    return cart
      .reduce((total, item) => total + (item.price || 0), 0)
      .toLocaleString("en-IN", {
        style: "currency",
        currency: "INR",
      });
  };

  // Function to remove an item from the cart
  const removeCartItem = (productId) => {
    const updatedCart = cart.filter((item) => item._id !== productId);
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  // Handle Razorpay payment
  const handlePayment = async () => {
    try {
      const totalAmount = parseInt(totalPrice().replace(/[^\d]/g, ""), 10); // Convert total to numeric value

      // Create an order on the server
      const { data: orderResponse } = await axios.post("/api/v1/payment/create-order", {
        amount: totalAmount,
      });

      const { id: orderId, amount } = orderResponse;

      // Razorpay payment options
      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID || "rzp_test_OxAxRfdIt6ofSm",
        amount: amount * 1,
        currency: "INR",
        name: "Arouse Automation",
        description: "Order Payment",
        order_id: orderId,
        handler: async (response) => {
          try {
            const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = response;

            const verificationData = {
              razorpay_order_id,
              razorpay_payment_id,
              razorpay_signature,
              cart,
            };

            const { data: verificationResponse } = await axios.post(
              "/api/v1/payment/verify-payment",
              verificationData
            );

            if (verificationResponse.ok) {
              setCart([]);
              localStorage.removeItem("cart");
              navigate("/dashboard/user/Orders");
            } else {
              alert("Payment verification failed. Please try again.");
            }
          } catch (error) {
            alert("An error occurred during payment verification.");
          }
        },
        prefill: {
          name: auth?.user?.name || "Guest User",
          email: auth?.user?.email || "guest@example.com",
          contact: auth?.user?.phone || "9000000000",
        },
        theme: {
          color: "#3399cc",
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      alert("Error initiating payment. Please try again.");
    }
  };

  return (
    <Layout>
      <div className="container cart-page">
        <h2 className="text-center cart-title">
          <span role="img" aria-label="cart">🛒</span> Your Shopping Cart
        </h2>
        <p className="text-center cart-subtitle">
          {cart?.length
            ? `You have ${cart.length} item(s) in your cart.`
            : "Your cart is empty. Start shopping now!"}
        </p>

        <div className="row">
          <div className="col-lg-7">
            <div className="row row-cols-1 row-cols-md-2 g-4">
              {cart?.map((item, index) => (
                <div className="col" key={item._id || index}>
                  <div className="card cart-item-card">
                    <img
                      src={`/api/v1/product/product-photo/${item._id}`}
                      alt={item.name}
                      className="card-img-top cart-item-image"
                    />
                    <div className="card-body">
                      <h5 className="card-title">{item.name}</h5>
                      <p className="card-text">{item.description?.substring(0, 50)}...</p>
                      <h6 className="cart-price">Price: {item.price}</h6>
                      <button
                        className="btn btn-danger w-100"
                        onClick={() => removeCartItem(item._id)}
                      >
                        <span role="img" aria-label="remove">❌</span> Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="col-lg-5">
            <div className="card shadow-lg p-4 cart-summary">
              <h3 className="text-center">
                <span role="img" aria-label="order">🛍️</span> Order Summary
              </h3>
              <hr />
              <h4 className="text-center total-price">Total: {totalPrice()}</h4>

              {auth?.user?.address ? (
                <div className="address-section">
                  <h5>
                    <span role="img" aria-label="location">📍</span> Shipping Address:
                  </h5>
                  <p>{auth.user.address}</p>
                  <button
                    className="btn btn-outline-primary w-100"
                    onClick={() => navigate("/dashboard/user/profile")}
                  >
                    <span role="img" aria-label="edit">✏️</span> Update Address
                  </button>
                </div>
              ) : auth?.token ? (
                <button
                  className="btn btn-outline-primary w-100"
                  onClick={() => navigate("/dashboard/user/profile")}
                >
                  <span role="img" aria-label="add">➕</span> Add Address
                </button>
              ) : (
                <button
                  className="btn btn-warning w-100"
                  onClick={() => navigate("/login", { state: { from: "/cart" } })}
                >
                  <span role="img" aria-label="login">🔑</span> Login to Proceed
                </button>
              )}

              <div className="mt-3">
                {auth?.token && cart.length > 0 && auth.user.address && (
                  <button className="btn btn-success w-100" onClick={handlePayment}>
                    <span role="img" aria-label="pay">💳</span> Proceed to Pay
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CartPage;
