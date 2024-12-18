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
import * as colors from "@/lib/colors";

const PageContainer = styled.div`
  min-height: 100vh;
  padding: 40px 0;

  @media screen and (max-width: 768px) {
    padding: 20px 0;
  }
`;

const TopSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  margin-bottom: 40px;
  opacity: 0;
  transform: translateY(20px);
  animation: fadeIn 0.8s ease-out forwards;

  @keyframes fadeIn {
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const PageTitle = styled(Title)`
  font-size: clamp(2rem, 4vw, 2.5rem);
  color: #1d1d1f;
  font-weight: 600;
  text-align: center;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  letter-spacing: -0.5px;
  margin: 0;
`;

const Subtitle = styled.p`
  font-size: clamp(1rem, 2vw, 1.125rem);
  color: #86868b;
  text-align: center;
  max-width: 600px;
  line-height: 1.5;
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
`;

const SearchWrapper = styled.div`
  width: 100%;
  max-width: 680px;
  margin: 0 auto;
  position: relative;
`;

const SearchInput = styled(Input)`
  width: 100%;
  padding: 16px 20px;
  font-size: 1.125rem;
  border: none;
  border-radius: 12px;
  background: rgba(0, 0, 0, 0.05);
  color: #1d1d1f;
  transition: all 0.2s ease;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;

  &:focus {
    outline: none;
    background: rgba(0, 0, 0, 0.08);
    box-shadow: 0 0 0 4px rgba(0, 0, 0, 0.05);
  }

  &::placeholder {
    color: #86868b;
  }
`;

const FiltersSection = styled.div`
  margin: 20px 0 40px;
  opacity: 0;
  transform: translateY(20px);
  animation: fadeIn 0.8s ease-out 0.2s forwards;
`;

const FiltersWrapper = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: center;
  padding: 0 20px;

  @media screen and (max-width: 768px) {
    flex-direction: column;
    gap: 8px;
  }
`;

const FilterSelect = styled.select`
  appearance: none;
  background: rgba(0, 0, 0, 0.05);
  border: none;
  border-radius: 20px;
  padding: 10px 36px 10px 16px;
  font-size: 0.9375rem;
  color: #1d1d1f;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  background-image: url("data:image/svg+xml,%3Csvg width='10' height='6' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h10L5 6z' fill='%23000'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 16px center;
  min-width: 200px;

  &:hover {
    background-color: rgba(0, 0, 0, 0.08);
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 4px rgba(0, 0, 0, 0.05);
  }

  @media screen and (max-width: 768px) {
    width: 100%;
    min-width: unset;
    max-width: 100%;
  }
`;

const ResultsSection = styled.div`
  opacity: 0;
  transform: translateY(20px);
  animation: fadeIn 0.8s ease-out 0.4s forwards;
`;

const NoResults = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: #86868b;
  font-size: 1.125rem;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
`;

const LoadingWrapper = styled.div`
  display: flex;
  justify-content: center;
  padding: 60px 0;
`;

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
      <PageContainer>
        <Center>
          <TopSection>
            <PageTitle>Our Products</PageTitle>
            <Subtitle>
              Explore our collection of premium reptile supplies, carefully
              curated for your scaly friends.
            </Subtitle>
            <SearchWrapper>
              <SearchInput
                value={phrase}
                onChange={(ev) => setPhrase(ev.target.value)}
                placeholder="Search products..."
              />
            </SearchWrapper>
          </TopSection>

          <FiltersSection>
            <FiltersWrapper>
              <FilterSelect
                onChange={handleCategorySelect}
                value={selectedCategory}
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </FilterSelect>

              {selectedCategory &&
                categories
                  .find((c) => c._id === selectedCategory)
                  ?.properties.map((prop) => (
                    <FilterSelect
                      key={prop.name}
                      onChange={(ev) =>
                        handleFilterChange(prop.name, ev.target.value)
                      }
                    >
                      <option value="all">{prop.name}: All</option>
                      {prop.values.map((val) => (
                        <option key={val} value={val}>
                          {val}
                        </option>
                      ))}
                    </FilterSelect>
                  ))}

              <FilterSelect
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
              </FilterSelect>
            </FiltersWrapper>
          </FiltersSection>

          <ResultsSection>
            {isLoading ? (
              <LoadingWrapper>
                <Spinner />
              </LoadingWrapper>
            ) : (
              <>
                {phrase !== "" && filteredProducts.length === 0 ? (
                  <NoResults>No products found for "{phrase}"</NoResults>
                ) : (
                  <ProductsGrid
                    products={filteredProducts}
                    wishedProducts={wishedProducts}
                  />
                )}
              </>
            )}
          </ResultsSection>
        </Center>
      </PageContainer>
    </>
  );
}

export async function getServerSideProps(ctx) {
  await mongooseConnect();
  const categories = await Category.find();
  const products = await Product.find({}, null, { sort: { _id: -1 } });
  const session = await getServerSession(ctx.req, ctx.res, authOptions);
  const wishedProducts = session?.user
    ? await WishedProduct.find({
        userEmail: session.user.email,
        product: products.map((p) => p._id.toString()),
      })
    : [];

  return {
    props: {
      categories: JSON.parse(JSON.stringify(categories)),
      products: JSON.parse(JSON.stringify(products)),
      wishedProducts: wishedProducts.map((i) => i.product.toString()),
    },
  };
}
