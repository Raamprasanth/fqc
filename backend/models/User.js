// ─────────────────────────────────────────────────────────────────────────────
// backend/models/User.js
// Mongoose schema for SchillerIndia users
// ─────────────────────────────────────────────────────────────────────────────

const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const SALT_ROUNDS = 10;

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      lowercase: true,
      minlength: [3, 'Username must be at least 3 characters'],
    },
    passwordHash: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['admin', 'employee', 'repair', 'service_coordinator', 'fqc', 'pt'],
      default: 'employee',
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    // We can store additional flexible properties for the frontend
    department: { type: String, default: '' },
    designation: { type: String, default: '' },
    divisions: { type: [String], default: [] },
  },
  {
    timestamps: true, // adds createdAt, updatedAt automatically
  }
);

// ── Instance method: compare plain-text password against stored hash ──────────
userSchema.methods.verifyPassword = function (plainPassword) {
  return bcrypt.compare(plainPassword, this.passwordHash);
};

// ── Static method: hash a plain-text password ─────────────────────────────────
userSchema.statics.hashPassword = function (plain) {
  return bcrypt.hash(plain, SALT_ROUNDS);
};

// ── Prevent returning passwordHash in JSON responses ─────────────────────────
userSchema.methods.toSafeObject = function () {
  return {
    id: this._id,
    _id: this._id,
    username: this.username,
    role: this.role,
    _collection: this.role, // For frontend compatibility
    adminId: this.role === 'admin' ? this.username : undefined,
    employeeId: this.role === 'employee' ? this.username : undefined,
    repairTeamId: this.role === 'repair' ? this.username : undefined,
    userId: ['service_coordinator', 'fqc', 'pt'].includes(this.role) ? this.username : undefined,
    name: this.name,
    email: this.email,
    isActive: this.isActive,
    department: this.department,
    designation: this.designation,
    divisions: this.divisions,
    createdAt: this.createdAt,
  };
};

const User = mongoose.model('User', userSchema);

module.exports = User;
