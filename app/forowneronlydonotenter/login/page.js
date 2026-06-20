"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function OwnerLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/owner-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (data.ok) {
        router.push("/forowneronlydonotenter");
        router.refresh();
      } else {
        setError(data.error || "Wrong password.");
      }
    } catch {
      setError("Something went wrong.");
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#08080f", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: "'JetBrains Mono',monospace" }}>
      <div style={{ fontSize: 40, marginBottom: 16 }}>🔒</div>
      <div style={{ color: "#fff", fontSize: 14, fontWeight: 700, marginBottom: 16 }}>Owner only — password required</div>
      <div style={{ position: "relative", marginBottom: 10 }}>
        <input
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === "Enter" && submit()}
          placeholder="Password"
          autoFocus
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          // iOS Safari applies "smart punctuation" by default on plain text
          // inputs, which can silently swap straight quotes/apostrophes for
          // curly ones as you type - not relevant to this exact password,
          // but worth disabling defensively since it's the kind of thing
          // that corrupts special characters without any visible sign it
          // happened. autoCorrect/autoCapitalize="off" also stop iOS from
          // "helpfully" altering casing or substituting characters.
          style={{ background: "#13131f", border: "1px solid #2a2a3e", borderRadius: 10, color: "#fff", fontSize: 14, padding: "12px 44px 12px 16px", outline: "none", minWidth: 240, textAlign: "center", fontFamily: "inherit", width: "100%", boxSizing: "border-box" }}
        />
        <button
          type="button"
          onClick={() => setShowPassword(s => !s)}
          aria-label={showPassword ? "Hide password" : "Show password"}
          style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 16, padding: 4, color: "#6b7280" }}
        >
          {showPassword ? "🙈" : "👁️"}
        </button>
      </div>
      <button
        onClick={submit}
        disabled={loading || !password}
        style={{ background: "#7c6af7", border: "none", borderRadius: 10, color: "#fff", fontSize: 13, fontWeight: 700, padding: "10px 24px", cursor: "pointer", opacity: (loading || !password) ? 0.6 : 1 }}
      >
        {loading ? "Checking..." : "Unlock"}
      </button>
      {error && <div style={{ color: "#ef4444", fontSize: 12, marginTop: 10 }}>{error}</div>}
    </div>
  );
}
