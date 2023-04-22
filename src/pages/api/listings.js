// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import axios from "axios";

const apiKey = process.env.ETSY_API_KEY;
const shopName = process.env.ETSY_SHOP_NAME;

export default async function handler(req, res) {
  try {
    const response = await axios.get(
      `https://openapi.etsy.com/v3/application/shops/${shopName}/listings`,
      { params: { api_key: apiKey } }
    );
    res.status(200).json({ name: "John Doe123" });
  } catch (error) {
    res.status(400).json({ message: error?.response.data.error });
  }
}
