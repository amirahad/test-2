import crypto from 'crypto';

function hashPassword(password) {
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(16).toString('hex');
    crypto.scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) reject(err);
      resolve(`${derivedKey.toString('hex')}.${salt}`);
    });
  });
}

async function main() {
  const password = 'demo123';
  const hashedPassword = await hashPassword(password);
  console.log(`Password: ${password}`);
  console.log(`Hashed: ${hashedPassword}`);
}

main().catch(console.error);