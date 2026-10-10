import { useState } from "react";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Button, Input } from "@stock-inventra/ui";

interface ForgotPasswordFormProps {
  onBack: () => void;
  onRequestOTP: (email: string) => Promise<boolean>;
  onResetPassword: (email: string, otp: string, newPassword: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export function ForgotPasswordForm({ onBack, onRequestOTP, onResetPassword, isLoading, error }: ForgotPasswordFormProps) {
  const [step, setStep] = useState<"request" | "reset">("request");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await onRequestOTP(email);
    if (success) {
      setStep("reset");
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onResetPassword(email, otp, newPassword);
  };

  return (
    <div className="w-full max-w-[520px] mx-auto">
      <div
        className="rounded-[20px] border border-[#EAE5E0] px-9 sm:px-10 py-[35px]"
        style={{
          background: "linear-gradient(180deg, #FEFCF8 0%, #FCF9F5 100%)",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(122,24,48,0.06)",
        }}
      >
        <div className="mb-16">
          <p className="text-[11px] font-bold tracking-[0.18em] text-[#77706D] uppercase mb-8">
            Account Recovery
          </p>
          <h2 className="text-[26px] font-bold text-[#242124] leading-[1.2] tracking-tight">
            {step === "request" ? "Forgot Password" : "Reset Password"}
          </h2>
          <p className="text-[13px] text-[#77706D] mt-4 leading-relaxed">
            {step === "request" 
              ? "Enter your email address and we'll send you a 6-digit reset code." 
              : `Enter the 6-digit code sent to ${email} and your new password.`}
          </p>
        </div>

        {error && (
          <div className="mb-10 px-4 py-3 rounded-[10px] bg-[#FEF2F2] border border-[#FECACA] text-[#DC2626] text-[13px] leading-relaxed">
            {error}
          </div>
        )}

        {step === "request" ? (
          <form onSubmit={handleRequestSubmit} className="space-y-8">
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

            <Button
              type="submit"
              className="w-full justify-center gap-2 !h-[52px] text-[16px] font-semibold !rounded-[8px] !bg-[#781529] hover:!bg-[#651121] !text-white border-none mt-4"
              disabled={isLoading}
              loading={isLoading}
            >
              {isLoading ? "Sending..." : "Send Reset Code"}
            </Button>
            
            <button
              type="button"
              onClick={onBack}
              className="w-full text-center text-[14px] text-[#781529] font-medium hover:underline mt-4"
            >
              Back to Login
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetSubmit} className="space-y-8">
            <div className="space-y-4">
              <label className="block text-[14px] font-semibold text-[#4e4d4d]">
                6-Digit Reset Code
              </label>
              <Input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="000000"
                maxLength={6}
                required
                className="text-center tracking-[4px] font-bold"
              />
            </div>

            <div className="space-y-4">
              <label className="block text-[14px] font-semibold text-[#4e4d4d]">
                New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-[14px] flex items-center pointer-events-none">
                  <Lock size={16} className="text-[#77706D]" />
                </div>
                <Input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="!pl-[40px] !pr-[40px]"
                  placeholder="Enter new password"
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-[14px] flex items-center text-[#77706D] hover:text-[#242124]"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full justify-center gap-2 !h-[52px] text-[16px] font-semibold !rounded-[8px] !bg-[#781529] hover:!bg-[#651121] !text-white border-none mt-4"
              disabled={isLoading}
              loading={isLoading}
            >
              {isLoading ? "Resetting..." : "Reset Password"}
            </Button>
            
            <button
              type="button"
              onClick={onBack}
              className="w-full text-center text-[14px] text-[#781529] font-medium hover:underline mt-4"
            >
              Back to Login
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
