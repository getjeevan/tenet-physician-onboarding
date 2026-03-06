import { usePhysicians } from "@/hooks/use-physicians";
import { Layout } from "@/components/Layout";
import { StatusBadge } from "@/components/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Filter, MoreHorizontal } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function AdminDashboard() {
  const { data: physicians = [], isLoading } = usePhysicians();
  const [search, setSearch] = useState("");

  const filteredPhysicians = physicians.filter(p => 
    p.user.firstName?.toLowerCase().includes(search.toLowerCase()) || 
    p.user.lastName?.toLowerCase().includes(search.toLowerCase()) ||
    p.department.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout 
      title="Admin Dashboard" 
      description="Manage all physicians in the onboarding pipeline."
    >
      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Physicians", value: physicians.length, color: "text-slate-900" },
          { label: "In Onboarding", value: physicians.filter(p => p.status === 'onboarding').length, color: "text-blue-600" },
          { label: "Pending Review", value: physicians.filter(p => p.status === 'review').length, color: "text-amber-600" },
          { label: "Active", value: physicians.filter(p => p.status === 'active').length, color: "text-emerald-600" },
        ].map((stat, idx) => (
          <Card key={idx} className="shadow-sm">
            <CardContent className="p-6">
              <p className="text-sm font-medium text-slate-500">{stat.label}</p>
              <p className={`text-3xl font-bold mt-2 ${stat.color}`}>{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between gap-4">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              placeholder="Search physicians..." 
              className="pl-10 bg-slate-50 border-slate-200" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button variant="outline" className="gap-2 text-slate-600">
            <Filter className="w-4 h-4" /> Filter
          </Button>
        </div>

        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow>
              <TableHead className="w-[250px]">Physician</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-slate-500">Loading...</TableCell>
              </TableRow>
            ) : filteredPhysicians.map((p) => (
              <TableRow key={p.id} className="hover:bg-slate-50/50">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                      {p.user.firstName?.[0]}{p.user.lastName?.[0]}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{p.user.firstName} {p.user.lastName}</p>
                      <p className="text-xs text-slate-500">{p.user.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{p.department}</TableCell>
                <TableCell>{new Date(p.startDate).toLocaleDateString()}</TableCell>
                <TableCell><StatusBadge status={p.status} /></TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="w-4 h-4 text-slate-400" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Layout>
  );
}
