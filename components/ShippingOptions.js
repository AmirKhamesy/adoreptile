import { useState, useEffect } from "react";
import styled from "styled-components";
import axios from "axios";
import { useSession } from "next-auth/react";
import * as colors from "@/lib/colors";
import ShippingOptionsModal from "./ShippingOptionsModal";

const ShippingOptionsContainer = styled.div`
  width: 100%;
  margin: 1.5rem 0 2rem;
  position: relative;
  /* Fix any overflow issues with parent containers */
  box-sizing: border-box;
  max-width: 100%;
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const SectionTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: ${colors.textDark};
  margin: 0;
`;

const DeliveryInfo = styled.div`
  font-size: 0.75rem;
  color: ${colors.textLight};
  font-weight: 500;
`;

const OptionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 1rem;
  margin-top: 0.5rem;
  width: 100%;

  /* Responsive adjustments */
  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }

  /* Ensure no horizontal overflow */
  max-width: 100%;
`;

const ShippingOption = styled.div`
  display: flex;
  flex-direction: column;
  padding: 1.25rem;
  border-radius: 12px;
  background: ${colors.white};
  border: 1.5px solid
    ${(props) => (props.selected ? colors.primary : "rgba(0,0,0,0.06)")};
  cursor: pointer;
  transition: all 0.15s ease-out;
  position: relative;
  box-shadow: ${(props) =>
    props.selected
      ? `0 4px 14px ${colors.primary}20`
      : "0 2px 6px rgba(0,0,0,0.03)"};

  /* Fix height issues */
  height: 100%;
  min-height: 120px;
  box-sizing: border-box;
  overflow: visible;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
  }

  ${(props) =>
    props.selected &&
    `
    background: ${colors.primary}06;
  `}
`;

const OptionHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 0.75rem;
`;

const CarrierLogo = styled.div`
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 0.75rem;
  flex-shrink: 0;
  background: ${colors.background};
  border-radius: 8px;
  padding: 6px;

  img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
  }
`;

const OptionTag = styled.div`
  position: absolute;
  top: -8px;
  right: 12px;
  background: ${(props) => {
    if (props.type === "Cheapest") return "#34C759";
    if (props.type === "Fastest") return "#007AFF";
    return "#9859F7"; // Best Value
  }};
  color: white;
  font-size: 0.625rem;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 12px;
  letter-spacing: 0.02em;
  box-shadow: 0 2px 6px
    ${(props) => {
      if (props.type === "Cheapest") return "rgba(52, 199, 89, 0.4)";
      if (props.type === "Fastest") return "rgba(0, 122, 255, 0.4)";
      return "rgba(152, 89, 247, 0.4)"; // Best Value
    }};
  z-index: 2;
`;

const RadioCircle = styled.div`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 1.5px solid
    ${(props) => (props.selected ? colors.primary : "rgba(0,0,0,0.15)")};
  position: absolute;
  top: 1.25rem;
  right: 1.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &::after {
    content: "";
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: ${(props) => (props.selected ? colors.primary : "transparent")};
    transition: all 0.2s ease;
  }
`;

const ShippingDetails = styled.div`
  flex-grow: 1;
`;

const ShippingName = styled.div`
  font-weight: 600;
  color: ${colors.textDark};
  font-size: 0.95rem;
  margin-bottom: 0.5rem;
  /* Ensure no text overflow */
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ShippingService = styled.div`
  font-size: 0.8rem;
  color: ${colors.textLight};
  margin-bottom: 0.5rem;
`;

const ShippingDelivery = styled.div`
  font-size: 0.75rem;
  font-weight: 500;
  color: ${colors.textLight};
  margin-top: auto;
  padding-top: 0.5rem;
  display: flex;
  align-items: center;

  svg {
    margin-right: 4px;
    color: ${colors.accent};
  }
`;

const ShippingPrice = styled.div`
  font-weight: 700;
  color: ${colors.textDark};
  font-size: 1.1rem;
  margin-top: 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const PriceAmount = styled.span`
  display: flex;
  align-items: baseline;

  span {
    font-size: 0.75rem;
    font-weight: 400;
    color: ${colors.textLight};
    margin-left: 4px;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2.5rem 1.5rem;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 16px;
  backdrop-filter: blur(10px);
  border: 1px solid ${colors.background};
`;

const LoadingSpinner = styled.div`
  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  width: 36px;
  height: 36px;
  margin-bottom: 1rem;
  color: ${colors.primary};
  animation: spin 1s linear infinite;
`;

const LoadingText = styled.div`
  font-size: 0.875rem;
  color: ${colors.textDark};
  font-weight: 500;
  text-align: center;
`;

