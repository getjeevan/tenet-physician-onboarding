import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { usePhysicianByUserId } from "@/hooks/use-physicians";
import { useDocuments, useCreateDocument } from "@/hooks/use-documents";
import { Layout } from "@/components/Layout";
import { StatusBadge } from "@/components/StatusBadge";
import { ObjectUploader } from "@/components/ObjectUploader";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { FileText, Upload, Eye, ExternalLink, MoreVertical } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export default function Documents() {
  const { user } = useAuth();
  const { data: physician } = usePhysicianByUserId(user?.id);
  const { data: documents = [], isLoading } = useDocuments(physician?.id || 0);
  const { mutate: createDocument, isPending } = useCreateDocument();
  
  const [docType, setDocType] = useState<string>("other");
  const [docName, setDocName] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // This handles the metadata creation after the file is uploaded to storage
  const handleUploadComplete = (result: any) => {
    if (!physician || result.successful.length === 0) return;
    
    const file = result.successful[0];
    const uploadURL = file.uploadURL; 
    
    // Create record in database
    createDocument({
      physicianId: physician.id,
      name: docName || file.name,
      type: docType as any,
      url: uploadURL,
      status: "pending",
    }, {
      onSuccess: () => {
        setIsDialogOpen(false);
        setDocName("");
      }
    });
  };

  const getUploadParams = async (file: any) => {
    const res = await fetch("/api/uploads/request-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: file.name,
        size: file.size,
        contentType: file.type,
      }),
    });
    const { uploadURL } = await res.json();
    return {
      method: "PUT" as const,
      url: uploadURL,
      headers: { "Content-Type": file.type },
    };
  };

  if (!physician) return null;

  return (
    <Layout 
      title="Documents" 
      description="Manage your required credentials and paperwork."
      header={
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 gap-2">
              <Upload className="w-4 h-4" /> Upload Document
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload New Document</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Document Type</Label>
                <Select value={docType} onValueChange={setDocType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="license">Medical License</SelectItem>
                    <SelectItem value="certification">Board Certification</SelectItem>
                    <SelectItem value="identification">Govt Identification</SelectItem>
                    <SelectItem value="contract">Signed Contract</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Document Name</Label>
                <Input 
                  placeholder="e.g. State Medical License 2024" 
                  value={docName}
                  onChange={(e) => setDocName(e.target.value)}
                />
              </div>
              
              <div className="pt-4">
                <ObjectUploader
                  onGetUploadParameters={getUploadParams}
                  onComplete={handleUploadComplete}
                  buttonClassName="w-full bg-slate-900 text-white hover:bg-slate-800 h-12 rounded-lg"
                >
                  Select File & Upload
                </ObjectUploader>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          [1,2,3].map(i => <div key={i} className="h-48 bg-slate-100 rounded-xl animate-pulse" />)
        ) : documents.map((doc) => (
          <Card key={doc.id} className="p-5 hover:shadow-lg transition-shadow duration-300 border-slate-200 group">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 text-slate-400">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => window.open(doc.url, '_blank')}>
                    <ExternalLink className="mr-2 w-4 h-4" /> View
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            <h3 className="font-semibold text-slate-900 mb-1 truncate" title={doc.name}>{doc.name}</h3>
            <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-4">{doc.type}</p>
            
            <div className="flex items-center justify-between mt-auto">
              <StatusBadge status={doc.status} />
              <span className="text-xs text-slate-400">
                {new Date(doc.uploadedAt || '').toLocaleDateString()}
              </span>
            </div>
          </Card>
        ))}

        {documents.length === 0 && (
          <div className="col-span-full py-16 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm text-slate-300">
              <Upload className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-medium text-slate-900">No documents yet</h3>
            <p className="text-slate-500 max-w-sm mx-auto mt-1 mb-6">
              Upload your licenses, certifications, and required paperwork to move forward.
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>Upload First Document</Button>
          </div>
        )}
      </div>
    </Layout>
  );
}
