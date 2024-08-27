import styled from "styled-components";
import Link from "next/link";
import { useState } from "react";
import axios from "axios";
import FlyingButton from "@/components/FlyingButton";
import HeartOutlineIcon from "@/components/icons/HeartOutlineIcon";
import HeartSolidIcon from "@/components/icons/HeartSolidIcon";

const ProductWrapper = styled.div`
  background-color: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.3s ease-in-out;
  &:hover {
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
  }
`;

const ImageContainer = styled.div`
  position: relative;
  padding-top: 100%;
  background-color: #f7f7f7;

  img {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const WishlistButton = styled.button`
  position: absolute;
  top: 0px;
  right: 0px;
  background: ${(props) => (props.wished ? "#FF7E5F" : "#FFA07A")};
  border: none;
  border-radius: 0px 0px 0px 12px;
  padding: 8px;
  cursor: pointer;
  z-index: 1;

  svg {
    width: 16px;
    height: 16px;
    color: white;
  }
`;

const ProductInfoBox = styled.div`
  height: 5rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const Title = styled(Link)`
  font-size: 0.66rem;
  font-weight: bold;
  color: #333;
  text-decoration: none;
  word-wrap: break-word;
  display: -webkit-box;
  -webkit-line-clamp: 2; /* Limit to 3 lines */
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.4;
  margin: 0.3rem 0.5rem;
`;

const PriceRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 1rem 0.5rem;
`;

const Price = styled.div`
  font-weight: 600;
  color: #333;
`;

const StyledFlyingButton = styled(FlyingButton)`
  background-color: #ff7e5f;
  border: none;
  border-radius: 5px;
  height: auto;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background-color: #ff6b4a;
  }
`;

const CartIcon = styled.svg`
  width: 24px;
  height: 24px;
  fill: white;
`;

export default function ProductBox({
  _id,
  title,
  price,
  images,
  wished = false,
  onRemoveFromWishlist = () => {},
}) {
  const url = "/product/" + _id;
  const [isWished, setIsWished] = useState(wished);

  function addToWishlist(ev) {
    ev.preventDefault();
    ev.stopPropagation();
    const nextValue = !isWished;
    if (!nextValue && onRemoveFromWishlist) {
      onRemoveFromWishlist(_id);
    }
    axios
      .post("/api/wishlist", {
        product: _id,
      })
      .then(() => {});
    setIsWished(nextValue);
  }

  return (
    <ProductWrapper>
      <ImageContainer>
        <WishlistButton wished={isWished} onClick={addToWishlist}>
          {isWished ? <HeartSolidIcon /> : <HeartOutlineIcon />}
        </WishlistButton>
        <img src={images?.[0]} alt={title} />
      </ImageContainer>
      <ProductInfoBox>
        <Title href={url} data-full-title={title}>
          {title}
        </Title>
        <PriceRow>
          <Price>${price}</Price>
          <StyledFlyingButton _id={_id} src={images?.[0]}>
            <CartIcon xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path d="M7 18c-1.104 0-2 .896-2 2s.896 2 2 2 2-.896 2-2-.896-2-2-2zm10 0c-1.104 0-2 .896-2 2s.896 2 2 2 2-.896 2-2-.896-2-2-2zm-12.086-2l1.307-5h11.559l1.307 5h-14.173zm13.086-14h-14v2h1.551l3.399 13h10.1l3.399-13h1.551v-2h-6.699l-3-3h-4.602l-3 3h-6.699v2zm-8.142-2h2.086l1.5 1.5h-5.086l1.5-1.5z" />
            </CartIcon>
          </StyledFlyingButton>
        </PriceRow>
      </ProductInfoBox>
    </ProductWrapper>
  );
}
