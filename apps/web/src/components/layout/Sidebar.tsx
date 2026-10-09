
import { NavLink } from "react-router-dom";
import { 
  LayoutDashboard, 
  Package, 
  Boxes, 
  Receipt, 
  Tags, 
  BarChart3, 
  Settings,
  FileBarChart,
  Box,
  LogOut
} from "lucide-react";
import { useAuth } from "../../features/auth/AuthProvider";

const navigationItems = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { label: "Products", path: "/products", icon: Package },
  { label: "Inventory", path: "/inventory", icon: Boxes },
  { label: "Sales", path: "/sales", icon: Receipt },
  { label: "Categories", path: "/categories", icon: Tags },
  { label: "Analytics", path: "/analytics", icon: BarChart3 },
  { label: "Reports", path: "/reports", icon: FileBarChart },
  { label: "Settings", path: "/settings", icon: Settings },
];

export function Sidebar() {
  const { logout } = useAuth();

  const handleLogout = async () => {
    if (window.confirm("Are you sure you want to log out?")) {
      try {
        await logout();
      } catch (error) {
        console.error("Failed to log out", error);
      }
    }
  };

  return (
    <aside className="hidden w-60 flex-col border-r border-border bg-surface md:flex">
      <div className="flex h-[72px] items-center px-[24px] gap-[12px] border-b border-[#EAE5E0] bg-[#FFFFFF]">
        <div className="flex h-[32px] w-[32px] items-center justify-center rounded-[8px] bg-[#781529]">
          <Box className="h-[20px] w-[20px] text-white" strokeWidth={2} />
        </div>
        <div className="flex flex-col">
          <h1 className="text-[16px] font-bold text-[#242124] leading-tight">Stock Inventra</h1>
          <span className="text-[11px] text-[#77706D] font-medium leading-none mt-[4px]">Inventory Management</span>
        </div>
      </div>
      
      <nav className="flex-1 space-y-[8px] px-12 py-12">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-[12px] rounded-md px-[12px] h-[44px] text-body transition-colors ${
                  isActive 
                    ? "bg-[#781529]/10 text-[#781529] font-semibold" 
                    : "text-text-secondary hover:bg-[#781529]/5 hover:text-text-primary"
                }`
              }
            >
              <Icon className="h-16 w-16" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
      
      <div className="mt-auto px-[24px] pb-[16px]">
        <button 
          onClick={handleLogout}
          className="flex w-full items-center gap-[12px] h-[48px] px-[12px] rounded-[10px] text-[#7A1830] font-semibold text-[15px] hover:bg-[#F5E8EC] transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[#7A1830] cursor-pointer"
        >
          <LogOut className="h-[20px] w-[20px]" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
