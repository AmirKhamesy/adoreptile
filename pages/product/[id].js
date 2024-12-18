import Center from "@/components/Center";
import Header from "@/components/Header";
import { mongooseConnect } from "@/lib/mongoose";
import { Product } from "@/models/Product";
import { Category } from "@/models/Category";
import styled from "styled-components";
import ProductImages from "@/components/ProductImages";
import CartIcon from "@/components/icons/CartIcon";
import FlyingButton from "@/components/FlyingButton";
import ProductReviews from "@/components/ProductReviews";
import { useState } from "react";
import Link from "next/link";
import * as colors from "@/lib/colors";

const PageContainer = styled.div`
  min-height: 100vh;
  padding: 10px 0 80px;
  background: #eefdf4;

  @media screen and (max-width: 768px) {
    padding: 10px 0 60px;
  }
`;

const Breadcrumbs = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 24px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  opacity: 0;
  transform: translateY(20px);
  animation: fadeIn 0.8s ease-out forwards;

  @keyframes fadeIn {
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const BreadcrumbLink = styled(Link)`
  color: ${colors.primary};
  text-decoration: none;
  font-size: 0.875rem;
  transition: color 0.2s;

  &:hover {
    color: ${colors.primary}dd;
  }
`;

const BreadcrumbSeparator = styled.span`
  color: #86868b;
  font-size: 0.875rem;
`;

const ProductSection = styled.div`
  background: ${colors.white};
  border-radius: 30px;
  padding: 40px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
  opacity: 0;
  transform: translateY(20px);
  animation: fadeIn 0.8s ease-out 0.2s forwards;

  @media screen and (max-width: 768px) {
    padding: 20px;
    border-radius: 20px;
  }
`;

const ColWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 40px;
  margin-bottom: 40px;
  max-width: 800px;
  margin: 0 auto;
`;

const ProductInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const ProductTitle = styled.h1`
  font-size: clamp(2rem, 4vw, 2.5rem);
  color: #1d1d1f;
  font-weight: 600;
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  letter-spacing: -0.5px;
  line-height: 1.1;
`;

const ProductDescription = styled.p`
  font-size: 1.125rem;
  color: #424245;
  line-height: 1.5;
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
`;

const PriceSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding-top: 32px;
  margin-top: auto;
  border-top: 1px solid #e5e5e7;

  @media screen and (min-width: 1024px) {
    flex-direction: row;
    align-items: flex-start;
    justify-content: flex-start;
    gap: 80px;
  }
`;

const PriceInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  flex: 1;
  max-width: 400px;
`;

const Price = styled.div`
  font-size: 1.5rem;
  font-weight: 600;
  color: #1d1d1f;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  display: flex;
  align-items: baseline;
  gap: 8px;

  .original-price {
    text-decoration: line-through;
    color: #86868b;
    font-size: 1.125rem;
    font-weight: 400;
  }
`;

const DiscountsBox = styled.div`
  margin: 24px 0;
  padding: 32px;
  background: #f5f5f7;
  border-radius: 20px;

  @media screen and (max-width: 768px) {
    padding: 24px;
  }
`;

const DiscountTitle = styled.h3`
  font-size: 1.25rem;
  color: #1d1d1f;
  margin: 0 0 24px;
  font-weight: 600;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
`;

const DiscountGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;

  @media screen and (max-width: 1200px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media screen and (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const DiscountCard = styled.div`
  background: ${colors.white};
  padding: 20px;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 2px solid
    ${(props) => (props.selected ? colors.primary : "transparent")};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  display: flex;
  flex-direction: column;
  gap: 8px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }
`;

const DiscountText = styled.div`
  font-size: 1rem;
  color: #1d1d1f;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  line-height: 1.4;

  &:first-child {
    font-weight: 500;
  }
`;

const SaveText = styled.div`
  color: ${colors.primary};
  font-size: 0.9375rem;
  font-weight: 500;
  margin-top: 4px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
