import { ReactNode } from "react";
import { Navigation, MobileNav } from "./Navigation";

interface LayoutProps {
  children: ReactNode;
  header?: ReactNode;
  title: string;
  description?: string;
}

export function Layout({ children, header, title, description }: LayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50/50 flex">
      <Navigation />
      
      <main className="flex-1 md:ml-64 pb-20 md:pb-8 animate-enter">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-display font-bold text-slate-900">{title}</h1>
              {description && (
                <p className="mt-1 text-slate-500 text-sm md:text-base">{description}</p>
              )}
            </div>
            {header && (
              <div className="flex items-center gap-3">
                {header}
              </div>
            )}
          </div>
          
          {children}
        </div>
      </main>

      <MobileNav />
    </div>
  );
}
