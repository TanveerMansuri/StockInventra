
import { NavLink } from "react-router-dom";
import { 
  LayoutDashboard, 
  Package, 
  Boxes, 
  Receipt, 
  Tags, 
  BarChart3, 
  Settings,
  FileBarChart
} from "lucide-react";

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

import { Box } from "lucide-react";

export function Sidebar() {
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
      
      <div className="p-16 mt-auto">
        <div className="rounded-lg bg-background p-12 text-center shadow-sm border border-border">
          <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 text-primary">
            <span className="text-small">👑</span>
          </div>
          <h4 className="mb-2 text-body-strong">Upgrade to Pro</h4>
          <p className="mb-8 text-caption text-text-secondary">Get advanced reports and more.</p>
          <button className="w-full rounded-md bg-primary py-6 text-caption font-semibold text-surface transition-colors hover:bg-primary-dark">
            Upgrade
          </button>
        </div>
      </div>
    </aside>
  );
}
