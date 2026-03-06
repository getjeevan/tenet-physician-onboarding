import { useAuth } from "@/hooks/use-auth";
import { usePhysicianByUserId } from "@/hooks/use-physicians";
import { useOnboardingSteps, useInitializeOnboarding } from "@/hooks/use-onboarding";
import { useDocuments } from "@/hooks/use-documents";
import { Layout } from "@/components/Layout";
import { StatusBadge } from "@/components/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { FileText, CheckCircle2, ArrowRight, AlertCircle, Calendar } from "lucide-react";
import { useEffect } from "react";
import CreateProfile from "./CreateProfile";

export default function Dashboard() {
  const { user } = useAuth();
  const { data: physician, isLoading: isLoadingProfile } = usePhysicianByUserId(user?.id);
  const { data: steps = [] } = useOnboardingSteps(physician?.id || 0);
  const { data: documents = [] } = useDocuments(physician?.id || 0);
  const { mutate: initializeSteps } = useInitializeOnboarding();

  useEffect(() => {
    if (physician?.id && steps.length === 0) {
      initializeSteps(physician.id);
    }
  }, [physician?.id, steps.length, initializeSteps]);

  if (isLoadingProfile) return <div className="flex h-screen items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;

  if (!physician) return <CreateProfile />;

  // Metrics
  const completedSteps = steps.filter(s => s.status === 'completed').length;
  const totalSteps = steps.length || 1;
  const progressPercentage = Math.round((completedSteps / totalSteps) * 100);
  
  const pendingDocs = documents.filter(d => d.status === 'pending').length;
  const approvedDocs = documents.filter(d => d.status === 'approved').length;

  return (
    <Layout 
      title={`Welcome back, Dr. ${user?.lastName}`}
      description="Here's an overview of your onboarding progress."
      header={
        <Link href="/profile">
          <Button variant="outline" className="hidden sm:flex">Edit Profile</Button>
        </Link>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Progress Card */}
        <Card className="col-span-1 md:col-span-2 shadow-lg border-primary/10 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16"></div>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium text-slate-600">Onboarding Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between mb-2">
              <span className="text-4xl font-bold text-slate-900">{progressPercentage}%</span>
              <span className="text-sm text-slate-500 mb-1">{completedSteps} of {totalSteps} steps completed</span>
            </div>
            <Progress value={progressPercentage} className="h-3 bg-slate-100" indicatorClassName="bg-primary" />
            <div className="mt-6 flex gap-4">
              <Link href="/checklist">
                <Button className="bg-primary hover:bg-primary/90 rounded-lg">
                  Continue Checklist <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Status Card */}
        <Card className="shadow-lg border-slate-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium text-slate-600">Current Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <span className="text-sm font-medium text-slate-600">Application</span>
                <StatusBadge status={physician.status} />
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-500">Start Date</p>
                  <p className="font-medium text-slate-900">{new Date(physician.startDate).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity / Next Steps */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-secondary" />
            Next Steps
          </h3>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 divide-y divide-slate-100">
            {steps.filter(s => s.status !== 'completed').slice(0, 3).map(step => (
              <div key={step.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${step.isRequired ? 'bg-red-400' : 'bg-slate-300'}`} />
                  <div>
                    <p className="font-medium text-slate-900">{step.stepName}</p>
                    <p className="text-xs text-slate-500">{step.description}</p>
                  </div>
                </div>
                <StatusBadge status={step.status} />
              </div>
            ))}
            {steps.filter(s => s.status !== 'completed').length === 0 && (
              <div className="p-8 text-center text-slate-500">
                <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
                <p>All steps completed! Great job.</p>
              </div>
            )}
          </div>
        </div>

        {/* Documents Status */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-500" />
            Documents Overview
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 mb-2">
                <AlertCircle className="w-5 h-5" />
              </div>
              <span className="text-2xl font-bold text-slate-900">{pendingDocs}</span>
              <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">Pending Review</span>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 mb-2">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <span className="text-2xl font-bold text-slate-900">{approvedDocs}</span>
              <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">Approved</span>
            </div>
          </div>
          
          <Link href="/documents">
            <Button variant="outline" className="w-full justify-between group">
              Manage Documents
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>
    </Layout>
  );
}
