"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { API_BASE } from "@/lib/api";
import { AUTH_TOKEN_KEY } from "@/lib/auth";
import { Button } from "@/components/design-system/Button";
import { Card } from "@/components/design-system/Card";
import { FieldWrapper, Input } from "@/components/design-system/Form";

type LoginResponse = {
  accessToken: string;
};

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@foodengineering.com");
  const [password, setPassword] = useState("Admin@123");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [mode, setMode] = useState<"login" | "forgot" | "reset">("login");
  const [status, setStatus] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("reset");
    if (token) {
      setResetToken(token);
      setMode("reset");
    }
  }, []);

  const handleLogin = async () => {
    setStatus("Signing in...");
    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        throw new Error("Login failed");
      }

      const data = (await response.json()) as LoginResponse;
      window.localStorage.setItem(AUTH_TOKEN_KEY, data.accessToken);
      setStatus("Success. Redirecting...");
      router.replace("/admin");
    } catch (error) {
      setStatus("Invalid credentials.");
    }
  };

  const handleForgot = async () => {
    setStatus("Sending reset link...");
    try {
      const response = await fetch(`${API_BASE}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });

      if (!response.ok) {
        throw new Error("Request failed");
      }

      const data = (await response.json()) as { resetToken?: string };
      if (data.resetToken) {
        setResetToken(data.resetToken);
        setMode("reset");
        setStatus("Reset token generated for dev use.");
        return;
      }

      setStatus("Check your email for the reset link.");
    } catch (error) {
      setStatus("Unable to start reset flow.");
    }
  };

  const handleReset = async () => {
    setStatus("Updating password...");
    try {
      const response = await fetch(`${API_BASE}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: resetToken, password: newPassword })
      });

      if (!response.ok) {
        throw new Error("Reset failed");
      }

      setStatus("Password updated. Sign in now.");
      setMode("login");
    } catch (error) {
      setStatus("Reset token invalid or expired.");
    }
  };

  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-xl items-center">
      <Card title="Admin Login" subtitle="Sign in to manage Food Engineering.">
        <div className="space-y-md">
          <FieldWrapper label="Email">
            <Input value={email} onChange={(event) => setEmail(event.target.value)} />
          </FieldWrapper>

          {mode === "login" ? (
            <>
              <FieldWrapper label="Password">
                <Input type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
              </FieldWrapper>
              <div className="flex flex-wrap items-center gap-sm">
                <Button variant="primary" onClick={handleLogin}>
                  Sign in
                </Button>
                <Button variant="ghost" onClick={() => setMode("forgot")}>
                  Forgot password
                </Button>
              </div>
            </>
          ) : null}

          {mode === "forgot" ? (
            <>
              <Button variant="primary" onClick={handleForgot}>
                Send reset link
              </Button>
              <Button variant="ghost" onClick={() => setMode("login")}>
                Back to login
              </Button>
            </>
          ) : null}

          {mode === "reset" ? (
            <>
              <FieldWrapper label="Reset token">
                <Input value={resetToken} onChange={(event) => setResetToken(event.target.value)} />
              </FieldWrapper>
              <FieldWrapper label="New password">
                <Input type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} />
              </FieldWrapper>
              <div className="flex flex-wrap items-center gap-sm">
                <Button variant="primary" onClick={handleReset}>
                  Update password
                </Button>
                <Button variant="ghost" onClick={() => setMode("login")}>
                  Back to login
                </Button>
              </div>
            </>
          ) : null}

          <p className="text-xs text-muted">{status}</p>
        </div>
      </Card>
    </div>
  );
}
