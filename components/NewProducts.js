import styled from "styled-components";
import Center from "@/components/Center";
import ProductsGrid from "@/components/ProductsGrid";

const NewArrivalsBg = styled.div`
  background-color: #f7e7e4;
  padding: 50px 0;
  border-radius: 15px;
  box-shadow: 0px 10px 30px rgba(0, 0, 0, 0.1);
`;

const TitleNewArrivals = styled.h2`
  font-size: 3rem;
  font-family: "Poppins", sans-serif;
  color: #ff6f61;
  margin-bottom: 40px;
  text-align: center;
  position: relative;
  &:after {
    content: "";
    display: block;
    width: 60px;
    height: 4px;
    background: #ff6f61;
    margin: 10px auto;
    border-radius: 2px;
  }
`;

export default function NewProducts({ products, wishedProducts }) {
  return (
    <NewArrivalsBg>
      <Center>
        <TitleNewArrivals>New Arrivals</TitleNewArrivals>
        <ProductsGrid products={products} wishedProducts={wishedProducts} />
      </Center>
    </NewArrivalsBg>
  );
}
