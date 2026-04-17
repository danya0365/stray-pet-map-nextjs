import { SupabaseDonationRepository } from "@/infrastructure/repositories/supabase/SupabaseDonationRepository";
import { createAdminSupabaseClient } from "@/infrastructure/supabase/admin";
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-03-31.basil",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

// POST /api/donate/webhook - รับ webhook จาก Stripe
// Saves donation + awards gamification points
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
        await handleDonationCompleted(session);
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

async function handleDonationCompleted(session: Stripe.Checkout.Session) {
  const metadata = session.metadata;
  if (!metadata) return;

  const amount = (session.amount_total || 0) / 100; // Convert from satang to THB
  const donorName = metadata.donor_name || "ผู้ใจดี";
  const targetType = (metadata.target_type || "fund") as "pet" | "fund";
  const petPostId = metadata.pet_post_id || undefined;
  const message = metadata.message;
  const isAnonymous = metadata.is_anonymous === "true";
  const showOnLeaderboard = metadata.show_on_leaderboard !== "false";

  console.log("💚 Donation completed:", {
    sessionId: session.id,
    amount,
    donorName,
    targetType,
    petPostId,
  });

  // Use admin client for webhook (service role)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Missing Supabase credentials");
    return;
  }

  const donationRepo = new SupabaseDonationRepository(
    supabaseUrl,
    supabaseServiceKey,
  );
  const adminClient = createAdminSupabaseClient();

  try {
    // 1. Find or create donation record
    let donation = await donationRepo.findByStripeSessionId(session.id);

    if (!donation) {
      // Create new donation record
      // Note: In real scenario, we should have created this during checkout
      // For now, create it here with guest donor info
      donation = await donationRepo.create({
        stripeSessionId: session.id,
        targetType,
        petPostId,
        amount,
        donorName,
        donorEmail: session.customer_email || undefined,
        message,
        isAnonymous,
        showOnLeaderboard,
      });
    }

    // 2. Calculate points (1 point per 10 THB, cap 200/day)
    // Check daily cap
    const today = new Date().toISOString().split("T")[0];
    const { data: todayDonations } = await adminClient
      .from("donations")
      .select("points_awarded")
      .eq("donor_id", donation.donorId)
      .gte("created_at", today)
      .lt("created_at", today + "T23:59:59");

    const pointsToday = (todayDonations || []).reduce(
      (sum: number, d: { points_awarded: number }) => sum + d.points_awarded,
      0,
    );

    const maxPoints = 200;
    const availablePoints = maxPoints - pointsToday;
    const calculatedPoints = Math.min(Math.floor(amount / 10), availablePoints);

    // 3. Complete the donation with points
    const completedDonation = await donationRepo.completeDonation(
      donation.id,
      session.payment_intent as string,
      calculatedPoints > 0 ? calculatedPoints : 0,
    );

    console.log("✅ Donation saved:", {
      donationId: completedDonation.id,
      points: completedDonation.pointsAwarded,
    });

    // 4. Award points via RPC if donor is logged in
    if (donation.donorId && calculatedPoints > 0) {
      await adminClient.rpc("award_points", {
        p_user_id: donation.donorId,
        p_action: "donation",
        p_points: calculatedPoints,
        p_reference_id: donation.id,
        p_reference_type: "donation",
      });

      // 5. Check and award badges
      await checkAndAwardDonationBadges(
        adminClient,
        donation.donorId,
        donationRepo,
      );
    }

    // 6. TODO: Send thank you email
    // await sendThankYouEmail(donorEmail, amount, message);
  } catch (error) {
    console.error("Error processing donation:", error);
    throw error;
  }
}

async function checkAndAwardDonationBadges(
  adminClient: ReturnType<typeof createAdminSupabaseClient>,
  donorId: string,
  donationRepo: SupabaseDonationRepository,
) {
  // Get donor stats
  const { count, amount } = await donationRepo.getDonorTotal(donorId);

  // Badge definitions
  const badgesToCheck = [
    { code: "first_donation", condition: count >= 1 },
    { code: "supporter_bronze", condition: amount >= 500 },
    { code: "supporter_silver", condition: amount >= 1000 },
    { code: "supporter_gold", condition: amount >= 5000 },
    { code: "supporter_platinum", condition: amount >= 10000 },
  ];

  // Check existing badges
  const { data: existingBadges } = await adminClient
    .from("user_badges")
    .select("badge_code")
    .eq("user_id", donorId);

  const existingCodes = new Set(
    (existingBadges || []).map((b: { badge_code: string }) => b.badge_code),
  );

  // Award new badges
  for (const badge of badgesToCheck) {
    if (badge.condition && !existingCodes.has(badge.code)) {
      await adminClient.from("user_badges").insert({
        user_id: donorId,
        badge_code: badge.code,
      });
      console.log(`🏅 Badge awarded: ${badge.code} to ${donorId}`);
    }
  }

  // Check "ผู้อุปถัมภ์" badge (donated 3 months in a row)
  // This would need more complex logic with a separate RPC
}
