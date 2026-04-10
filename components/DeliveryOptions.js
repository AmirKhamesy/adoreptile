import { useState, useEffect, useRef, useCallback } from "react";
import styled from "styled-components";
import axios from "axios";
import { useSession } from "next-auth/react";
import * as colors from "@/lib/colors";
import ShippingOptionsModal from "./ShippingOptionsModal";

// ─── Tab selector ────────────────────────────────────────────────────────────

const SegmentedControl = styled.div`
  display: flex;
  background: ${colors.background};
  border-radius: 14px;
  padding: 4px;
  gap: 2px;
  margin-bottom: 1.5rem;
`;

const Tab = styled.button`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 0.6rem 0.5rem;
  border: none;
  border-radius: 10px;
  font-size: 0.82rem;
  font-weight: ${(p) => (p.active ? "600" : "500")};
  cursor: ${(p) => (p.disabled ? "not-allowed" : "pointer")};
  transition: all 0.18s ease;
  background: ${(p) => (p.active ? colors.white : "transparent")};
  color: ${(p) => {
    if (p.disabled) return "#b0b8b4";
    return p.active ? colors.primary : colors.textLight;
  }};
  box-shadow: ${(p) =>
    p.active ? `0 2px 8px ${colors.primary}18` : "none"};

  svg {
    width: 15px;
    height: 15px;
    flex-shrink: 0;
  }

  @media (max-width: 480px) {
    font-size: 0.75rem;
    padding: 0.55rem 0.35rem;
    gap: 4px;
  }
`;

// ─── Pickup card ─────────────────────────────────────────────────────────────

const InfoCard = styled.div`
  background: ${(p) => p.bg || `${colors.primary}06`};
  border: 1.5px solid ${(p) => p.border || `${colors.primary}25`};
  border-radius: 14px;
  padding: 1.25rem 1.25rem 1rem;
  display: flex;
  align-items: flex-start;
  gap: 1rem;
`;

const IconCircle = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${(p) => p.bg || `${colors.primary}15`};
  color: ${(p) => p.color || colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const CardBody = styled.div`
  flex: 1;
`;

const CardTitle = styled.div`
  font-weight: 600;
  font-size: 0.95rem;
  color: ${colors.textDark};
  margin-bottom: 0.2rem;
`;

const CardSub = styled.div`
  font-size: 0.78rem;
  color: ${colors.textLight};
  line-height: 1.45;
`;

const FreeBadge = styled.span`
  display: inline-flex;
  align-items: center;
  margin-top: 0.65rem;
  background: #34c75918;
  color: #27a349;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 20px;
`;

const PriceBadge = styled.span`
  display: inline-flex;
  align-items: center;
  margin-top: 0.65rem;
  background: ${colors.primary}12;
  color: ${colors.primary};
  font-size: 0.75rem;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 20px;
`;

const UnavailableBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-top: 0.65rem;
  background: #f5f5f7;
  color: #86868b;
  font-size: 0.75rem;
  font-weight: 500;
  padding: 3px 10px;
  border-radius: 20px;
`;

// ─── Delivery address form ────────────────────────────────────────────────────

const AddressForm = styled.div`
  position: relative;
  margin-bottom: 1rem;
`;

const AddressGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.6rem;
  margin-bottom: 0.6rem;

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const AddressInput = styled.input`
  width: 100%;
  padding: 0.7rem 0.875rem;
  border: 1.5px solid ${(p) => (p.focused ? colors.primary : `${colors.primary}20`)};
  border-radius: 10px;
  font-size: 0.875rem;
  color: ${colors.textDark};
  background: ${colors.white};
  outline: none;
  transition: border-color 0.15s, opacity 0.2s;
  box-sizing: border-box;
  opacity: ${(p) => (p.blurred ? 0.45 : 1)};
  filter: ${(p) => (p.blurred ? "blur(1.5px)" : "none")};
  pointer-events: ${(p) => (p.blurred ? "none" : "auto")};

  &::placeholder {
    color: ${colors.textLight}80;
  }
`;

const CheckingOverlay = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  color: ${colors.textLight};
  font-weight: 500;
  pointer-events: none;
  z-index: 1;
`;

const ResultCard = styled.div`
  border-radius: 12px;
  padding: 0.875rem 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: 0.25rem;
  background: ${(p) => (p.available ? `${colors.primary}07` : "#f5f5f7")};
  border: 1.5px solid ${(p) => (p.available ? `${colors.primary}30` : "rgba(0,0,0,0.08)")};
  transition: all 0.2s ease;
`;

const ResultIcon = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: ${(p) => (p.available ? `${colors.primary}15` : "#e5e5ea")};
  color: ${(p) => (p.available ? colors.primary : "#8e8e93")};
`;

const ResultBody = styled.div`
  flex: 1;
`;

const ResultTitle = styled.div`
  font-size: 0.85rem;
  font-weight: 600;
  color: ${(p) => (p.available ? colors.textDark : "#3a3a3c")};
  margin-bottom: 2px;
`;

const ResultSub = styled.div`
  font-size: 0.75rem;
  color: ${colors.textLight};
`;

// ─── Shipping list styles ─────────────────────────────────────────────────────

const ShippingOptionCard = styled.div`
  display: flex;
  flex-direction: column;
  padding: 1.1rem 1.1rem 1rem;
  border-radius: 12px;
  background: ${colors.white};
  border: 1.5px solid
    ${(p) => (p.selected ? colors.primary : "rgba(0,0,0,0.07)")};
  cursor: pointer;
  transition: all 0.15s ease-out;
  position: relative;
  box-shadow: ${(p) =>
    p.selected
      ? `0 4px 14px ${colors.primary}20`
      : "0 2px 6px rgba(0,0,0,0.03)"};
  ${(p) => p.selected && `background: ${colors.primary}06;`}

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.07);
  }
