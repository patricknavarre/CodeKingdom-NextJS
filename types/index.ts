export interface User {
  _id: string;
  username: string;
  email: string;
  age: number;
  role: 'student' | 'teacher' | 'parent' | 'admin';
  avatar?: {
    head?: string;
    body?: string;
    accessory?: string;
    background?: string;
  };
  coins?: number;
  experience?: number;
  level?: number;
  points?: number;
  characterId?: string;
  characterName?: string;
  characterImage?: string;
  characterAccessories?: any[];
  token?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}
