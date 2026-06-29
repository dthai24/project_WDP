const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    fullName: { type: String },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: true,
      default: "123456"
    },
    role: {
      type: String,
      enum: ["Admin", "Mentor", "Learner", "Student", "Guest"],
      default: "Learner"
    },
    roles: [
      {
        roleId: { type: Number },
        roleName: { type: String }
      }
    ],
    xp: { type: Number, default: 0 },
    streak: { type: Number, default: 0 },
    isBlocked: { type: Boolean, default: false }
  },
  { timestamps: true }
);

// Post-init hook to align fields and roles
userSchema.post("init", function (doc) {
  if (doc.roles && doc.roles.length > 0) {
    const primaryRole = doc.roles[0];
    const roleName = primaryRole.roleName?.trim();
    
    if (roleName === "Admin") {
      doc.role = "Admin";
    } else if (roleName === "Mentor") {
      doc.role = "Mentor";
    } else if (roleName === "Learner" || roleName === "Student") {
      doc.role = "Learner";
    } else {
      // Fallback matching logic
      if (primaryRole.roleId === 3) {
        doc.role = "Admin";
      } else if (primaryRole.roleId === 2) {
        doc.role = "Mentor";
      } else if (primaryRole.roleId === 1) {
        doc.role = "Learner";
      }
    }
  }
  if (!doc.name && doc.fullName) {
    doc.name = doc.fullName;
  }
  if (!doc.fullName && doc.name) {
    doc.fullName = doc.name;
  }
});

// Hash password before saving if modified and not already hashed
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  // Don't double hash
  if (this.password.startsWith("$2a$") || this.password.startsWith("$2b$")) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method supporting both bcrypt and plain text fallback
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (this.password.startsWith("$2a$") || this.password.startsWith("$2b$")) {
    return bcrypt.compare(candidatePassword, this.password);
  }
  return candidatePassword === this.password;
};

module.exports = mongoose.model("User", userSchema);
