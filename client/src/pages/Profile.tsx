import { useAuth } from "@/hooks/use-auth";
import { usePhysicianByUserId, useUpdatePhysician } from "@/hooks/use-physicians";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function Profile() {
  const { user } = useAuth();
  const { data: physician } = usePhysicianByUserId(user?.id);
  const { mutate: updatePhysician, isPending } = useUpdatePhysician();

  const form = useForm({
    defaultValues: {
      specialty: "",
      department: "",
      licenseNumber: "",
      npiNumber: "",
    }
  });

  useEffect(() => {
    if (physician) {
      form.reset({
        specialty: physician.specialty,
        department: physician.department,
        licenseNumber: physician.licenseNumber,
        npiNumber: physician.npiNumber,
      });
    }
  }, [physician, form]);

  const onSubmit = (data: any) => {
    if (physician) {
      updatePhysician({ id: physician.id, ...data });
    }
  };

  if (!physician) return null;

  return (
    <Layout title="My Profile" description="Manage your personal and professional information.">
      <div className="max-w-3xl">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Professional Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>First Name</Label>
                  <Input value={user?.firstName || ''} disabled className="bg-slate-50" />
                </div>
                <div className="space-y-2">
                  <Label>Last Name</Label>
                  <Input value={user?.lastName || ''} disabled className="bg-slate-50" />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Email Address</Label>
                <Input value={user?.email || ''} disabled className="bg-slate-50" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                <div className="space-y-2">
                  <Label>Specialty</Label>
                  <Input {...form.register("specialty")} />
                </div>
                <div className="space-y-2">
                  <Label>Department</Label>
                  <Input {...form.register("department")} />
                </div>
                <div className="space-y-2">
                  <Label>License Number</Label>
                  <Input {...form.register("licenseNumber")} />
                </div>
                <div className="space-y-2">
                  <Label>NPI Number</Label>
                  <Input {...form.register("npiNumber")} />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" size="lg" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
