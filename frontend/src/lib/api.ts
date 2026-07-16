/**
 * API client for Campus Info Hub backend.
 * All requests are proxied through Next.js rewrites to the Flask backend.
 */

const API_BASE = "/api";

export interface Post {
  id: number;
  user_id: number;
  title: string;
  content: string;
  category: "lost_found" | "market" | "info";
  contact: string;
  price: number;
  status: "active" | "resolved" | "closed";
  image_url: string;
  created_at: string;
  updated_at: string;
  author_name: string;
  author_contact?: string;
}

export interface PostsResponse {
  posts: Post[];
  total: number;
  page: number;
  page_size: number;
}

export interface StatsResponse {
  total_posts: number;
  by_category: Record<string, number>;
  recent_posts: Array<{
    id: number;
    title: string;
    category: string;
    created_at: string;
    author_name: string;
  }>;
}

export interface User {
  id: number;
  username: string;
  contact: string;
}

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

export function isLoggedIn(): boolean {
  return !!getToken();
}

function authHeaders(): HeadersInit {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...authHeaders(),
    ...options.headers,
  };

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || data.message || `Request failed: ${res.status}`);
  }

  return data as T;
}

// === Auth API ===

export const authApi = {
  register: (username: string, password: string, contact?: string) =>
    request<{ message: string; token: string; user: User }>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ username, password, contact }),
    }),

  login: (username: string, password: string) =>
    request<{ message: string; token: string; user: User }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),

  getProfile: () =>
    request<{ user: User }>("/auth/profile"),
};

// === Posts API ===

export const postsApi = {
  list: (params?: {
    category?: string;
    status?: string;
    keyword?: string;
    page?: number;
    page_size?: number;
  }) => {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v) query.append(k, String(v));
      });
    }
    return request<PostsResponse>(`/posts${query.toString() ? `?${query}` : ""}`);
  },

  get: (id: number) =>
    request<{ post: Post }>(`/posts/${id}`),

  create: (data: {
    title: string;
    content: string;
    category: string;
    contact?: string;
    price?: number;
    image_url?: string;
  }) =>
    request<{ message: string; post: Post }>("/posts", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: number, data: Partial<Post>) =>
    request<{ message: string; post: Post }>(`/posts/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (id: number) =>
    request<{ message: string }>(`/posts/${id}`, {
      method: "DELETE",
    }),
};

// === Stats API ===

export const statsApi = {
  get: () => request<StatsResponse>("/stats"),
};
