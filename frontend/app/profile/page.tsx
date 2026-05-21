"use client";

import * as React from "react";
import { Header } from "@/components/header";

export default function ProfilePage() {
    const [user, setUser] = React.useState<any>(null);
    const [loading, setLoading] = React.useState(true);

    const [name, setName] = React.useState("");
    const [role, setRole] = React.useState("");

    const [oldPassword, setOldPassword] = React.useState("");
    const [newPassword, setNewPassword] = React.useState("");
    const [confirmedNewPassword, setConfirmedNewPassword] = React.useState("");

    const [postTitle, setPostTitle] = React.useState("");
    const [postContent, setPostContent] = React.useState("");

    const [userPosts, setUserPosts] = React.useState<any[]>([]);
    const [pendingPosts, setPendingPosts] = React.useState<any[]>([]);
    const [error, setError] = React.useState("");
    const [success, setSuccess] = React.useState("");

    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

    const handleLogout = React.useCallback(async () => {
        try {
            const refreshToken = localStorage.getItem("refreshToken");
            if (refreshToken) {
                await fetch(`${BACKEND_URL}/logout`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ token: refreshToken }),
                });
            }
        } catch (err) {
            console.error(err);
        } finally {
            localStorage.removeItem("token");
            localStorage.removeItem("refreshToken");
            window.location.href = "/login";
        }
    }, [BACKEND_URL]);

    const fetchWithAuth = React.useCallback(async (url: string, options: RequestInit = {}) => {
        const token = localStorage.getItem("token");
        const headers = {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...options.headers,
        };

        let res = await fetch(url, { ...options, headers });

        if (res.status === 401) {
            const refreshToken = localStorage.getItem("refreshToken");
            if (refreshToken) {
                const refreshRes = await fetch(`${BACKEND_URL}/refresh-token`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ token: refreshToken }),
                });

                if (refreshRes.ok) {
                    const refreshData = await refreshRes.json();
                    localStorage.setItem("token", refreshData.token);

                    headers.Authorization = `Bearer ${localStorage.getItem("token")}`;
                    res = await fetch(url, { ...options, headers });
                } else {
                    handleLogout();
                }
            } else {
                handleLogout();
            }
        }

        return res;
    }, [BACKEND_URL, handleLogout]);

    const loadProfileData = React.useCallback(async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            window.location.href = "/login";
            return;
        }

        try {
            setLoading(true);
            const res = await fetchWithAuth(`${BACKEND_URL}/profile`);
            if (!res.ok) throw new Error("Failed to load profile");

            const data = await res.json();
            setUser(data);
            setName(data.name);
            setRole(data.role);
            setUserPosts(data.Posts || []);

            if (data.isAdmin) {
                const postsRes = await fetchWithAuth(`${BACKEND_URL}/admin/posts/pending`);
                if (postsRes.ok) {
                    const postsData = await postsRes.json();
                    setPendingPosts(postsData);
                }
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [BACKEND_URL, fetchWithAuth]);

    React.useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            window.location.href = "/login";
        } else {
            loadProfileData();
        }
    }, [loadProfileData]);

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        try {
            const res = await fetchWithAuth(`${BACKEND_URL}/profile/update`, {
                method: "POST",
                body: JSON.stringify({ name, role }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Update failed");

            setSuccess("Profile updated successfully!");
            setUser((prev: any) => ({ ...prev, name, role }));
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (newPassword !== confirmedNewPassword) {
            setError("New passwords do not match");
            return;
        }

        try {
            const res = await fetchWithAuth(`${BACKEND_URL}/profile/change-password`, {
                method: "POST",
                body: JSON.stringify({
                    oldPassword,
                    newPassword,
                    confirmedNewPassword
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Password change failed");

            setSuccess("Password changed successfully!");
            setOldPassword("");
            setNewPassword("");
            setConfirmedNewPassword("");
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleCreatePost = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        try {
            const res = await fetchWithAuth(`${BACKEND_URL}/posts`, {
                method: "POST",
                body: JSON.stringify({ title: postTitle, content: postContent }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to create post");

            setSuccess("Post submitted for moderation!");
            setPostTitle("");
            setPostContent("");

            if (data.post) {
                setUserPosts((prev) => [data.post, ...prev]);
            }
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleModeratePost = async (postId: number, status: "approved" | "rejected") => {
        setError("");
        setSuccess("");

        try {
            const res = await fetchWithAuth(`${BACKEND_URL}/admin/posts/${postId}/moderate`, {
                method: "PUT",
                body: JSON.stringify({ status }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Moderation failed");

            setSuccess(`Post ${status === "approved" ? "approved" : "rejected"} successfully!`);
            setPendingPosts((prev) => prev.filter((p) => p.id !== postId));
        } catch (err: any) {
            setError(err.message);
        }
    };

    if (loading) {
        return (
            <>
                <Header />
                <main className="flex flex-1 items-center justify-center pt-24 text-muted-foreground">
                    Завантаження профілю...
                </main>
            </>
        );
    }

    return (
        <>
            <Header />
            <main className="mx-auto w-full max-w-4xl pt-28 px-5 pb-16 flex flex-col gap-10">
                <div className="flex items-center justify-between border-b border-white/5 pb-5">
                    <div>
                        <h1 className="text-3xl font-semibold tracking-tight">Особистий кабінет</h1>
                        <p className="text-sm text-muted-foreground mt-1">Вітаємо, {user?.name}!</p>
                    </div>
                    <button onClick={handleLogout} className="h-9 px-4 rounded-lg border border-destructive/30 text-destructive text-sm font-medium hover:bg-destructive/10 cursor-pointer">
                        Вийти з акаунта
                    </button>
                </div>

                {error && <p className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg text-center">{error}</p>}
                {success && <p className="text-sm text-green-500 bg-green-500/10 p-3 rounded-lg text-center">{success}</p>}

                <div className="grid gap-6 md:grid-cols-2">
                    <div className="rounded-xl border border-white/10 p-6 bg-card flex flex-col gap-4">
                        <h2 className="text-xl font-medium tracking-tight">Дані профілю</h2>
                        <form onSubmit={handleUpdateProfile} className="flex flex-col gap-4">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs text-muted-foreground">Нікнейм / Ім'я</label>
                                <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="h-10 rounded-lg border border-white/15 bg-background px-3 text-sm outline-none focus:border-foreground" />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs text-muted-foreground">Спеціалізація (Роль)</label>
                                <select value={role} onChange={(e) => setRole(e.target.value)} className="h-10 rounded-lg border border-white/15 bg-background px-3 text-sm outline-none text-foreground focus:border-foreground">
                                    <option value="actor">Актор озвучення</option>
                                    <option value="translator">Перекладач</option>
                                    <option value="sound">Звукорежисер</option>
                                </select>
                            </div>
                            <button type="submit" className="h-10 rounded-lg bg-foreground text-sm font-medium text-background hover:opacity-90 cursor-pointer">
                                Зберегти зміни
                            </button>
                        </form>
                    </div>

                    <div className="rounded-xl border border-white/10 p-6 bg-card flex flex-col gap-4">
                        <h2 className="text-xl font-medium tracking-tight">Безпека</h2>
                        <form onSubmit={handleChangePassword} className="flex flex-col gap-4">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs text-muted-foreground">Старий пароль</label>
                                <input type="password" required value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} className="h-10 rounded-lg border border-white/15 bg-background px-3 text-sm outline-none focus:border-foreground" />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs text-muted-foreground">Новий пароль</label>
                                <input type="password" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="h-10 rounded-lg border border-white/15 bg-background px-3 text-sm outline-none focus:border-foreground" />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs text-muted-foreground">Підтвердження нового паролю</label>
                                <input type="password" required value={confirmedNewPassword} onChange={(e) => setConfirmedNewPassword(e.target.value)} className="h-10 rounded-lg border border-white/15 bg-background px-3 text-sm outline-none focus:border-foreground" />
                            </div>
                            <button type="submit" className="h-10 rounded-lg bg-foreground text-sm font-medium text-background hover:opacity-90 cursor-pointer">
                                Оновити пароль
                            </button>
                        </form>
                    </div>
                </div>

                <div className="rounded-xl border border-white/10 p-6 bg-card flex flex-col gap-4">
                    <h2 className="text-xl font-medium tracking-tight">Створити нову анкету / Пост у портфоліо</h2>
                    <form onSubmit={handleCreatePost} className="flex flex-col gap-4">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs text-muted-foreground">Назва роботи або анкети</label>
                            <input type="text" required value={postTitle} onChange={(e) => setPostTitle(e.target.value)} placeholder="Наприклад: Мій бекстейдж озвучення аніме Фрірен" className="h-10 rounded-lg border border-white/15 bg-background px-3 text-sm outline-none focus:border-foreground" />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs text-muted-foreground">Опис / Текст</label>
                            <textarea required value={postContent} onChange={(e) => setPostContent(e.target.value)} placeholder="Додайте деталі роботи, посилання на релізи або інформацію про обладнання..." rows={4} className="rounded-lg border border-white/15 bg-background p-3 text-sm outline-none focus:border-foreground resize-none" />
                        </div>
                        <button type="submit" className="h-10 rounded-lg bg-foreground text-sm font-medium text-background hover:opacity-90 cursor-pointer">
                            Опублікувати (На модерацію)
                        </button>
                    </form>
                </div>

                <div className="rounded-xl border border-white/10 p-6 bg-card flex flex-col gap-4">
                    <h2 className="text-xl font-medium tracking-tight">Мої пости та анкети</h2>
                    {userPosts.length === 0 ? (
                        <p className="text-sm text-muted-foreground">Ви ще не створили жодного поста.</p>
                    ) : (
                        <div className="grid gap-4 sm:grid-cols-2">
                            {userPosts.map((p: any) => (
                                <div key={p.id} className="rounded-xl border border-white/5 p-4 bg-card/50 flex flex-col justify-between gap-4">
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                                                p.status === "approved" ? "bg-green-500/10 text-green-500" :
                                                    p.status === "rejected" ? "bg-destructive/10 text-destructive" :
                                                        "bg-yellow-500/10 text-yellow-500"
                                            }`}>
                                                {p.status === "approved" ? "Схвалено" : p.status === "rejected" ? "Відхилено" : "На модерації"}
                                            </span>
                                        </div>
                                        <h3 className="font-medium tracking-tight">{p.title}</h3>
                                        <p className="text-sm text-muted-foreground mt-2">{p.content}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {user?.isAdmin && (
                    <div className="rounded-xl border border-yellow-500/20 p-6 bg-yellow-500/[0.02] flex flex-col gap-4">
                        <h2 className="text-xl font-medium tracking-tight text-yellow-500">Панель модератора (Пости на перевірку)</h2>
                        {pendingPosts.length === 0 ? (
                            <p className="text-sm text-muted-foreground">Немає постів, що очікують модерації.</p>
                        ) : (
                            <div className="grid gap-4 sm:grid-cols-2">
                                {pendingPosts.map((p: any) => (
                                    <div key={p.id} className="rounded-xl border border-white/5 p-4 bg-card/50 flex flex-col justify-between gap-4">
                                        <div>
                                            <span className="text-[10px] text-muted-foreground font-mono block mb-1">Автор ID: {p.UserId}</span>
                                            <h3 className="font-medium tracking-tight">{p.title}</h3>
                                            <p className="text-sm text-muted-foreground mt-2">{p.content}</p>
                                        </div>
                                        <div className="flex justify-end gap-2 border-t border-white/5 pt-3">
                                            <button onClick={() => handleModeratePost(p.id, "rejected")} className="text-xs text-destructive hover:underline cursor-pointer">Відхилити</button>
                                            <button onClick={() => handleModeratePost(p.id, "approved")} className="text-xs text-green-500 hover:underline cursor-pointer">Схвалити</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </main>
        </>
    );
}