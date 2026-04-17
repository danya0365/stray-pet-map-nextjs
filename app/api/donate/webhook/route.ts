import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-03-31.basil",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

// POST /api/donate/webhook - รับ webhook จาก Stripe
export async function POST(request: Request) {
  try {
    if (!webhookSecret) {
      return NextResponse.json(
        { error: "Webhook secret not configured" },
        { status: 500 },
      );
    }

    const payload = await request.text();
    const signature = request.headers.get("stripe-signature") as string;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Unknown signature error";
      console.error("Webhook signature verification failed:", errorMessage);
      return NextResponse.json(
        { error: `Invalid signature: ${errorMessage}` },
        { status: 400 },
      );
    }

    // Handle successful payment
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      // Check if this is a donation
      if (session.metadata?.type === "donation") {
        console.log("💚 Donation received:", {
          amount: session.amount_total,
          message: session.metadata.message,
          sessionId: session.id,
        });

        // TODO: Save to database, send thank you email, etc.
        // await saveDonation({
        //   sessionId: session.id,
        //   amount: session.amount_total,
        //   message: session.metadata.message,
        //   customerEmail: session.customer_email,
        // });
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
