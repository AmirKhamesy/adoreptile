import styled from "styled-components";
import { ButtonStyle } from "@/components/Button";
import * as colors from "@/lib/colors";
import { CartContext } from "@/components/CartContext";
import { useContext, useEffect, useRef } from "react";

const FlyingButtonWrapper = styled.div`
  button {
    ${ButtonStyle};
    ${(props) =>
      props.main
        ? `
      background-color: ${colors.primary};
      color: white;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
      border-radius: 12px;
      
      &:hover {
        background-color: ${colors.primaryDark};
        transform: translateY(-1px);
        box-shadow: 0 4px 12px ${colors.primary}40;
      }
      
      &:active {
        transform: translateY(0);
      }
    `
        : `
      background-color: ${colors.primary}15;
      color: ${colors.primary};
      border-radius: 12px;
      
      &:hover {
        background-color: ${colors.primary};
        color: white;
      }
    `}

    ${(props) =>
      props.white &&
      `
      background-color: rgba(255, 255, 255, 0.9);
      color: ${colors.primary};
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      font-weight: 500;
      border-radius: 12px;
      
      &:hover {
        background-color: rgba(255, 255, 255, 1);
        transform: translateY(-1px);
      }
      
      &:active {
        transform: translateY(0);
      }
    `}
  }

  @keyframes fly {
    0% {
      opacity: 1;
      transform: translate(0, 0) scale(1);
    }
    100% {
      opacity: 0;
      transform: translate(150px, -150px) scale(0.3);
    }
  }

  img {
    display: none;
    max-width: 100px;
    max-height: 100px;
    opacity: 1;
    position: fixed;
    z-index: 5;
    border-radius: 10px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    pointer-events: none;
    transition: transform 1s cubic-bezier(0.16, 1, 0.3, 1),
      opacity 0.8s ease-out;
  }

  .flying {
    animation: fly 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }
`;

export default function FlyingButton(props) {
  const { addProduct, addMultipleProducts } = useContext(CartContext);
  const imgRef = useRef();
  const timeoutRef = useRef();

  function sendImageToCart(ev) {
    ev.preventDefault();
    ev.stopPropagation();

    const rect = ev.currentTarget.getBoundingClientRect();
    const targetRect = document
      .querySelector(".cart-count")
      ?.getBoundingClientRect() || {
      top: 20,
      right: window.innerWidth - 20,
    };

    if (imgRef.current) {
      imgRef.current.style.display = "block";
      imgRef.current.style.left = `${ev.clientX - 50}px`;
      imgRef.current.style.top = `${ev.clientY - 50}px`;
      imgRef.current.classList.add("flying");

      timeoutRef.current = setTimeout(() => {
        if (imgRef.current) {
          imgRef.current.style.display = "none";
          imgRef.current.classList.remove("flying");
        }
      }, 1000);
    }

    const quantity = props.quantity || 1;
    addMultipleProducts(props._id, quantity);
  }

  useEffect(() => {
    const interval = setInterval(() => {
      const reveal = imgRef.current?.closest("div[data-sr-id]");
      if (reveal?.style.opacity === "1") {
        reveal.style.transform = "none";
      }
    }, 100);

    return () => {
      clearInterval(interval);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <FlyingButtonWrapper white={props.white} main={props.main}>
      <img src={props.src} alt="" ref={imgRef} />
      <button
        onClick={sendImageToCart}
        onMouseDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        {...props}
      />
    </FlyingButtonWrapper>
  );
}
