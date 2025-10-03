import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Insert into Supabase
    const { data, error } = await supabaseAdmin
      .from("users")
      .insert([{ name, email, password_hash: passwordHash }])
      .select();

    if (error) {
      console.error("❌ Supabase insert error:", error);
      return res.status(400).json({ error: error.message });
    }

    const user = data[0];

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(200).json({ user, token });
  } catch (err) {
    console.error("❌ Signup API error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
