"use client";

import { createContext, useContext } from "react";
import type { UserResponse } from "./types";

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  barCouncilId?: string;
}

export interface AuthContextType {
  user: UserResponse | null;
  token: string | null;
  isAuthenticated: boolean;
  /** True while the provider restores the session from localStorage on mount. */
  initializing: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isAuthenticated: false,
  initializing: true,
  login: async () => {},
  register: async () => {},
  logout: () => {},
});

export function useAuth(): AuthContextType {
  return useContext(AuthContext);
}
