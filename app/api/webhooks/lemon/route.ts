import { NextResponse } from "next/server";
import crypto from "crypto";
import { createTransaction } from "@/lib/actions/transaction.action";

export async function POST(req: Request) {
  try {
    const clonedReq = req.clone();
    const eventType = req.headers.get("X-Event-Name");
    const body = await req.json();

    // Verify webhook signature
    const secret = process.env.LEMON_SQUEEZY_WEBHOOK_SIGNATURE!;
    const hmac = crypto.createHmac("sha256", secret);
    const digest = hmac.update(await clonedReq.text()).digest();
    const signature = Buffer.from(req.headers.get("X-Signature") || "", "hex");

    if (!crypto.timingSafeEqual(new Uint8Array(digest), new Uint8Array(signature))) {
      return NextResponse.json({ message: "Invalid signature" }, { status: 401 });
    }

    // Handle order_created event
    if (eventType === "subscription_created" || eventType === "subscription_updated") {
      const { order_id, billing_anchor, status } = body.data.attributes;
      const { custom_data } = body.meta;
      const { plan, credits, buyerId } = custom_data || {};

      console.log(custom_data);
      console.log(body.data.attributes);

      const transaction = {
        orderId: order_id, // Using Lemon Squeezy order ID as orderId for consistency
        amount: parseFloat(billing_anchor),
        plan: plan || "",
        credits: Number(credits) || 0,
        buyerId: buyerId || "",
        createdAt: new Date(),
      };

      console.log(transaction);

      const newTransaction = await createTransaction(transaction);
      
      return NextResponse.json({ message: "OK", transaction: newTransaction });
    }

    // Handle other event types if needed

    return NextResponse.json({ message: "Webhook received" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}