import Center from "@/components/Center";
import Header from "@/components/Header";
import Title from "@/components/Title";
import { mongooseConnect } from "@/lib/mongoose";
import { Product } from "@/models/Product";
import styled from "styled-components";
import WhiteBox from "@/components/WhiteBox";
import ProductImages from "@/components/ProductImages";
import CartIcon from "@/components/icons/CartIcon";
import FlyingButton from "@/components/FlyingButton";
import ProductReviews from "@/components/ProductReviews";
import { useState } from "react";

const ColWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  @media screen and (min-width: 768px) {
    grid-template-columns: 0.8fr 1.2fr;
  }
  gap: 40px;
  margin: 40px 0;
`;

const PriceRow = styled.div`
  display: flex;
  gap: 20px;
  align-items: center;
`;

const Price = styled.span`
  font-size: 1.4rem;
`;

const DiscountsBox = styled.div`
  margin: 20px 0;
  padding: 20px;
  background-color: #f5f5f7;
  border-radius: 10px;
`;

const DiscountTitle = styled.h3`
  font-size: 1.1rem;
  color: #1d1d1f;
  margin: 0 0 15px 0;
`;

const DiscountGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
`;

const DiscountCard = styled.div`
  background: white;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
  cursor: pointer;

  &:hover {
    transform: scale(1.02);
  }
`;

const DiscountText = styled.div`
  font-size: 0.9rem;
  color: #1d1d1f;
  margin-bottom: 5px;
`;

const SaveText = styled.div`
  color: #bf4800;
  font-size: 0.85rem;
  margin-top: 5px;
`;

const QuantitySelector = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 20px 0;
`;

const QuantityButton = styled.button`
  background: #f5f5f7;
  border: none;
  padding: 5px 10px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1.2rem;

  &:hover {
    background: #e8e8ed;
  }
`;

const QuantityDisplay = styled.span`
  font-size: 1.1rem;
  min-width: 40px;
  text-align: center;
`;

export default function ProductPage({ product }) {
  const [quantity, setQuantity] = useState(1);
  const [selectedDiscount, setSelectedDiscount] = useState(null);

  const getBestDiscount = (quantity) => {
    if (!product.discounts?.length) return null;

    // Filter discounts where quantity meets or exceeds threshold
    // Sort by quantity threshold in descending order to get highest eligible quantity
    const applicableDiscounts = product.discounts
      .filter((d) => quantity >= d.quantity)
      .sort((a, b) => b.quantity - a.quantity);

    // Return the discount with highest quantity requirement
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

    // Auto-select the discount based on highest eligible quantity threshold
    const bestDiscount = getBestDiscount(newQuantity);
    setSelectedDiscount(bestDiscount);
  };

  return (
    <>
      <Header />
      <Center>
        <ColWrapper>
          <WhiteBox>
            <ProductImages images={product.images} />
          </WhiteBox>
          <div>
            <Title>{product.title}</Title>
            <p>{product.description}</p>

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

            <QuantitySelector>
              <QuantityButton
                onClick={() => handleQuantityChange(quantity - 1)}
              >
                -
              </QuantityButton>
              <QuantityDisplay>{quantity}</QuantityDisplay>
              <QuantityButton
                onClick={() => handleQuantityChange(quantity + 1)}
              >
                +
              </QuantityButton>
            </QuantitySelector>

            <PriceRow>
              <div>
                <Price>
                  ${calculatePrice().toFixed(2)}
                  {selectedDiscount && (
                    <span
                      style={{
                        textDecoration: "line-through",
                        color: "#666",
                        fontSize: "1rem",
                        marginLeft: "10px",
                      }}
                    >
                      ${(product.price * quantity).toFixed(2)}
                    </span>
                  )}
                </Price>
              </div>
              <div>
                <FlyingButton
                  main
                  _id={product._id}
                  src={product.images?.[0]}
                  quantity={quantity}
                >
                  <CartIcon />
                  Add to cart
                </FlyingButton>
              </div>
            </PriceRow>
          </div>
        </ColWrapper>
        <ProductReviews product={product} />
      </Center>
    </>
  );
}

export async function getServerSideProps(context) {
  await mongooseConnect();
  const { id } = context.query;
  const product = await Product.findById(id);
  return {
    props: {
      product: JSON.parse(JSON.stringify(product)),
    },
  };
}
