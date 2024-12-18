import Header from "@/components/Header";
import styled from "styled-components";
import Center from "@/components/Center";
import { Category } from "@/models/Category";
import { Product } from "@/models/Product";
import ProductsGrid from "@/components/ProductsGrid";
import { useEffect, useState } from "react";
import axios from "axios";
import Spinner from "@/components/Spinner";
import { mongooseConnect } from "@/lib/mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { WishedProduct } from "@/models/WishedProduct";
import * as colors from "@/lib/colors";

const PageContainer = styled.div`
  min-height: 100vh;
  padding: 40px 0 80px;
  background: #eefdf4;

  @media screen and (max-width: 768px) {
    padding: 20px 0 60px;
  }
`;

const TopSection = styled.div`
  text-align: center;
  margin-bottom: 60px;
  opacity: 0;
  transform: translateY(20px);
  animation: fadeIn 0.8s ease-out forwards;

  @keyframes fadeIn {
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @media screen and (max-width: 768px) {
    margin-bottom: 40px;
  }
`;

const PageTitle = styled.h1`
  font-size: clamp(2.5rem, 5vw, 3.5rem);
  color: #1d1d1f;
  font-weight: 600;
  margin: 0 0 16px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  letter-spacing: -0.5px;
  line-height: 1.1;
`;

const Subtitle = styled.p`
  font-size: clamp(1.125rem, 2vw, 1.25rem);
  color: #424245;
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.5;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
`;

const FiltersSection = styled.div`
  margin-bottom: 40px;
  opacity: 0;
  transform: translateY(20px);
  animation: fadeIn 0.8s ease-out 0.2s forwards;
`;

const FiltersWrapper = styled.div`
  background: ${colors.white};
  border-radius: 20px;
  padding: 24px;
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);

  @media screen and (max-width: 768px) {
    flex-direction: column;
    gap: 12px;
    padding: 20px;
  }
`;

const FilterGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;

  @media screen and (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }
`;

const FilterLabel = styled.span`
  font-size: 1rem;
  color: #424245;
  font-weight: 500;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  white-space: nowrap;
`;

const FilterSelect = styled.select`
  appearance: none;
  background: rgba(0, 0, 0, 0.05);
  border: none;
  border-radius: 980px;
  padding: 10px 36px 10px 16px;
  font-size: 0.9375rem;
  color: #1d1d1f;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  min-width: 180px;
  background-image: url("data:image/svg+xml,%3Csvg width='10' height='6' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h10L5 6z' fill='%23000'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 16px center;

  &:hover {
    background-color: rgba(0, 0, 0, 0.08);
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 4px rgba(0, 0, 0, 0.05);
  }

  @media screen and (max-width: 768px) {
    width: 100%;
  }
`;

const ResultsSection = styled.div`
  background: ${colors.white};
  border-radius: 30px;
  padding: 40px;
  opacity: 0;
  transform: translateY(20px);
  animation: fadeIn 0.8s ease-out 0.4s forwards;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);

  @media screen and (max-width: 768px) {
    padding: 20px;
    border-radius: 20px;
  }
`;

const LoadingWrapper = styled.div`
  display: flex;
  justify-content: center;
  padding: 60px 0;
`;

const NoResults = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: #424245;
  font-size: 1.125rem;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
`;

export default function CategoryPage({
  category,
  subCategories,
  products: originalProducts,
  wishedProducts = [],
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
    const url = `/api/products?${params.toString()}`;
    axios.get(url).then((res) => {
      setProducts(res.data);
      setLoadingProducts(false);
    });
  }, [filtersValues, sort, filtersChanged]);

  return (
    <>
      <Header />
      <PageContainer>
        <Center>
          <TopSection>
            <PageTitle>{category.name}</PageTitle>
            <Subtitle>
              Discover our premium selection of {category.name.toLowerCase()},
              carefully curated for your reptilian companion.
            </Subtitle>
          </TopSection>

          {category.properties.length > 0 && (
            <FiltersSection>
              <FiltersWrapper>
                {category.properties.map((prop) => (
                  <FilterGroup key={prop.name}>
                    <FilterLabel>{prop.name}:</FilterLabel>
                    <FilterSelect
                      onChange={(ev) =>
                        handleFilterChange(prop.name, ev.target.value)
                      }
                      value={
                        filtersValues.find((f) => f.name === prop.name).value
                      }
                    >
                      <option value="all">All {prop.name}s</option>
                      {prop.values.map((val) => (
                        <option key={val} value={val}>
                          {val}
                        </option>
                      ))}
                    </FilterSelect>
                  </FilterGroup>
                ))}
                <FilterGroup>
                  <FilterLabel>Sort by:</FilterLabel>
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
                </FilterGroup>
              </FiltersWrapper>
            </FiltersSection>
          )}

          <ResultsSection>
            {loadingProducts ? (
              <LoadingWrapper>
                <Spinner />
              </LoadingWrapper>
            ) : products.length > 0 ? (
              <ProductsGrid
                products={products}
                wishedProducts={wishedProducts}
              />
            ) : (
              <NoResults>No products found matching your criteria.</NoResults>
            )}
          </ResultsSection>
        </Center>
      </PageContainer>
    </>
  );
}

export async function getServerSideProps(ctx) {
  await mongooseConnect();
  const category = await Category.findById(ctx.query.id);
  const subCategories = await Category.find({ parent: category._id });
  const categoryIds = [category._id, ...subCategories.map((c) => c._id)];
  const products = await Product.find({ category: categoryIds }, null, {
    sort: { _id: -1 },
  });

  const session = await getServerSession(ctx.req, ctx.res, authOptions);
  const wishedProducts = session?.user
    ? await WishedProduct.find({
        userEmail: session.user.email,
        product: products.map((p) => p._id.toString()),
      })
    : [];

  return {
    props: {
      category: JSON.parse(JSON.stringify(category)),
      subCategories: JSON.parse(JSON.stringify(subCategories)),
      products: JSON.parse(JSON.stringify(products)),
      wishedProducts: wishedProducts.map((i) => i.product.toString()),
    },
  };
}
