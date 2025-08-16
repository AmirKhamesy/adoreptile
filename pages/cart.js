import Header from "@/components/Header";
import styled from "styled-components";
import Center from "@/components/Center";
import Button from "@/components/Button";
import { useContext, useEffect, useState } from "react";
import { CartContext } from "@/components/CartContext";
import axios from "axios";
import Input from "@/components/Input";
import { RevealWrapper } from "next-reveal";
import { useSession, signIn } from "next-auth/react";
import * as colors from "@/lib/colors";
import Link from "next/link";
import ShippingOptions from "@/components/ShippingOptions";

const PageWrapper = styled.div`
  min-height: 100vh;
  background: ${colors.background}08;
`;

const CartContainer = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem 1rem;
  padding-bottom: calc(2rem + env(safe-area-inset-bottom, 0));

  @media screen and (max-width: 768px) {
    padding: 1rem;
    padding-bottom: calc(1rem + env(safe-area-inset-bottom, 0));
  }
`;

const CartTitle = styled.h1`
  font-size: 2.5rem;
  font-weight: 600;
  color: ${colors.primary};
  margin-bottom: 2rem;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  svg {
    width: 2rem;
    height: 2rem;
    color: ${colors.primary};
  }

  @media screen and (max-width: 768px) {
    font-size: 2rem;

    svg {
      width: 1.75rem;
      height: 1.75rem;
    }
  }
`;

const CartGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;

  @media screen and (min-width: 1024px) {
    grid-template-columns: 1.5fr 1fr;
  }
`;

const CartSection = styled.div`
  background: ${colors.white};
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 4px 24px ${colors.primary}10;

  @media screen and (max-width: 768px) {
    padding: 1.5rem;
  }
`;

const SectionTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: ${colors.primary};
  margin-bottom: 1.5rem;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  svg {
    width: 1.25rem;
    height: 1.25rem;
    color: ${colors.primary};
  }
`;

const CartItem = styled.div`
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 1.5rem;
  padding: 1.5rem 0;
  border-bottom: 1px solid ${colors.background};

  &:last-child {
    border-bottom: none;
  }

  @media screen and (max-width: 768px) {
    gap: 1rem;
  }
`;

const ProductImage = styled(Link)`
  width: 100px;
  height: 100px;
  border-radius: 12px;
  overflow: hidden;
  background: ${colors.background};
  display: block;
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-2px);
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  @media screen and (max-width: 768px) {
    width: 80px;
    height: 80px;
  }
`;

const ProductInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const ProductTitle = styled(Link)`
  font-size: 1rem;
  font-weight: 500;
  color: ${colors.textDark};
  margin: 0;
  text-decoration: none;
  transition: color 0.2s ease;

  &:hover {
    color: ${colors.primary};
  }
`;

const ProductPrice = styled.div`
  display: flex;
  align-items: baseline;
  gap: 8px;
  font-size: 1.125rem;
  font-weight: 600;
  color: ${colors.primary};

  .original-price {
    font-size: 0.875rem;
    text-decoration: line-through;
    color: #86868b;
    font-weight: 400;
  }
`;

const DiscountBadge = styled.span`
  background: #f5f5f7;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
  color: #1d1d1f;
  margin-left: 8px;
`;

const QuantityControls = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: 0.5rem;
`;

const QuantityButton = styled.button`
  background: ${colors.primary}15;
  border: none;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${colors.primary};
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 1rem;

  &:hover {
    background: ${colors.primary}25;
  }
`;

const Quantity = styled.span`
  font-size: 0.9rem;
  font-weight: 500;
  color: ${colors.textDark};
  min-width: 1.5rem;
  text-align: center;
`;

const OrderSummary = styled.div`
  margin-top: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const SummaryRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9rem;
  color: ${colors.textDark};
  padding: 0.5rem 0;

  &.total {
    font-size: 1.125rem;
    font-weight: 600;
    color: ${colors.primary};
    border-top: 1px solid ${colors.background};
    margin-top: 0.5rem;
    padding-top: 1rem;
  }
`;

const CheckoutButton = styled.button`
  background: ${colors.primary};
  color: white;
  border: none;
  padding: 1rem;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 500;
  width: 100%;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  svg {
    width: 1.25rem;
    height: 1.25rem;
  }

  &:hover {
    background: ${colors.primaryDark};
    transform: translateY(-1px);
  }

  &:disabled {
    background: ${colors.primary}50;
    cursor: not-allowed;
  }
`;

const EmptyCart = styled.div`
  text-align: center;
  padding: 3rem 0;
  color: ${colors.textDark};

  h2 {
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: 1rem;
  }

  p {
    font-size: 1rem;
    margin-bottom: 2rem;
  }

  a {
    background: ${colors.primary};
    color: white;
    border: none;
    padding: 0.875rem 1.5rem;
    border-radius: 12px;
    font-size: 1rem;
    font-weight: 500;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;

    &:hover {
      background: ${colors.primaryDark};
      transform: translateY(-1px);
    }
  }
`;

