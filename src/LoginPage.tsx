import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
);

export default function SimpleLogin() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  async function handleLogin() {
    if (!email) {
      setMessage("Please enter an email.");
      return;
    }

    const { data: existingUser, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .limit(1)
      .single();

    if (error && error.code !== "PGRST116") {
      setMessage("Error querying user: " + error.message);
      return;
    }

    if (existingUser) {
      setMessage("Welcome back, " + existingUser.email);
      localStorage.setItem("userEmail", existingUser.email);
      navigate("/");
    } else {
      const { data: newUser, error: insertError } = await supabase
        .from("users")
        .insert({ email })
        .select()
        .single();

      if (insertError) {
        setMessage("Error creating user: " + insertError.message);
        return;
      }

      setMessage("Account created for " + newUser.email);
      localStorage.setItem("userEmail", newUser.email);
      navigate("/");
    }
  }

  return (
   <div className="login-wrapper">
  <div className="login-card">
    <h2>Login</h2>
    <input
      type="email"
      placeholder="Your email"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
    />
    <button onClick={handleLogin}>Login</button>
    <p>{message}</p>
  </div>
</div>
  );
}
