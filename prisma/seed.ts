import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { generateLicenseKey } from "../src/lib/license";

const prisma = new PrismaClient();

const DEMO_EMAIL = "demo@devcomdigital.com";
const DEMO_PASSWORD = "demo12345";

async function main() {
  const hashed = await bcrypt.hash(DEMO_PASSWORD, 12);

  const user = await prisma.user.upsert({
    where: { email: DEMO_EMAIL },
    update: {
      name: "Demo User",
      password: hashed,
      emailVerified: new Date(),
      role: "ADMIN",
    },
    create: {
      name: "Demo User",
      email: DEMO_EMAIL,
      password: hashed,
      emailVerified: new Date(),
      role: "ADMIN",
    },
  });

  await prisma.subscription.upsert({
    where: { userId: user.id },
    update: {
      status: "ACTIVE",
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
    create: {
      userId: user.id,
      paypalSubscriptionId: "DEMO-SUBSCRIPTION",
      paypalPlanId: process.env.PAYPAL_PLAN_ID ?? "DEMO-PLAN",
      status: "ACTIVE",
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  const existingLicense = await prisma.license.findUnique({
    where: { userId: user.id },
  });
  const license = existingLicense
    ? await prisma.license.update({
        where: { userId: user.id },
        data: { active: true, revokedAt: null },
      })
    : await prisma.license.create({
        data: { userId: user.id, key: generateLicenseKey(), active: true },
      });

  console.log("Seeded demo user:");
  console.log(`  email:    ${DEMO_EMAIL}`);
  console.log(`  password: ${DEMO_PASSWORD}`);
  console.log(`  license:  ${license.key}`);

  const tools = [
    { slug: "seo-keyword-toolkit", name: "SEO & Keyword Toolkit", desc: "Rank tracking and on-page audits.", status: "IN_DEVELOPMENT" as const, order: 0 },
    { slug: "social-content-scheduler", name: "Social Content Scheduler", desc: "Cross-platform post planning.", status: "IN_DEVELOPMENT" as const, order: 1 },
    { slug: "campaign-analytics", name: "Campaign Analytics", desc: "Unified ad spend and ROI dashboards.", status: "IN_DEVELOPMENT" as const, order: 2 },
    { slug: "ad-creative-generator", name: "Ad Creative Generator", desc: "On-brand copy and creative drafts.", status: "IN_DEVELOPMENT" as const, order: 3 },
    { slug: "shopify-themes-apps", name: "Shopify Themes & Apps", desc: "Curated themes and app recommendations for your store.", status: "IN_DEVELOPMENT" as const, order: 4 },
    { slug: "custom-scripts", name: "Custom Scripts", desc: "Tailored scripts to automate storefront and backend tasks.", status: "IN_DEVELOPMENT" as const, order: 5 },
    { slug: "automations", name: "Automations", desc: "Workflow automations across marketing and operations.", status: "IN_DEVELOPMENT" as const, order: 6 },
    { slug: "product-feed-optimizer", name: "Product Feed Optimizer", desc: "Auto-clean titles, descriptions, and images for Google Shopping & Meta.", status: "IN_DEVELOPMENT" as const, order: 7 },
    { slug: "abandoned-cart-recovery", name: "Abandoned Cart Recovery", desc: "Email and SMS sequences triggered off cart events.", status: "IN_DEVELOPMENT" as const, order: 8 },
    { slug: "review-ugc-aggregator", name: "Review & UGC Aggregator", desc: "Pull reviews and photos from multiple sources into one widget.", status: "IN_DEVELOPMENT" as const, order: 9 },
    { slug: "inventory-price-sync", name: "Inventory & Price Sync", desc: "Keep stock and pricing consistent across Shopify and marketplaces.", status: "IN_DEVELOPMENT" as const, order: 10 },
    { slug: "email-sms-campaign-builder", name: "Email/SMS Campaign Builder", desc: "Welcome series, win-back flows, and lifecycle campaigns.", status: "IN_DEVELOPMENT" as const, order: 11 },
    { slug: "landing-page-builder", name: "Landing Page Builder", desc: "Campaign-specific pages that plug into your ad creative.", status: "IN_DEVELOPMENT" as const, order: 12 },
    { slug: "competitor-price-tracker", name: "Competitor Price Tracker", desc: "Monitor rival storefronts and get alerts on price or stock changes.", status: "IN_DEVELOPMENT" as const, order: 13 },
    { slug: "customer-segmentation-ltv", name: "Customer Segmentation & LTV", desc: "Cohort analysis feeding back into campaign analytics.", status: "IN_DEVELOPMENT" as const, order: 14 },
    { slug: "ab-testing-suite", name: "A/B Testing Suite", desc: "Test product pages, checkout flows, and creative variants.", status: "IN_DEVELOPMENT" as const, order: 15 },
    { slug: "chatbot-support-widget", name: "Chatbot & Support Widget", desc: "AI-assisted customer service for your storefront. Requires a license key to activate.", status: "IN_DEVELOPMENT" as const, requiresLicenseKey: true, order: 16 },
  ];

  for (const tool of tools) {
    await prisma.tool.upsert({
      where: { slug: tool.slug },
      update: tool,
      create: tool,
    });
  }
  console.log(`Seeded ${tools.length} tools.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
