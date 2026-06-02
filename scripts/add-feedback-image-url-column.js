/**
 * Adds image_url column to feedbacks table.
 * Run: node scripts/add-feedback-image-url-column.js
 *
 * If exec_sql RPC is unavailable, run this SQL in Supabase SQL Editor:
 *   ALTER TABLE feedbacks ADD COLUMN IF NOT EXISTS image_url TEXT;
 */
require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);

async function main() {
  const { error: probeError } = await supabase
    .from("feedbacks")
    .select("image_url")
    .limit(1);

  if (!probeError) {
    console.log("✅ feedbacks.image_url already exists");
    return;
  }

  if (!probeError.message.includes("image_url")) {
    console.error("Unexpected error:", probeError.message);
    process.exit(1);
  }

  const { error: rpcError } = await supabase.rpc("exec_sql", {
    sql: "ALTER TABLE feedbacks ADD COLUMN IF NOT EXISTS image_url TEXT;",
  });

  if (rpcError) {
    console.log("Could not run migration automatically.");
    console.log("Run this in Supabase → SQL Editor:\n");
    console.log(
      "ALTER TABLE feedbacks ADD COLUMN IF NOT EXISTS image_url TEXT;"
    );
    process.exit(1);
  }

  console.log("✅ Added feedbacks.image_url column");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
