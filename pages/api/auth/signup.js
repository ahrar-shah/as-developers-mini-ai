import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Missing fields" });
    }

    // hash password
    const hash = await bcrypt.hash(password, 10);

    // insert user
    const { data, error } = await supabaseAdmin
      .from("users")
      .insert([{ name, email, password_hash: hash }])
      .select();

    if (error) {
      console.error("Supabase insert error:", error); // 🔥 will show exact issue in Vercel logs
      return res.status(400).json({ error: error.message });
    }

    const user = data[0];

    // issue JWT
    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    return res.status(200).json({ user, token });
  } catch (err) {
    console.error("Signup handler error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
