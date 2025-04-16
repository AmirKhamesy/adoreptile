import { mongooseConnect } from "@/lib/mongoose";
import { ShippingBox } from "@/models/ShippingBox";

export default async function handle(req, res) {
  await mongooseConnect();

  res.json(await ShippingBox.find());
}
