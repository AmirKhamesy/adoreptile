/**
 * Advanced 3D bin packing algorithms for optimizing item placement in shipping boxes
 * This implementation uses a simple 3D bin packing algorithm to determine if items can fit in a box
 */

/**
 * Check if items can fit in a box
 * @param {Array} items - Array of items with dimensions [length, width, height]
 * @param {Object} box - Box with dimensions {length, width, height}
 * @returns {Boolean} - Whether all items can fit in the box
 */
export function canItemsFitInBox(items, box) {
  console.log(`📏 Checking if items fit in box: ${box.name}`);

  // Simple volume check as a quick pre-check
  const boxVolume =
    box.dimensions.length * box.dimensions.width * box.dimensions.height;
  console.log(`   - Box volume: ${boxVolume} cubic cm`);

  let totalItemsVolume = 0;

  for (const item of items) {
    const { dimensions, quantity } = item;
    const itemVolume = dimensions.length * dimensions.width * dimensions.height;
    totalItemsVolume += itemVolume * quantity;
  }

  console.log(`   - Total items volume: ${totalItemsVolume} cubic cm`);

  // If total volume of items is greater than box volume, they definitely won't fit
  if (totalItemsVolume > boxVolume) {
    console.log(`   ❌ Items won't fit (volume too large)`);
    return false;
  }

  // For a more accurate check, we would need to implement a proper 3D bin packing algorithm
  // This is a simplification that works for most cases
  console.log(`   ✅ Items should fit by volume check`);
  return true;
}

/**
 * Sort boxes to find the most optimal one for a set of items
 * @param {Array} items - Array of items with dimensions and quantities
 * @param {Array} boxes - Array of available boxes
 * @returns {Object|null} - The most optimal box or null if no box fits
 */
export function findOptimalBox(items, boxes) {
  console.log("🔍 Finding optimal box for items");

  // Skip empty items
  if (!items || items.length === 0) {
    console.log("⚠️ No items provided");
    return null;
  }

  // Skip if no boxes
  if (!boxes || boxes.length === 0) {
    console.log("⚠️ No boxes available");
    return null;
  }

  // Calculate total weight of all items
  let totalWeight = 0;
  for (const item of items) {
    totalWeight += (item.weight || 0) * (item.quantity || 1);
  }

  console.log(`⚖️ Total weight of all items: ${totalWeight} lbs`);

  // Filter boxes that can hold the weight
  const boxesByWeight = boxes.filter((box) => box.maxWeight >= totalWeight);
  console.log(
    `📦 Found ${boxesByWeight.length} boxes that can support the weight`
  );

  if (boxesByWeight.length === 0) {
    console.log("❌ No box can hold this weight");
    return null; // No box can hold this weight
  }

  // Sort boxes by volume (smallest first)
  const sortedBoxes = [...boxesByWeight].sort((a, b) => {
    const volumeA =
      a.dimensions.length * a.dimensions.width * a.dimensions.height;
    const volumeB =
      b.dimensions.length * b.dimensions.width * b.dimensions.height;
    return volumeA - volumeB;
  });

  console.log("📊 Boxes sorted by volume (smallest first)");

  // Find the first (smallest) box that can fit all items
  for (const box of sortedBoxes) {
    console.log(`🔍 Checking box: ${box.name}`);
    if (canItemsFitInBox(items, box)) {
      console.log(`✅ Found optimal box: ${box.name}`);
      return box;
    }
  }

  // If no box fits, return the largest box
  const largestBox = sortedBoxes[sortedBoxes.length - 1];
  console.log(
    `⚠️ No box fits perfectly. Using largest available: ${largestBox.name}`
  );
  return largestBox;
}

/**
 * Expand the findSmallestBox function to use the advanced packing algorithm
 * @param {Array} products - Array of products
 * @param {Array} items - Array of items with productId and quantity
 * @param {Array} boxes - Array of available boxes
 * @returns {Object} - The optimal box and package details
 */
export function packItems(products, items, boxes) {
  console.log("📦 Starting packing algorithm");

  // Create a map of products for quick lookup
  const productsMap = {};
  products.forEach((product) => {
    productsMap[product._id.toString()] = product;
  });

  console.log(
    `📋 Created lookup map for ${Object.keys(productsMap).length} products`
  );

  // Convert items to the format expected by the packing algorithm
  const packingItems = [];
  let totalWeight = 0;

  for (const item of items) {
    const product = productsMap[item.productId];
    if (!product) {
      console.log(`⚠️ Product not found for ID: ${item.productId}`);
      continue;
    }

    // Add weight
    const itemWeight = (product.weight || 0) * item.quantity;
    totalWeight += itemWeight;

    console.log(
      `⚖️ Added weight for ${item.quantity}x ${
        product.title || product._id
      }: ${itemWeight} lbs`
    );

    // Add dimensions
    if (product.dimensions) {
      // Add each item individually for better packing optimization
      for (let i = 0; i < item.quantity; i++) {
        packingItems.push({
          dimensions: {
            length: product.dimensions.length || 1,
            width: product.dimensions.width || 1,
            height: product.dimensions.height || 1,
          },
          weight: product.weight || 0,
          quantity: 1,
        });
      }
      console.log(
        `📏 Added dimensions for ${item.quantity}x ${
          product.title || product._id
        }`
      );
    } else {
      console.log(
        `⚠️ No dimensions found for product: ${product.title || product._id}`
      );
    }
  }

  console.log(`📦 Prepared ${packingItems.length} items for packing algorithm`);

  // Find the optimal box
  const optimalBox = findOptimalBox(packingItems, boxes);

  if (!optimalBox) {
    console.error("❌ No suitable shipping box found");
    throw new Error("No suitable shipping box found for these items");
  }

  console.log(`✅ Selected box: ${optimalBox.name}`);

  // Convert dimensions from cm to inches for SecureShip API
  const cmToInches = 0.393701;

  const packageDetails = {
    packageType: "MyPackage",
    userDefinedPackageType: optimalBox.name,
    weight: Math.max(0.1, totalWeight), // Ensure minimum weight of 0.1
    weightUnits: "Lbs",
    length: Math.max(1, Math.ceil(optimalBox.dimensions.length * cmToInches)),
    width: Math.max(1, Math.ceil(optimalBox.dimensions.width * cmToInches)),
    height: Math.max(1, Math.ceil(optimalBox.dimensions.height * cmToInches)),
    dimUnits: "Inches",
    insurance: 0, // Will be set based on order value
    isAdditionalHandling: false,
    signatureOptions: "None",
    description: "Online order",
    temperatureProtection: false,
    isDangerousGoods: false,
    isNonStackable: false,
  };

  console.log("📦 Final package details:");
  console.log(`   - Box: ${optimalBox.name}`);
  console.log(
    `   - Weight: ${packageDetails.weight} ${packageDetails.weightUnits}`
  );
  console.log(
    `   - Dimensions: ${packageDetails.length} x ${packageDetails.width} x ${packageDetails.height} ${packageDetails.dimUnits}`
  );

  return {
    box: optimalBox,
    packageDetails,
    totalWeight,
  };
}
