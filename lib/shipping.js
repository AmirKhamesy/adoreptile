import axios from "axios";
import { Product } from "@/models/Product";
import { ShippingBox } from "@/models/ShippingBox";
import { packItems } from "./packing";

// Find the smallest box that can fit all items
export async function findSmallestBox(items) {
  try {
    console.log("📦 Finding smallest box for items:", JSON.stringify(items));

    // Fetch all product details to get their dimensions and weights
    const productIds = items.map((item) => item.productId);
    console.log("🔍 Looking up products with IDs:", productIds);

    const products = await Product.find({ _id: { $in: productIds } });
    console.log(`✅ Found ${products.length} products`);

    // Log product details for debugging
    products.forEach((product) => {
      console.log(`📋 Product: ${product.title || product._id}`);
      console.log(`   - Weight: ${product.weight || "not set"} lbs`);
      console.log(
        `   - Dimensions: ${product.dimensions?.length || "not set"} x ${
          product.dimensions?.width || "not set"
        } x ${product.dimensions?.height || "not set"} cm`
      );
    });

    // Get all available shipping boxes
    console.log("🔍 Retrieving available shipping boxes...");
    const boxes = await ShippingBox.find().sort({
      "dimensions.length": 1,
      "dimensions.width": 1,
      "dimensions.height": 1,
    });
    console.log(`✅ Found ${boxes.length} shipping boxes`);

    if (boxes.length === 0) {
      console.warn(
        "⚠️ No shipping boxes found in the database. Please create some boxes first."
      );
    } else {
      // Log box details for debugging
      boxes.forEach((box) => {
        console.log(`📦 Box: ${box.name}`);
        console.log(`   - Max Weight: ${box.maxWeight} lbs`);
        console.log(
          `   - Dimensions: ${box.dimensions.length} x ${box.dimensions.width} x ${box.dimensions.height} cm`
        );
      });
    }

    // Use the advanced packing algorithm to find the optimal box
    console.log("🧮 Running packing algorithm...");
    const result = packItems(products, items, boxes);
    console.log(`✅ Selected box: ${result.box.name}`);
    console.log(
      `   - Package weight: ${result.packageDetails.weight} ${result.packageDetails.weightUnits}`
    );
    console.log(
      `   - Package dimensions: ${result.packageDetails.length} x ${result.packageDetails.width} x ${result.packageDetails.height} ${result.packageDetails.dimUnits}`
    );

    return result;
  } catch (error) {
    console.error("❌ Error finding smallest box:", error);
    throw error;
  }
}

// Format address for SecureShip API
export function formatAddress(address, isResidential = true) {
  console.log(
    `📋 Formatting address for SecureShip: ${address.city}, ${address.postalCode}`
  );
  console.log(
    `   - Address type: ${isResidential ? "Residential" : "Business"}`
  );

  // Format date for the appointment (future date)
  const appointmentDate = new Date();
  appointmentDate.setDate(appointmentDate.getDate() + 14); // 2 weeks in future
  const formattedDate = appointmentDate.toISOString().split("T")[0];

  return {
    addr1: address.streetAddress,
    countryCode: address.country === "Canada" ? "CA" : "US", // Default to CA/US based on country name
    postalCode: address.postalCode,
    city: address.city,
    taxId: isResidential ? "B-654321-Y" : "A-123456-Z", // Default tax IDs matching the example
    residential: isResidential,
    isSaturday: false,
    isInside: false,
    isTailGate: false,
    isTradeShow: false,
    isLimitedAccess: false,
    isStopinOnly: false,
    appointment: {
      appointmentType: "None",
      phone: address.phone || "604-555-" + (isResidential ? "1234" : "7890"),
      date: formattedDate,
      time: "3:00 PM",
    },
  };
}

// Get shipping quotes from SecureShip API
export async function getShippingQuotes(
  fromAddress,
  toAddress,
  packageDetails,
  orderValue = 0
) {
  try {
    console.log("🚚 Getting shipping quotes from SecureShip API");
    console.log("📦 Package details:", JSON.stringify(packageDetails));

    // Set insurance value based on order value
    packageDetails.insurance = orderValue;
    console.log(`💰 Insurance value set to: ${orderValue}`);

    const apiKey = process.env.SECURESHIP_API_KEY;
    if (!apiKey) {
      console.error(
        "❌ SECURESHIP_API_KEY is not set in environment variables"
      );
      throw new Error(
        "SecureShip API key is not configured. Please set SECURESHIP_API_KEY in your .env file."
      );
    } else {
      console.log(
        "🔑 Using SecureShip API Key: " +
          apiKey.substring(0, 4) +
          "..." +
          apiKey.substring(apiKey.length - 4)
      );
    }

    // Create the request object in the format expected by SecureShip API without the request wrapper
    const payload = {
      fromAddress,
      toAddress,
      packages: [packageDetails],
      shipDateTime: new Date().toISOString(),
      currencyCode: "CAD",
      billingOptions: "Prepaid",
      isDocumentsOnly: false,
    };

    console.log(
      "📤 Sending request to SecureShip API:",
      JSON.stringify(payload)
    );

    // Call SecureShip API
    const response = await axios.post(
      "https://secureship.ca/ship/api/v1/carriers/rates",
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          "x-api-key": `${apiKey}`,
        },
      }
    );

    console.log(
      `✅ Received ${response.data.length} shipping quotes from SecureShip`
    );

    // Process and return the shipping options
    const formattedQuotes = response.data.map((option) => ({
      id: `${option.carrierCode}-${option.selectedService}`,
      carrier: option.carrierCode,
      service: option.serviceName,
      price: option.total,
      estimatedDelivery: option.deliveryTime?.friendlyTime || "Unknown",
      tags: option.tags || [],
    }));

    // Log the cheapest and fastest options for debugging
    const cheapestOption = [...formattedQuotes].sort(
      (a, b) => a.price - b.price
    )[0];
    const fastestOption = formattedQuotes.find((quote) =>
      quote.tags?.includes("Fastest")
    );

    if (cheapestOption) {
      console.log(
        `💰 Cheapest option: ${cheapestOption.carrier} ${cheapestOption.service} - $${cheapestOption.price}`
      );
    }

    if (fastestOption) {
      console.log(
        `⚡ Fastest option: ${fastestOption.carrier} ${fastestOption.service} - $${fastestOption.price}`
      );
    }

    return formattedQuotes;
  } catch (error) {
    console.error("❌ Error getting shipping quotes:", error);
    console.error("📋 Error details:", error.response?.data || error.message);

    if (error.response?.status === 401) {
      console.error(
        "🔑 Authentication failed. Please check your SecureShip API key."
      );
    } else if (error.response?.status === 400) {
      console.error(
        "🚨 Bad request. API validation error:",
        JSON.stringify(error.response.data)
      );
    }

    throw error;
  }
}
