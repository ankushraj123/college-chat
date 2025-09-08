import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

interface DailyLimit {
  used: number;
  limit: number;
  remaining: number;
}

export function useDailyLimit() {
  const queryClient = useQueryClient();
  
  const query = useQuery({
    queryKey: ["/api/daily-limit"],
    queryFn: async (): Promise<DailyLimit> => {
      const sessionToken = localStorage.getItem("sessionToken");
      const response = await fetch("/api/daily-limit", {
        headers: sessionToken ? { "x-session-token": sessionToken } : {},
      });
      if (!response.ok) throw new Error("Failed to fetch daily limit");
      return response.json();
    },
  });

  // Refetch every minute to keep limit updated
  useEffect(() => {
    const interval = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ["/api/daily-limit"] });
    }, 60000);

    return () => clearInterval(interval);
  }, [queryClient]);

  return query;
}
