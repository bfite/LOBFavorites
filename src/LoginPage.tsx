import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) {
      setMessage(`Error: ${error.message}`);
    } else {
      setMessage("Check your email for the login link!");
    }
    setLoading(false);
  }

  return (
    <div style={{ maxWidth: 400, margin: "0 auto", padding: 24 }}>
      <h2 style={{ fontSize: 24, fontWeight: "bold", marginBottom: 16 }}>Login</h2>
      <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <input
          type="email"
          placeholder="Your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ padding: 8, fontSize: 16 }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{ padding: 10, fontSize: 16, backgroundColor: "#4f46e5", color: "white", border: "none", cursor: "pointer" }}
        >
          {loading ? "Sending..." : "Send Magic Link"}
        </button>
      </form>
      {message && <p style={{ marginTop: 16 }}>{message}</p>}
    </div>
  );
}