const StyledInput = styled(Input)`
  margin-bottom: 1rem;
  background: ${colors.primary}08;
  border: 1px solid ${colors.primary}15;
  padding: 0.875rem;
  border-radius: 10px;
  font-size: 0.9rem;

  &:focus {
    outline: 2px solid ${colors.primary}40;
    border-color: transparent;
  }
`;

const InputGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;

  @media screen and (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const SuccessMessage = styled.div`
  text-align: center;
  padding: 4rem 2rem;

  h1 {
    font-size: 2rem;
    color: ${colors.primary};
    margin-bottom: 1rem;
  }

  p {
    font-size: 1.125rem;
    color: ${colors.textDark};
  }
`;

const CartIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
    />
  </svg>
);

const SummaryIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
    />
  </svg>
);

const ShippingIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
    />
  </svg>
);

const CheckoutIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
    />
  </svg>
);

export default function CartPage() {
  const { cartProducts, addProduct, removeProduct, clearCart } =
    useContext(CartContext);
  const { data: session } = useSession();
  const [products, setProducts] = useState([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [streetAddress, setStreetAddress] = useState("");
  const [country, setCountry] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [shippingFee, setShippingFee] = useState(null);
  const [selectedShippingOption, setSelectedShippingOption] = useState(null);

  useEffect(() => {
    if (cartProducts.length > 0) {
      axios.post("/api/cart", { ids: cartProducts }).then((response) => {
        setProducts(response.data);
      });
    } else {
      setProducts([]);
    }
  }, [cartProducts]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    if (window?.location.href.includes("success")) {
      setIsSuccess(true);
      clearCart();
    }
    axios.get("/api/settings?name=shippingFee").then((res) => {
      setShippingFee(res.data.value);
    });
  }, []);

  useEffect(() => {
    if (!session) {
      return;
    }
    axios.get("/api/address").then((response) => {
      setName(response.data.name);
      setEmail(response.data.email);
      setCity(response.data.city);
      setPostalCode(response.data.postalCode);
      setStreetAddress(response.data.streetAddress);
      setCountry(response.data.country);
    });
  }, [session]);

  function moreOfThisProduct(id) {
    addProduct(id);
  }

  function lessOfThisProduct(id) {
    removeProduct(id);
  }

  async function goToPayment() {
    const response = await axios.post("/api/checkout", {
      name,
      email,
      city,
      postalCode,
      streetAddress,
      country,
      cartProducts,
      shippingFee: selectedShippingOption?.price || shippingFee,
    });
    if (response.data.url) {
      window.location = response.data.url;
    }
  }

  const handleSelectShipping = (option) => {
    setSelectedShippingOption(option);
    // Also update shipping fee
    setShippingFee(option.price);
  };

  const calculateTotal = () => {
    let total = 0;
    for (const product of products) {
      const quantity = cartProducts.filter((id) => id === product._id).length;
      if (!product.discounts?.length) {
        total += product.price * quantity;
        continue;
      }

      // Find best applicable discount
      const applicableDiscounts = product.discounts
        .filter((d) => quantity >= d.quantity)
        .sort((a, b) => b.quantity - a.quantity);

      const bestDiscount = applicableDiscounts[0];

      if (!bestDiscount) {
        total += product.price * quantity;
      } else if (bestDiscount.type === "fixed") {
        total += (product.price - bestDiscount.value) * quantity;
      } else {
        total += product.price * (1 - bestDiscount.value / 100) * quantity;
      }
    }
    return total;
  };

  if (isSuccess) {
    return (
      <PageWrapper>
        <Header />
        <CartContainer>
          <RevealWrapper>
            <SuccessMessage>
              <h1>Thank you for your order! 🦎</h1>
              <p>We'll send you an email when your order ships.</p>
            </SuccessMessage>
          </RevealWrapper>
        </CartContainer>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <Header />
      <CartContainer>
        <CartTitle>
          <CartIcon />
          Your Cart
        </CartTitle>
        {!cartProducts?.length ? (
          <RevealWrapper>
            <EmptyCart>
              <h2>Your cart is empty</h2>
              <p>Looks like you haven't added any reptile friends yet!</p>
              <Link href="/products" className="continue-shopping">
                Continue Shopping
              </Link>
            </EmptyCart>
          </RevealWrapper>
        ) : (
          <CartGrid>
            <RevealWrapper delay={0}>
              <CartSection>
                <SectionTitle>Cart Items</SectionTitle>
                {products.map((product) => {
                  const quantity = cartProducts.filter(
                    (id) => id === product._id
                  ).length;
                  return (
                    <CartItem key={product._id}>
                      <ProductImage href={`/product/${product._id}`}>
                        <img src={product.images[0]} alt={product.title} />
                      </ProductImage>
                      <ProductInfo>
                        <ProductTitle href={`/product/${product._id}`}>
                          {product.title}
                        </ProductTitle>
                        <ProductPrice>
                          {(() => {
                            const quantity = cartProducts.filter(
                              (id) => id === product._id
                            ).length;

                            if (!product.discounts?.length) {
                              return `$${(product.price * quantity).toFixed(
                                2
                              )}`;
                            }

                            const applicableDiscounts = product.discounts
                              .filter((d) => quantity >= d.quantity)
                              .sort((a, b) => b.quantity - a.quantity);

                            const bestDiscount = applicableDiscounts[0];

                            if (!bestDiscount) {
                              return `$${(product.price * quantity).toFixed(
                                2
                              )}`;
                            }

                            const originalPrice = product.price * quantity;
                            const discountedPrice =
                              bestDiscount.type === "fixed"
                                ? (product.price - bestDiscount.value) *
                                  quantity
                                : product.price *
                                  (1 - bestDiscount.value / 100) *
                                  quantity;

                            const discountText =
                              bestDiscount.type === "fixed"
                                ? `-$${bestDiscount.value}`
                                : `-${bestDiscount.value}%`;

                            return (
                              <>
                                ${discountedPrice.toFixed(2)}
                                <span className="original-price">
                                  ${originalPrice.toFixed(2)}
                                </span>
                                <DiscountBadge>{discountText}</DiscountBadge>
                              </>
                            );
                          })()}
                        </ProductPrice>
                        <QuantityControls>
                          <QuantityButton
                            onClick={() => lessOfThisProduct(product._id)}
                          >
                            −
                          </QuantityButton>
                          <Quantity>{quantity}</Quantity>
                          <QuantityButton
                            onClick={() => moreOfThisProduct(product._id)}
                          >
                            +
                          </QuantityButton>
                        </QuantityControls>
                      </ProductInfo>
                    </CartItem>
                  );
                })}

                <SectionTitle style={{ marginTop: "2rem" }}>
                  <ShippingIcon />
                  Shipping Options
                </SectionTitle>

                <ShippingOptions
                  products={products}
                  cartProducts={cartProducts}
                  onSelect={handleSelectShipping}
                />
              </CartSection>
            </RevealWrapper>

            <RevealWrapper delay={100}>
              <CartSection>
                <SectionTitle>
                  <SummaryIcon />
                  Order Summary
                </SectionTitle>
                <OrderSummary>
                  <SummaryRow>
                    <span>Subtotal</span>
                    <span>${calculateTotal().toFixed(2)}</span>
                  </SummaryRow>
                  <SummaryRow>
                    <span>Shipping</span>
                    <span>${parseFloat(shippingFee || 0).toFixed(2)}</span>
                  </SummaryRow>
                  <SummaryRow className="total">
                    <span>Total</span>
                    <span>
                      $
                      {(
                        calculateTotal() + parseFloat(shippingFee || 0)
                      ).toFixed(2)}
                    </span>
                  </SummaryRow>
                </OrderSummary>

                {!session ? (
                  <div style={{ textAlign: "center", marginTop: "2rem" }}>
                    <p style={{ marginBottom: "1rem", color: colors.textDark }}>
                      Please sign in to complete your order
                    </p>
                    <Button
                      onClick={() => signIn("google")}
                      style={{
                        background: colors.primary,
                        color: "white",
                        border: "none",
                        padding: "0.875rem 1.5rem",
                        borderRadius: "12px",
                        fontSize: "1rem",
                        fontWeight: "500",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        width: "100%",
                      }}
                    >
                      Sign In with Google
                    </Button>
                  </div>
                ) : (
                  <>
                    <SectionTitle style={{ marginTop: "2rem" }}>
                      <ShippingIcon />
                      Shipping Information
                    </SectionTitle>
                    <StyledInput
                      type="text"
                      placeholder="Full Name"
                      value={name}
                      onChange={(ev) => setName(ev.target.value)}
                    />
                    <StyledInput
                      type="email"
                      placeholder="Email"
                      value={email}
                      onChange={(ev) => setEmail(ev.target.value)}
                    />
                    <InputGrid>
                      <StyledInput
                        type="text"
                        placeholder="City"
                        value={city}
                        onChange={(ev) => setCity(ev.target.value)}
                      />
                      <StyledInput
                        type="text"
                        placeholder="Postal Code"
                        value={postalCode}
                        onChange={(ev) => setPostalCode(ev.target.value)}
                      />
                    </InputGrid>
                    <StyledInput
                      type="text"
                      placeholder="Street Address"
                      value={streetAddress}
                      onChange={(ev) => setStreetAddress(ev.target.value)}
                    />
                    <StyledInput
                      type="text"
                      placeholder="Country"
                      value={country}
                      onChange={(ev) => setCountry(ev.target.value)}
                    />
                    <CheckoutButton
                      onClick={goToPayment}
                      disabled={
                        !name ||
                        !email ||
                        !city ||
                        !postalCode ||
                        !streetAddress ||
                        !country ||
                        !shippingFee
                      }
                    >
                      <CheckoutIcon />
                      Proceed to Checkout
                    </CheckoutButton>
                  </>
                )}
              </CartSection>
            </RevealWrapper>
          </CartGrid>
        )}
      </CartContainer>
    </PageWrapper>
  );
}
