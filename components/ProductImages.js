import styled from "styled-components";
import { useState } from "react";

const ImageContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 20px;
  height: 500px;

  @media screen and (max-width: 768px) {
    display: flex;
    flex-direction: column;
    height: auto;
    gap: 16px;
  }
`;

const BigImageWrapper = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  background: #fff;
  border-radius: 20px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const BigImage = styled.img`
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  padding: 20px;
`;

const ImageButtons = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: 100%;
  overflow-y: auto;
  padding-right: 12px;
  scrollbar-width: thin;
  scrollbar-color: #86868b transparent;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #86868b;
    border-radius: 20px;
  }

  @media screen and (max-width: 768px) {
    flex-direction: row;
    overflow-x: auto;
    overflow-y: hidden;
    padding-right: 0;
    padding-bottom: 12px;

    &::-webkit-scrollbar {
      height: 6px;
    }
  }
`;

const ImageButton = styled.div`
  width: 70px;
  height: 70px;
  flex-shrink: 0;
  padding: 8px;
  border: 2px solid ${(props) => (props.active ? "#1d1d1f" : "transparent")};
  border-radius: 12px;
  cursor: pointer;
  background: #fff;
  overflow: hidden;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    border-color: #86868b;
  }
`;

const Image = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 4px;
`;

export default function ProductImages({ images }) {
  const [activeImage, setActiveImage] = useState(images?.[0]);
  return (
    <ImageContainer>
      <BigImageWrapper>
        <BigImage src={activeImage} alt="" />
      </BigImageWrapper>
      <ImageButtons>
        {images.map((image) => (
          <ImageButton
            key={image}
            active={image === activeImage}
            onClick={() => setActiveImage(image)}
          >
            <Image src={image} alt="" />
          </ImageButton>
        ))}
      </ImageButtons>
    </ImageContainer>
  );
}
