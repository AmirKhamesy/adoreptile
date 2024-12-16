import Header from "@/components/Header";
import styled from "styled-components";
import Center from "@/components/Center";
import Button from "@/components/Button";
import { useContext, useEffect, useState } from "react";
import { CartContext } from "@/components/CartContext";
import axios from "axios";
import Table from "@/components/Table";
import Input from "@/components/Input";
import { RevealWrapper } from "next-reveal";
import { useSession } from "next-auth/react";

const ColumnsWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 40px;
  margin-top: 40px;
  margin-bottom: 40px;

  @media screen and (min-width: 768px) {
    grid-template-columns: 1.2fr 0.8fr;
  }

  table thead tr th:nth-child(3),
  table tbody tr td:nth-child(3),
  table tbody tr.subtotal td:nth-child(2) {
    text-align: right;
  }

  table tr.subtotal td {
    padding: 15px 0;
  }

  table tbody tr.subtotal td:nth-child(2) {
    font-size: 1.4rem;
  }

  tr.total td {
    font-weight: bold;
  }
`;

const Box = styled.div`
  background-color: #f7e7e4;
  border-radius: 10px;
  padding: 30px;
`;

const ProductInfoCell = styled.td`
  padding: 10px 0;
  button {
    padding: 0 !important;
  }
`;

const ProductImageBox = styled.div`
  width: 70px;
  height: 100px;
  padding: 2px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;

  img {
    max-width: 60px;
    max-height: 60px;
  }

  @media screen and (min-width: 768px) {
    padding: 10px;
    width: 100px;
    height: 100px;

    img {
      max-width: 80px;
      max-height: 80px;
    }
  }
`;

const QuantityLabel = styled.span`
  padding: 0 15px;
  display: block;

  @media screen and (min-width: 768px) {
    display: inline-block;
    padding: 0 6px;
  }
`;

const CityHolder = styled.div`
  display: flex;
  gap: 5px;
`;

const StyledButton = styled(Button)`
  background-color: #ff7e5f;
  color: white;

  &:hover {
    background-color: #ff6b4a;
  }
`;

const SavingsBox = styled.div`
  background-color: #f5f5f7;
  border-radius: 10px;
  padding: 15px;
  margin: 10px 0;
`;

const SavingsTitle = styled.div`
  color: #1d1d1f;
  font-size: 1rem;
  font-weight: 500;
  margin-bottom: 8px;
`;

const SavingsAmount = styled.div`
  color: #bf4800;
  font-size: 0.9rem;
`;

const OriginalPrice = styled.span`
  text-decoration: line-through;
  color: #86868b;
  font-size: 0.9rem;
  margin-left: 8px;
