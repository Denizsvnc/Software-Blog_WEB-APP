// User Types
export interface User {
  id: string;
  email: string;
  username: string;
  name?: string;
  bio?: string;
  avatarUrl?: string;
  emailVerified?: string;
  role: 'ADMIN' | 'EDITOR' | 'USER';
  status: 'ACTIVE' | 'BANNED' | 'SUSPENDED';
  createdAt: string;
  updatedAt: string;
}

// Category Types
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

// Post Types
export interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  published: boolean;
  viewCount: number;
  imageUrls?: string[];
  videoUrls?: string[];
  createdAt: string;
  updatedAt: string;
  authorId: string;
  author?: {
    id?: string;
    username: string;
    avatarUrl?: string;
    bio?: string;
  };
  categories?: Category[];
  likes?: { userId: string }[];
  _count?: {
    likes: number;
    comments: number;
  };
}

// Comment Types
export interface Comment {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  user?: User;
  postId: string;
}

// Like Types
export interface Like {
  id: string;
  userId: string;
  postId: string;
  createdAt: string;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  error?: string;
}

// Auth Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
  name?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}
