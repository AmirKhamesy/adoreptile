import Header from "@/components/Header";
import Center from "@/components/Center";
import { signIn, signOut, useSession } from "next-auth/react";
import styled from "styled-components";
import { RevealWrapper } from "next-reveal";
import Input from "@/components/Input";
import { useEffect, useState } from "react";
import axios from "axios";
import Spinner from "@/components/Spinner";
import ProductBox from "@/components/ProductBox";
import Tabs from "@/components/Tabs";
import SingleOrder from "@/components/SingleOrder";
import * as colors from "@/lib/colors";

const PageContainer = styled.div`
  min-height: 100vh;
  padding: 40px 0;
  width: 100%;
  max-width: 100%;
  overflow-x: hidden;

  @media screen and (max-width: 768px) {
    padding: 20px 0;
  }
`;

const ContentWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 30px;
  max-width: 1000px;
  margin: 0 auto;
  width: 100%;
  padding: 0 20px;
  box-sizing: border-box;

  @media screen and (max-width: 768px) {
    padding: 0 16px;
    gap: 20px;
  }
`;

const Card = styled.div`
  background: ${colors.white};
  border-radius: 30px;
  padding: 40px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
  opacity: 0;
  transform: translateY(20px);
  animation: fadeIn 0.8s ease-out forwards;
  width: 100%;
  box-sizing: border-box;

  @keyframes fadeIn {
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @media screen and (max-width: 768px) {
    padding: 24px 16px;
    border-radius: 20px;
  }
`;

const PageTitle = styled.h1`
  font-size: clamp(2rem, 4vw, 2.5rem);
  color: #1d1d1f;
  font-weight: 600;
  margin: 0 0 30px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  letter-spacing: -0.5px;
  text-align: center;
`;

const TabsContainer = styled.div`
  margin: 0 -16px 30px -16px;

  @media screen and (max-width: 768px) {
    margin: 0 -8px 20px -8px;
  }
`;

const WishedProductsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 30px;
  margin-top: 20px;

  @media screen and (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 20px;
  }
`;

const FormSection = styled.div`
  margin-bottom: 24px;
`;

const SectionTitle = styled.h3`
  font-size: 0.875rem;
  color: #86868b;
  margin: 0 0 16px;
  font-weight: 500;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  letter-spacing: -0.2px;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;

  @media screen and (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const StyledInput = styled(Input)`
  background: #f5f5f7;
  border: none;
  border-radius: 12px;
  padding: 14px 16px;
  font-size: 1rem;
  color: #1d1d1f;
  transition: all 0.2s ease;

  &:focus {
    box-shadow: 0 0 0 4px ${colors.primary}22;
  }
`;

const Button = styled.button`
  background: ${(props) => (props.primary ? colors.primary : "#f5f5f7")};
  color: ${(props) => (props.primary ? colors.white : colors.primary)};
  border: none;
  border-radius: 980px;
  padding: 12px 24px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  width: 100%;
  margin-top: 20px;

  &:hover {
    background: ${(props) =>
      props.primary ? `${colors.primary}dd` : "#e8e8ed"};
    transform: ${(props) => (props.primary ? "scale(1.02)" : "none")};
  }
`;

const EmptyState = styled.div`
  text-align: center;
  color: #86868b;
  padding: 40px 20px;
  font-size: 1.125rem;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
`;

export default function AccountPage() {
  const { data: session } = useSession();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [streetAddress, setStreetAddress] = useState("");
  const [country, setCountry] = useState("");
  const [addressLoaded, setAddressLoaded] = useState(true);
  const [wishlistLoaded, setWishlistLoaded] = useState(true);
  const [orderLoaded, setOrderLoaded] = useState(true);
  const [wishedProducts, setWishedProducts] = useState([]);
  const [activeTab, setActiveTab] = useState("Orders");
  const [orders, setOrders] = useState([]);

  async function logout() {
    await signOut({
      callbackUrl: process.env.NEXT_PUBLIC_URL,
    });
  }
  async function login() {
    await signIn("google");
  }

  function saveAddress() {
    const data = { name, email, city, streetAddress, postalCode, country };
    axios.put("/api/address", data);
  }

  useEffect(() => {
    if (!session) {
      return;
    }
    setAddressLoaded(false);
    setWishlistLoaded(false);
    setOrderLoaded(false);
    axios.get("/api/address").then((response) => {
      setName(response.data.name);
      setEmail(response.data.email);
      setCity(response.data.city);
      setPostalCode(response.data.postalCode);
      setStreetAddress(response.data.streetAddress);
      setCountry(response.data.country);
      setAddressLoaded(true);
    });
    axios.get("/api/wishlist").then((response) => {
      setWishedProducts(response.data.map((wp) => wp.product));
      setWishlistLoaded(true);
    });
    axios.get("/api/orders").then((response) => {
      setOrders(response.data);
      setOrderLoaded(true);
    });
  }, [session]);

  function productRemovedFromWishlist(idToRemove) {
    setWishedProducts((products) => {
      return [...products.filter((p) => p?._id?.toString() !== idToRemove)];
    });
  }

  return (
    <>
      <Header />
      <PageContainer>
        <Center>
          <ContentWrapper>
            <RevealWrapper delay={0}>
              <Card>
                <PageTitle>{session ? "Your Account" : "Sign In"}</PageTitle>
                {!session && (
                  <Button primary onClick={login}>
                    Continue with Google
                  </Button>
                )}
                {session && (
                  <>
                    <TabsContainer>
                      <Tabs
                        tabs={["Orders", "Wishlist", "Profile"]}
                        active={activeTab}
                        onChange={setActiveTab}
                      />
                    </TabsContainer>

                    {activeTab === "Orders" && (
                      <>
                        {!orderLoaded && <Spinner fullWidth={true} />}
                        {orderLoaded && orders.length === 0 && (
                          <EmptyState>No orders yet</EmptyState>
                        )}
                        {orderLoaded && orders.length > 0 && (
                          <div>
                            {orders.map((order) => (
                              <SingleOrder key={order._id} {...order} />
                            ))}
                          </div>
                        )}
                      </>
                    )}

                    {activeTab === "Wishlist" && (
                      <>
                        {!wishlistLoaded && <Spinner fullWidth={true} />}
                        {wishlistLoaded && wishedProducts.length === 0 && (
                          <EmptyState>Your wishlist is empty</EmptyState>
                        )}
                        {wishlistLoaded && wishedProducts.length > 0 && (
                          <WishedProductsGrid>
                            {wishedProducts
                              .filter((p) => p?._id)
                              .map((product) => (
                                <ProductBox
                                  key={product._id}
                                  {...product}
                                  wished={true}
                                  onRemoveFromWishlist={
                                    productRemovedFromWishlist
                                  }
                                />
                              ))}
                          </WishedProductsGrid>
                        )}
                      </>
                    )}

                    {activeTab === "Profile" && (
                      <>
                        {!addressLoaded && <Spinner fullWidth={true} />}
                        {addressLoaded && (
                          <form
                            onSubmit={(e) => {
                              e.preventDefault();
                              saveAddress();
                            }}
                          >
                            <FormSection>
                              <SectionTitle>Personal Information</SectionTitle>
                              <FormGrid>
                                <StyledInput
                                  type="text"
                                  placeholder="Name"
                                  value={name}
                                  onChange={(ev) => setName(ev.target.value)}
                                />
                                <StyledInput
                                  type="email"
                                  placeholder="Email"
                                  value={email}
                                  onChange={(ev) => setEmail(ev.target.value)}
                                />
                              </FormGrid>
                            </FormSection>

                            <FormSection>
                              <SectionTitle>Shipping Address</SectionTitle>
                              <FormGrid>
                                <StyledInput
                                  type="text"
                                  placeholder="Street Address"
                                  value={streetAddress}
                                  onChange={(ev) =>
                                    setStreetAddress(ev.target.value)
                                  }
                                />
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
                                  onChange={(ev) =>
                                    setPostalCode(ev.target.value)
                                  }
                                />
                                <StyledInput
                                  type="text"
                                  placeholder="Country"
                                  value={country}
                                  onChange={(ev) => setCountry(ev.target.value)}
                                />
                              </FormGrid>
                            </FormSection>

                            <Button primary type="submit">
                              Save Changes
                            </Button>
                            <Button
                              onClick={logout}
                              style={{ marginTop: "10px" }}
                            >
                              Sign Out
                            </Button>
                          </form>
                        )}
                      </>
                    )}
                  </>
                )}
              </Card>
            </RevealWrapper>
          </ContentWrapper>
        </Center>
      </PageContainer>
    </>
  );
}
