import Link from "next/link";
import styled from "styled-components";
import { useContext, useState, useEffect } from "react";
import { CartContext } from "@/components/CartContext";
import BarsIcon from "@/components/icons/Bars";
import SearchIcon from "@/components/icons/SearchIcon";
import Center from "@/components/Center";
import * as colors from "@/lib/colors";

const StyledHeader = styled.header`
  background: ${colors.white}dd;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  transition: all 0.3s ease;
  border-bottom: 1px solid ${colors.primary}22;

  &.scrolled {
    background: ${colors.white}ff;
    box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
  }
`;

const Logo = styled(Link)`
  color: ${colors.primary};
  text-decoration: none;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  font-size: 1.4rem;
  font-weight: 600;
  letter-spacing: -0.5px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  z-index: 1001;
  position: relative;

  &:before {
    content: "🦎";
    font-size: 1.6rem;
  }

  &:hover {
    transform: translateY(-1px);
    color: ${colors.primaryDark};
  }
`;

const Wrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.8rem 1rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const MobileNav = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  max-width: 380px;
  background: ${colors.white};
  transform: translateX(100%);
  transition: none;
  display: flex;
  flex-direction: column;
  z-index: 1000;
  box-shadow: none;
  visibility: hidden;
  opacity: 0;

  &.mounted {
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1),
      opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  &.isOpen {
    transform: translateX(0);
    box-shadow: -10px 0 30px rgba(0, 0, 0, 0.1);
    visibility: visible;
    opacity: 1;
  }

  @media screen and (min-width: 768px) {
    display: none;
  }
`;

const MobileNavHeader = styled.div`
  padding: 1rem 1.5rem;
  border-bottom: 1px solid ${colors.background};
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 70px;
`;

const MobileNavContent = styled.div`
  padding: 1.5rem;
  overflow-y: auto;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const StyledNav = styled.nav`
  display: none;

  @media screen and (min-width: 768px) {
    display: flex;
    position: static;
    padding: 0;
    flex-direction: row;
    gap: 2rem;
    background: none;
    box-shadow: none;
    width: auto;
  }
`;

const NavLink = styled(Link)`
  color: ${colors.textDark};
  text-decoration: none;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  font-size: 1.1rem;
  font-weight: 500;
  padding: 0.8rem 0;
  opacity: 0.9;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: space-between;

  @media screen and (min-width: 768px) {
    font-size: 0.95rem;
    padding: 0.3rem 0;
    border-bottom: 2px solid transparent;

    &:hover {
      color: ${colors.primary};
      border-bottom: 2px solid ${colors.primary};
    }
  }

  @media screen and (max-width: 767px) {
    padding: 1rem 0;
    border-bottom: 1px solid ${colors.background};

    &:hover {
      color: ${colors.primary};
      padding-left: 10px;
    }
  }
`;

const NavButton = styled.button`
  background-color: transparent;
  width: 44px;
  height: 44px;
  border: 0;
  color: ${colors.primary};
  cursor: pointer;
  z-index: 1001;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  position: relative;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;

  &:active {
    transform: scale(0.95);
  }

  @media (hover: hover) {
    &:hover {
      transform: scale(1.1);
    }
  }

  @media screen and (min-width: 768px) {
    display: none;
  }
`;

const SideIcons = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  z-index: 1001;
  position: relative;

  a {
    color: ${colors.primary};
    transition: all 0.2s ease;
    display: flex;
    align-items: center;

    &:hover {
      transform: scale(1.1);
    }
  }
`;

const CartCount = styled.span`
  background: ${colors.accent};
  color: ${colors.white};
  font-size: 0.8rem;
  padding: 0.2rem 0.6rem;
  border-radius: 1rem;
  margin-left: 0.5rem;
  font-weight: 500;
`;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(5px);
  transition: none;
  opacity: 0;
  visibility: hidden;
  z-index: 999;

  &.mounted {
    transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  &.isOpen {
    opacity: 1;
    visibility: visible;
  }

  @media screen and (min-width: 768px) {
    display: none;
  }
`;

const CloseButton = styled(NavButton)`
  color: ${colors.textDark};
`;

export default function Header() {
  const { cartProducts } = useContext(CartContext);
  const [mobileNavActive, setMobileNavActive] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (mobileNavActive) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileNavActive]);

  const closeMobileNav = () => {
    setMobileNavActive(false);
  };

  return (
    <>
      <StyledHeader className={isScrolled ? "scrolled" : ""}>
        <Wrapper>
          <Logo href={"/"}>Adoreptile</Logo>
          <StyledNav>
            <NavLink href={"/"}>Home</NavLink>
            <NavLink href={"/products"}>Products</NavLink>
            <NavLink href={"/categories"}>Categories</NavLink>
            <NavLink href={"/account"}>Account</NavLink>
            <NavLink href={"/cart"}>
              Cart{" "}
              {cartProducts.length > 0 && (
                <CartCount>{cartProducts.length}</CartCount>
              )}
            </NavLink>
          </StyledNav>
          <SideIcons>
            <Link href={"/search"}>
              <SearchIcon />
            </Link>
            <NavButton
              onClick={() => setMobileNavActive((prev) => !prev)}
              aria-label="Toggle menu"
            >
              <BarsIcon />
            </NavButton>
          </SideIcons>
        </Wrapper>
      </StyledHeader>

      <MobileNav
        className={`${isMounted ? "mounted" : ""} ${
          mobileNavActive ? "isOpen" : ""
        }`}
      >
        <MobileNavHeader>
          <Logo href={"/"} onClick={closeMobileNav}>
            Adoreptile
          </Logo>
          <CloseButton onClick={closeMobileNav} aria-label="Close menu">
            ✕
          </CloseButton>
        </MobileNavHeader>
        <MobileNavContent>
          <NavLink href={"/"} onClick={closeMobileNav}>
            Home
          </NavLink>
          <NavLink href={"/products"} onClick={closeMobileNav}>
            Products
          </NavLink>
          <NavLink href={"/categories"} onClick={closeMobileNav}>
            Categories
          </NavLink>
          <NavLink href={"/account"} onClick={closeMobileNav}>
            Account
          </NavLink>
          <NavLink href={"/cart"} onClick={closeMobileNav}>
            Cart{" "}
            {cartProducts.length > 0 && (
              <CartCount>{cartProducts.length}</CartCount>
            )}
          </NavLink>
        </MobileNavContent>
      </MobileNav>

      <Overlay
        className={`${isMounted ? "mounted" : ""} ${
          mobileNavActive ? "isOpen" : ""
        }`}
        onClick={closeMobileNav}
      />
    </>
  );
}
