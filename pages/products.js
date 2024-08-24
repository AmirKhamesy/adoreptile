import Header from "@/components/Header";
import styled from "styled-components";
import Center from "@/components/Center";
import { mongooseConnect } from "@/lib/mongoose";
import { Product } from "@/models/Product";
import ProductsGrid from "@/components/ProductsGrid";
import Title from "@/components/Title";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { WishedProduct } from "@/models/WishedProduct";
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { debounce } from "lodash";
import Input from "@/components/Input";
import Spinner from "@/components/Spinner";

export default function ProductsPage({ products, wishedProducts }) {
  const [phrase, setPhrase] = useState("");
  const [filteredProducts, setFilteredProducts] = useState(products);
  const [isLoading, setIsLoading] = useState(false);
  const debouncedSearch = useCallback(debounce(searchProducts, 500), []);

  useEffect(() => {
    if (phrase.length > 0) {
      setIsLoading(true);
      debouncedSearch(phrase);
    } else {
      setFilteredProducts(products);
    }
  }, [phrase, products]);

  function searchProducts(phrase) {
    axios
      .get("/api/products?phrase=" + encodeURIComponent(phrase))
      .then((response) => {
        setFilteredProducts(response.data);
        setIsLoading(false);
      });
  }

  return (
    <>
      <Header />
      <Center>
        <SearchSection>
          <PageTitle>Explore Our Products</PageTitle>
          <SearchInput
            autoFocus
            value={phrase}
            onChange={(ev) => setPhrase(ev.target.value)}
            placeholder="Search for products..."
          />
        </SearchSection>
        {isLoading && <Spinner fullWidth={true} />}
        {!isLoading && phrase !== "" && filteredProducts.length === 0 && (
          <NoProductsText>
            No products found for query "{phrase}"
          </NoProductsText>
        )}
        {!isLoading && filteredProducts.length > 0 && (
          <StyledProductsGrid
            products={filteredProducts}
            wishedProducts={wishedProducts}
          />
        )}
      </Center>
    </>
  );
}

const PageTitle = styled(Title)`
  font-size: 3rem;
  color: #333;
  text-align: center;
  margin-bottom: 1.5rem;
`;

const SearchSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 2rem;

  @media (max-width: 768px) {
    margin-bottom: 1.5rem;
  }
`;

const SearchInput = styled(Input)`
  padding: 10px 15px;
  border-radius: 30px;
  font-size: 1.2rem;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid #ddd;

  &:focus {
    outline: none;
    border-color: #ff7e5f;
  }
`;

const StyledProductsGrid = styled(ProductsGrid)`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 30px;

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 480px) {
    grid-template-columns: repeat(1, 1fr);
  }

  div {
    position: relative;
    overflow: hidden;
    border-radius: 15px;
    box-shadow: 0 6px 15px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s ease-in-out;

    &:hover {
      transform: scale(1.08);
    }

    img {
      width: 100%;
      height: auto;
      transition: transform 0.3s ease-in-out;

      &:hover {
        transform: scale(1.15);
      }
    }

    button {
      font-size: 1rem;
      background-color: #ff7e5f;
      color: white;
      border: none;
      padding: 0.7rem 1.5rem;
      border-radius: 25px;
      transition: background-color 0.3s ease-in-out;
      position: absolute;
      bottom: 10px;
      left: 50%;
      transform: translateX(-50%);

      &:hover {
        background-color: #ff6b4a;
      }
    }
  }
`;

const NoProductsText = styled.h2`
  font-size: 1.5rem;
  color: #555;
  text-align: center;
  margin-top: 2rem;
`;

export async function getServerSideProps(ctx) {
  await mongooseConnect();
  const products = await Product.find({}, null, { sort: { _id: -1 } });
  const session = await getServerSession(ctx.req, ctx.res, authOptions);
  const wishedProducts = session?.user
    ? await WishedProduct.find({
        userEmail: session?.user.email,
        product: products.map((p) => p._id.toString()),
      })
    : [];
  return {
    props: {
      products: JSON.parse(JSON.stringify(products)),
      wishedProducts: wishedProducts.map((i) => i.product.toString()),
    },
  };
}
