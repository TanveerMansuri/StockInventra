import { ReactNode } from "react";

interface LoginLayoutProps {
  children: ReactNode;
}

export function LoginLayout({ children }: LoginLayoutProps) {
  return (
    <div
      className="min-h-[100dvh] flex items-center justify-center px-4 sm:px-8 overflow-y-auto box-border"
      style={{
        background: "radial-gradient(circle at 0% 0%, #FEF7F0 0%, transparent 50%), radial-gradient(circle at 100% 0%, #FCF6EF 0%, transparent 50%), radial-gradient(circle at 0% 100%, #F8F1E8 0%, transparent 50%), radial-gradient(circle at 100% 100%, #F7EDE3 0%, transparent 50%), #F5EFE6"
      }}
    >
      {children}
    </div>
  );
}