const LoadingShimmer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 1rem;
  margin-top: 0.5rem;
  width: 100%;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const ShimmerOption = styled.div`
  @keyframes shimmer {
    0% {
      background-position: -200% 0;
    }
    100% {
      background-position: 200% 0;
    }
  }

  height: 120px;
  border-radius: 12px;
  background: linear-gradient(
    90deg,
    ${colors.background}00 25%,
    ${colors.background}30 50%,
    ${colors.background}00 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border: 1px solid ${colors.background};
`;

const Message = styled.div`
  text-align: center;
  padding: 2rem 1.5rem;
  color: ${colors.textDark};
  background: ${colors.white};
  border-radius: 16px;
  font-size: 0.95rem;
  font-weight: 500;
  border: 1px solid ${colors.background};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
  line-height: 1.5;
  margin: 1rem 0;
`;

const WarningMessage = styled(Message)`
  background: #fff9f0;
  color: #96611e;
  border: 1px solid #ffe8bb;
  display: flex;
  flex-direction: column;
  align-items: center;

  svg {
    margin-bottom: 0.75rem;
    color: #f59e0b;
  }
`;

const ErrorMessage = styled(Message)`
  background: #fff0f0;
  color: #a12a2a;
  border: 1px solid #ffcaca;
  display: flex;
  flex-direction: column;
  align-items: center;

  svg {
    margin-bottom: 0.75rem;
    color: #dc2626;
  }
`;

// Add divider for custom selection
const CustomSelectionDivider = styled.div`
  width: 100%;
  margin: 1rem 0;
  border-top: 1px dashed ${colors.background};
  position: relative;

  &::after {
    content: "Custom Selection";
    position: absolute;
    top: -10px;
    left: 50%;
    transform: translateX(-50%);
    background: white;
    padding: 0 0.75rem;
    font-size: 0.7rem;
    color: ${colors.textLight};
    font-weight: 500;
  }
`;

// Add More Options button
const MoreOptionsButton = styled.button`
  width: 100%;
  padding: 0.875rem;
  background: white;
  border: 1.5px dashed ${colors.background};
  border-radius: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  font-weight: 500;
  color: ${colors.textDark};
  transition: all 0.15s ease;
  margin-top: 1rem;

  &:hover {
    background: ${colors.background};
    border-color: rgba(0, 0, 0, 0.1);
  }

  svg {
    margin-right: 0.5rem;
    width: 18px;
    height: 18px;
  }
`;

// Helper to get carrier logo and map carrier names
const getCarrierLogo = (carrierCode) => {
  const carriers = {
    UPS: "/ups-logo.svg",
    FedEx: "/fedex-logo.svg",
    Canpar: "/canpar-logo.svg",
    Canadapost: "/canadapost-logo.svg",
    GLS: "/gls-logo.svg",
    Purolator: "/purolator-logo.svg",
  };

  return carriers[carrierCode] || "/generic-shipping-logo.svg";
};

// Format the delivery string to be more user-friendly
const formatDeliveryEstimate = (estimatedDelivery) => {
  if (!estimatedDelivery) return "Delivery estimate unavailable";

  // Check if it contains dates
  if (estimatedDelivery.includes("-") || estimatedDelivery.includes("/")) {
    return `Estimated delivery: ${estimatedDelivery}`;
  }

  // Check if it contains "day" or "days"
  if (estimatedDelivery.toLowerCase().includes("day")) {
    return `Delivery in ${estimatedDelivery}`;
  }

  return `Delivery: ${estimatedDelivery}`;
};

