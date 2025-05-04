import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import styled from "styled-components";
import * as colors from "@/lib/colors";

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: fadeIn 0.2s ease-out;
  backdrop-filter: blur(2px);

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @media (max-width: 768px) {
    align-items: flex-end;
    padding: 0; /* Remove any padding */
  }
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 16px;
  max-width: 650px;
  width: 95%;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  animation: slideUp 0.3s ease-out;
  position: relative;
  overflow: hidden;

  @keyframes slideUp {
    from {
      transform: translateY(50px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  @media (max-width: 768px) {
    width: 100%;
    max-width: 100%;
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
    max-height: 90vh;
    height: 90vh; /* Fixed height on mobile */
    margin: 0; /* Remove any margin */
    animation: slideUpMobile 0.3s ease-out;

    @keyframes slideUpMobile {
      from {
        transform: translateY(100%);
      }
      to {
        transform: translateY(0);
      }
    }
  }
`;

const ModalHeader = styled.div`
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid ${colors.background};
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
`;

const ModalTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  color: ${colors.textDark};
  margin: 0;
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: ${colors.textLight};
  transition: all 0.2s ease;

  &:hover {
    background: ${colors.background};
    color: ${colors.textDark};
  }

  svg {
    width: 24px;
    height: 24px;
  }
`;

const ModalBody = styled.div`
  padding: 1rem 1.5rem;
  overflow-y: auto;
  max-height: calc(85vh - 70px); /* Adjust based on header height */

  @media (max-width: 768px) {
    max-height: calc(90vh - 70px);
    padding: 0.75rem 1rem; /* Reduced padding on mobile */
  }
`;

const ShippingOptionsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const ShippingOptionItem = styled.div`
  display: flex;
  align-items: center;
  padding: 1rem;
  border-radius: 12px;
  background: ${(props) =>
    props.selected ? `${colors.primary}08` : colors.white};
  border: 1.5px solid
    ${(props) => (props.selected ? colors.primary : "rgba(0,0,0,0.06)")};
  cursor: pointer;
  transition: all 0.15s ease-out;
  position: relative;

  &:hover {
    border-color: ${(props) =>
      props.selected ? colors.primary : "rgba(0,0,0,0.1)"};
    background: ${(props) =>
      props.selected ? `${colors.primary}08` : "rgba(0,0,0,0.01)"};
  }

  @media (max-width: 768px) {
    padding: 0.75rem;
    flex-wrap: wrap; /* Allow wrapping on mobile */
  }
`;

const OptionCheckbox = styled.div`
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 1.5px solid
    ${(props) => (props.selected ? colors.primary : "rgba(0,0,0,0.15)")};
  margin-right: 1rem;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &::after {
    content: "";
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: ${(props) => (props.selected ? colors.primary : "transparent")};
    transition: all 0.2s ease;
  }
`;

const CarrierLogo = styled.div`
  width: 42px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1rem;
  flex-shrink: 0;
  background: ${colors.background};
  border-radius: 8px;
  padding: 8px;

  img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
  }

  @media (max-width: 768px) {
    width: 36px;
    height: 36px;
    margin-right: 0.75rem;
    padding: 6px;
  }
`;

const OptionInfo = styled.div`
  flex-grow: 1;

  @media (max-width: 768px) {
    min-width: 0; /* Allow text to truncate */
    width: calc(100% - 140px); /* Make space for price and checkbox */
  }
`;

const OptionName = styled.div`
  font-weight: 600;
  color: ${colors.textDark};
  font-size: 1rem;
  margin-bottom: 0.25rem;

  @media (max-width: 768px) {
    font-size: 0.9rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

const OptionService = styled.div`
  font-size: 0.85rem;
  color: ${colors.textLight};

  @media (max-width: 768px) {
    font-size: 0.8rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

const OptionMeta = styled.div`
  display: flex;
  align-items: center;
  margin-top: 0.5rem;
  font-size: 0.8rem;
  color: ${colors.textLight};

  svg {
    width: 14px;
    height: 14px;
    margin-right: 0.25rem;
    color: ${colors.accent};
  }

  span + span {
    margin-left: 1rem;
    display: flex;
    align-items: center;
  }

  @media (max-width: 768px) {
    font-size: 0.75rem;
    margin-top: 0.3rem;
  }
`;

const OptionBadge = styled.div`
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.65rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  margin-right: 0.75rem;
  color: white;
  background: ${(props) => {
    if (props.type === "Cheapest") return "#34C759";
    if (props.type === "Fastest") return "#007AFF";
    return "#9859F7"; // Best Value
  }};

  @media (max-width: 768px) {
    padding: 0.2rem 0.4rem;
    font-size: 0.6rem;
    margin-right: 0.5rem;
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
  }
`;

const OptionPrice = styled.div`
  font-weight: 700;
  color: ${colors.textDark};
  font-size: 1.1rem;
  margin-left: 1rem;
  flex-shrink: 0;

  span {
    font-size: 0.75rem;
    font-weight: 400;
    color: ${colors.textLight};
    margin-left: 2px;
  }

  @media (max-width: 768px) {
    font-size: 1rem;
    margin-left: 0.5rem;
  }
`;

export default function ShippingOptionsModal({
  options,
  selectedOption,
  onSelectOption,
  onClose,
  getCarrierLogo,
  formatDeliveryEstimate,
}) {
  const modalRef = useRef(null);
  const modalContentRef = useRef(null);

  // Handle escape key press to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Trap focus within modal
  useEffect(() => {
    if (!modalContentRef.current) return;

    const focusableElements = modalContentRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e) => {
      if (e.key === "Tab") {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    };

    window.addEventListener("keydown", handleTabKey);
    firstElement.focus();

    return () => window.removeEventListener("keydown", handleTabKey);
  }, []);

  // Prevent scroll on body
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // Handle outside click to close modal
  const handleOverlayClick = (e) => {
    if (modalRef.current === e.target) {
      onClose();
    }
  };

  // Find tags for cheapest, fastest, and best value options
  const cheapestOption = [...options].sort((a, b) => a.price - b.price)[0];

  // Extract delivery days function (same as in ShippingOptions component)
  const getDays = (str) => {
    const match = str?.match(/(\d+)[\s-]*day/i);
    return match ? parseInt(match[1]) : 999;
  };

  const fastestOption = [...options].reduce((prev, current) => {
    const prevDays = getDays(prev.estimatedDelivery);
    const currentDays = getDays(current.estimatedDelivery);
    return prevDays < currentDays ? prev : current;
  }, options[0]);

  // Calculate best value based on price and speed
  const getBestValue = () => {
    const remainingOptions = options.filter(
      (opt) => opt.id !== cheapestOption.id && opt.id !== fastestOption.id
    );

    if (remainingOptions.length === 0) return null;

    return remainingOptions.reduce((prev, current) => {
      const getDays = (str) => {
        const match = str?.match(/(\d+)[\s-]*day/i);
        return match ? parseInt(match[1]) : 10;
      };

      const getPriceSpeedRatio = (option) => {
        const days = getDays(option.estimatedDelivery);
        return option.price * days;
      };

      const prevRatio = getPriceSpeedRatio(prev);
      const currentRatio = getPriceSpeedRatio(current);

      return prevRatio < currentRatio ? prev : current;
    }, remainingOptions[0]);
  };

  const bestValueOption = getBestValue();

  // Use createPortal to render modal at document body level
  if (typeof document === "undefined") return null; // SSR check

  return createPortal(
    <ModalOverlay
      ref={modalRef}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="shipping-options-title"
    >
      <ModalContent ref={modalContentRef}>
        <ModalHeader>
          <ModalTitle id="shipping-options-title">
            All Shipping Options
          </ModalTitle>
          <CloseButton onClick={onClose} aria-label="Close dialog">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6 18L18 6M6 6L18 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </CloseButton>
        </ModalHeader>

        <ModalBody>
          <ShippingOptionsList>
            {options.map((option) => {
              // Determine if this option has a special badge
              let badgeType = null;
              if (option.id === cheapestOption.id) badgeType = "Cheapest";
              else if (option.id === fastestOption.id) badgeType = "Fastest";
              else if (bestValueOption && option.id === bestValueOption.id)
                badgeType = "Best Value";

              return (
                <ShippingOptionItem
                  key={option.id}
                  selected={selectedOption?.id === option.id}
                  onClick={() => {
                    onSelectOption(option);
                    onClose();
                  }}
                  tabIndex="0"
                  role="radio"
                  aria-checked={selectedOption?.id === option.id}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      onSelectOption(option);
                      onClose();
                      e.preventDefault();
                    }
                  }}
                >
                  <OptionCheckbox selected={selectedOption?.id === option.id} />
                  <CarrierLogo>
                    <img
                      src={getCarrierLogo(option.carrier)}
                      alt={option.carrier}
                    />
                  </CarrierLogo>

                  <OptionInfo>
                    <OptionName>{option.carrier}</OptionName>
                    <OptionService>{option.service}</OptionService>
                    <OptionMeta>
                      <span>
                        <svg
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
                      </span>
                    </OptionMeta>
                  </OptionInfo>

                  {badgeType && (
                    <OptionBadge type={badgeType}>{badgeType}</OptionBadge>
                  )}
                  <OptionPrice>
                    ${option.price.toFixed(2)}
                    <span>USD</span>
                  </OptionPrice>
                </ShippingOptionItem>
              );
            })}
          </ShippingOptionsList>
        </ModalBody>
      </ModalContent>
    </ModalOverlay>,
    document.body
  );
}
