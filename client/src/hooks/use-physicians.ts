import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type CreatePhysicianRequest, type UpdatePhysicianRequest } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function usePhysicians() {
  return useQuery({
    queryKey: [api.physicians.list.path],
    queryFn: async () => {
      const res = await fetch(api.physicians.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch physicians");
      return api.physicians.list.responses[200].parse(await res.json());
    },
  });
}

export function usePhysician(id: number) {
  return useQuery({
    queryKey: [api.physicians.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.physicians.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch physician");
      return api.physicians.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

export function usePhysicianByUserId(userId: string | undefined) {
  return useQuery({
    queryKey: ["physician-by-user", userId],
    queryFn: async () => {
      if (!userId) return null;
      const url = buildUrl(api.physicians.getByUserId.path, { userId });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch physician profile");
      return api.physicians.getByUserId.responses[200].parse(await res.json());
    },
    enabled: !!userId,
  });
}

export function useCreatePhysician() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: CreatePhysicianRequest) => {
      const res = await fetch(api.physicians.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to create profile");
      }
      return api.physicians.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.physicians.list.path] });
      queryClient.invalidateQueries({ queryKey: ["physician-by-user"] });
      toast({
        title: "Profile Created",
        description: "Your physician profile has been successfully set up.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useUpdatePhysician() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: number } & UpdatePhysicianRequest) => {
      const url = buildUrl(api.physicians.update.path, { id });
      const res = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to update profile");
      return api.physicians.update.responses[200].parse(await res.json());
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.physicians.get.path, variables.id] });
      queryClient.invalidateQueries({ queryKey: [api.physicians.list.path] });
      toast({
        title: "Profile Updated",
        description: "Changes have been saved successfully.",
      });
    },
  });
}
