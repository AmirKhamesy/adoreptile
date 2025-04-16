import { mongooseConnect } from "@/lib/mongoose";
import {
  findSmallestBox,
  formatAddress,
  getShippingQuotes,
} from "@/lib/shipping";
import { Address } from "@/models/Address";

export default async function handler(req, res) {
  try {
    console.log("🚀 Shipping Quotes API called");

    // Only allow POST method
    if (req.method !== "POST") {
      console.log("❌ Method not allowed:", req.method);
      return res.status(405).json({ error: "Method not allowed" });
    }

    console.log("🔄 Connecting to MongoDB...");
    await mongooseConnect();
    console.log("✅ MongoDB connected");

    const { items, fromAddressId, toAddressId, orderValue = 0 } = req.body;
    console.log(
      "📦 Request payload:",
      JSON.stringify({
        itemCount: items?.length || 0,
        fromAddressId,
        toAddressId,
        orderValue,
      })
    );

    // Validate required parameters
    if (!items || !items.length) {
      console.log("❌ Validation failed: No items provided");
      return res.status(400).json({ error: "No items provided" });
    }

    if (!fromAddressId) {
      console.log("❌ Validation failed: From address ID is required");
      return res.status(400).json({ error: "From address ID is required" });
    }

    if (!toAddressId) {
      console.log("❌ Validation failed: To address ID is required");
      return res.status(400).json({ error: "To address ID is required" });
    }

    // Get addresses from database
    console.log("🏠 Looking up addresses...");
    console.log(`   - From address ID: ${fromAddressId}`);
    console.log(`   - To address ID: ${toAddressId}`);

    const fromAddress = await Address.findById(fromAddressId);
    const toAddress = await Address.findById(toAddressId);

    if (!fromAddress) {
      console.log(`❌ From address not found with ID: ${fromAddressId}`);
      return res.status(404).json({ error: "From address not found" });
    }

    if (!toAddress) {
      console.log(`❌ To address not found with ID: ${toAddressId}`);
      return res.status(404).json({ error: "To address not found" });
    }

    console.log("✅ Addresses found:");
    console.log(`   - From: ${fromAddress.city}, ${fromAddress.postalCode}`);
    console.log(`   - To: ${toAddress.city}, ${toAddress.postalCode}`);

    // Find the smallest box that can fit all items
    console.log("📦 Finding the smallest box for items...");
    const { packageDetails } = await findSmallestBox(items);
    console.log("✅ Found suitable package");

    // Format addresses for SecureShip API
    console.log("🏠 Formatting addresses for SecureShip API...");
    const formattedFromAddress = formatAddress(fromAddress, false); // Business address
    const formattedToAddress = formatAddress(toAddress, true); // Residential address
    console.log("✅ Addresses formatted");

    // Get shipping quotes
    console.log("🚚 Requesting shipping quotes...");
    const shippingQuotes = await getShippingQuotes(
      formattedFromAddress,
      formattedToAddress,
      packageDetails,
      orderValue
    );
    console.log(`✅ Received ${shippingQuotes.length} shipping quotes`);

    // Return shipping quotes
    console.log("🏁 Returning shipping quotes response");
    return res.status(200).json({
      success: true,
      quotes: shippingQuotes,
      package: {
        weight: packageDetails.weight,
        dimensions: {
          length: packageDetails.length,
          width: packageDetails.width,
          height: packageDetails.height,
          units: packageDetails.dimUnits,
        },
      },
    });
  } catch (error) {
    console.error("❌ Error in shipping quotes API:", error);
    console.error("   Stack trace:", error.stack);

    return res.status(500).json({
      error: "Failed to get shipping quotes",
      message: error.message,
    });
  }
}
