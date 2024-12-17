import styled from "styled-components";
import ProductBox from "@/components/ProductBox";
import { RevealWrapper } from "next-reveal";
import * as colors from "@/lib/colors";

const StyledProductsGrid = styled.div`
  display: grid;
  gap: 30px;
  grid-template-columns: 1fr;
  position: relative;

  @media screen and (min-width: 640px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media screen and (min-width: 768px) {
    gap: 40px;
  }

  @media screen and (min-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);
  }

  @media screen and (min-width: 1280px) {
    grid-template-columns: repeat(4, 1fr);
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  grid-column: 1 / -1;

  h3 {
    font-size: 1.5rem;
    color: ${colors.textDark};
    margin-bottom: 1rem;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
      sans-serif;
  }

  p {
    color: ${colors.textLight};
    font-size: 1.1rem;
    line-height: 1.5;
    max-width: 500px;
    margin: 0 auto;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
      sans-serif;
  }
`;

export default function ProductsGrid({ products, wishedProducts = [] }) {
  if (!products?.length) {
    return (
      <EmptyState>
        <h3>No Products Found</h3>
        <p>
          We couldn't find any products matching your criteria. Please try
          adjusting your filters or check back later.
        </p>
      </EmptyState>
    );
  }

  return (
    <StyledProductsGrid>
      {products.map((product, index) => (
        <RevealWrapper
          key={product._id}
          delay={index * 50}
          duration={600}
          origin="bottom"
          distance="20px"
        >
          <ProductBox
            {...product}
            wished={wishedProducts.includes(product._id)}
            isNew={index < 3} // Mark first 3 products as new
          />
        </RevealWrapper>
      ))}
    </StyledProductsGrid>
  );
}