`;

const QuantitySelector = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  background: #f5f5f7;
  padding: 6px;
  border-radius: 980px;
  width: fit-content;
`;

const QuantityButton = styled.button`
  background: #f5f5f7;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 16px;
  cursor: pointer;
  font-size: 1.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #1d1d1f;
  transition: all 0.2s ease;

  &:hover {
    background: #e8e8ed;
  }
`;

const QuantityDisplay = styled.span`
  font-size: 1.125rem;
  color: #1d1d1f;
  min-width: 40px;
  text-align: center;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
`;

const ReviewsSection = styled.div`
  margin-top: 60px;
  opacity: 0;
  transform: translateY(20px);
  animation: fadeIn 0.8s ease-out 0.4s forwards;
`;

const AddToCartSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;

  @media screen and (min-width: 1024px) {
    width: 280px;
    flex-shrink: 0;
  }
`;

const StyledFlyingButton = styled(FlyingButton)`
  background-color: ${colors.primary};
  color: white;
  border: none;
  border-radius: 980px;
  padding: 14px 24px;
  font-size: 1.0625rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;

  svg {
    width: 20px;
    height: 20px;
  }

  &:hover {
    background-color: ${colors.primary}dd;
    transform: scale(1.02);
  }
`;

const DeliveryInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  color: #1d1d1f;
  font-size: 0.9375rem;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  white-space: nowrap;
  margin-top: 8px;

  svg {
    width: 24px;
    height: 24px;
    color: ${colors.primary};
    flex-shrink: 0;
  }

  .asterisk {
    color: #86868b;
    font-size: 0.75rem;
    vertical-align: super;
    margin-left: 2px;
  }
`;

const DeliveryNote = styled.div`
  color: #86868b;
  font-size: 0.8125rem;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  margin-top: 4px;
  padding-left: 36px;
`;

