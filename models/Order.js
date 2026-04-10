import { model, models, Schema } from "mongoose";

const OrderSchema = new Schema(
  {
    userEmail: String,
    line_items: Object,
    // Array of items with product reference and quantity for packaging + label creation
    items: [
      {
        productId: { type: Schema.Types.ObjectId, ref: "Product" },
        quantity: Number,
      },
    ],
    name: String,
    email: String,
    city: String,
    postalCode: String,
    streetAddress: String,
    country: String,
    paid: Boolean,
    orderType: String, // "delivery" or "pickup"
  selectedService: String, // SecureShip selectedService code chosen at checkout
    // Shipping label + tracking info (created once payment succeeds)
    shippingLabel: {
      trackingNumber: String,
      carrierTrackingNos: [String],
      typeOfRate: String,
      pickupCutoffTime: String,
      webServiceNotices: Object,
      raw: Object, // full API response for future reference
      createdAt: Date,
    },
    shippingLabelError: {
      message: String,
      at: Date,
    },
  },
  {
    timestamps: true,
  }
);

export const Order = models?.Order || model("Order", OrderSchema);
