import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type CreateDocumentRequest, type UpdateDocumentStatusRequest } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function useDocuments(physicianId: number) {
  return useQuery({
    queryKey: [api.documents.list.path, physicianId],
    queryFn: async () => {
      const url = buildUrl(api.documents.list.path, { physicianId });
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch documents");
      return api.documents.list.responses[200].parse(await res.json());
    },
    enabled: !!physicianId,
  });
}

export function useCreateDocument() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: CreateDocumentRequest) => {
      const res = await fetch(api.documents.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to upload document info");
      return api.documents.create.responses[201].parse(await res.json());
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [api.documents.list.path, data.physicianId] });
      toast({
        title: "Document Uploaded",
        description: "Your document has been added to your profile.",
      });
    },
  });
}

export function useUpdateDocumentStatus() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, status, physicianId }: { id: number; physicianId: number } & UpdateDocumentStatusRequest) => {
      const url = buildUrl(api.documents.updateStatus.path, { id });
      const res = await fetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to update document status");
      return api.documents.updateStatus.responses[200].parse(await res.json());
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.documents.list.path, variables.physicianId] });
      toast({
        title: "Status Updated",
        description: `Document status changed to ${variables.status}`,
      });
    },
  });
}
