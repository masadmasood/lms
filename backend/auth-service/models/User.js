import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      // Note: For demo/seed, password is plain text. In production, always hash passwords!
    },
    role: {
      type: String,
      required: true,
      enum: ["student", "admin"],
      default: "student"
    },
  },
  {
    timestamps: true,
    collection: "users", // ensure collection name is exactly 'users'
  }
);

const User = mongoose.model("User", userSchema);

export default User;
