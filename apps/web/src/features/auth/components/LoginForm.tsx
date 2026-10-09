import { useState } from "react";
import { Mail, Lock, Eye, EyeOff, Shield, ArrowRight } from "lucide-react";
import { Button, Input } from "@stock-inventra/ui";

interface LoginFormProps {
  onSubmit: (credentials: { email: string; password: string }) => void;
  isLoading: boolean;
  error: string | null;
}

export function LoginForm({ onSubmit, isLoading, error }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ email, password });
  };

  return (
    <div className="w-full max-w-[520px] mx-auto">
      <div
        className="rounded-[20px] border border-[#EAE5E0] px-9 sm:px-10 py-[35px] max-h-[calc(100dvh-70px)] overflow-y-auto"
        style={{
          background: "linear-gradient(180deg, #FEFCF8 0%, #FCF9F5 100%)",
          boxShadow:
            "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(122,24,48,0.06)",
        }}
      >
        {/* Header and Logo */}
        <div className="mb-24">
          <div className="flex items-center gap-10 mb-20">
            <svg width="0" height="0" className="hidden">
              <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#9b223c" />
                <stop offset="100%" stopColor="#781529" />
              </linearGradient>
            </svg>
            {/* <div className="flex items-center justify-center p-[6px] bg-white border border-[#EAE5E0] rounded-lg shadow-sm">
              <Box size={20} style={{ stroke: "url(#logo-gradient)" }} strokeWidth={2} />
            </div>
            <h1 className="text-[18px] font-bold text-[#242124]">Stock Inventra</h1> */}
          </div>
          <p className="text-[11px] font-bold tracking-[0.18em] text-[#77706D] uppercase mb-8">
            Welcome Back
          </p>
          <h2 className="text-[26px] font-bold text-[#242124] leading-[1.2] tracking-tight">
            Sign in to Stock Inventra
          </h2>
          <p className="text-[13px] text-[#77706D] mt-8 leading-relaxed">
            Continue to manage your inventory business
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-20 px-16 py-12 rounded-[10px] bg-[#FEF2F2] border border-[#FECACA] text-[#DC2626] text-[13px] leading-relaxed">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-10">
          {/* Email */}
          <div className="space-y-4">
            <label className="block text-[14px] font-semibold text-[#4e4d4d]">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-[14px] flex items-center pointer-events-none">
                <Mail size={16} className="text-[#77706D]" />
              </div>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="!pl-[40px]"
                placeholder="admin@company.com"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-4 !mt-[28px]">
            <label className="block text-[14px] font-semibold text-[#4e4d4d]">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-[14px] flex items-center pointer-events-none">
                <Lock size={16} className="text-[#77706D]" />
              </div>
              <Input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="!pl-[40px] !pr-[40px]"
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-[14px] flex items-center text-[#77706D] hover:text-[#242124] transition-colors"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Remember / Forgot */}
          {/* <div className="flex items-center justify-between">
            <label className="flex items-center gap-8 cursor-pointer select-none group">
              <input
                type="checkbox"
                className="w-[16px] h-[16px] rounded-[4px] border-[#EAE5E0] text-[#7A1830] focus:ring-[#7A1830]/30 cursor-pointer accent-[#7A1830]"
              />
              <span className="text-[13px] text-[#77706D] group-hover:text-[#242124] transition-colors">
                Remember me
              </span>
            </label>
            <button
              type="button"
              className="text-[13px] font-semibold text-[#7A1830] hover:text-[#641326] transition-colors"
            >
              Forgot password?
            </button>
          </div> */}

          {/* Submit */}
          <Button
            type="submit"
            className="w-full justify-center gap-8 !h-[52px] text-[16px] font-semibold !rounded-[8px] !bg-[#781529] hover:!bg-[#651121] !text-white border-none"
            disabled={isLoading}
            loading={isLoading}
          >
            {isLoading ? "Signing In…" : (
              <>
                Sign In <ArrowRight size={18} />
              </>
            )}
          </Button>
        </form>

        {/* Divider */}
        <div className="my-24 flex items-center gap-16">
          <div className="h-px bg-[#EAE5E0] flex-1" />
          <span className="text-[12px] font-semibold text-[#a7a09e] tracking-widest uppercase">
            OR
          </span>
          <div className="h-px bg-[#EAE5E0] flex-1" />
        </div>

        {/* Security Info */}
        <div className="flex gap-12 items-center px-14 py-10 rounded-[12px] bg-[#FAF5EF]">
          <div
            className="flex items-center justify-center w-[48px] h-[48px] rounded-full shrink-0 bg-[#FEFBF6]"
          >
            <Shield size={24} className="text-[#7A1830]" />
          </div>
          <div>
            <p className="text-[13px] font-semibold text-[#3C3834] leading-tight">
              Secure Access
            </p>
            <p className="text-[12px] text-[#969087] mt-[3px] leading-relaxed">
              Your data is protected with enterprise-grade security.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
