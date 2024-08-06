import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/database/mongoose';
import Transaction from '@/lib/database/models/transaction.model';
import axios from "axios";

export const dynamic = "force-dynamic";


export const LEMON_SQUEEZY_ENDPOINT = "https://api.lemonsqueezy.com/v1/";
export const lemonSqueezyApiInstance = axios.create({
  baseURL: LEMON_SQUEEZY_ENDPOINT,
  headers: {
    Accept: "application/vnd.api+json",
    "Content-Type": "application/vnd.api+json",
    Authorization: `Bearer ${process.env.LEMON_SQUEEZY_API_KEY}`,
  },
});

export async function POST(req: Request) {
  try {
    const { variantId, plan, amount, credits, buyerId } = await req.json();

    if (!variantId || !plan || !amount || !credits || !buyerId) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    const response = await lemonSqueezyApiInstance.post("/checkouts", {
      data: {
        type: "checkouts",
        attributes: {
          checkout_data: {
            custom: {
              plan,
              credits,
              buyerId,
            },
          },
        },
        relationships: {
          store: {
            data: {
              type: "stores",
              id: process.env.LEMON_SQUEEZY_STORE_ID!,
            },
          },
          variant: {
            data: {
              type: "variants",
              id: variantId.toString(),
            },
          },
        },
      },
    });

    const checkoutUrl = response.data.data.attributes.url;

    return NextResponse.json({ checkoutUrl });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "An error occurred" },
      { status: 500 }
    );
  }
}