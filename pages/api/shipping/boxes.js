import { mongooseConnect } from "@/lib/mongoose";
import { ShippingBox } from "@/models/ShippingBox";

export default async function handler(req, res) {
  await mongooseConnect();

  // GET method - Get all shipping boxes
  if (req.method === "GET") {
    try {
      const boxes = await ShippingBox.find().sort({
        "dimensions.length": 1,
        "dimensions.width": 1,
        "dimensions.height": 1,
      });
      return res.status(200).json(boxes);
    } catch (error) {
      return res.status(500).json({ error: "Failed to fetch shipping boxes" });
    }
  }

  // POST method - Create a new shipping box
  if (req.method === "POST") {
    try {
      const { name, description, dimensions, maxWeight, isDefault } = req.body;

      // Validate required fields
      if (!name) return res.status(400).json({ error: "Name is required" });
      if (!dimensions)
        return res.status(400).json({ error: "Dimensions are required" });
      if (!dimensions.length || !dimensions.width || !dimensions.height) {
        return res
          .status(400)
          .json({
            error: "All dimension fields (length, width, height) are required",
          });
      }
      if (maxWeight === undefined)
        return res.status(400).json({ error: "Max weight is required" });

      // If this box is set as default, remove default status from all other boxes
      if (isDefault) {
        await ShippingBox.updateMany({}, { isDefault: false });
      }

      // Create the new box
      const newBox = await ShippingBox.create({
        name,
        description,
        dimensions,
        maxWeight,
        isDefault: !!isDefault,
      });

      return res.status(201).json(newBox);
    } catch (error) {
      return res.status(500).json({ error: "Failed to create shipping box" });
    }
  }

  // PUT method - Update a shipping box
  if (req.method === "PUT") {
    try {
      const { id, name, description, dimensions, maxWeight, isDefault } =
        req.body;

      // Validate ID
      if (!id) return res.status(400).json({ error: "ID is required" });

      const updateData = {};
      if (name) updateData.name = name;
      if (description !== undefined) updateData.description = description;
      if (dimensions) updateData.dimensions = dimensions;
      if (maxWeight !== undefined) updateData.maxWeight = maxWeight;
      if (isDefault !== undefined) updateData.isDefault = isDefault;

      // If this box is set as default, remove default status from all other boxes
      if (isDefault) {
        await ShippingBox.updateMany(
          { _id: { $ne: id } },
          { isDefault: false }
        );
      }

      // Update the box
      const updatedBox = await ShippingBox.findByIdAndUpdate(id, updateData, {
        new: true,
      });

      if (!updatedBox) {
        return res.status(404).json({ error: "Shipping box not found" });
      }

      return res.status(200).json(updatedBox);
    } catch (error) {
      return res.status(500).json({ error: "Failed to update shipping box" });
    }
  }

  // DELETE method - Delete a shipping box
  if (req.method === "DELETE") {
    try {
      const { id } = req.query;

      // Validate ID
      if (!id) return res.status(400).json({ error: "ID is required" });

      // Delete the box
      const deletedBox = await ShippingBox.findByIdAndDelete(id);

      if (!deletedBox) {
        return res.status(404).json({ error: "Shipping box not found" });
      }

      return res
        .status(200)
        .json({ message: "Shipping box deleted successfully" });
    } catch (error) {
      return res.status(500).json({ error: "Failed to delete shipping box" });
    }
  }

  // Method not allowed
  return res.status(405).json({ error: "Method not allowed" });
}
