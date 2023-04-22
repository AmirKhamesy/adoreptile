import Head from "next/head";
import { useEffect, useState } from "react";
import axios from "axios";

console.log(process.env);
const shopName = process.env.NEXT_PUBLIC_ETSY_SHOP_NAME || "Shop Name";

async function getListings() {
  try {
    const response = await axios.get("/api/listings");
    console.info("API response:", response);
    if (response.statusText === "OK") {
      return response.data;
    }
  } catch (error) {
    const parsedRes = JSON.parse(error.request.response);
    console.log(parsedRes.message);
  }
}

export default function Home() {
  const [listings, setListings] = useState([]);

  useEffect(() => {
    const data = getListings();
  }, []);

  return (
    <>
      <Head>
        <title>{shopName}</title>
        <meta name="description" content="Online reptile store" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <p>{shopName}</p>
      </main>
    </>
  );
}
