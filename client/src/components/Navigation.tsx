import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { 
  LayoutDashboard, 
  FileText, 
  CheckSquare, 
  User, 
  LogOut, 
  Stethoscope,
  Users
} from "lucide-react";
import { cn } from "@/lib/utils";

export function Navigation() {
  const [location] = useLocation();
  const { logout, user } = useAuth();

  const isAdmin = user?.email?.includes("admin"); // Simple check for demo

  const navItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    ...(isAdmin ? [
      { href: "/admin", label: "Physicians", icon: Users },
    ] : [
      { href: "/profile", label: "Profile", icon: User },
      { href: "/documents", label: "Documents", icon: FileText },
      { href: "/checklist", label: "Checklist", icon: CheckSquare },
    ]),
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-100 h-screen fixed left-0 top-0 z-50 shadow-sm">
      <div className="p-6 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <Stethoscope className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-display font-bold text-xl text-primary leading-none">MedBoard</h1>
            <p className="text-xs text-muted-foreground mt-1">Physician Onboarding</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <button 
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium",
                  isActive 
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25" 
                    : "text-slate-600 hover:bg-slate-50 hover:text-primary"
                )}
              >
                <item.icon className={cn("w-5 h-5", isActive ? "text-white" : "text-slate-400 group-hover:text-primary")} />
                {item.label}
              </button>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-100">
        <div className="bg-slate-50 rounded-xl p-4 mb-4">
          <div className="flex items-center gap-3 mb-3">
            <img 
              src={user?.profileImageUrl || `https://ui-avatars.com/api/?name=${user?.firstName}+${user?.lastName}`} 
              alt="Profile" 
              className="w-10 h-10 rounded-full border-2 border-white shadow-sm"
            />
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-slate-900 truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button 
            onClick={() => logout()}
            className="w-full flex items-center justify-center gap-2 text-xs font-semibold text-red-500 hover:text-red-600 hover:bg-red-50 py-2 rounded-lg transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </div>
    </aside>
  );
}

export function MobileNav() {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 flex justify-around z-50 shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
      <Link href="/">
        <button className="flex flex-col items-center gap-1 text-slate-500 hover:text-primary">
          <LayoutDashboard className="w-6 h-6" />
          <span className="text-[10px] font-medium">Home</span>
        </button>
      </Link>
      <Link href="/documents">
        <button className="flex flex-col items-center gap-1 text-slate-500 hover:text-primary">
          <FileText className="w-6 h-6" />
          <span className="text-[10px] font-medium">Docs</span>
        </button>
      </Link>
      <Link href="/checklist">
        <button className="flex flex-col items-center gap-1 text-slate-500 hover:text-primary">
          <CheckSquare className="w-6 h-6" />
          <span className="text-[10px] font-medium">Tasks</span>
        </button>
      </Link>
      <Link href="/profile">
        <button className="flex flex-col items-center gap-1 text-slate-500 hover:text-primary">
          <User className="w-6 h-6" />
          <span className="text-[10px] font-medium">Profile</span>
        </button>
      </Link>
    </div>
  );
}