`;

const OptionsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 0.25rem;
`;

const OptionRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const CarrierLogo = styled.div`
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${colors.background};
  border-radius: 8px;
  padding: 5px;
  flex-shrink: 0;

  img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
  }
`;

const OptionMeta = styled.div`
  flex: 1;
`;

const OptionName = styled.div`
  font-weight: 600;
  font-size: 0.88rem;
  color: ${colors.textDark};
`;

const OptionService = styled.div`
  font-size: 0.75rem;
  color: ${colors.textLight};
  margin-top: 1px;
`;

const OptionPrice = styled.div`
  font-weight: 700;
  font-size: 1rem;
  color: ${colors.textDark};
  white-space: nowrap;
`;

const OptionTag = styled.div`
  position: absolute;
  top: -8px;
  right: 12px;
  background: ${(p) => {
    if (p.type === "Cheapest") return "#34C759";
    if (p.type === "Fastest") return "#007AFF";
    return "#9859F7";
  }};
  color: white;
  font-size: 0.6rem;
  font-weight: 700;
  padding: 3px 9px;
  border-radius: 10px;
  letter-spacing: 0.03em;
  box-shadow: 0 2px 6px
    ${(p) => {
      if (p.type === "Cheapest") return "rgba(52, 199, 89, 0.4)";
      if (p.type === "Fastest") return "rgba(0, 122, 255, 0.4)";
      return "rgba(152, 89, 247, 0.4)";
    }};
`;

const RadioDot = styled.div`
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 1.5px solid
    ${(p) => (p.selected ? colors.primary : "rgba(0,0,0,0.18)")};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.15s;

  &::after {
    content: "";
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: ${(p) => (p.selected ? colors.primary : "transparent")};
    transition: all 0.15s;
  }
`;

const DeliveryEst = styled.div`
  font-size: 0.72rem;
  color: ${colors.textLight};
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 3px;

  svg {
    color: ${colors.accent};
    flex-shrink: 0;
  }
`;

// ─── Loading / states ─────────────────────────────────────────────────────────

const LoadingRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 0;
  color: ${colors.textLight};
  font-size: 0.875rem;
