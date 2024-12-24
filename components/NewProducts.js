import styled, { keyframes } from "styled-components";
import Center from "@/components/Center";
import ProductsGrid from "@/components/ProductsGrid";
import * as colors from "@/lib/colors";
import { RevealWrapper } from "next-reveal";

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const NewArrivalsSection = styled.section`
  background: linear-gradient(
    180deg,
    ${colors.background}22 0%,
    ${colors.white} 100%
  );
  padding: 80px 0;
  position: relative;
  overflow: hidden;

  @media screen and (max-width: 768px) {
    padding: 60px 0;
  }
`;

const HeaderWrapper = styled.div`
  text-align: center;
  max-width: 600px;
  margin: 0 auto 48px;
  animation: ${fadeIn} 1s ease-out both;

  @media screen and (max-width: 768px) {
    margin-bottom: 40px;
  }
`;

const Title = styled.h2`
  font-size: clamp(2rem, 4vw, 2.5rem);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  color: ${colors.textDark};
  margin: 0 0 1rem;
  font-weight: 600;
  letter-spacing: -0.02em;
  line-height: 1.1;
`;

const Subtitle = styled.p`
  color: ${colors.textLight};
  font-size: clamp(1rem, 2vw, 1.125rem);
  line-height: 1.5;
  margin: 0 auto;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
`;

const ButtonWrapper = styled.div`
  text-align: center;
  margin-top: 48px;
  animation: ${fadeIn} 1s ease-out 0.6s both;
`;

const ViewAllButton = styled.a`
  display: inline-flex;
  align-items: center;
  color: ${colors.primary};
  font-size: 1.1rem;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.3s ease;
  gap: 8px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;

  &:after {
    content: "→";
    transition: transform 0.3s ease;
  }

  &:hover {
    color: ${colors.primaryDark};

    &:after {
      transform: translateX(5px);
    }
  }
`;

export default function NewProducts({ products, wishedProducts }) {
  return (
    <NewArrivalsSection>
      <Center>
        <HeaderWrapper>
          <RevealWrapper origin="top">
            <Title>New Arrivals</Title>
            <Subtitle>
              Discover our latest collection of premium reptile supplies,
              designed with your scaly friends in mind.
            </Subtitle>
          </RevealWrapper>
        </HeaderWrapper>

        <RevealWrapper origin="bottom" delay={200}>
          <ProductsGrid products={products} wishedProducts={wishedProducts} />
        </RevealWrapper>

        <ButtonWrapper>
          <ViewAllButton href="/products">Shop New Arrivals</ViewAllButton>
        </ButtonWrapper>
      </Center>
    </NewArrivalsSection>
  );
}
