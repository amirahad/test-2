import { scrypt, randomBytes, timingSafeEqual } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64));
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied, stored) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64));
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

async function main() {
  // Create a new hashed password for "password"
  const password = "password";
  const hashedPassword = await hashPassword(password);
  console.log(`New hashed password for "password": ${hashedPassword}`);
  
  // Create a new hashed password for "demo123"
  const demoPassword = "demo123";
  const hashedDemoPassword = await hashPassword(demoPassword);
  console.log(`New hashed password for "demo123": ${hashedDemoPassword}`);
  
  // Test comparison with the stored hashed password from the database
  const storedPassword = "91b9c79d7dec9be8eb48e3af39b6491716ef6101fb21d62e76d64c1c532e93c6f8e3dfa27e8287ab0c049884535c57c6399441a1be59ad85d430345c5599f0c1.348280b54d04acd718105340503621a6";
  
  // Verify stored password matches
  const isMatch = await comparePasswords(password, storedPassword);
  console.log(`Password "password" matches stored hash: ${isMatch}`);

  // Try another password
  const isMatchDemo = await comparePasswords("demo123", storedPassword);
  console.log(`Password "demo123" matches stored hash: ${isMatchDemo}`);
}

main().catch(console.error);