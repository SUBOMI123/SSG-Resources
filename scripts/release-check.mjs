const productionMode = process.argv.includes("--production");

const checks = [
  {
    name: "DATABASE_URL",
    ok: Boolean(process.env.DATABASE_URL),
    message: productionMode
      ? "Required in production for Supabase/Postgres connectivity."
      : "Optional locally because the app can fall back to docker-compose defaults.",
    required: productionMode,
  },
  {
    name: "ADMIN_AUTH_SECRET",
    ok: Boolean(process.env.ADMIN_AUTH_SECRET),
    message: productionMode
      ? "Required in production so admin sessions do not use the local fallback secret."
      : "Recommended locally. Required before real deployment.",
    required: productionMode,
  },
  {
    name: "BUSINESS_WHATSAPP_NUMBER",
    ok: Boolean(process.env.BUSINESS_WHATSAPP_NUMBER),
    message: productionMode
      ? "Required in production so customer checkout sends orders to the real business WhatsApp."
      : "Recommended locally. Required before public testing.",
    required: productionMode,
  },
  {
    name: "PAYSTACK_SECRET_KEY",
    ok: Boolean(process.env.PAYSTACK_SECRET_KEY),
    message: "Required only when live Paystack verification is being enabled.",
    required: false,
  },
  {
    name: "PAYSTACK_PUBLIC_KEY",
    ok: Boolean(process.env.PAYSTACK_PUBLIC_KEY),
    message: "Required only when live Paystack verification is being enabled.",
    required: false,
  },
];

const missingRequired = checks.filter((check) => check.required && !check.ok);

console.log(`Release check mode: ${productionMode ? "production" : "local"}`);

for (const check of checks) {
  const state = check.ok ? "OK" : check.required ? "MISSING" : "WARN";
  console.log(`${state.padEnd(7)} ${check.name} - ${check.message}`);
}

if (missingRequired.length > 0) {
  process.exitCode = 1;
} else {
  console.log("Release check completed.");
}