`;

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
  const [totalSavings, setTotalSavings] = useState(0);
  const [originalTotal, setOriginalTotal] = useState(0);

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
    });
    if (response.data.url) {
      window.location = response.data.url;
    }
  }

  const getBestDiscount = (product, quantity) => {
    if (!product.discounts?.length) return null;

    // Filter discounts where quantity meets or exceeds threshold
    // Sort by quantity threshold in descending order to get highest eligible quantity
    const applicableDiscounts = product.discounts
      .filter((d) => quantity >= d.quantity)
      .sort((a, b) => b.quantity - a.quantity);

    // Return the discount with highest quantity requirement
    return applicableDiscounts[0] || null;
  };

  const calculateProductTotal = (product, quantity) => {
    if (!product.discounts?.length) return product.price * quantity;

    const bestDiscount = getBestDiscount(product, quantity);
    if (!bestDiscount) return product.price * quantity;

    if (bestDiscount.type === "fixed") {
      return (product.price - bestDiscount.value) * quantity;
    } else {
      return product.price * (1 - bestDiscount.value / 100) * quantity;
    }
  };

  useEffect(() => {
    if (products.length > 0) {
      let savings = 0;
      let original = 0;

      products.forEach((product) => {
        const quantity = cartProducts.filter((id) => id === product._id).length;
        const originalPrice = product.price * quantity;
        const discountedPrice = calculateProductTotal(product, quantity);

        original += originalPrice;
        savings += originalPrice - discountedPrice;
      });

      setTotalSavings(savings);
      setOriginalTotal(original);
    }
  }, [products, cartProducts]);

  let productsTotal = 0;
  for (const productId of cartProducts) {
    const price = products.find((p) => p._id === productId)?.price || 0;
    productsTotal += price;
  }

  const total = (productsTotal + parseFloat(shippingFee || 0)).toFixed(2);

  if (isSuccess) {
    return (
      <>
        <Header />
        <Center>
          <ColumnsWrapper>
            <Box>
              <h1>Thanks for your order!</h1>
              <p>We will email you when your order will be sent.</p>
            </Box>
          </ColumnsWrapper>
        </Center>
      </>
    );
  }

  return (
    <>
      <Header />
      <Center>
        <ColumnsWrapper>
          <RevealWrapper delay={0}>
            <Box>
              <h2>Cart</h2>
              {!cartProducts?.length && <div>Your cart is empty</div>}
              {products?.length > 0 && (
                <>
                  {totalSavings > 0 && (
                    <SavingsBox>
                      <SavingsTitle>Available Savings</SavingsTitle>
                      <SavingsAmount>
                        You're saving ${totalSavings.toFixed(2)} on your order
                      </SavingsAmount>
                    </SavingsBox>
                  )}
                  <Table>
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Quantity</th>
                        <th>Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((product) => {
                        const quantity = cartProducts.filter(
                          (id) => id === product._id
                        ).length;
                        const bestDiscount = getBestDiscount(product, quantity);
                        const discountedTotal = calculateProductTotal(
                          product,
                          quantity
                        );
                        const originalTotal = product.price * quantity;

                        return (
                          <tr key={product._id}>
                            <ProductInfoCell>
                              <ProductImageBox>
                                <img src={product.images[0]} alt="" />
                              </ProductImageBox>
                              <div>
                                {product.title}
                                {bestDiscount && (
                                  <div
                                    style={{
                                      fontSize: "0.8rem",
                                      color: "#bf4800",
                                      marginTop: "4px",
                                    }}
                                  >
                                    {bestDiscount.type === "fixed"
                                      ? `$${bestDiscount.value} off per item`
                                      : `${bestDiscount.value}% off`}
                                  </div>
                                )}
                              </div>
                            </ProductInfoCell>
                            <td>
                              <StyledButton
                                onClick={() => lessOfThisProduct(product._id)}
                              >
                                -
                              </StyledButton>
                              <QuantityLabel>{quantity}</QuantityLabel>
                              <StyledButton
                                onClick={() => moreOfThisProduct(product._id)}
                              >
                                +
                              </StyledButton>
                            </td>
                            <td>
                              <div>
                                ${discountedTotal.toFixed(2)}
                                {bestDiscount && (
                                  <OriginalPrice>
                                    ${originalTotal.toFixed(2)}
                                  </OriginalPrice>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                      <tr className="subtotal">
                        <td colSpan={2}>Products</td>
                        <td>
                          $
                          {products
                            .reduce((total, product) => {
                              return (
                                total +
                                calculateProductTotal(
                                  product,
                                  cartProducts.filter(
                                    (id) => id === product._id
                                  ).length
                                )
                              );
                            }, 0)
                            .toFixed(2)}
                          {totalSavings > 0 && (
                            <OriginalPrice>
                              ${originalTotal.toFixed(2)}
                            </OriginalPrice>
                          )}
                        </td>
                      </tr>
                      <tr className="subtotal">
                        <td colSpan={2}>Shipping</td>
                        <td>${parseFloat(shippingFee || 0).toFixed(2)}</td>
                      </tr>
                      <tr className="subtotal total">
                        <td colSpan={2}>Total</td>
                        <td>
                          $
                          {(
                            products.reduce((total, product) => {
                              return (
                                total +
                                calculateProductTotal(
                                  product,
                                  cartProducts.filter(
                                    (id) => id === product._id
                                  ).length
                                )
                              );
                            }, 0) + parseFloat(shippingFee || 0)
                          ).toFixed(2)}
                        </td>
                      </tr>
                    </tbody>
                  </Table>
                </>
              )}
            </Box>
          </RevealWrapper>
          {!!cartProducts?.length && (
            <RevealWrapper delay={100}>
              <Box>
                <h2>Order information</h2>
                <Input
                  type="text"
                  placeholder="Name"
                  value={name}
                  name="name"
                  onChange={(ev) => setName(ev.target.value)}
                />
                <Input
                  type="text"
                  placeholder="Email"
                  value={email}
                  name="email"
                  onChange={(ev) => setEmail(ev.target.value)}
                />
                <CityHolder>
                  <Input
                    type="text"
                    placeholder="City"
                    value={city}
                    name="city"
                    onChange={(ev) => setCity(ev.target.value)}
                  />
                  <Input
                    type="text"
                    placeholder="Postal Code"
                    value={postalCode}
                    name="postalCode"
                    onChange={(ev) => setPostalCode(ev.target.value)}
                  />
                </CityHolder>
                <Input
                  type="text"
                  placeholder="Street Address"
                  value={streetAddress}
                  name="streetAddress"
                  onChange={(ev) => setStreetAddress(ev.target.value)}
                />
                <Input
                  type="text"
                  placeholder="Country"
                  value={country}
                  name="country"
                  onChange={(ev) => setCountry(ev.target.value)}
                />
                <StyledButton black block onClick={goToPayment}>
                  Continue to payment
                </StyledButton>
              </Box>
            </RevealWrapper>
          )}
        </ColumnsWrapper>
      </Center>
    </>
  );
}
