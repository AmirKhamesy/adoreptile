import Header from "@/components/Header";
import styled from "styled-components";
import Center from "@/components/Center";
import { mongooseConnect } from "@/lib/mongoose";
import { Category } from "@/models/Category";
import { Product } from "@/models/Product";
import ProductBox from "@/components/ProductBox";
import Link from "next/link";
import { RevealWrapper } from "next-reveal";
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

const CategoryGrid = styled.div`
  display: grid;
  gap: 40px;
  margin-bottom: 80px;
  opacity: 0;
  transform: translateY(20px);
  animation: fadeIn 0.8s ease-out 0.2s forwards;

  @media screen and (max-width: 768px) {
    gap: 30px;
    margin-bottom: 60px;
  }
`;

const CategorySection = styled.section`
  background: ${colors.white};
  border-radius: 30px;
  overflow: hidden;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);

  @media (hover: hover) {
    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
    }
  }
`;

const CategoryHeader = styled.div`
  padding: 40px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);

  @media screen and (max-width: 768px) {
    padding: 30px 20px;
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
`;

const CategoryInfo = styled.div`
  flex-grow: 1;
`;

const CategoryTitle = styled.h2`
  font-size: clamp(1.5rem, 3vw, 2rem);
  color: #1d1d1f;
  margin: 0 0 8px;
  font-weight: 600;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  letter-spacing: -0.3px;
`;

const CategoryDescription = styled.p`
  font-size: 1.0625rem;
  color: #424245;
  margin: 0;
  line-height: 1.5;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
`;

const ViewAllLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  color: ${colors.primary};
  font-size: 1.0625rem;
  font-weight: 500;
  text-decoration: none;
  padding: 12px 24px;
  border-radius: 980px;
  background: ${colors.primary}10;
  transition: all 0.2s ease;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  white-space: nowrap;

  &:after {
    content: "→";
    margin-left: 6px;
    transition: transform 0.2s ease;
  }

  @media (hover: hover) {
    &:hover {
      background: ${colors.primary}20;

      &:after {
        transform: translateX(4px);
      }
    }
  }
`;

const ProductsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  padding: 40px;
  gap: 30px;
  background: ${colors.white};

  @media screen and (max-width: 768px) {
    padding: 20px;
    gap: 20px;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  }
`;

const NoProducts = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: #424245;
  font-size: 1.125rem;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  grid-column: 1 / -1;
`;

export default function CategoriesPage({
  mainCategories,
  categoriesProducts,
  wishedProducts = [],
}) {
  return (
    <>
      <Header />
      <PageContainer>
        <Center>
          <TopSection>
            <PageTitle>Shop by Category</PageTitle>
            <Subtitle>
              Explore our curated collection of premium reptile supplies,
              thoughtfully organized to help you find exactly what your scaly
              friend needs.
            </Subtitle>
          </TopSection>

          <CategoryGrid>
            {mainCategories
              .filter(
                (category) => categoriesProducts[category._id]?.length > 0
              )
              .map((category) => (
                <CategorySection key={category._id}>
                  <CategoryHeader>
                    <CategoryInfo>
                      <CategoryTitle>{category.name}</CategoryTitle>
                      <CategoryDescription>
                        Discover our selection of {category.name.toLowerCase()}{" "}
                        for your reptilian companion.
                      </CategoryDescription>
                    </CategoryInfo>
                    <ViewAllLink href={`/category/${category._id}`}>
                      View Collection
                    </ViewAllLink>
                  </CategoryHeader>

                  <ProductsGrid>
                    {categoriesProducts[category._id].length > 0 ? (
                      categoriesProducts[category._id].map((product, index) => (
                        <RevealWrapper
                          key={product._id}
                          delay={index * 100}
                          duration={700}
                          origin="bottom"
                          distance="20px"
                          reset={false}
                          mobile={false}
                        >
                          <ProductBox
                            {...product}
                            wished={wishedProducts.includes(product._id)}
                          />
                        </RevealWrapper>
                      ))
                    ) : (
                      <NoProducts>
                        No products available in this category yet.
                      </NoProducts>
                    )}
                  </ProductsGrid>
                </CategorySection>
              ))}
          </CategoryGrid>
        </Center>
      </PageContainer>
    </>
  );
}

export async function getServerSideProps(ctx) {
  await mongooseConnect();
  const categories = await Category.find();
  const mainCategories = categories.filter((c) => !c.parent);
  const categoriesProducts = {};
  const allFetchedProductsId = [];

  for (const mainCat of mainCategories) {
    const mainCatId = mainCat._id.toString();
    const childCatIds = categories
      .filter((c) => c?.parent?.toString() === mainCatId)
      .map((c) => c._id.toString());
    const categoriesIds = [mainCatId, ...childCatIds];
    const products = await Product.find({ category: categoriesIds }, null, {
      limit: 6,
      sort: { _id: -1 },
    });
    if (products.length > 0) {
      allFetchedProductsId.push(...products.map((p) => p._id.toString()));
      categoriesProducts[mainCat._id] = products;
    }
  }

  const session = await getServerSession(ctx.req, ctx.res, authOptions);
  const wishedProducts = session?.user
    ? await WishedProduct.find({
        userEmail: session.user.email,
        product: allFetchedProductsId,
      })
    : [];

  return {
    props: {
      mainCategories: JSON.parse(JSON.stringify(mainCategories)),
      categoriesProducts: JSON.parse(JSON.stringify(categoriesProducts)),
      wishedProducts: wishedProducts.map((i) => i.product.toString()),
    },
  };
}
