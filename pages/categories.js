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

export default function CategoriesPage({
  mainCategories,
  categoriesProducts,
  wishedProducts = [],
}) {
  return (
    <>
      <Header />
      <Center>
        {mainCategories
          .filter((category) => categoriesProducts[category._id]?.length > 0)
          .map((category) => (
            <CategorySection key={category._id}>
              <CategoryHeader>
                <SectionTitle>{category.name}</SectionTitle>
                <StyledLink href={`/category/${category._id}`}>
                  Show all &rarr;
                </StyledLink>
              </CategoryHeader>
              <StyledProductsGrid>
                {categoriesProducts[category._id].map((product, index) => (
                  <RevealWrapper delay={index * 50} key={product._id}>
                    <ProductBox
                      {...product}
                      wished={wishedProducts.includes(product._id)}
                    />
                  </RevealWrapper>
                ))}
              </StyledProductsGrid>
            </CategorySection>
          ))}
      </Center>
    </>
  );
}

const CategorySection = styled.div`
  margin-bottom: 2rem;
`;

const CategoryHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const SectionTitle = styled.h2`
  font-size: 2rem;
  color: #333;
  font-weight: bold;
`;

const StyledLink = styled(Link)`
  font-size: 1rem;
  color: #ff7e5f;
  text-decoration: underline;

  &:hover {
    color: #ff6b4a;
  }
`;

const StyledProductsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 16px;

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 480px) {
    grid-template-columns: repeat(1, 1fr);
  }
`;

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
      limit: 3,
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
        userEmail: session?.user.email,
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
