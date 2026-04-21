const DEFAULT_LOCAL_DATABASE_URL = "postgresql://ssg_user:ssg_password@localhost:5432/ssg_dev";
const DEFAULT_LOCAL_ADMIN_SECRET = "dev-admin-secret-change-me";

function isBlank(value: string | undefined) {
  return !value || value.trim().length === 0;
}

export function getDatabaseUrl() {
  return process.env.DATABASE_URL ?? DEFAULT_LOCAL_DATABASE_URL;
}

export function getAdminAuthSecret() {
  return process.env.ADMIN_AUTH_SECRET ?? DEFAULT_LOCAL_ADMIN_SECRET;
}

export function getRuntimeConfigStatus() {
  const nodeEnv = process.env.NODE_ENV ?? "development";
  const paystackSecretConfigured = !isBlank(process.env.PAYSTACK_SECRET_KEY);
  const paystackPublicConfigured = !isBlank(process.env.PAYSTACK_PUBLIC_KEY);
  const businessWhatsAppConfigured = !isBlank(process.env.BUSINESS_WHATSAPP_NUMBER);
  const usingDatabaseFallback = isBlank(process.env.DATABASE_URL);
  const usingAdminSecretFallback = isBlank(process.env.ADMIN_AUTH_SECRET);
  const productionLike = nodeEnv === "production";

  const warnings: string[] = [];
  const errors: string[] = [];

  if (usingDatabaseFallback) {
    const message = "DATABASE_URL is using the local development fallback.";
    if (productionLike) {
      errors.push(message);
    } else {
      warnings.push(message);
    }
  }

  if (usingAdminSecretFallback) {
    const message = "ADMIN_AUTH_SECRET is using the local development fallback.";
    if (productionLike) {
      errors.push(message);
    } else {
      warnings.push(message);
    }
  }

  if (!businessWhatsAppConfigured) {
    const message = "BUSINESS_WHATSAPP_NUMBER is using the local development fallback.";
    if (productionLike) {
      errors.push(message);
    } else {
      warnings.push(message);
    }
  }

  if (!paystackSecretConfigured || !paystackPublicConfigured) {
    warnings.push("Paystack keys are not fully configured yet.");
  }

  return {
    nodeEnv,
    productionLike,
    paystackConfigured: paystackSecretConfigured && paystackPublicConfigured,
    businessWhatsAppConfigured,
    usingDatabaseFallback,
    usingAdminSecretFallback,
    warnings,
    errors,
  };
}
