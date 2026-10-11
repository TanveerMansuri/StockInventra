import { useState, useEffect } from "react";
import { PageContainer } from "../../components/layout/PageContainer";
import { useAuth } from "../auth/AuthProvider";
import { profileService, authService } from "../../services/api";
import { 
  Camera, 
  UserRound, 
  Mail, 
  CalendarDays, 
  ShieldCheck, 
  LockKeyhole, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  Circle 
} from "lucide-react";

export function ProfilePage() {
  const { user } = useAuth();
  
  // Personal Info State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);


  // Password State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  
  // Visibility Toggles
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
    }
  }, [user]);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    try {
      const res = await profileService.updateProfile({ name }) as any;
      if (res.success) {
         (useAuth as any).updateUser?.(res.data) || alert("Profile updated"); // It will use context normally if extracted
         window.location.reload();
      }
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to update profile");
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handlePasswordSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    setIsUpdatingPassword(true);
    try {
      await authService.changePassword({ currentPassword, newPassword });
      alert("Password updated successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to update password");
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const formData = new FormData();
      formData.append("avatar", file);
      const res = await profileService.uploadAvatar(formData) as any;
      if (res.success) window.location.reload();
    } catch (err: any) {
      alert("Failed to upload avatar");
    }
  };

  // Password Requirements Logic
  const hasMinLength = newPassword.length >= 8;
  const hasNumber = /\d/.test(newPassword);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);

  return (
    <PageContainer>
      <div className="flex flex-col mb-[16px] lg:mb-[20px]">
        <h1 className="text-[30px] lg:text-[32px] font-bold text-[#242124] leading-[38px]">Profile</h1>
        <p className="text-[14px] text-[#77706D] leading-[20px] mt-[4px]">Manage your personal profile and security settings.</p>
      </div>

      <div className="grid grid-cols-1 gap-[16px] lg:gap-[20px] lg:grid-cols-[minmax(300px,0.8fr)_minmax(0,1.7fr)] items-stretch">
        
        {/* Left Column - Profile Summary */}
        <div className="bg-[#FFFFFF] border border-[#EAE5E0] rounded-[12px] p-[18px] lg:p-[20px] shadow-[0_2px_8px_rgba(36,33,36,0.04)] flex flex-col w-full h-full">
          
          {/* Avatar Section */}
          <div className="flex flex-col items-center">
            <div className="relative">
              {/* Avatar Image / Fallback */}
              <div className="w-[120px] h-[120px] lg:w-[132px] lg:h-[132px] rounded-full border-[4px] border-white shadow-[0_4px_12px_rgba(36,33,36,0.08)] bg-[#F5EFE6] flex items-center justify-center overflow-hidden">
                {user?.avatar ? (
                  <img 
                    src={user.avatar.startsWith('http') ? user.avatar : `${(import.meta.env.VITE_API_BASE_URL ? new URL(import.meta.env.VITE_API_BASE_URL).origin : 'http://localhost:4000')}${user.avatar}`} 
                    alt={user?.name || "User"} 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <span className="text-[40px] font-bold text-[#7A1830]">
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                )}
              </div>
              
              {/* Floating Camera Button */}
              <label 
                className="absolute bottom-[2px] right-[2px] w-[36px] h-[36px] lg:w-[40px] lg:h-[40px] bg-[#7A1830] hover:bg-[#641326] transition-colors rounded-full border-[2px] border-white flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-[#7A1830] focus:ring-offset-2 z-10 shadow-sm cursor-pointer"
              >
                <Camera className="text-white w-[16px] h-[16px] lg:w-[18px] lg:h-[18px]" />
                <input type="file" className="hidden" accept="image/png, image/jpeg, image/webp" onChange={handleAvatarUpload} />
              </label>
            </div>

            <h2 className="text-[21px] lg:text-[22px] font-bold text-[#242124] leading-[28px] mt-[12px]">
              {user?.name || "Admin User"}
            </h2>
            <p className="text-[12px] lg:text-[13px] text-[#968D88] uppercase tracking-wide mt-[2px]">
              {user?.role || "ADMIN"}
            </p>

            <div className="mt-[8px] bg-[#E5F4E9] text-[#15803D] text-[12px] font-semibold px-[10px] py-[4px] rounded-full flex items-center gap-[6px]">
              <div className="w-[6px] h-[6px] rounded-full bg-[#15803D]"></div>
              Active
            </div>
          </div>

          <div className="h-[1px] bg-[#EAE5E0] w-full my-[16px]"></div>

          {/* Metadata */}
          <div className="flex flex-col gap-[10px] lg:gap-[12px]">
            <div className="flex items-center gap-[12px]">
              <div className="w-[34px] h-[34px] lg:w-[36px] lg:h-[36px] rounded-full bg-[#F5E9EC] flex items-center justify-center flex-shrink-0">
                <Mail className="w-[16px] h-[16px] lg:w-[18px] lg:h-[18px] text-[#7A1830]" />
              </div>
              <div className="flex flex-col">
                <span className="text-[12px] lg:text-[13px] text-[#77706D] leading-[16px]">Email address</span>
                <span className="text-[14px] lg:text-[15px] font-medium text-[#242124] leading-[20px] break-all">{user?.email || "admin@stockinventra.com"}</span>
              </div>
            </div>

            <div className="flex items-center gap-[12px]">
              <div className="w-[34px] h-[34px] lg:w-[36px] lg:h-[36px] rounded-full bg-[#F5E9EC] flex items-center justify-center flex-shrink-0">
                <CalendarDays className="w-[16px] h-[16px] lg:w-[18px] lg:h-[18px] text-[#7A1830]" />
              </div>
              <div className="flex flex-col">
                <span className="text-[12px] lg:text-[13px] text-[#77706D] leading-[16px]">Member since</span>
                <span className="text-[14px] lg:text-[15px] font-medium text-[#242124] leading-[20px]">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : "Apr 21, 2025"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-[12px]">
              <div className="w-[34px] h-[34px] lg:w-[36px] lg:h-[36px] rounded-full bg-[#F5E9EC] flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-[16px] h-[16px] lg:w-[18px] lg:h-[18px] text-[#7A1830]" />
              </div>
              <div className="flex flex-col">
                <span className="text-[12px] lg:text-[13px] text-[#77706D] leading-[16px]">Role</span>
                <span className="text-[14px] lg:text-[15px] font-medium text-[#242124] leading-[20px] capitalize">
                  {user?.role ? user.role.toLowerCase() : "Administrator"}
                </span>
              </div>
            </div>
          </div>

          <label 
            className="w-full mt-auto h-[42px] lg:h-[44px] bg-white border-[1.5px] border-[#7A1830] text-[#7A1830] hover:bg-[#F5E9EC] text-[13px] lg:text-[14px] font-semibold rounded-[9px] flex items-center justify-center gap-[8px] transition-colors focus:outline-none focus:ring-2 focus:ring-[#7A1830] focus:ring-offset-2 cursor-pointer"
          >
            <Camera className="w-[16px] h-[16px] lg:w-[18px] lg:h-[18px]" />
            Change Avatar
            <input type="file" className="hidden" accept="image/png, image/jpeg, image/webp" onChange={handleAvatarUpload} />
          </label>
        </div>

        {/* Right Column - Forms */}
        <div className="flex flex-col gap-[14px] lg:gap-[16px] w-full min-w-0 h-full justify-between">
          
          {/* Personal Information Card */}
          <div className="bg-[#FFFFFF] border border-[#EAE5E0] rounded-[12px] p-[18px] lg:p-[20px] shadow-[0_2px_8px_rgba(36,33,36,0.04)] h-full flex flex-col">
            <div className="flex items-center gap-[12px] mb-[12px]">
              <div className="w-[42px] h-[42px] lg:w-[44px] lg:h-[44px] rounded-full bg-[#F5E9EC] flex items-center justify-center flex-shrink-0">
                <UserRound className="w-[18px] h-[18px] text-[#7A1830]" />
              </div>
              <div className="flex flex-col">
                <h3 className="text-[17px] lg:text-[18px] font-bold text-[#242124] leading-[24px]">Personal Information</h3>
                <p className="text-[12px] lg:text-[13px] text-[#77706D] leading-[18px] mt-[2px]">Update your account details and keep your information accurate.</p>
              </div>
            </div>

            <form onSubmit={handleProfileSave} className="flex flex-col">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-[18px] lg:gap-x-[20px] gap-y-[14px] lg:gap-y-[16px]">
                <div className="flex flex-col gap-[6px]">
                  <label className="text-[13px] font-medium text-[#242124] leading-[18px]">
                    Full Name <span className="text-[#DC2626]">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-[12px] lg:pl-[14px] flex items-center pointer-events-none">
                      <UserRound className="w-[16px] h-[16px] text-[#968D88]" />
                    </div>
                    <input 
                      type="text" 
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full h-[44px] lg:h-[46px] pl-[36px] lg:pl-[40px] pr-[12px] lg:pr-[14px] border border-[#EAE5E0] rounded-[9px] bg-white text-[14px] lg:text-[15px] text-[#242124] placeholder:text-[#968D88] outline-none focus:border-[#7A1830] focus:ring-1 focus:ring-[#7A1830]"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-[6px]">
                  <label className="text-[13px] font-medium text-[#242124] leading-[18px]">
                    Email Address <span className="text-[#DC2626]">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-[12px] lg:pl-[14px] flex items-center pointer-events-none">
                      <Mail className="w-[16px] h-[16px] text-[#968D88]" />
                    </div>
                    <input 
                      type="email" 
                      readOnly
                      disabled
                      value={email}
                      className="w-full h-[44px] lg:h-[46px] pl-[36px] lg:pl-[40px] pr-[12px] lg:pr-[14px] border border-[#EAE5E0] rounded-[9px] bg-[#F5F5F5] text-[14px] lg:text-[15px] text-[#77706D] outline-none cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-auto pt-[16px] lg:pt-[20px] flex justify-end">
                <button 
                  type="submit" 
                  disabled={isUpdatingProfile}
                  className="h-[42px] lg:h-[44px] min-w-[160px] px-[20px] bg-[#7A1830] hover:bg-[#641326] disabled:opacity-70 text-white text-[13px] lg:text-[14px] font-semibold rounded-[9px] transition-colors focus:outline-none focus:ring-2 focus:ring-[#7A1830] focus:ring-offset-2"
                >
                  {isUpdatingProfile ? "Updating..." : "Update Profile"}
                </button>
              </div>
            </form>
          </div>

          {/* Change Password Card */}
          <div className="bg-[#FFFFFF] border border-[#EAE5E0] rounded-[12px] p-[18px] lg:p-[20px] shadow-[0_2px_8px_rgba(36,33,36,0.04)] h-full flex flex-col">
            <div className="flex items-center gap-[12px] mb-[12px]">
              <div className="w-[42px] h-[42px] lg:w-[44px] lg:h-[44px] rounded-full bg-[#F5E9EC] flex items-center justify-center flex-shrink-0">
                <LockKeyhole className="w-[18px] h-[18px] text-[#7A1830]" />
              </div>
              <div className="flex flex-col">
                <h3 className="text-[17px] lg:text-[18px] font-bold text-[#242124] leading-[24px]">Change Password</h3>
                <p className="text-[12px] lg:text-[13px] text-[#77706D] leading-[18px] mt-[2px]">Keep your account secure by using a strong password.</p>
              </div>
            </div>

            <form onSubmit={handlePasswordSave} className="flex flex-col">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-[18px] lg:gap-x-[20px] gap-y-[12px] lg:gap-y-[14px]">
                
                {/* Current Password - Full Width */}
                <div className="flex flex-col gap-[6px] md:col-span-2">
                  <label className="text-[13px] font-medium text-[#242124] leading-[18px]">
                    Current Password <span className="text-[#DC2626]">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-[12px] lg:pl-[14px] flex items-center pointer-events-none">
                      <LockKeyhole className="w-[16px] h-[16px] text-[#968D88]" />
                    </div>
                    <input 
                      type={showCurrentPassword ? "text" : "password"}
                      required
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full h-[44px] lg:h-[46px] pl-[36px] lg:pl-[40px] pr-[40px] lg:pr-[44px] border border-[#EAE5E0] rounded-[9px] bg-white text-[14px] lg:text-[15px] text-[#242124] placeholder:text-[#968D88] outline-none focus:border-[#7A1830] focus:ring-1 focus:ring-[#7A1830]"
                    />
                    <button 
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      aria-label={showCurrentPassword ? "Hide password" : "Show password"}
                      className="absolute inset-y-0 right-0 pr-[12px] lg:pr-[14px] flex items-center focus:outline-none"
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="w-[18px] h-[18px] text-[#77706D] hover:text-[#242124]" />
                      ) : (
                        <Eye className="w-[18px] h-[18px] text-[#77706D] hover:text-[#242124]" />
                      )}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div className="flex flex-col gap-[6px]">
                  <label className="text-[13px] font-medium text-[#242124] leading-[18px]">
                    New Password <span className="text-[#DC2626]">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-[12px] lg:pl-[14px] flex items-center pointer-events-none">
                      <LockKeyhole className="w-[16px] h-[16px] text-[#968D88]" />
                    </div>
                    <input 
                      type={showNewPassword ? "text" : "password"}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full h-[44px] lg:h-[46px] pl-[36px] lg:pl-[40px] pr-[40px] lg:pr-[44px] border border-[#EAE5E0] rounded-[9px] bg-white text-[14px] lg:text-[15px] text-[#242124] placeholder:text-[#968D88] outline-none focus:border-[#7A1830] focus:ring-1 focus:ring-[#7A1830]"
                    />
                    <button 
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      aria-label={showNewPassword ? "Hide password" : "Show password"}
                      className="absolute inset-y-0 right-0 pr-[12px] lg:pr-[14px] flex items-center focus:outline-none"
                    >
                      {showNewPassword ? (
                        <EyeOff className="w-[18px] h-[18px] text-[#77706D] hover:text-[#242124]" />
                      ) : (
                        <Eye className="w-[18px] h-[18px] text-[#77706D] hover:text-[#242124]" />
                      )}
                    </button>
                  </div>
                  
                  {/* Password Requirements List */}
                  {newPassword.length > 0 && (
                    <div className="flex flex-row flex-wrap gap-x-[12px] gap-y-[4px] mt-[6px]">
                      <div className="flex items-center gap-[4px]">
                        {hasMinLength ? <CheckCircle2 className="w-[12px] h-[12px] text-[#15803D]" /> : <Circle className="w-[12px] h-[12px] text-[#968D88]" />}
                        <span className={`text-[11px] lg:text-[12px] ${hasMinLength ? 'text-[#15803D]' : 'text-[#77706D]'}`}>8+ chars</span>
                      </div>
                      <div className="flex items-center gap-[4px]">
                        {hasNumber ? <CheckCircle2 className="w-[12px] h-[12px] text-[#15803D]" /> : <Circle className="w-[12px] h-[12px] text-[#968D88]" />}
                        <span className={`text-[11px] lg:text-[12px] ${hasNumber ? 'text-[#15803D]' : 'text-[#77706D]'}`}>Number</span>
                      </div>
                      <div className="flex items-center gap-[4px]">
                        {hasSpecialChar ? <CheckCircle2 className="w-[12px] h-[12px] text-[#15803D]" /> : <Circle className="w-[12px] h-[12px] text-[#968D88]" />}
                        <span className={`text-[11px] lg:text-[12px] ${hasSpecialChar ? 'text-[#15803D]' : 'text-[#77706D]'}`}>Special char</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm New Password */}
                <div className="flex flex-col gap-[6px]">
                  <label className="text-[13px] font-medium text-[#242124] leading-[18px]">
                    Confirm New Password <span className="text-[#DC2626]">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-[12px] lg:pl-[14px] flex items-center pointer-events-none">
                      <LockKeyhole className="w-[16px] h-[16px] text-[#968D88]" />
                    </div>
                    <input 
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full h-[44px] lg:h-[46px] pl-[36px] lg:pl-[40px] pr-[40px] lg:pr-[44px] border border-[#EAE5E0] rounded-[9px] bg-white text-[14px] lg:text-[15px] text-[#242124] placeholder:text-[#968D88] outline-none focus:border-[#7A1830] focus:ring-1 focus:ring-[#7A1830]"
                    />
                    <button 
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                      className="absolute inset-y-0 right-0 pr-[12px] lg:pr-[14px] flex items-center focus:outline-none"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-[18px] h-[18px] text-[#77706D] hover:text-[#242124]" />
                      ) : (
                        <Eye className="w-[18px] h-[18px] text-[#77706D] hover:text-[#242124]" />
                      )}
                    </button>
                  </div>
                </div>

              </div>

              <div className="mt-auto pt-[16px] lg:pt-[20px] flex justify-end">
                <button 
                  type="submit" 
                  disabled={isUpdatingPassword}
                  className="h-[42px] lg:h-[44px] min-w-[176px] px-[20px] bg-[#7A1830] hover:bg-[#641326] disabled:opacity-70 text-white text-[13px] lg:text-[14px] font-semibold rounded-[9px] transition-colors focus:outline-none focus:ring-2 focus:ring-[#7A1830] focus:ring-offset-2"
                >
                  {isUpdatingPassword ? "Updating..." : "Update Password"}
                </button>
              </div>
            </form>
          </div>

        </div>
      </div>

    </PageContainer>
  );
}
