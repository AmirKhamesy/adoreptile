import { mongooseConnect } from "@/lib/mongoose";
import { Product } from "@/models/Product";
import { Order } from "@/models/Order";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { Setting } from "@/models/Setting";
const stripe = require("stripe")(process.env.STRIPE_SK);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.json("should be a POST request");
    return;
  }
  const {
    name,
    email,
    city,
    postalCode,
    streetAddress,
    country,
    cartProducts,
    selectedShippingOption,
    shippingFee,
  } = req.body;

  console.log(req.body);
  await mongooseConnect();
  const productsIds = cartProducts;
  const uniqueIds = [...new Set(productsIds)];
  const productsInfos = await Product.find({ _id: uniqueIds });

  const getBestDiscount = (product, quantity) => {
    if (!product.discounts?.length) return null;
    const applicableDiscounts = product.discounts
      .filter((d) => quantity >= d.quantity)
      .sort((a, b) => b.quantity - a.quantity);
    return applicableDiscounts[0] || null;
  };
  const calculateProductTotal = (product, quantity) => {
    if (!product.discounts?.length) return product.price * quantity;

    const bestDiscount = getBestDiscount(product, quantity);
    if (!bestDiscount) return product.price * quantity;

    if (bestDiscount.type === "fixed") {
      return (product.price - bestDiscount.value) * quantity;
    } else {
      return product.price * (1 - bestDiscount.value / 100) * quantity;
    }
  };

  let line_items = [];
  let items = [];
  for (const productId of uniqueIds) {
    const productInfo = productsInfos.find(
      (p) => p._id.toString() === productId,
    );
    const quantity = productsIds.filter((id) => id === productId)?.length || 0;
    if (quantity > 0 && productInfo) {
      const totalAmount = calculateProductTotal(productInfo, quantity);
      line_items.push({
        quantity,
        price_data: {
          currency: "USD",
          product_data: { name: productInfo.title },
          unit_amount: Math.round((totalAmount * 100) / quantity), // Convert to cents and get per-unit price
        },
      });
      items.push({ productId, quantity });
    }
  }

  const session = await getServerSession(req, res, authOptions);
  const isPickup = selectedShippingOption?.isPickup === true;

  const orderDoc = await Order.create({
    line_items,
    items,
    name,
    email,
    city,
    postalCode,
    streetAddress,
    country,
    paid: false,
    orderType: isPickup ? "pickup" : "delivery",
    userEmail: session?.user?.email,
    selectedService: isPickup
      ? null
      : selectedShippingOption?.id
        ? selectedShippingOption.id.split("-")[1]
        : null,
  });

  let shippingFeeCents = 0;
  if (!isPickup) {
    const shippingFeeSetting = await Setting.findOne({ name: "shippingFee" });
    const fallbackShippingFee = parseFloat(shippingFeeSetting?.value || "0");
    const effectiveShippingFee =
      typeof selectedShippingOption?.price === "number"
        ? selectedShippingOption.price
        : typeof shippingFee === "number"
          ? shippingFee
          : fallbackShippingFee;
    shippingFeeCents = Math.round(effectiveShippingFee * 100);
  }

  const shippingDisplayName = isPickup
    ? `Pick Up: ${selectedShippingOption?.service || "Store Pickup"}`
    : selectedShippingOption
      ? `${selectedShippingOption.carrier} ${selectedShippingOption.service}`
      : "Shipping fee";

  const stripeSession = await stripe.checkout.sessions.create({
    line_items,
    mode: "payment",
    customer_email: email,
    success_url: process.env.PUBLIC_URL + "/cart?success=1",
    cancel_url: process.env.PUBLIC_URL + "/cart?canceled=1",
    metadata: {
      orderId: orderDoc._id.toString(),
      selectedService: orderDoc.selectedService || "",
    },
    allow_promotion_codes: true,
    shipping_options: [
      {
        shipping_rate_data: {
          display_name: shippingDisplayName,
          type: "fixed_amount",
          fixed_amount: { amount: shippingFeeCents, currency: "USD" },
        },
      },
    ],
  });

  res.json({
    url: stripeSession.url,
  });
}