export default function ProductPage({ product, mainCategory, subCategory }) {
  const [quantity, setQuantity] = useState(1);
  const [selectedDiscount, setSelectedDiscount] = useState(null);

  const getBestDiscount = (quantity) => {
    if (!product.discounts?.length) return null;
    const applicableDiscounts = product.discounts
      .filter((d) => quantity >= d.quantity)
      .sort((a, b) => b.quantity - a.quantity);
    return applicableDiscounts[0] || null;
  };

  const calculatePrice = () => {
    if (!selectedDiscount) return product.price * quantity;
    if (selectedDiscount.type === "fixed") {
      return (product.price - selectedDiscount.value) * quantity;
    } else {
      return product.price * (1 - selectedDiscount.value / 100) * quantity;
    }
  };

  const calculateSavings = (discount) => {
    if (discount.type === "fixed") {
      return discount.value * discount.quantity;
    } else {
      return (
        (product.price * discount.quantity * discount.value) /
        100
      ).toFixed(2);
    }
  };

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity < 1) return;
    setQuantity(newQuantity);
    const bestDiscount = getBestDiscount(newQuantity);
    setSelectedDiscount(bestDiscount);
  };

  return (
    <>
      <Header />
      <PageContainer>
        <Center>
          {mainCategory && (
            <Breadcrumbs>
              <BreadcrumbLink href="/categories">Categories</BreadcrumbLink>
              <BreadcrumbSeparator>›</BreadcrumbSeparator>
              <BreadcrumbLink href={`/category/${mainCategory._id}`}>
                {mainCategory.name}
              </BreadcrumbLink>
              {subCategory && (
                <>
                  <BreadcrumbSeparator>›</BreadcrumbSeparator>
                  <BreadcrumbLink href={`/category/${subCategory._id}`}>
                    {subCategory.name}
                  </BreadcrumbLink>
                </>
              )}
              <BreadcrumbSeparator>›</BreadcrumbSeparator>
              <span style={{ color: "#86868b", fontSize: "0.875rem" }}>
                {product.title}
              </span>
            </Breadcrumbs>
          )}

          <ProductSection>
            <ColWrapper>
              <ProductImages images={product.images} />
              <ProductInfo>
                <div>
                  <ProductTitle>{product.title}</ProductTitle>
                  <ProductDescription>{product.description}</ProductDescription>
                </div>

                {product.discounts?.length > 0 && (
                  <DiscountsBox>
                    <DiscountTitle>Available Discounts</DiscountTitle>
                    <DiscountGrid>
                      {product.discounts.map((discount, index) => (
                        <DiscountCard
                          key={index}
                          selected={selectedDiscount?._id === discount._id}
                          onClick={() => {
                            if (quantity >= discount.quantity) {
                              setSelectedDiscount(discount);
                            } else {
                              setQuantity(discount.quantity);
                              setSelectedDiscount(discount);
                            }
                          }}
                        >
                          <DiscountText>
                            Buy {discount.quantity}+ items
                          </DiscountText>
                          <DiscountText>
                            {discount.type === "fixed"
                              ? `$${discount.value} off per item`
                              : `${discount.value}% off`}
                          </DiscountText>
                          <SaveText>
                            Save up to ${calculateSavings(discount)}
                          </SaveText>
                        </DiscountCard>
                      ))}
                    </DiscountGrid>
                  </DiscountsBox>
                )}

                <PriceSection>
                  <PriceInfo>
                    <Price>
                      ${calculatePrice().toFixed(2)}
                      {selectedDiscount && (
                        <span className="original-price">
                          ${(product.price * quantity).toFixed(2)}
                        </span>
                      )}
                    </Price>
                    <div>
                      <DeliveryInfo>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12"
                          />
                        </svg>
                        Free delivery for orders $100+
                        <span className="asterisk">*</span>
                      </DeliveryInfo>
                      <DeliveryNote>
                        * Excludes oversized items and remote locations
                      </DeliveryNote>
                    </div>
                  </PriceInfo>
                  <AddToCartSection>
                    <QuantitySelector>
                      <QuantityButton
                        onClick={() => handleQuantityChange(quantity - 1)}
                      >
                        −
                      </QuantityButton>
                      <QuantityDisplay>{quantity}</QuantityDisplay>
                      <QuantityButton
                        onClick={() => handleQuantityChange(quantity + 1)}
                      >
                        +
                      </QuantityButton>
                    </QuantitySelector>
                    <StyledFlyingButton
                      main
                      _id={product._id}
                      src={product.images?.[0]}
                      quantity={quantity}
                    >
                      <CartIcon />
                      Add to Cart
                    </StyledFlyingButton>
                  </AddToCartSection>
                </PriceSection>
              </ProductInfo>
            </ColWrapper>
          </ProductSection>

          <ReviewsSection>
            <ProductReviews product={product} />
          </ReviewsSection>
        </Center>
      </PageContainer>
    </>
  );
}

export async function getServerSideProps(ctx) {
  try {
    await mongooseConnect();
    const product = await Product.findById(ctx.query.id);

    // If product doesn't exist, redirect to 404
    if (!product) {
      return {
        notFound: true,
      };
    }

    const category = await Category.findById(product.category);

    // If category doesn't exist, still show the product but without breadcrumbs
    if (!category) {
      return {
        props: {
          product: JSON.parse(JSON.stringify(product)),
          mainCategory: null,
          subCategory: null,
        },
      };
    }

    let mainCategory, subCategory;
    if (category.parent) {
      subCategory = category;
      mainCategory = await Category.findById(category.parent);

      // If parent category doesn't exist, use current category as main
      if (!mainCategory) {
        mainCategory = category;
        subCategory = null;
      }
    } else {
      mainCategory = category;
    }

    return {
      props: {
        product: JSON.parse(JSON.stringify(product)),
        mainCategory: JSON.parse(JSON.stringify(mainCategory)),
        subCategory: subCategory
          ? JSON.parse(JSON.stringify(subCategory))
          : null,
      },
    };
  } catch (error) {
    console.error("Error in product page:", error);
    return {
      notFound: true,
    };
  }
}
