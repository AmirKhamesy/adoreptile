import Center from "@/components/Center";
import styled, { keyframes } from "styled-components";
import ButtonLink from "@/components/ButtonLink";
import CartIcon from "@/components/icons/CartIcon";
import FlyingButton from "@/components/FlyingButton";
import { RevealWrapper } from "next-reveal";
import * as colors from "@/lib/colors";

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const scaleIn = keyframes`
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`;

const Bg = styled.div`
  color: ${colors.textDark};
  padding: 120px 20px 80px;
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  overflow: hidden;
  position: relative;

  &:before {
    content: "🦎";
    position: absolute;
    font-size: 400px;
    opacity: 0.03;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 0;
    pointer-events: none;
  }
`;

const Title = styled.h1`
  margin: 0;
  font-weight: 600;
  font-size: 3rem;
  color: ${colors.primary};
  text-align: center;
  letter-spacing: -0.5px;
  line-height: 1.1;
  animation: ${fadeIn} 1s ease-out 0.2s both;

  @media screen and (min-width: 768px) {
    font-size: 4.5rem;
  }
`;

const Desc = styled.p`
  color: ${colors.textLight};
  font-size: 1.3rem;
  text-align: center;
  margin: 1.5rem auto;
  max-width: 600px;
  line-height: 1.5;
  animation: ${fadeIn} 1s ease-out 0.4s both;

  @media screen and (min-width: 768px) {
    font-size: 1.5rem;
  }
`;

const ColumnsWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 60px;
  margin-top: 40px;
  position: relative;
  z-index: 1;

  @media screen and (min-width: 768px) {
    grid-template-columns: 1fr;
    max-width: 800px;
    margin: 40px auto;
  }
`;

const Column = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
`;

const ButtonsWrapper = styled.div`
  display: flex;
  gap: 20px;
  margin-top: 2rem;
  flex-direction: column;
  align-items: center;
  animation: ${fadeIn} 1s ease-out 0.8s both;

  @media screen and (min-width: 768px) {
    flex-direction: row;
    justify-content: center;
  }

  button,
  a {
    font-size: 1.1rem;
    padding: 12px 24px;
    border-radius: 980px;
    transition: all 0.3s ease;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    gap: 8px;

    svg {
      width: 20px;
      height: 20px;
    }

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
    }
  }
`;

const ProductImage = styled.div`
  position: relative;
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
  animation: ${scaleIn} 1s ease-out both;

  img {
    width: 100%;
    height: auto;
    object-fit: contain;
    border-radius: 24px;
    transition: transform 0.6s ease-out;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);

    &:hover {
      transform: scale(1.02) translateY(-5px);
    }
  }

  &:after {
    content: "";
    position: absolute;
    bottom: -20px;
    left: 10%;
    right: 10%;
    height: 20px;
    background: radial-gradient(
      ellipse at center,
      rgba(0, 0, 0, 0.1) 0%,
      rgba(0, 0, 0, 0) 70%
    );
    filter: blur(5px);
    z-index: -1;
  }
`;

const ContentWrapper = styled.div`
  text-align: center;
  max-width: 800px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
`;

const Badge = styled.span`
  background: ${colors.accent}22;
  color: ${colors.accent};
  padding: 8px 16px;
  border-radius: 50px;
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 1rem;
  display: inline-block;
  animation: ${fadeIn} 1s ease-out both;
`;

export default function Featured({ product }) {
  return (
    <Bg>
      <Center>
        <ContentWrapper>
          <RevealWrapper origin={"top"}>
            <Badge>Featured Product</Badge>
            <Title>{product.title}</Title>
            <Desc>{product.description}</Desc>
            <ButtonsWrapper>
              <ButtonLink
                href={"/product/" + product._id}
                style={{
                  background: colors.primary,
                  color: colors.white,
                  border: "none",
                }}
              >
                Learn more
              </ButtonLink>
              <FlyingButton
                _id={product._id}
                src={product.images?.[0]}
                style={{
                  background: colors.accent,
                  color: colors.white,
                  border: "none",
                }}
              >
                <CartIcon />
                Add to cart
              </FlyingButton>
            </ButtonsWrapper>
          </RevealWrapper>
        </ContentWrapper>

        <ColumnsWrapper>
          <Column>
            <RevealWrapper delay={0}>
              <ProductImage>
                <img
                  src={product.images?.[0]}
                  alt={product.title}
                  loading="eager"
                />
              </ProductImage>
            </RevealWrapper>
          </Column>
        </ColumnsWrapper>
      </Center>
    </Bg>
  );
}
