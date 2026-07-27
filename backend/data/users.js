// ─────────────────────────────────────────────────────────────────────────────
// backend/data/users.js
// In-memory user store (replace with a real DB like MongoDB / MySQL later)
// Passwords are pre-hashed with bcryptjs (rounds = 10).
//
// To generate a new hash for a password run:
//   node -e "const b=require('bcryptjs'); b.hash('YourPassword',10).then(h=>console.log(h));"
// ─────────────────────────────────────────────────────────────────────────────

const bcrypt = require('bcryptjs');

// Pre-hashed passwords:
//   admin123   → hash below
//   emp123     → hash below
const users = [
  {
    id: 1,
    username: 'admin',
    // password: admin123
    passwordHash: '$2a$10$uGPGhVNzl1nZFMLoQ.w1i.UR9THgK7D42cyzs4ToIvBQK3r09G/Bq',
    role: 'admin',
    name: 'Admin User',
  },
  {
    id: 2,
    username: 'employee1',
    // password: emp123
    passwordHash: '$2a$10$ckfZQr9CI24WQIu4emjV9.vybmHXS4nARAtp/J8odoZk4YIANuUtG',
    role: 'employee',
    name: 'John Doe',
  },
];

/**
 * Find a user by username (case-insensitive).
 * @param {string} username
 * @returns {object|undefined}
 */
function findByUsername(username) {
  return users.find(
    (u) => u.username.toLowerCase() === username.toLowerCase()
  );
}

/**
 * Verify a plain-text password against a stored hash.
 * @param {string} plain
 * @param {string} hash
 * @returns {Promise<boolean>}
 */
async function verifyPassword(plain, hash) {
  return bcrypt.compare(plain, hash);
}

module.exports = { findByUsername, verifyPassword };
