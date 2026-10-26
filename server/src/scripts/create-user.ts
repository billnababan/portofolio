// Adds a user from the command line (e.g. when locked out).
// Usage: npm run user:create -- <email> <name> <owner|editor> <password>
import bcrypt from "bcryptjs";
import { execute, pool } from "../db/pool.js";

const [email, name, role, password] = process.argv.slice(2);
if (!email || !name || (role !== "owner" && role !== "editor") || !password || password.length < 10) {
  console.error('Usage: npm run user:create -- <email> "<name>" <owner|editor> "<password, 10+ characters>"');
  process.exit(1);
}
await execute(pool, `INSERT INTO users (name, email, role, password_hash) VALUES (?, ?, ?, ?)`, [name, email.toLowerCase(), role, await bcrypt.hash(password, 12)]);
console.log(`user:create: ${email} (${role}) added`);
await pool.end();
