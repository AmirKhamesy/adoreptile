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
import { Category } from "@/models/Category";
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { debounce } from "lodash";
import Input from "@/components/Input";
import Spinner from "@/components/Spinner";

export default function ProductsPage({ products, wishedProducts, categories }) {
  const [phrase, setPhrase] = useState("");
  const [filteredProducts, setFilteredProducts] = useState(products);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [filtersValues, setFiltersValues] = useState([]);
  const [sort, setSort] = useState("_id-desc");
  const [filtersChanged, setFiltersChanged] = useState(false);
  const debouncedSearch = useCallback(debounce(searchProducts, 500), [
    phrase,
    selectedCategory,
    filtersValues,
    sort,
  ]);

  useEffect(() => {
    if (!filtersChanged && phrase === "") return;
    setIsLoading(true);
    debouncedSearch();
  }, [phrase, filtersValues, sort, filtersChanged]);

  function searchProducts() {
    const params = new URLSearchParams();

    if (selectedCategory) {
      params.set("categories", selectedCategory);
    }
    if (phrase) {
      params.set("phrase", phrase);
    }
    filtersValues.forEach((f) => {
      if (f.value !== "all") {
        params.set(f.name, f.value);
      }
    });
    params.set("sort", sort);

    axios.get(`/api/products?${params.toString()}`).then((response) => {
      setFilteredProducts(response.data);
      setIsLoading(false);
    });
  }

  function handleFilterChange(filterName, filterValue) {
    setFiltersValues((prev) => {
      const newFilters = prev.filter((f) => f.name !== filterName);
      if (filterValue !== "all") {
        newFilters.push({ name: filterName, value: filterValue });
      }
      return newFilters;
    });
    setFiltersChanged(true);
  }

  function handleCategorySelect(ev) {
    setSelectedCategory(ev.target.value);
    setFiltersValues([]);
    setFiltersChanged(true);
  }

  return (
    <>
      <Header />
      <Center>
        <TopSection>
          <PageTitle>Explore Our Products</PageTitle>
          <SearchWrapper>
            <SearchInput
              autoFocus
              value={phrase}
              onChange={(ev) => setPhrase(ev.target.value)}
              placeholder="Search for products..."
            />
          </SearchWrapper>
        </TopSection>
        <TopSection>
          <SearchFiltersWrapper>
            <FiltersWrapper>
              <StyledFilter>
                <span>Category:</span>
                <select
                  onChange={handleCategorySelect}
                  value={selectedCategory}
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </StyledFilter>
              {selectedCategory &&
                categories
                  .find((c) => c._id === selectedCategory)
                  ?.properties.map((prop) => (
                    <StyledFilter key={prop.name}>
                      <span>{prop.name}:</span>
                      <select
                        onChange={(ev) =>
                          handleFilterChange(prop.name, ev.target.value)
                        }
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
                  <option value="_id-desc">Newest First</option>
                  <option value="_id-asc">Oldest First</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                </select>
              </StyledFilter>
            </FiltersWrapper>
          </SearchFiltersWrapper>
        </TopSection>

        {isLoading && <Spinner fullWidth={true} />}
        {!isLoading && phrase !== "" && filteredProducts.length === 0 && (
          <NoProductsText>No products found for "{phrase}"</NoProductsText>
        )}
        {!isLoading && filteredProducts.length > 0 && (
          <ProductsGrid
            products={filteredProducts}
            wishedProducts={wishedProducts}
          />
        )}
      </Center>
    </>
  );
}

const TopSection = styled.div`
  display: flex;
  align-items: center;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    margin-bottom: 1.5rem;
  }
`;

const PageTitle = styled(Title)`
  font-size: 2.5rem;
  color: #2a2a2a;
`;

const SearchFiltersWrapper = styled.div`
  display: flex;
  width: 100%;
  justify-content: center;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 10px;
    width: 100%;
  }
`;

const SearchWrapper = styled.div`
  max-width: 500px;
  width: 100%;
`;

const SearchInput = styled(Input)`
  padding: 8px 15px;
  border-radius: 20px;
  font-size: 1rem;
  width: 100%;
  border: 1px solid #ddd;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);

  &:focus {
    outline: none;
    border-color: #ff7e5f;
  }
`;

const FiltersWrapper = styled.div`
  display: flex;
  gap: 15px;
  margin: 1rem 0;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 10px;
    width: 100%;
  }
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
    border: 0px solid #ccc;
    font-size: 1rem;
    color: #444;
    border-radius: 5px;
    transition: background-color 0.2s ease-in-out, border-color 0.2s ease-in-out;
    width: 100%;

    &:hover {
      background-color: #f0f0f0;
      border-color: #ff7e5f;
    }

    &:focus {
      outline: none;
      border-color: #ff7e5f;
      box-shadow: 0 0 5px rgba(255, 126, 95, 0.5);
    }
  }

  span {
    font-weight: bold;
    color: #ff7e5f;
    flex-shrink: 0;
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
  const categories = await Category.find({});
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
      categories: JSON.parse(JSON.stringify(categories)),
    },
  };
}
