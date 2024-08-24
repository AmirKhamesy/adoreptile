import Header from "@/components/Header";
import Title from "@/components/Title";
import Center from "@/components/Center";
import { Category } from "@/models/Category";
import { Product } from "@/models/Product";
import ProductsGrid from "@/components/ProductsGrid";
import styled from "styled-components";
import { useEffect, useState } from "react";
import axios from "axios";
import Spinner from "@/components/Spinner";

const BackgroundDiv = styled.div`
  background-color: #f7e7e4;
`;

const StyledCategoryHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  h1 {
    font-size: 2.5rem;
    color: #ff7e5f;
    text-align: center;
  }
`;

const StyledFiltersWrapper = styled.div`
  display: flex;
  gap: 15px;
`;

const StyledFilter = styled.div`
  background-color: #ddd;
  padding: 0.5rem 1rem;
  border-radius: 10px;
  display: flex;
  gap: 5px;
  align-items: center;
  color: #444;

  select {
    background-color: transparent;
    border: none;
    font-size: inherit;
    color: #444;
    padding: 0.25rem 0.5rem;
    border-radius: 5px;
    transition: background-color 0.2s ease-in-out;

    &:hover {
      background-color: #f0f0f0;
    }
  }

  span {
    font-weight: bold;
    color: #ff7e5f;
  }
`;

const StyledProductsGrid = styled(ProductsGrid)`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 480px) {
    grid-template-columns: repeat(1, 1fr);
  }

  div {
    position: relative;
    overflow: hidden;
    border-radius: 10px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    transition: transform 0.2s ease-in-out;

    &:hover {
      transform: scale(1.05);
    }

    img {
      width: 100%;
      height: auto;
      transition: transform 0.2s ease-in-out;

      &:hover {
        transform: scale(1.1);
      }
    }

    button {
      font-size: 1rem;
      background-color: #ff7e5f;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 5px;
      transition: background-color 0.2s ease-in-out;

      &:hover {
        background-color: #ff6b4a;
      }
    }
  }
`;

export default function CategoryPage({
  category,
  subCategories,
  products: originalProducts,
}) {
  const defaultSorting = "_id-desc";
  const defaultFilterValues = category.properties.map((p) => ({
    name: p.name,
    value: "all",
  }));
  const [products, setProducts] = useState(originalProducts);
  const [filtersValues, setFiltersValues] = useState(defaultFilterValues);
  const [sort, setSort] = useState(defaultSorting);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [filtersChanged, setFiltersChanged] = useState(false);

  function handleFilterChange(filterName, filterValue) {
    setFiltersValues((prev) => {
      return prev.map((p) => ({
        name: p.name,
        value: p.name === filterName ? filterValue : p.value,
      }));
    });
    setFiltersChanged(true);
  }

  useEffect(() => {
    if (!filtersChanged) {
      return;
    }
    setLoadingProducts(true);
    const catIds = [category._id, ...(subCategories?.map((c) => c._id) || [])];
    const params = new URLSearchParams();
    params.set("categories", catIds.join(","));
    params.set("sort", sort);
    filtersValues.forEach((f) => {
      if (f.value !== "all") {
        params.set(f.name, f.value);
      }
    });
    const url = `/api/products?` + params.toString();
    axios.get(url).then((res) => {
      setProducts(res.data);
      setLoadingProducts(false);
    });
  }, [filtersValues, sort, filtersChanged]);

  return (
    <BackgroundDiv>
      <Header />
      <Center>
        <StyledCategoryHeader>
          <h1>{category.name}</h1>
          <StyledFiltersWrapper>
            {category.properties.map((prop) => (
              <StyledFilter key={prop.name}>
                <span>{prop.name}:</span>
                <select
                  onChange={(ev) =>
                    handleFilterChange(prop.name, ev.target.value)
                  }
                  value={filtersValues.find((f) => f.name === prop.name).value}
                >
                  <option value="all">All</option>
                  {prop.values.map((val) => (
                    <option key={val} value={val}>
                      {val}
                    </option>
                  ))}
                </select>
              </StyledFilter>
            ))}
            <StyledFilter>
              <span>Sort:</span>
              <select
                value={sort}
                onChange={(ev) => {
                  setSort(ev.target.value);
                  setFiltersChanged(true);
                }}
              >
                <option value="price-asc">price, lowest first</option>
                <option value="price-desc">price, highest first</option>
                <option value="_id-desc">newest first</option>
                <option value="_id-asc">oldest first</option>
              </select>
            </StyledFilter>
          </StyledFiltersWrapper>
        </StyledCategoryHeader>
        {loadingProducts && <Spinner fullWidth />}
        {!loadingProducts && (
          <div>
            {products.length > 0 && <StyledProductsGrid products={products} />}
            {products.length === 0 && <div>Sorry, no products found</div>}
          </div>
        )}
      </Center>
    </BackgroundDiv>
  );
}

export async function getServerSideProps(context) {
  const category = await Category.findById(context.query.id);
  const subCategories = await Category.find({ parent: category._id });
  const catIds = [category._id, ...subCategories.map((c) => c._id)];
  const products = await Product.find({ category: catIds });
  return {
    props: {
      category: JSON.parse(JSON.stringify(category)),
      subCategories: JSON.parse(JSON.stringify(subCategories)),
      products: JSON.parse(JSON.stringify(products)),
    },
  };
}
