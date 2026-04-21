import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { getRuntimeConfigStatus } from "@/lib/runtime-config";

export async function GET() {
  const config = getRuntimeConfigStatus();

  try {
    await prisma.$queryRaw`SELECT 1`;

    const status = config.errors.length > 0 ? "fail" : config.warnings.length > 0 ? "warn" : "ok";

    return NextResponse.json({
      status,
      environment: config.nodeEnv,
      checks: {
        database_connection: "ok",
        database_url: config.usingDatabaseFallback ? "fallback" : "configured",
        admin_auth_secret: config.usingAdminSecretFallback ? "fallback" : "configured",
        business_whatsapp_number: config.businessWhatsAppConfigured ? "configured" : "fallback",
        paystack: config.paystackConfigured ? "configured" : "not_configured",
      },
      warnings: config.warnings,
      errors: config.errors,
    });
  } catch (error) {
    console.error("Health check failed", error);
    return NextResponse.json(
      {
        status: "fail",
        environment: config.nodeEnv,
        checks: {
          database_connection: "failed",
          database_url: config.usingDatabaseFallback ? "fallback" : "configured",
          admin_auth_secret: config.usingAdminSecretFallback ? "fallback" : "configured",
          business_whatsapp_number: config.businessWhatsAppConfigured ? "configured" : "fallback",
          paystack: config.paystackConfigured ? "configured" : "not_configured",
        },
        warnings: config.warnings,
        errors: [...config.errors, "Database connection check failed."],
      },
      { status: 500 },
    );
  }
}
