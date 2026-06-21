const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: { type: String },
    fullName: { type: String },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["Admin", "Mentor", "Student", "Guest"], default: "Student" },
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
    if (primaryRole.roleId === 3 || primaryRole.roleName === "Admin") {
      doc.role = "Admin";
    } else if (primaryRole.roleId === 2 || primaryRole.roleName === "Mentor") {
      doc.role = "Mentor";
    } else if (primaryRole.roleId === 1 || primaryRole.roleName === "Student") {
      doc.role = "Student";
    } else if (primaryRole.roleId === 4 || primaryRole.roleName === "Guest") {
      doc.role = "Guest";
    }
  }
  if (!doc.name && doc.fullName) {
    doc.name = doc.fullName;
  }
  if (!doc.fullName && doc.name) {
    doc.fullName = doc.name;
  }
});

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
