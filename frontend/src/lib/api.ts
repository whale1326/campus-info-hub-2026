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
  is_admin?: boolean;
  created_at?: string;
}

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

export function isLoggedIn(): boolean {
  return !!getToken();
}

export function isAdmin(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem("is_admin") === "true";
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

  updateProfile: (contact: string) =>
    request<{ message: string; user: User }>("/auth/profile", {
      method: "PUT",
      body: JSON.stringify({ contact }),
    }),

  changePassword: (oldPassword: string, newPassword: string) =>
    request<{ message: string }>("/auth/password", {
      method: "PUT",
      body: JSON.stringify({ old_password: oldPassword, new_password: newPassword }),
    }),
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

  getMyPosts: (params?: { category?: string; status?: string; page?: number; page_size?: number }) => {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v) query.append(k, String(v));
      });
    }
    return request<PostsResponse>(`/posts/my${query.toString() ? `?${query}` : ""}`);
  },
};

// === Comments API ===

export interface Comment {
  id: number;
  post_id: number;
  user_id: number;
  content: string;
  created_at: string;
  author_name: string;
  author_is_admin: boolean;
}

export const commentsApi = {
  list: (postId: number) =>
    request<{ comments: Comment[] }>(`/posts/${postId}/comments`),

  create: (postId: number, content: string) =>
    request<{ message: string; comment: Comment }>(`/posts/${postId}/comments`, {
      method: "POST",
      body: JSON.stringify({ content }),
    }),

  delete: (commentId: number) =>
    request<{ message: string }>(`/comments/${commentId}`, {
      method: "DELETE",
    }),
};

// === Stats API ===

export const statsApi = {
  get: () => request<StatsResponse>("/stats"),
};

// === Admin API ===

export interface AdminStats {
  total_users: number;
  total_posts: number;
  active_posts: number;
  by_category: Record<string, number>;
  by_status: Record<string, number>;
  recent_users: Array<{
    id: number;
    username: string;
    contact: string;
    is_admin: boolean;
    created_at: string;
  }>;
}

export interface AdminUser {
  id: number;
  username: string;
  contact: string;
  is_admin: boolean;
  created_at: string;
}

export interface AdminUsersResponse {
  users: AdminUser[];
  total: number;
  page: number;
  page_size: number;
}

export interface AdminPostsResponse {
  posts: Post[];
  total: number;
  page: number;
  page_size: number;
}

export const adminApi = {
  getStats: () => request<AdminStats>("/admin/stats"),

  listUsers: (params?: { keyword?: string; page?: number; page_size?: number }) => {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v) query.append(k, String(v));
      });
    }
    return request<AdminUsersResponse>(`/admin/users${query.toString() ? `?${query}` : ""}`);
  },

  deleteUser: (id: number) =>
    request<{ message: string }>(`/admin/users/${id}`, { method: "DELETE" }),

  listPosts: (params?: {
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
    return request<AdminPostsResponse>(`/admin/posts${query.toString() ? `?${query}` : ""}`);
  },

  deletePost: (id: number) =>
    request<{ message: string }>(`/admin/posts/${id}`, { method: "DELETE" }),

  updatePostStatus: (id: number, status: string) =>
    request<{ message: string; post: Post }>(`/admin/posts/${id}/status`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    }),
};
