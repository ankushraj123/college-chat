import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Confession, InsertConfession } from "@shared/schema";

export function useConfessions(collegeCode?: string) {
  return useQuery({
    queryKey: ["/api/confessions", collegeCode],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (collegeCode) params.append("collegeCode", collegeCode);
      
      const response = await fetch(`/api/confessions?${params}`);
      if (!response.ok) throw new Error("Failed to fetch confessions");
      return response.json() as Promise<Confession[]>;
    },
  });
}

export function useCreateConfession() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (confession: InsertConfession) => {
      const sessionToken = localStorage.getItem("sessionToken");
      const response = await apiRequest("POST", "/api/confessions", confession);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/confessions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/daily-limit"] });
    },
  });
}

export function useToggleLike(confessionId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/confessions/${confessionId}/like`, {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/confessions"] });
    },
  });
}
