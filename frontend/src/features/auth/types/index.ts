export interface User {
  _id: string;
  email: string;
  name: string;
}

export interface AuthResponse {
  access_token: string;
  user?: User; // Depending on backend response, backend currently returns just token or user details too?
  // Based on AuthController, login returns { access_token } and register returns User.
  // We might need to adjust backend to return User on login or fetch it separately.
  // For now, let's assume we might decode token or fetch profile.
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User | null, token: string) => void;
  logout: () => void;
}
