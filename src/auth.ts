import { load, save } from "./storage";

const AUTH_KEY = "authUser";

interface AuthUser {
  email: string;
  name: string;
}

export function login(email: string, password: string): boolean {
  const validEmail = "admin@company.com";
  const validPassword = "admin123";

  if (email === validEmail && password === validPassword) {
    const user: AuthUser = {
      email,
      name: "Admin"
    };
    save<AuthUser | null>(AUTH_KEY, user);
    return true;
  }
  return false;
}

export function logout(): void {
  localStorage.removeItem(AUTH_KEY);
}

export function isLoggedIn(): boolean {
  const user = load<AuthUser | null>(AUTH_KEY, null);
  return !!user;
}

export function getCurrentUserName(): string | null {
  const user = load<AuthUser | null>(AUTH_KEY, null);
  return user ? user.name : null;
}
