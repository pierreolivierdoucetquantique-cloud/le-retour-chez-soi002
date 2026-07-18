import { migrate } from "drizzle-orm/postgres-js/migrator";
import { db, sql } from "./client";

async function run() {
  console.log("Application des migrations...");
  await migrate(db, { migrationsFolder: "./drizzle" });
  console.log("Migrations appliquées avec succès.");
}

run()
  .catch((err) => {
    console.error("Échec des migrations :", err);
    process.exitCode = 1;
  })
  .finally(() => {
    void sql.end();
  });