export default function ShippingOptions({ products, cartProducts, onSelect }) {
  const { data: session } = useSession();
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [userAddress, setUserAddress] = useState(null);
  const [showAllOptions, setShowAllOptions] = useState(false);
  const [isCustomSelection, setIsCustomSelection] = useState(false);

  useEffect(() => {
    if (!session) return;

    // Get user address
    const fetchAddress = async () => {
      try {
        const response = await axios.get("/api/address");
        setUserAddress(response.data);
      } catch (err) {
        console.error("Error fetching address:", err);
      }
    };

    fetchAddress();
  }, [session]);

  useEffect(() => {
    // Only fetch shipping options if we have products, a session, and a complete address
    if (
      !products?.length ||
      !cartProducts?.length ||
      !session ||
      !userAddress ||
      !userAddress.streetAddress ||
      !userAddress.city ||
      !userAddress.postalCode ||
      !userAddress.country
    ) {
      return;
    }

    const fetchShippingOptions = async () => {
      setLoading(true);
      setError(null);

      try {
        // Create items array with product IDs and quantities
        const items = [];
        const productMap = {};

        // Create a map of products for easy lookup
        products.forEach((product) => {
          productMap[product._id] = product;
        });

        // Count occurrences of each product ID
        cartProducts.forEach((id) => {
          const existingItem = items.find((item) => item.productId === id);
          if (existingItem) {
            existingItem.quantity++;
          } else {
            items.push({ productId: id, quantity: 1 });
          }
        });

        // Get shipping options
        const response = await axios.post("/api/shipping/quotes", {
          items,
          fromAddressId: process.env.NEXT_PUBLIC_STORE_ADDRESS_ID, // Use public env var if available
          toAddressId: userAddress._id,
          orderValue: products.reduce((sum, product) => {
            return (
              sum +
              product.price *
                cartProducts.filter((id) => id === product._id).length
            );
          }, 0),
        });

        setOptions(response.data.quotes || []);

        // Auto-select cheapest option if no option is selected
        if (response.data.quotes?.length && !selectedOption) {
          const cheapestOption = [...response.data.quotes].sort(
            (a, b) => a.price - b.price
          )[0];
          setSelectedOption(cheapestOption);
          if (onSelect) onSelect(cheapestOption);
        }
      } catch (err) {
        console.error("Error fetching shipping options:", err);
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchShippingOptions();
  }, [products, cartProducts, session, userAddress, onSelect]);

  const handleSelectOption = (option) => {
    setSelectedOption(option);

    // Check if selected option is one of the top 3 options
    const isTopOption =
      option.id === cheapestOption?.id ||
      option.id === fastestOption?.id ||
      option.id === bestValueOption?.id;

    setIsCustomSelection(!isTopOption);

    if (onSelect) onSelect(option);
  };

  // Find the top 3 options - cheapest, fastest, and best value
  const cheapestOption = options.length
    ? [...options].sort((a, b) => a.price - b.price)[0]
    : null;

  // Helper function to extract delivery days
  const getDays = (str) => {
    const match = str?.match(/(\d+)[\s-]*day/i);
    return match ? parseInt(match[1]) : 999;
  };

  const fastestOption = options.length
    ? [...options].reduce((prev, current) => {
        const prevDays = getDays(prev.estimatedDelivery);
        const currentDays = getDays(current.estimatedDelivery);
        return prevDays <= currentDays ? prev : current;
      }, options[0])
    : null;

  // Calculate best value based on price and speed
  const getBestValue = () => {
    if (!options.length || options.length < 3) return null;

    const remainingOptions = options.filter(
      (opt) => opt.id !== cheapestOption?.id && opt.id !== fastestOption?.id
    );

    if (remainingOptions.length === 0) return null;

    return remainingOptions.reduce((prev, current) => {
      const getPriceSpeedRatio = (option) => {
        const days = getDays(option.estimatedDelivery) || 1;
        // Lower price and faster delivery = better value (lower ratio)
        return option.price / (10 - Math.min(days, 9));
      };

      const prevRatio = getPriceSpeedRatio(prev);
      const currentRatio = getPriceSpeedRatio(current);

      return prevRatio <= currentRatio ? prev : current;
    }, remainingOptions[0]);
  };

  const bestValueOption = getBestValue();

  // Filter to only show top 3 options
  const topOptions = options.filter(
    (option) =>
      option.id === cheapestOption?.id ||
      option.id === fastestOption?.id ||
      (bestValueOption && option.id === bestValueOption.id)
  );

  if (!session) {
    return (
      <ShippingOptionsContainer>
        <WarningMessage>
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 8V12M12 16H12.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Please log in to see shipping options for your order.
        </WarningMessage>
      </ShippingOptionsContainer>
    );
  }

  if (
    !userAddress?.streetAddress ||
    !userAddress?.city ||
    !userAddress?.postalCode ||
    !userAddress?.country
  ) {
    return (
      <ShippingOptionsContainer>
        <WarningMessage>
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 8V12M12 16H12.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Please complete your shipping address to see delivery options.
        </WarningMessage>
      </ShippingOptionsContainer>
    );
  }

  if (loading) {
    return (
      <ShippingOptionsContainer>
        <LoadingContainer>
          <LoadingSpinner>
            <svg
              width="36"
              height="36"
              viewBox="0 0 36 36"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M18 3C9.71573 3 3 9.71573 3 18C3 26.2843 9.71573 33 18 33C26.2843 33 33 26.2843 33 18C33 13.9118 31.3645 10.2056 28.7121 7.5"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </LoadingSpinner>
          <LoadingText>Finding the best shipping rates for you...</LoadingText>
        </LoadingContainer>

        <LoadingShimmer>
          <ShimmerOption />
          <ShimmerOption />
          <ShimmerOption />
        </LoadingShimmer>
      </ShippingOptionsContainer>
    );
  }

  if (error) {
    return (
      <ShippingOptionsContainer>
        <ErrorMessage>
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 9V11M12 15H12.01M5.07183 19H18.9282C20.4678 19 21.4301 17.3333 20.6603 16L13.7321 4C12.9623 2.66667 11.0378 2.66667 10.268 4L3.33978 16C2.56998 17.3333 3.53223 19 5.07183 19Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          We couldn't calculate shipping rates at this time. Please try again
          later.
        </ErrorMessage>
      </ShippingOptionsContainer>
    );
  }

  if (!options?.length) {
    return (
      <ShippingOptionsContainer>
        <Message>
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M9 17H15M9 13H15M9 9H10M19 21H5C3.89543 21 3 20.1046 3 19V5C3 3.89543 3.89543 3 5 3H19C20.1046 3 21 3.89543 21 5V19C21 20.1046 20.1046 21 19 21Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          No shipping options are available for your location right now. Please
          check your address or contact customer support.
        </Message>
      </ShippingOptionsContainer>
    );
  }

  return (
    <ShippingOptionsContainer>
      <SectionHeader>
        <SectionTitle>Shipping options</SectionTitle>
        <DeliveryInfo>
          Shipping to {userAddress.city}, {userAddress.country}
        </DeliveryInfo>
      </SectionHeader>

      <OptionsGrid>
        {/* Display top options first */}
        {topOptions.map((option) => {
          // Determine tag type based on which special option it is
          let tagType = null;
          if (option.id === cheapestOption?.id) tagType = "Cheapest";
          else if (option.id === fastestOption?.id) tagType = "Fastest";
          else if (bestValueOption && option.id === bestValueOption.id)
            tagType = "Best Value";

          return (
            <ShippingOption
              key={option.id}
              onClick={() => handleSelectOption(option)}
              selected={selectedOption?.id === option.id}
            >
              {tagType && <OptionTag type={tagType}>{tagType}</OptionTag>}
              <RadioCircle selected={selectedOption?.id === option.id} />

              <OptionHeader>
                <CarrierLogo>
                  <img
                    src={getCarrierLogo(option.carrier)}
                    alt={option.carrier}
                  />
                </CarrierLogo>
                <ShippingName>{option.carrier}</ShippingName>
              </OptionHeader>

              <ShippingService>{option.service}</ShippingService>

              <ShippingDelivery>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 8V12L15 15M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                {formatDeliveryEstimate(option.estimatedDelivery)}
              </ShippingDelivery>

              <ShippingPrice>
                <PriceAmount>
                  ${option.price.toFixed(2)} <span>USD</span>
                </PriceAmount>
              </ShippingPrice>
            </ShippingOption>
          );
        })}

        {/* Display custom selection if it's not one of the top options */}
        {isCustomSelection && selectedOption && (
          <>
            <CustomSelectionDivider />
            <ShippingOption
              key={selectedOption.id}
              onClick={() => handleSelectOption(selectedOption)}
              selected={true}
            >
              <RadioCircle selected={true} />

              <OptionHeader>
                <CarrierLogo>
                  <img
                    src={getCarrierLogo(selectedOption.carrier)}
                    alt={selectedOption.carrier}
                  />
                </CarrierLogo>
                <ShippingName>{selectedOption.carrier}</ShippingName>
              </OptionHeader>

              <ShippingService>{selectedOption.service}</ShippingService>

              <ShippingDelivery>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 8V12L15 15M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                {formatDeliveryEstimate(selectedOption.estimatedDelivery)}
              </ShippingDelivery>

              <ShippingPrice>
                <PriceAmount>
                  ${selectedOption.price.toFixed(2)} <span>USD</span>
                </PriceAmount>
              </ShippingPrice>
            </ShippingOption>
          </>
        )}
      </OptionsGrid>

      {/* More options button */}
      <MoreOptionsButton onClick={() => setShowAllOptions(true)}>
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M5 12H19M12 5V19"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        View More Shipping Options
      </MoreOptionsButton>

      {/* Modal for all options */}
      {showAllOptions && (
        <ShippingOptionsModal
          options={options}
          selectedOption={selectedOption}
          onSelectOption={handleSelectOption}
          onClose={() => setShowAllOptions(false)}
          getCarrierLogo={getCarrierLogo}
          formatDeliveryEstimate={formatDeliveryEstimate}
        />
      )}
    </ShippingOptionsContainer>
  );
}
