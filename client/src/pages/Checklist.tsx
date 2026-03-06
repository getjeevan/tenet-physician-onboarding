import { useAuth } from "@/hooks/use-auth";
import { usePhysicianByUserId } from "@/hooks/use-physicians";
import { useOnboardingSteps, useUpdateStepStatus } from "@/hooks/use-onboarding";
import { Layout } from "@/components/Layout";
import { StatusBadge } from "@/components/StatusBadge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Checklist() {
  const { user } = useAuth();
  const { data: physician } = usePhysicianByUserId(user?.id);
  const { data: steps = [], isLoading } = useOnboardingSteps(physician?.id || 0);
  const { mutate: updateStatus, isPending } = useUpdateStepStatus();

  if (!physician) return null;

  const handleStepAction = (stepId: number, currentStatus: string) => {
    const nextStatus = currentStatus === 'completed' ? 'pending' : 'completed';
    updateStatus({ id: stepId, physicianId: physician.id, status: nextStatus as any });
  };

  return (
    <Layout 
      title="Onboarding Checklist" 
      description="Complete these steps to finalize your onboarding."
    >
      <div className="max-w-3xl">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden divide-y divide-slate-100">
          {isLoading ? (
            <div className="p-8 text-center text-slate-500">Loading checklist...</div>
          ) : steps.map((step) => {
            const isCompleted = step.status === 'completed';
            
            return (
              <div 
                key={step.id} 
                className={cn(
                  "p-6 flex gap-4 transition-colors",
                  isCompleted ? "bg-slate-50/50" : "hover:bg-slate-50"
                )}
              >
                <button
                  onClick={() => handleStepAction(step.id, step.status)}
                  disabled={isPending}
                  className={cn(
                    "flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all mt-1",
                    isCompleted 
                      ? "bg-emerald-500 border-emerald-500 text-white" 
                      : "border-slate-300 text-transparent hover:border-primary"
                  )}
                >
                  <CheckCircle2 className="w-4 h-4" />
                </button>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className={cn("font-semibold text-lg", isCompleted ? "text-slate-500 line-through decoration-slate-300" : "text-slate-900")}>
                      {step.stepName}
                    </h3>
                    {step.isRequired && !isCompleted && (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-red-500 bg-red-50 px-2 py-1 rounded-full">Required</span>
                    )}
                  </div>
                  <p className="text-slate-500 mb-4 text-sm leading-relaxed">{step.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <StatusBadge status={step.status} />
                    {isCompleted && (
                      <span className="text-xs text-slate-400">
                        Completed on {new Date(step.completedAt || '').toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Layout>
  );
}
