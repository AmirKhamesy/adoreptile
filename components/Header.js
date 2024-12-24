import Link from "next/link";
import styled from "styled-components";
import { useContext, useState, useEffect, useRef } from "react";
import { CartContext } from "@/components/CartContext";
import BarsIcon from "@/components/icons/Bars";
import SearchIcon from "@/components/icons/SearchIcon";
import Center from "@/components/Center";
import * as colors from "@/lib/colors";
import { debounce } from "lodash";
import axios from "axios";
import CartIconMobile from "@/components/icons/CartIconMobile";

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
  opacity: 0;
  transform: translateY(-10px);
  padding-top: env(safe-area-inset-top, 0);

  &.mounted {
    opacity: 1;
    transform: translateY(0);
  }

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
  pointer-events: none;

  &.mounted {
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  &.isOpen {
    transform: translateX(0);
    box-shadow: -10px 0 30px rgba(0, 0, 0, 0.1);
    pointer-events: all;
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
  opacity: 0;
  transform: translateX(30px);
  transition: none;

  .mounted & {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    transition-delay: 0.1s;
  }

  .isOpen & {
    opacity: 1;
    transform: translateX(0);
  }
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

  &[aria-label="Toggle menu"] {
    @media screen and (min-width: 768px) {
      display: none;
    }
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
  background: ${colors.primary}22;
  color: ${colors.primary};
  font-size: 0.75rem;
  padding: 0.15rem 0.4rem;
  border-radius: 0.75rem;
  margin-left: 0.5rem;
  font-weight: 600;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid ${colors.primary}15;
  min-width: 1.2rem;
  text-align: center;
  display: inline-flex;
  align-items: center;
  justify-content: center;
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
  pointer-events: none;
  z-index: 999;

  &.mounted {
    transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  &.isOpen {
    opacity: 1;
    pointer-events: all;
  }

  @media screen and (min-width: 768px) {
    display: none;
  }
`;

const CloseButton = styled(NavButton)`
  color: ${colors.textDark};
  width: 44px;
  height: 44px;
  font-size: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background: rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;

  &:hover {
    background: rgba(0, 0, 0, 0.08);
  }

  svg {
    width: 20px;
    height: 20px;
  }
`;

const SearchContainer = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  width: 100%;
  max-width: 600px;
  height: 100vh;
  background: #eefdf4;
  transform: translateX(100%);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 1002;
  display: flex;
  flex-direction: column;
  padding: 40px 0;

  &.isOpen {
    transform: translateX(0);
  }

  @media screen and (max-width: 768px) {
    padding: 20px 0;
  }
`;

const SearchHeader = styled.div`
  padding: 0 2rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  min-height: 70px;
  padding-top: calc(env(safe-area-inset-top, 0) + 1rem);
  margin-bottom: 0;
`;

const Divider = styled.div`
  height: 1px;
  background: ${colors.primary}15;
  margin: 1.5rem 0;
  width: 100%;
  box-shadow: 0 1px 3px ${colors.primary}05;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 1rem 1.5rem;
  border-radius: 20px;
  border: none;
  background: ${colors.white};
  font-size: 1rem;
  color: ${colors.textDark};
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  transition: all 0.2s ease;
  box-shadow: 0 4px 24px ${colors.primary}10;

  &:focus {
    outline: none;
    box-shadow: 0 4px 24px ${colors.primary}20;
  }

  &::placeholder {
    color: ${colors.textLight};
  }
`;

const SearchResults = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 0 2rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  opacity: 0;
  transform: translateY(10px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &.visible {
    opacity: 1;
    transform: translateY(0);
  }

  @media screen and (max-width: 768px) {
    padding: 0 1.5rem;
  }
`;

const SearchResultItem = styled(Link)`
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 1.5rem;
  padding: 1.5rem;
  text-decoration: none;
  color: inherit;
  background: ${colors.white};
  border-radius: 20px;
  transition: all 0.2s ease;
  box-shadow: 0 4px 24px ${colors.primary}10;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 24px ${colors.primary}20;
  }

  @media screen and (max-width: 768px) {
    gap: 1rem;
    padding: 1rem;
  }
`;

const SearchResultImage = styled.div`
  width: 100px;
  height: 100px;
  border-radius: 12px;
  overflow: hidden;
  background: ${colors.background};

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  @media screen and (max-width: 768px) {
    width: 80px;
    height: 80px;
  }
`;

const SearchResultInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const SearchResultTitle = styled.div`
  font-size: 1rem;
  font-weight: 500;
  color: ${colors.textDark};
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin: 0;
`;

const SearchResultPrice = styled.div`
  font-size: 1.125rem;
  font-weight: 600;
  color: ${colors.primary};

  &::before {
    content: "$";
  }
`;

const NoResults = styled.div`
  text-align: center;
  padding: 3rem 2rem;
  color: ${colors.textLight};
  font-size: 1rem;
  background: ${colors.white};
  border-radius: 20px;
  box-shadow: 0 4px 24px ${colors.primary}10;
`;

const LoadingSpinner = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3rem 2rem;
  color: ${colors.primary};
  background: ${colors.white};
  border-radius: 20px;
  box-shadow: 0 4px 24px ${colors.primary}10;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  &:before {
    content: "";
    width: 24px;
    height: 24px;
    border: 2px solid ${colors.primary}22;
    border-top-color: ${colors.primary};
    border-radius: 50%;
    animation: spin 0.6s linear infinite;
  }
`;

const SearchOverlay = styled(Overlay)`
  z-index: 1001;
  background: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(5px);

  @media screen and (min-width: 768px) {
    display: block;
  }
`;

const CloseSearchButton = styled(CloseButton)`
  width: 44px;
  height: 44px;
  color: ${colors.textDark};
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background: rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;

  &:hover {
    background: rgba(0, 0, 0, 0.08);
  }

  svg {
    width: 20px;
    height: 20px;
  }
`;

const CartBubble = styled.span`
  position: absolute;
  top: -4px;
  right: -4px;
  background: ${colors.primary}22;
  color: ${colors.primary};
  font-size: 0.6875rem;
  padding: 0.1rem 0.3rem;
  border-radius: 0.75rem;
  font-weight: 600;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid ${colors.primary}15;
  min-width: 1rem;
  height: 1rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
`;

const MobileCartButton = styled(NavButton)`
  @media screen and (min-width: 768px) {
    display: none;
  }
`;

export default function Header() {
  const { cartProducts } = useContext(CartContext);
  const [mobileNavActive, setMobileNavActive] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [searchActive, setSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [resultsVisible, setResultsVisible] = useState(false);
  const searchInputRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (mobileNavActive || searchActive) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileNavActive, searchActive]);

  const searchProducts = debounce(async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.get(
        "/api/products?phrase=" + encodeURIComponent(query)
      );
      setSearchResults(response.data);
      setTimeout(() => setResultsVisible(true), 100);
    } catch (error) {
      console.error("Error searching products:", error);
      setSearchResults([]);
    }
    setIsLoading(false);
  }, 300);

  useEffect(() => {
    setResultsVisible(false);
    searchProducts(searchQuery);
  }, [searchQuery]);

  const closeMobileNav = () => {
    setMobileNavActive(false);
  };

  const closeSearch = () => {
    setSearchActive(false);
    setSearchQuery("");
    setSearchResults([]);
    setResultsVisible(false);
  };

  useEffect(() => {
    if (searchActive && searchInputRef.current) {
      const timer = setTimeout(() => {
        searchInputRef.current.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [searchActive]);

  return (
    <>
      <StyledHeader
        className={`${isMounted ? "mounted" : ""} ${
          isScrolled ? "scrolled" : ""
        }`}
      >
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
            <NavButton
              onClick={() => setSearchActive(true)}
              aria-label="Open search"
            >
              <SearchIcon />
            </NavButton>
            <MobileCartButton
              onClick={() => (window.location.href = "/cart")}
              aria-label="View cart"
            >
              <CartIconMobile />
              {cartProducts.length > 0 && (
                <CartBubble>{cartProducts.length}</CartBubble>
              )}
            </MobileCartButton>
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
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
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

        </MobileNavContent>
      </MobileNav>

      <Overlay
        className={`${isMounted ? "mounted" : ""} ${
          mobileNavActive ? "isOpen" : ""
        }`}
        onClick={closeMobileNav}
      />

      <SearchContainer className={searchActive ? "isOpen" : ""}>
        <SearchHeader>
          <SearchInput
            ref={searchInputRef}
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <CloseSearchButton onClick={closeSearch} aria-label="Close search">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </CloseSearchButton>
        </SearchHeader>
        <Divider />
        <SearchResults className={resultsVisible ? "visible" : ""}>
          {isLoading ? (
            <LoadingSpinner />
          ) : searchQuery && searchResults.length === 0 ? (
            <NoResults>No products found for "{searchQuery}"</NoResults>
          ) : (
            searchResults.map((product) => (
              <SearchResultItem
                key={product._id}
                href={`/product/${product._id}`}
                onClick={closeSearch}
              >
                <SearchResultImage>
                  <img src={product.images?.[0]} alt={product.title} />
                </SearchResultImage>
                <SearchResultInfo>
                  <SearchResultTitle>{product.title}</SearchResultTitle>
                  <SearchResultPrice>
                    {product.price?.toFixed(2)}
                  </SearchResultPrice>
                </SearchResultInfo>
              </SearchResultItem>
            ))
          )}
        </SearchResults>
      </SearchContainer>
      <SearchOverlay
        className={`${isMounted ? "mounted" : ""} ${
          searchActive ? "isOpen" : ""
        }`}
        onClick={closeSearch}
      />
    </>
  );
}