`;

const Spinner = styled.div`
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  width: 20px;
  height: 20px;
  border: 2px solid ${colors.primary}30;
  border-top-color: ${colors.primary};
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  flex-shrink: 0;
`;

const ShimmerCard = styled.div`
  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
  height: 72px;
  border-radius: 12px;
  background: linear-gradient(
    90deg,
    ${colors.background} 25%,
    ${colors.background}60 50%,
    ${colors.background} 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;
`;

const Message = styled.div`
  text-align: center;
  padding: 1.5rem 1rem;
  color: ${colors.textLight};
  font-size: 0.875rem;
  border-radius: 12px;
  border: 1px solid ${colors.background};
  background: ${colors.white};
  line-height: 1.5;
`;

const MoreBtn = styled.button`
  width: 100%;
  margin-top: 0.75rem;
  padding: 0.7rem;
  background: ${colors.white};
  border: 1.5px dashed ${colors.background};
  border-radius: 10px;
  cursor: pointer;
  font-size: 0.82rem;
  font-weight: 500;
  color: ${colors.textLight};
  transition: all 0.15s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;

  &:hover {
    background: ${colors.background};
    color: ${colors.textDark};
  }

  svg { width: 14px; height: 14px; }
`;

// ─── Helper utilities ─────────────────────────────────────────────────────────

const getCarrierLogo = (carrier) => {
  const map = {
    UPS: "/ups-logo.svg",
    FedEx: "/fedex-logo.svg",
    Canpar: "/canpar-logo.svg",
    Canadapost: "/canadapost-logo.svg",
    GLS: "/gls-logo.svg",
    Purolator: "/purolator-logo.svg",
  };
  return map[carrier] || "/generic-shipping-logo.svg";
};

const formatDelivery = (str) => {
  if (!str) return "Estimate unavailable";
  if (str.toLowerCase().includes("day")) return `In ${str}`;
  if (str.includes("-") || str.includes("/")) return `Est. ${str}`;
  return str;
};

const getDays = (str) => {
  const m = str?.match(/(\d+)[\s-]*day/i);
  return m ? parseInt(m[1]) : 999;
};

// ─── Icons ────────────────────────────────────────────────────────────────────

const PickupTabIcon = () => (
  <svg viewBox="0 0 24 24" fill="none">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="currentColor" />
  </svg>
);

const DeliveryTabIcon = () => (
  <svg viewBox="0 0 24 24" fill="none">
    <path d="M1 3h15v13H1zM16 8h4l3 3v5h-7V8z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    <circle cx="5.5" cy="18.5" r="2.5" stroke="currentColor" strokeWidth="1.8" />
    <circle cx="18.5" cy="18.5" r="2.5" stroke="currentColor" strokeWidth="1.8" />
  </svg>
);

const ShippingTabIcon = () => (
  <svg viewBox="0 0 24 24" fill="none">
    <path d="M20 8H4a2 2 0 00-2 2v7h20v-7a2 2 0 00-2-2zM2 17h20M12 8V4M8 4h8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ClockIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
    <path d="M12 8V12L15 15M21 12C21 16.97 16.97 21 12 21C7.03 21 3 16.97 3 12C3 7.03 7.03 3 12 3C16.97 3 21 7.03 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

// ─── Main component ───────────────────────────────────────────────────────────

export default function DeliveryOptions({
  products,
  cartProducts,
  onSelect,
  pickupLocation,
  deliverySettings,
  userAddress,
}) {
  const { data: session } = useSession();

  const defaultTab = pickupLocation ? "pickup" : deliverySettings?.location?.lat ? "local_delivery" : "shipping";
  const [activeTab, setActiveTab] = useState(defaultTab);

  // Local delivery address fields (editable, pre-filled from saved address)
  const [dlvStreet, setDlvStreet] = useState("");
  const [dlvCity, setDlvCity] = useState("");
  const [dlvPostal, setDlvPostal] = useState("");
  const [dlvCountry, setDlvCountry] = useState("");
  const [focusedField, setFocusedField] = useState(null);

  // Local delivery state
  const [deliveryCheck, setDeliveryCheck] = useState(null); // { available, distanceKm, deliveryFee, reason }
  const [deliveryChecking, setDeliveryChecking] = useState(false);
  const checkTimerRef = useRef(null);

  // Shipping state
  const [shippingOptions, setShippingOptions] = useState([]);
  const [shippingLoading, setShippingLoading] = useState(false);
  const [shippingError, setShippingError] = useState(null);
  const [shippingLoaded, setShippingLoaded] = useState(false);
  const [selectedShippingOpt, setSelectedShippingOpt] = useState(null);
  const [showAllOptions, setShowAllOptions] = useState(false);

  const prevCartRef = useRef(null);
  const cachedOptionsRef = useRef(null);

  const hasAddress =
    userAddress?.streetAddress &&
    userAddress?.city &&
    userAddress?.postalCode &&
    userAddress?.country;

  // Pre-fill delivery address fields from saved address
  useEffect(() => {
    if (userAddress) {
      setDlvStreet(userAddress.streetAddress || "");
      setDlvCity(userAddress.city || "");
      setDlvPostal(userAddress.postalCode || "");
      setDlvCountry(userAddress.country || "");
    }
  }, [userAddress]);

  // Run delivery check against current field values
  const runDeliveryCheck = useCallback((street, city, postal, country) => {
    if (!street || !city || !postal || !country) return;
    setDeliveryChecking(true);
    setDeliveryCheck(null);
    axios
      .get("/api/delivery/check", {
        params: { streetAddress: street, city, postalCode: postal, country },
      })
      .then((res) => {
        setDeliveryCheck(res.data);
      })
      .catch(() =>
        setDeliveryCheck({ available: false, reason: "Could not check delivery area" })
      )
      .finally(() => setDeliveryChecking(false));
  }, []);

  // Auto-run check when local_delivery tab opens (if address is pre-filled)
  useEffect(() => {
    if (activeTab !== "local_delivery") return;
    if (dlvStreet && dlvCity && dlvPostal && dlvCountry && !deliveryCheck) {
      runDeliveryCheck(dlvStreet, dlvCity, dlvPostal, dlvCountry);
    }
  }, [activeTab]); // eslint-disable-line react-hooks/exhaustive-deps

  // Debounced check triggered on blur or after typing stops
  const scheduleCheck = (street, city, postal, country) => {
    clearTimeout(checkTimerRef.current);
    if (!street || !city || !postal || !country) return;
    checkTimerRef.current = setTimeout(() => {
      runDeliveryCheck(street, city, postal, country);
    }, 600);
  };

  // Auto-select pickup on mount
  useEffect(() => {
    if (pickupLocation) {
      const pickup = buildPickupOption(pickupLocation);
      onSelect && onSelect(pickup);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch shipping quotes lazily when shipping tab is selected
  useEffect(() => {
    if (activeTab !== "shipping") return;
    if (shippingLoaded && cachedOptionsRef.current) return;
    if (!products?.length || !cartProducts?.length || !hasAddress) return;

    const hasCartChanged = () => {
      if (!prevCartRef.current) return true;
      if (prevCartRef.current.length !== cartProducts.length) return true;
      const cur = {};
      cartProducts.forEach((id) => (cur[id] = (cur[id] || 0) + 1));
      const prev = {};
      prevCartRef.current.forEach((id) => (prev[id] = (prev[id] || 0) + 1));
      for (const id in cur) if (cur[id] !== prev[id]) return true;
      for (const id in prev) if (prev[id] !== cur[id]) return true;
      return false;
    };

    if (!hasCartChanged() && cachedOptionsRef.current) {
      setShippingOptions(cachedOptionsRef.current);
      return;
    }

    setShippingLoading(true);
    setShippingError(null);

    const items = [];
    cartProducts.forEach((id) => {
      const existing = items.find((i) => i.productId === id);
      if (existing) existing.quantity++;
      else items.push({ productId: id, quantity: 1 });
    });

    axios
      .post("/api/shipping/quotes", {
        items,
        toAddressId: userAddress._id,
        orderValue: products.reduce(
          (sum, p) =>
            sum + p.price * cartProducts.filter((id) => id === p._id).length,
          0
        ),
      })
      .then((res) => {
        const quotes = res.data.quotes || [];
        cachedOptionsRef.current = quotes;
        prevCartRef.current = [...cartProducts];
        setShippingOptions(quotes);
        setShippingLoaded(true);

        // Auto-select cheapest
        if (quotes.length && !selectedShippingOpt) {
          const cheapest = [...quotes].sort((a, b) => a.price - b.price)[0];
          setSelectedShippingOpt(cheapest);
          onSelect && onSelect(cheapest);
        }
      })
      .catch((err) => {
        setShippingError(err.response?.data?.message || "Failed to load shipping rates");
      })
      .finally(() => setShippingLoading(false));
  }, [activeTab, products, cartProducts, hasAddress, userAddress]);

  // When tab changes, update parent with the "default" selection for that tab
  const handleTabChange = (tab) => {
    setActiveTab(tab);

    if (tab === "pickup" && pickupLocation) {
      onSelect && onSelect(buildPickupOption(pickupLocation));
    } else if (tab === "local_delivery") {
      // Will resolve once delivery check is done
      onSelect && onSelect(null);
    } else if (tab === "shipping") {
      if (selectedShippingOpt) {
        onSelect && onSelect(selectedShippingOpt);
      } else {
        onSelect && onSelect(null);
      }
    }
  };

  const handleSelectShipping = (option) => {
    setSelectedShippingOpt(option);
    onSelect && onSelect(option);
  };

  // Confirm local delivery selection after check resolves
  useEffect(() => {
    if (activeTab !== "local_delivery") return;
    if (deliveryCheck?.available) {
      onSelect &&
        onSelect({
          id: "local_delivery",
          isLocalDelivery: true,
          carrier: "Local",
          service: "Local Delivery",
          price: deliveryCheck.deliveryFee || 15,
          deliveryAddress: {
            streetAddress: dlvStreet,
            city: dlvCity,
            postalCode: dlvPostal,
            country: dlvCountry,
          },
        });
    } else if (deliveryCheck && !deliveryCheck.available) {
      onSelect && onSelect(null);
    }
  }, [deliveryCheck, activeTab]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Determine top shipping options ────────────────────────────────────────

  const cheapestOpt = shippingOptions.length
    ? [...shippingOptions].sort((a, b) => a.price - b.price)[0]
    : null;

  const fastestOpt = shippingOptions.length
    ? [...shippingOptions].reduce((prev, cur) =>
        getDays(cur.estimatedDelivery) < getDays(prev.estimatedDelivery) ? cur : prev
      )
    : null;

  const getBestValue = () => {
    if (shippingOptions.length < 3) return null;
    const rest = shippingOptions.filter(
      (o) => o.id !== cheapestOpt?.id && o.id !== fastestOpt?.id
    );
    if (!rest.length) return null;
    return rest.reduce((prev, cur) => {
      const ratio = (o) => o.price / (10 - Math.min(getDays(o.estimatedDelivery), 9));
      return ratio(cur) < ratio(prev) ? cur : prev;
    }, rest[0]);
  };

  const bestValueOpt = getBestValue();

  const topOptions = shippingOptions.filter(
    (o) =>
      o.id === cheapestOpt?.id ||
      o.id === fastestOpt?.id ||
      (bestValueOpt && o.id === bestValueOpt.id)
  );

  // ─── Render ─────────────────────────────────────────────────────────────────

  const hasLocalDelivery = !!deliverySettings?.location?.lat;
  const hasShipping = true; // could be false if all products are non-shippable

  return (
    <div>
      <SegmentedControl>
        {pickupLocation && (
          <Tab active={activeTab === "pickup"} onClick={() => handleTabChange("pickup")}>
            <PickupTabIcon />
            Store Pickup
          </Tab>
        )}

        {hasLocalDelivery && (
          <Tab
            active={activeTab === "local_delivery"}
            onClick={() => handleTabChange("local_delivery")}
          >
            <DeliveryTabIcon />
            Local Delivery
          </Tab>
        )}

        {hasShipping && (
          <Tab
            active={activeTab === "shipping"}
            onClick={() => handleTabChange("shipping")}
          >
            <ShippingTabIcon />
            Shipping
          </Tab>
        )}
      </SegmentedControl>

      {/* ── Store Pickup ── */}
      {activeTab === "pickup" && (
        <InfoCard bg="rgba(52,199,89,0.05)" border="rgba(52,199,89,0.25)">
          <IconCircle bg="rgba(52,199,89,0.12)" color="#27a349">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
                fill="currentColor"
              />
            </svg>
          </IconCircle>
          <CardBody>
            <CardTitle>{pickupLocation?.title || "Store Pickup"}</CardTitle>
            {pickupLocation?.address && (
              <CardSub>{pickupLocation.address}</CardSub>
            )}
            <FreeBadge>Free pickup</FreeBadge>
          </CardBody>
        </InfoCard>
      )}

      {/* ── Local Delivery ── */}
      {activeTab === "local_delivery" && (
        <>
          <AddressForm>
            <AddressInput
              placeholder="Street Address"
              value={dlvStreet}
              blurred={deliveryChecking}
              focused={focusedField === "street"}
              onFocus={() => setFocusedField("street")}
              onBlur={() => {
                setFocusedField(null);
                setDeliveryCheck(null);
                runDeliveryCheck(dlvStreet, dlvCity, dlvPostal, dlvCountry);
              }}
              onChange={(e) => {
                setDlvStreet(e.target.value);
                setDeliveryCheck(null);
                scheduleCheck(e.target.value, dlvCity, dlvPostal, dlvCountry);
              }}
              style={{ marginBottom: "0.6rem", display: "block" }}
            />
            <AddressGrid>
              <AddressInput
                placeholder="City"
                value={dlvCity}
                blurred={deliveryChecking}
                focused={focusedField === "city"}
                onFocus={() => setFocusedField("city")}
                onBlur={() => {
                  setFocusedField(null);
                  setDeliveryCheck(null);
                  runDeliveryCheck(dlvStreet, dlvCity, dlvPostal, dlvCountry);
                }}
                onChange={(e) => {
                  setDlvCity(e.target.value);
                  setDeliveryCheck(null);
                  scheduleCheck(dlvStreet, e.target.value, dlvPostal, dlvCountry);
                }}
              />
              <AddressInput
                placeholder="Postal Code"
                value={dlvPostal}
                blurred={deliveryChecking}
                focused={focusedField === "postal"}
                onFocus={() => setFocusedField("postal")}
                onBlur={() => {
                  setFocusedField(null);
                  setDeliveryCheck(null);
                  runDeliveryCheck(dlvStreet, dlvCity, dlvPostal, dlvCountry);
                }}
                onChange={(e) => {
                  setDlvPostal(e.target.value);
                  setDeliveryCheck(null);
                  scheduleCheck(dlvStreet, dlvCity, e.target.value, dlvCountry);
                }}
              />
            </AddressGrid>
            <AddressInput
              placeholder="Country"
              value={dlvCountry}
              blurred={deliveryChecking}
              focused={focusedField === "country"}
              onFocus={() => setFocusedField("country")}
              onBlur={() => {
                setFocusedField(null);
                setDeliveryCheck(null);
                runDeliveryCheck(dlvStreet, dlvCity, dlvPostal, dlvCountry);
              }}
              onChange={(e) => {
                setDlvCountry(e.target.value);
                setDeliveryCheck(null);
                scheduleCheck(dlvStreet, dlvCity, dlvPostal, e.target.value);
              }}
              style={{ display: "block" }}
            />

            {deliveryChecking && (
              <CheckingOverlay>
                <Spinner />
                Checking your area…
              </CheckingOverlay>
            )}
          </AddressForm>

          {deliveryCheck && (
            <ResultCard available={deliveryCheck.available}>
              <ResultIcon available={deliveryCheck.available}>
                {deliveryCheck.available ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M15 9L9 15M9 9l6 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                  </svg>
                )}
              </ResultIcon>
              <ResultBody>
                <ResultTitle available={deliveryCheck.available}>
                  {deliveryCheck.available ? "Delivery available!" : "Outside delivery range"}
                </ResultTitle>
                <ResultSub>
                  {deliveryCheck.available
                    ? `${deliveryCheck.distanceKm} km away · $${(deliveryCheck.deliveryFee || 15).toFixed(2)} delivery fee`
                    : deliveryCheck.reason}
                </ResultSub>
              </ResultBody>
              {deliveryCheck.available && (
                <PriceBadge style={{ margin: 0, flexShrink: 0 }}>
                  ${(deliveryCheck.deliveryFee || 15).toFixed(2)}
                </PriceBadge>
              )}
            </ResultCard>
          )}
        </>
      )}

      {/* ── Shipping ── */}
      {activeTab === "shipping" && (
        <>
          {!hasAddress ? (
            <Message>Please save your shipping address in your account to see carrier rates.</Message>
          ) : shippingLoading ? (
            <>
              <LoadingRow>
                <Spinner />
                Finding the best rates for you…
              </LoadingRow>
              <OptionsList style={{ marginTop: "0.5rem" }}>
                <ShimmerCard />
                <ShimmerCard />
                <ShimmerCard />
              </OptionsList>
            </>
          ) : shippingError ? (
            <Message>
              Could not load shipping rates. Please try again later.
            </Message>
          ) : shippingOptions.length === 0 ? (
            <Message>No shipping options available for your address.</Message>
          ) : (
            <>
              <OptionsList>
                {topOptions
                  .sort((a, b) => {
                    if (a.id === bestValueOpt?.id) return -1;
                    if (b.id === bestValueOpt?.id) return 1;
                    if (a.id === cheapestOpt?.id) return -1;
                    if (b.id === cheapestOpt?.id) return 1;
                    return 0;
                  })
                  .map((opt) => {
                    let tagType = null;
                    if (opt.id === cheapestOpt?.id) tagType = "Cheapest";
                    else if (opt.id === fastestOpt?.id) tagType = "Fastest";
                    else if (bestValueOpt && opt.id === bestValueOpt.id) tagType = "Best Value";

                    const selected = selectedShippingOpt?.id === opt.id;
                    return (
                      <ShippingOptionCard
                        key={opt.id}
                        selected={selected}
                        onClick={() => handleSelectShipping(opt)}
                      >
                        {tagType && <OptionTag type={tagType}>{tagType}</OptionTag>}
                        <OptionRow>
                          <RadioDot selected={selected} />
                          <CarrierLogo>
                            <img src={getCarrierLogo(opt.carrier)} alt={opt.carrier} />
                          </CarrierLogo>
                          <OptionMeta>
                            <OptionName>{opt.carrier}</OptionName>
                            <OptionService>{opt.service}</OptionService>
                            {opt.estimatedDelivery && (
                              <DeliveryEst>
                                <ClockIcon />
                                {formatDelivery(opt.estimatedDelivery)}
                              </DeliveryEst>
                            )}
                          </OptionMeta>
                          <OptionPrice>${opt.price.toFixed(2)}</OptionPrice>
                        </OptionRow>
                      </ShippingOptionCard>
                    );
                  })}

                {/* Custom selection (non-top option selected via modal) */}
                {selectedShippingOpt &&
                  !topOptions.find((o) => o.id === selectedShippingOpt.id) && (
                    <ShippingOptionCard selected onClick={() => {}}>
                      <OptionRow>
                        <RadioDot selected />
                        <CarrierLogo>
                          <img
                            src={getCarrierLogo(selectedShippingOpt.carrier)}
                            alt={selectedShippingOpt.carrier}
                          />
                        </CarrierLogo>
                        <OptionMeta>
                          <OptionName>{selectedShippingOpt.carrier}</OptionName>
                          <OptionService>{selectedShippingOpt.service}</OptionService>
                          {selectedShippingOpt.estimatedDelivery && (
                            <DeliveryEst>
                              <ClockIcon />
                              {formatDelivery(selectedShippingOpt.estimatedDelivery)}
                            </DeliveryEst>
                          )}
                        </OptionMeta>
                        <OptionPrice>${selectedShippingOpt.price.toFixed(2)}</OptionPrice>
                      </OptionRow>
                    </ShippingOptionCard>
                  )}
              </OptionsList>

              {shippingOptions.length > topOptions.length && (
                <MoreBtn onClick={() => setShowAllOptions(true)}>
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="M5 12H19M12 5V19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  View all {shippingOptions.length} options
                </MoreBtn>
              )}
            </>
          )}
        </>
      )}

      {showAllOptions && (
        <ShippingOptionsModal
          options={shippingOptions}
          selectedOption={selectedShippingOpt}
          onSelectOption={(opt) => {
            handleSelectShipping(opt);
            setShowAllOptions(false);
          }}
          onClose={() => setShowAllOptions(false)}
          getCarrierLogo={getCarrierLogo}
          formatDeliveryEstimate={formatDelivery}
        />
      )}
    </div>
  );
}

// Helper exported for use in cart.js
export function buildPickupOption(pickupLocation) {
  return {
    id: "pickup",
    isPickup: true,
    carrier: "Pickup",
    service: pickupLocation?.title || "Store Pickup",
    price: 0,
    address: pickupLocation?.address,
    estimatedDelivery: "Ready for pickup",
  };
}
