"use client";

import { useState } from "react";
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
  const [status, setStatus] = useState("");

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

  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-xl items-center">
      <Card title="Admin Login" subtitle="Sign in to manage Food Engineering.">
        <div className="space-y-md">
          <FieldWrapper label="Email">
            <Input value={email} onChange={(event) => setEmail(event.target.value)} />
          </FieldWrapper>
          <FieldWrapper label="Password">
            <Input type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
          </FieldWrapper>
          <Button variant="primary" onClick={handleLogin}>
            Sign in
          </Button>
          <p className="text-xs text-muted">{status}</p>
        </div>
      </Card>
    </div>
  );
}
