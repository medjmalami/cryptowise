import { db } from "./src/db";

try {
  await db.execute(`SELECT 1`);
  console.log("Database connection successful!");
} catch (error) {
  console.error("Database connection failed:", error);
}
console.log("Hello via Bun!");