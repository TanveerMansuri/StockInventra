import { useState, useEffect } from "react";
import { PageContainer } from "../../components/layout/PageContainer";
import { Button, Card, CardHeader, CardTitle, CardContent, Input, Badge } from "@stock-inventra/ui";
import { UserCircle } from "lucide-react";
import { useAuth } from "../auth/AuthProvider";

export function ProfilePage() {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [user]);

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Profile update functionality goes here!");
  };

  const handlePasswordSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    alert("Password update functionality goes here!");
  };

  return (
    <PageContainer
      title="Profile"
      description="Manage your personal profile and security."
    >
      <div className="grid grid-cols-1 gap-24 lg:grid-cols-3">
        {/* Left Column - Avatar & Info */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="flex flex-col items-center p-32 text-center">
              <div className="mb-16 flex h-96 w-96 items-center justify-center rounded-full bg-background">
                <UserCircle className="h-64 w-64 text-text-secondary" />
              </div>
              <h3 className="text-section-title">{user?.name}</h3>
              <p className="text-body text-text-secondary">{user?.role}</p>
              <Badge variant="primary" className="mt-8">Active</Badge>
              
              <Button variant="outline" className="mt-24 w-full">Change Avatar</Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Forms */}
        <div className="flex flex-col gap-24 lg:col-span-2">
          <form onSubmit={handleProfileSave}>
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-24 sm:grid-cols-2">
                <Input label="Full Name" value={name} onChange={e => setName(e.target.value)} required />
                <Input label="Email Address" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
                <div className="sm:col-span-2 flex justify-end">
                  <Button type="submit" variant="primary">Update Profile</Button>
                </div>
              </CardContent>
            </Card>
          </form>

          <form onSubmit={handlePasswordSave}>
            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-24 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Input label="Current Password" type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required />
                </div>
                <Input label="New Password" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
                <Input label="Confirm New Password" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
                <div className="sm:col-span-2 flex justify-end">
                  <Button type="submit" variant="primary">Update Password</Button>
                </div>
              </CardContent>
            </Card>
          </form>
        </div>
      </div>
    </PageContainer>
  );
}
