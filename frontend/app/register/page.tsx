"use client";

import * as React from "react";
import { Header } from "@/components/header";

export default function RegisterPage() {
    const [name, setName] = React.useState("");
    const [email, setEmail] = React.useState("");
    const [role, setRole] = React.useState("actor");
    const [password, setPassword] = React.useState("");
    const [confirmedPassword, setConfirmedPassword] = React.useState("");
    const [error, setError] = React.useState("");
    const [success, setSuccess] = React.useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, role, password, confirmedPassword }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Registration failed");

            setSuccess("Registration successful! Redirecting to login...");
            setTimeout(() => window.location.href = "/login", 1500);
        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <>
            <Header />
        <main className="flex flex-1 items-center justify-center pt-24 px-5 my-10">
        <div className="w-full max-w-sm rounded-xl border border-white/10 p-6 bg-card">
        <h1 className="text-2xl font-semibold tracking-tight text-center">Реєстрація</h1>

    {error && <p className="mt-3 text-sm text-destructive text-center">{error}</p>}
        {success && <p className="mt-3 text-sm text-green-500 text-center">{success}</p>}

            <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
        <label className="text-xs text-muted-foreground">Нікнейм / Ім'я</label>
        <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="h-10 rounded-lg border border-white/15 bg-background px-3 text-sm outline-none focus:border-foreground" />
            </div>

            <div className="flex flex-col gap-1.5">
        <label className="text-xs text-muted-foreground">Email</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="h-10 rounded-lg border border-white/15 bg-background px-3 text-sm outline-none focus:border-foreground" />
            </div>

            <div className="flex flex-col gap-1.5">
        <label className="text-xs text-muted-foreground">Спеціалізація (Роль)</label>
            <select value={role} onChange={(e) => setRole(e.target.value)} className="h-10 rounded-lg border border-white/15 bg-background px-3 text-sm outline-none text-foreground focus:border-foreground">
        <option value="actor">Актор озвучення</option>
        <option value="translator">Перекладач</option>
            <option value="sound">Звукорежисер</option>
            </select>
            </div>

            <div className="flex flex-col gap-1.5">
        <label className="text-xs text-muted-foreground">Пароль</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="h-10 rounded-lg border border-white/15 bg-background px-3 text-sm outline-none focus:border-foreground" />
            </div>

            <div className="flex flex-col gap-1.5">
        <label className="text-xs text-muted-foreground">Підтвердження паролю</label>
        <input type="password" required value={confirmedPassword} onChange={(e) => setConfirmedPassword(e.target.value)} className="h-10 rounded-lg border border-white/15 bg-background px-3 text-sm outline-none focus:border-foreground" />
            </div>

            <button type="submit" className="mt-2 h-10 w-full rounded-lg bg-foreground text-sm font-medium text-background hover:opacity-90">
            Створити акаунт
        </button>
        </form>
        </div>
        </main>
        </>
        );
        }