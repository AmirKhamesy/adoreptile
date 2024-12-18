import styled from "styled-components";
import Link from "next/link";
import { memo, useCallback, useState } from "react";
import axios from "axios";
import HeartOutlineIcon from "./icons/HeartOutlineIcon";
import HeartSolidIcon from "./icons/HeartSolidIcon";
import FlyingButton from "@/components/FlyingButton";
import * as colors from "@/lib/colors";

const ProductWrapper = styled.div`
  position: relative;
  background: ${colors.white};
  border-radius: 20px;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  height: 100%;
  display: flex;
  flex-direction: column;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  cursor: pointer;

  @media (hover: hover) {
    &:hover {
      transform: scale(1.02);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);

      img {
        transform: scale(1.1);
      }
    }
  }
`;

const ProductLink = styled(Link)`
  text-decoration: none;
  color: inherit;
  display: flex;
  flex-direction: column;
  flex: 1;
`;

const ImageContainer = styled.div`
  aspect-ratio: 1;
  position: relative;
  overflow: hidden;
  background: #f5f5f7;
  border-radius: 20px 20px 0 0;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ProductImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  position: absolute;
  top: 0;
  left: 0;
`;

const WishlistButton = styled.button`
  position: absolute;
  top: 12px;
  right: 12px;
  background: ${(props) =>
    props.wished ? colors.primary : "rgba(255, 255, 255, 0.9)"};
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  cursor: pointer;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);

  svg {
    width: 16px;
    height: 16px;
    color: ${(props) => (props.wished ? colors.white : colors.primary)};
    transition: transform 0.2s ease;
  }

  @media (hover: hover) {
    &:hover {
      transform: scale(1.1);
      background: ${(props) =>
        props.wished ? colors.primaryDark : colors.white};
    }
  }

  @media (max-width: 768px) {
    width: 36px;
    height: 36px;

    svg {
      width: 18px;
      height: 18px;
    }
  }
`;

const ProductInfoBox = styled.div`
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex-grow: 1;
  background: ${colors.white};
  position: relative;
`;

const Title = styled.div`
  font-size: 1rem;
  font-weight: 500;
  color: #1d1d1f;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.4;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  transition: color 0.2s ease;
  min-height: 2.8em;

  @media screen and (min-width: 1024px) {
    font-size: 1.0625rem;
  }
`;

const PriceRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-top: auto;
  position: relative;
  z-index: 1;
`;

const Price = styled.div`
  font-size: 1.0625rem;
  font-weight: 600;
  color: #1d1d1f;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;

  &::before {
    content: "$";
    font-size: 0.85em;
    font-weight: 500;
    margin-right: 1px;
  }
`;

const AddToCartButton = styled(FlyingButton)`
  background-color: ${colors.primary};
  border: none;
  border-radius: 980px;
  padding: 8px 16px;
  color: ${colors.white};
  font-weight: 500;
  font-size: 0.875rem;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  white-space: nowrap;
  position: relative;
  overflow: hidden;
  -webkit-tap-highlight-color: transparent;
  user-select: none;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  z-index: 2;

  svg {
    width: 16px;
    height: 16px;
    transition: all 0.3s ease;
    position: relative;
    color: ${colors.white};
    flex-shrink: 0;
  }

  @media (hover: hover) {
    &:hover {
      background-color: ${colors.primaryDark};
      transform: translateY(-1px);
      box-shadow: 0 2px 4px ${colors.primary}40;

      svg {
        transform: translateX(2px);
      }
    }

    &:active {
      transform: translateY(0);
    }
  }

  @media (max-width: 768px) {
    width: auto;
    padding: 10px 18px;
    font-size: 0.9375rem;
    justify-content: center;

    svg {
      width: 18px;
      height: 18px;
    }
  }
`;

const Badge = styled.span`
  position: absolute;
  top: 12px;
  left: 12px;
  background: ${colors.primary}15;
  color: ${colors.primary};
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 500;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  z-index: 2;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
`;

const ProductBox = memo(function ProductBox({
  _id,
  title,
  price,
  images,
  wished = false,
  onRemoveFromWishlist = () => {},
  createdAt,
}) {
  const [isWished, setIsWished] = useState(wished);
  const isNewProduct =
    createdAt &&
    new Date(createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const handleWishlist = useCallback(
    (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      const nextValue = !isWished;
      if (!nextValue && onRemoveFromWishlist) {
        onRemoveFromWishlist(_id);
      }
      axios.post("/api/wishlist", {
        product: _id,
      });
      setIsWished(nextValue);
    },
    [isWished, _id, onRemoveFromWishlist]
  );

  const formattedPrice = price?.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <ProductWrapper>
      {isNewProduct && <Badge>New</Badge>}
      <WishlistButton
        wished={isWished}
        onClick={handleWishlist}
        aria-label={isWished ? "Remove from wishlist" : "Add to wishlist"}
        type="button"
      >
        {isWished ? <HeartSolidIcon /> : <HeartOutlineIcon />}
      </WishlistButton>
      <ProductLink href={`/product/${_id}`}>
        <ImageContainer>
          <ProductImage src={images?.[0]} alt={title} loading="lazy" />
        </ImageContainer>
        <ProductInfoBox>
          <Title>{title}</Title>
        </ProductInfoBox>
      </ProductLink>
      <div style={{ padding: "0 20px 20px" }}>
        <PriceRow>
          <Price>{formattedPrice}</Price>
          <AddToCartButton _id={_id} src={images?.[0]}>
            Add to Cart
          </AddToCartButton>
        </PriceRow>
      </div>
    </ProductWrapper>
  );
});

ProductBox.displayName = "ProductBox";

export default ProductBox;
