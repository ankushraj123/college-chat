import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { User } from "@shared/schema";

export function useAuth() {
  return useQuery({
    queryKey: ["/api/auth/me"],
    queryFn: async () => {
      const sessionToken = localStorage.getItem("adminSessionToken");
      if (!sessionToken) return null;
      
      try {
        const response = await fetch("/api/auth/me", {
          headers: { "x-session-token": sessionToken },
        });
        if (!response.ok) return null;
        return response.json() as Promise<User>;
      } catch {
        return null;
      }
    },
  });
}

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      username,
      password,
      college_id,
    }: {
      username: string;
      password: string;
      college_id: string;
    }) => {
      const response = await apiRequest("POST", "/api/auth/login", {
        username,
        password,
        college_id,
      });
      return response.json();
    },
    onSuccess: (data) => {
      localStorage.setItem("adminSessionToken", data.sessionToken);
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      localStorage.removeItem("adminSessionToken");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
    },
  });
}