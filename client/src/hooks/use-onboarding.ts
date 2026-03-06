import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type UpdateStepStatusRequest } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function useOnboardingSteps(physicianId: number) {
  return useQuery({
    queryKey: [api.onboarding.listSteps.path, physicianId],
    queryFn: async () => {
      const url = buildUrl(api.onboarding.listSteps.path, { physicianId });
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch onboarding steps");
      return api.onboarding.listSteps.responses[200].parse(await res.json());
    },
    enabled: !!physicianId,
  });
}

export function useInitializeOnboarding() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (physicianId: number) => {
      const url = buildUrl(api.onboarding.initialize.path, { physicianId });
      const res = await fetch(url, { 
        method: "POST",
        credentials: "include" 
      });
      
      if (!res.ok) throw new Error("Failed to initialize onboarding");
      return api.onboarding.initialize.responses[201].parse(await res.json());
    },
    onSuccess: (data, physicianId) => {
      queryClient.invalidateQueries({ queryKey: [api.onboarding.listSteps.path, physicianId] });
    }
  });
}

export function useUpdateStepStatus() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, status, physicianId }: { id: number; physicianId: number } & UpdateStepStatusRequest) => {
      const url = buildUrl(api.onboarding.updateStep.path, { id });
      const res = await fetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to update step status");
      return api.onboarding.updateStep.responses[200].parse(await res.json());
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.onboarding.listSteps.path, variables.physicianId] });
      if (variables.status === 'completed') {
        toast({
          title: "Step Completed",
          description: "Progress saved successfully.",
        });
      }
    },
  });
}
