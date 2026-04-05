"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";

interface SubscriptionInfo {
  planName: string;
  tier: string;
  queriesUsedToday: number;
  dailyLimit: number;
  expiresAt?: string;
}

interface UseSubscriptionReturn {
  subscription: SubscriptionInfo | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  isWithinLimit: boolean;
}

export function useSubscription(): UseSubscriptionReturn {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!user) {
      setSubscription(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await api.get<SubscriptionInfo>("/api/my-subscription");
      if (response.success && response.data) {
        setSubscription(response.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load subscription");
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const isWithinLimit = subscription
    ? subscription.dailyLimit === -1 || subscription.queriesUsedToday < subscription.dailyLimit
    : true;

  return { subscription, isLoading, error, refresh, isWithinLimit };
}
