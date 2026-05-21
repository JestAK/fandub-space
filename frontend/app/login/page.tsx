"use client";

import * as React from "react";
import { Header } from "@/components/header";

export default function LoginPage() {
    const [email, setEmail] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [error, setError] = React.useState("");
    const [success, setSuccess] = React.useState("");

    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000";

    React.useEffect(() => {
        if (typeof window !== "undefined") {
            const urlParams = new URLSearchParams(window.location.search);
            const token = urlParams.get("token");
            const refreshToken = urlParams.get("refreshToken");
            const authError = urlParams.get("error");

            if (token && refreshToken) {
                localStorage.setItem("token", token);
                localStorage.setItem("refreshToken", refreshToken);
                window.location.href = "/profile";
            } else if (authError) {
                setError(decodeURIComponent(authError));
            }
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        try {
            const res = await fetch(`${BACKEND_URL}/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Invalid email or password");

            const tokenToSave = data.accessToken || data.token;

            if (tokenToSave) {
                localStorage.setItem("token", tokenToSave);
            }

            if (data.refreshToken) {
                localStorage.setItem("refreshToken", data.refreshToken);
            }

            setSuccess("Login successful! Redirecting...");

            setTimeout(() => {
                window.location.href = "/profile";
            }, 1000);

        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <>
            <Header />
            <main className="flex flex-1 items-center justify-center pt-24 px-5 my-10">
                <div className="w-full max-w-sm rounded-xl border border-white/10 p-6 bg-card flex flex-col gap-4">
                    <h1 className="text-2xl font-semibold tracking-tight text-center">Вхід</h1>

                    {error && <p className="text-sm text-destructive text-center">{error}</p>}
                    {success && <p className="text-sm text-green-500 text-center">{success}</p>}

                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs text-muted-foreground">Email</label>
                            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="h-10 rounded-lg border border-white/15 bg-background px-3 text-sm outline-none focus:border-foreground" />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs text-muted-foreground">Пароль</label>
                            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="h-10 rounded-lg border border-white/15 bg-background px-3 text-sm outline-none focus:border-foreground" />
                        </div>

                        <button type="submit" className="mt-2 h-10 w-full rounded-lg bg-foreground text-sm font-medium text-background hover:opacity-90 cursor-pointer">
                            Увійти
                        </button>
                    </form>

                    <div className="flex flex-col items-center justify-center border-t border-white/5 pt-4">
                        <a href={`${BACKEND_URL}/auth/google`} className="flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-white/15 text-sm font-medium hover:bg-white/5 cursor-pointer">
                            Увійти через Google
                        </a>
                    </div>
                </div>
            </main>
        </>
    );
}