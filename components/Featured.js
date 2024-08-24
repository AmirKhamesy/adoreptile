import Center from "@/components/Center";
import styled, { keyframes } from "styled-components";
import ButtonLink from "@/components/ButtonLink";
import CartIcon from "@/components/icons/CartIcon";
import FlyingButton from "@/components/FlyingButton";
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

const Bg = styled.div`
  background: linear-gradient(135deg, #ff6f61 0%, #ffa07a 100%);
  color: #fff;
  padding: 80px 20px;
  border-radius: 15px;
  margin: 20px 0;
  font-family: "Poppins", sans-serif;
  box-shadow: 0px 10px 30px rgba(0, 0, 0, 0.2);
  animation: ${fadeIn} 1s ease-in-out;
  overflow: hidden;
  position: relative;
`;

const Title = styled.h1`
  margin: 0;
  font-weight: bold;
  font-size: 2.5rem;
  color: #fff;
  text-align: center;
  background: linear-gradient(to right, #fff, #ffebcd);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: ${fadeIn} 1s ease-in-out 0.2s forwards;
  opacity: 0;
  @media screen and (min-width: 768px) {
    font-size: 4rem;
  }
`;

const Desc = styled.p`
  color: #fbe7e4;
  font-size: 1.1rem;
  text-align: center;
  margin-top: 20px;
  opacity: 0;
  animation: ${fadeIn} 1s ease-in-out 0.4s forwards;
  @media screen and (min-width: 768px) {
    font-size: 1.3rem;
  }
`;

const ColumnsWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 40px;
  animation: ${fadeIn} 1s ease-in-out 0.6s forwards;
  opacity: 0;

  img.main {
    max-width: 100%;
    max-height: 300px;
    display: block;
    margin: 0 auto;
    border-radius: 15px;
    box-shadow: 0px 10px 20px rgba(0, 0, 0, 0.3);
    transition: transform 0.3s ease-in-out;
  }
  img.main:hover {
    transform: scale(1.05);
  }

  @media screen and (min-width: 768px) {
    grid-template-columns: 1.1fr 0.9fr;
  }
`;

const Column = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ButtonsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-top: 35px;
  align-items: center;
  opacity: 0;
  animation: ${fadeIn} 1s ease-in-out 0.8s forwards;

  @media screen and (min-width: 768px) {
    flex-direction: row;
    justify-content: center;
  }

  button,
  a {
    transition: transform 0.3s ease;
  }

  button:hover,
  a:hover {
    transform: translateY(-5px);
  }
`;

const CenterImg = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
`;

const ImgColumn = styled(Column)`
  & > div {
    width: 100%;
  }
`;

const ContentWrapper = styled.div`
  text-align: center;
  opacity: 0;
  animation: ${fadeIn} 1s ease-in-out 0.4s forwards;
`;

export default function Featured({ product }) {
  return (
    <Bg>
      <Center>
        <ColumnsWrapper>
          <Column>
            <div>
              <RevealWrapper origin={"left"} delay={0}>
                <ContentWrapper>
                  <Title>{product.title}</Title>
                  <Desc>{product.description}</Desc>
                  <ButtonsWrapper>
                    <ButtonLink
                      href={"/product/" + product._id}
                      outline={1}
                      white={1}
                    >
                      Read more
                    </ButtonLink>
                    <FlyingButton
                      white={1}
                      _id={product._id}
                      src={product.images?.[0]}
                    >
                      <CartIcon />
                      Add to cart
                    </FlyingButton>
                  </ButtonsWrapper>
                </ContentWrapper>
              </RevealWrapper>
            </div>
          </Column>
          <ImgColumn>
            <RevealWrapper delay={0}>
              <CenterImg>
                <img className={"main"} src={product.images?.[0]} alt="" />
              </CenterImg>
            </RevealWrapper>
          </ImgColumn>
        </ColumnsWrapper>
      </Center>
    </Bg>
  );
}
