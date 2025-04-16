import axios from "axios";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    console.log("🧪 Testing SecureShip API directly with Postman-like request");

    const apiKey = process.env.SECURESHIP_API_KEY;
    if (!apiKey) {
      console.error(
        "❌ SECURESHIP_API_KEY is not set in environment variables"
      );
      return res.status(500).json({
        error: "SecureShip API key is not configured",
        message: "Please set SECURESHIP_API_KEY in your .env file",
      });
    }

    // Either use the passed body or use the default test payload
    const payload = req.body || {
      fromAddress: {
        addr1: "789 Granville Street",
        countryCode: "CA",
        postalCode: "V6C 1Z6",
        city: "Vancouver",
        taxId: "A-123456-Z",
        residential: false,
        isSaturday: false,
        isInside: false,
        isTailGate: false,
        isTradeShow: false,
        isLimitedAccess: false,
        isStopinOnly: false,
        appointment: {
          appointmentType: "None",
          phone: "604-555-7890",
          date: "2025-04-10",
          time: "3:00 PM",
        },
      },
      toAddress: {
        addr1: "453 Foster Avenue",
        countryCode: "CA",
        postalCode: "V3J 2L9",
        city: "Coquitlam",
        taxId: "B-654321-Y",
        residential: true,
        isSaturday: false,
        isInside: false,
        isTailGate: false,
        isTradeShow: false,
        isLimitedAccess: false,
        isStopinOnly: false,
        appointment: {
          appointmentType: "None",
          phone: "604-555-1234",
          date: "2025-04-20",
          time: "3:00 PM",
        },
      },
      packages: [
        {
          packageType: "MyPackage",
          userDefinedPackageType: "Small Box",
          weight: 0.5,
          weightUnits: "Lbs",
          length: 8,
          width: 6,
          height: 4,
          dimUnits: "Inches",
          insurance: 15.0,
          isAdditionalHandling: false,
          signatureOptions: "None",
          description: "Gift card",
          temperatureProtection: false,
          isDangerousGoods: false,
          isNonStackable: false,
        },
      ],
      shipDateTime: "2025-04-10T10:30:00Z",
      currencyCode: "CAD",
      billingOptions: "Prepaid",
      isDocumentsOnly: false,
    };

    console.log("📤 Request payload:", JSON.stringify(payload));

    // Send request to SecureShip API using the Postman format
    const response = await axios.post(
      "https://secureship.ca/ship/api/v1/carriers/rates",
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
        },
      }
    );

    console.log(`✅ Received ${response.data.length} shipping quotes`);

    // Return raw API response for testing/comparison
    return res.status(200).json({
      success: true,
      rawApiResponse: response.data,
      // Also include a formatted version for convenience
      formattedQuotes: response.data.map((option) => ({
        id: `${option.carrierCode}-${option.selectedService}`,
        carrier: option.carrierCode,
        service: option.serviceName,
        price: option.total,
        estimatedDelivery: option.deliveryTime?.friendlyTime || "Unknown",
        tags: option.tags || [],
      })),
    });
  } catch (error) {
    console.error("❌ Error testing SecureShip API:", error);
    console.error("📋 Error details:", error.response?.data || error.message);

    if (error.response?.status === 401) {
      console.error("🔑 Authentication failed. Check your SecureShip API key.");
    }

    return res.status(500).json({
      error: "Failed to get shipping quotes",
      message: error.message,
      details: error.response?.data,
    });
  }
}
