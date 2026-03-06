import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, ShieldCheck, Clock } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-lg border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold">M</div>
            <span className="font-display font-bold text-xl text-slate-900">MedBoard</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="/api/login">
              <Button variant="ghost" className="hidden sm:inline-flex text-slate-600">Sign In</Button>
            </a>
            <a href="/api/login">
              <Button className="bg-primary hover:bg-primary/90 rounded-full px-6">
                Get Started
              </Button>
            </a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="max-w-2xl animate-enter">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-primary text-sm font-medium mb-6">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                New Physician Portal
              </div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-display font-bold text-slate-900 tracking-tight leading-[1.1] mb-6">
                Streamline your <span className="text-primary">medical onboarding</span>
              </h1>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed max-w-lg">
                Complete credentials, sign contracts, and manage onboarding tasks in one secure, compliant platform designed for healthcare professionals.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a href="/api/login">
                  <Button size="lg" className="bg-primary hover:bg-primary/90 h-14 px-8 rounded-full text-lg w-full sm:w-auto shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 transition-all duration-300">
                    Start Onboarding <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </a>
                <Button variant="outline" size="lg" className="h-14 px-8 rounded-full text-lg w-full sm:w-auto border-2 hover:bg-slate-50">
                  Contact Support
                </Button>
              </div>
            </div>
            <div className="relative lg:h-[600px] w-full hidden lg:block">
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-100 to-teal-50 rounded-[3rem] transform rotate-3 scale-95 opacity-50 blur-3xl"></div>
              {/* Abstract dashboard representation */}
              <div className="relative z-10 bg-white rounded-2xl shadow-2xl border border-slate-100 p-6 max-w-md mx-auto transform hover:-translate-y-2 transition-transform duration-500">
                <div className="flex items-center justify-between mb-6">
                  <div className="h-8 w-24 bg-slate-100 rounded-lg"></div>
                  <div className="h-8 w-8 bg-blue-100 rounded-full"></div>
                </div>
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-4 p-3 rounded-xl border border-slate-50 bg-slate-50/50">
                      <div className="w-10 h-10 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-primary">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <div className="h-2 w-24 bg-slate-200 rounded mb-2"></div>
                        <div className="h-2 w-16 bg-slate-100 rounded"></div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 pt-6 border-t border-slate-100">
                  <div className="flex justify-between items-center">
                    <div className="h-2 w-20 bg-slate-200 rounded"></div>
                    <div className="h-8 w-24 bg-primary rounded-lg"></div>
                  </div>
                </div>
              </div>
              
              {/* Floating badges */}
              <div className="absolute top-20 right-10 bg-white p-4 rounded-xl shadow-xl border border-slate-100 flex items-center gap-3 animate-bounce duration-[3000ms]">
                <ShieldCheck className="w-8 h-8 text-teal-500" />
                <div>
                  <p className="font-bold text-slate-900">HIPAA Compliant</p>
                  <p className="text-xs text-slate-500">Secure & Encrypted</p>
                </div>
              </div>

              <div className="absolute bottom-40 left-0 bg-white p-4 rounded-xl shadow-xl border border-slate-100 flex items-center gap-3 animate-bounce duration-[4000ms]">
                <Clock className="w-8 h-8 text-primary" />
                <div>
                  <p className="font-bold text-slate-900">Fast Track</p>
                  <p className="text-xs text-slate-500">2x Faster Processing</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-slate-50 py-12 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-500 text-sm">
          <p>© 2024 Tenet Healthcare. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
