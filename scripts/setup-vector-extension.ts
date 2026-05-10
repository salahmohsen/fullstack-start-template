import { sql } from "drizzle-orm";
import { db } from "../src/lib/db/index.js";

async function setupVectorExtension() {
  try {
    console.log("🚀 Setting up vector extension...");

    // Check if vector extension is already enabled
    const extensionCheck = await db.execute(sql`
      SELECT EXISTS(
        SELECT 1 FROM pg_extension WHERE extname = 'vector'
      ) as extension_exists;
    `);

    const result = extensionCheck.rows[0] as { extension_exists: boolean };
    if (result.extension_exists) {
      console.log("✅ Vector extension is already enabled!");
      return;
    }

    // Enable vector extension
    await db.execute(sql`CREATE EXTENSION IF NOT EXISTS vector;`);

    console.log("✅ Vector extension has been successfully enabled!");
    console.log(
      "📝 Your database is now ready for vector operations and embeddings.",
    );
  } catch (error) {
    console.error("❌ Failed to setup vector extension:");

    if (error instanceof Error) {
      if (error.message.includes("permission denied")) {
        console.error(
          "Permission denied. Make sure your database user has the necessary privileges.",
        );
        console.log("\n📋 Manual Setup Instructions:");
        console.log("1. Open your Neon dashboard");
        console.log("2. Navigate to SQL Editor");
        console.log("3. Run the following query:");
        console.log("   CREATE EXTENSION vector;");
        console.log(
          "\n🔗 Neon docs: https://neon.tech/docs/extensions/pg_vector",
        );
      } else if (error.message.includes("does not exist")) {
        console.error("Vector extension is not available on this database.");
        console.log("\n📋 For Neon users:");
        console.log("1. Open your Neon dashboard at https://console.neon.tech");
        console.log("2. Navigate to SQL Editor");
        console.log("3. Run the following query:");
        console.log("   CREATE EXTENSION vector;");
        console.log(
          "\n🔗 Neon docs: https://neon.tech/docs/extensions/pg_vector",
        );
      } else {
        console.error(error.message);
      }
    }

    process.exit(1);
  }
}

// Run the setup

setupVectorExtension().catch((error) => {
  console.error("❌ Unexpected error:", error);
  process.exit(1);
});
