import { useState, useEffect } from "react";
import { PageContainer } from "../../components/layout/PageContainer";
import { Button, Card, CardHeader, CardTitle, CardContent, Input, Select } from "@stock-inventra/ui";
import { useSettings } from "../../hooks/useSettings";
import { settingsService } from "../../services/api";
import { useAuth } from "../../features/auth/AuthProvider";

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState("business");
  const { data: settingsData, isLoading } = useSettings();
  const { user } = useAuth();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [lowStockThreshold, setLowStockThreshold] = useState(20);
  const [currency, setCurrency] = useState("INR");

  useEffect(() => {
    if (settingsData) {
      setBusinessName(settingsData.business?.businessName || "");
      setEmail(settingsData.business?.email || "");
      setPhone(settingsData.business?.phone || "");
      setAddress((settingsData as any).address || "");
      setLowStockThreshold((settingsData as any).defaultLowStockThreshold || 20);
      setCurrency(settingsData.currency ? (typeof settingsData.currency === 'string' ? settingsData.currency : (settingsData.currency as any).currency || "INR") : "INR");
    }
  }, [settingsData]);

  const tabs = [
    { id: "business", label: "Business Information" },
    { id: "inventory", label: "Inventory Settings" },
    { id: "currency", label: "Currency & Tax" },
    { id: "account", label: "Account Settings" },
  ];

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await settingsService.updateSettings({
        businessName,
        email,
        phone,
        address,
        defaultLowStockThreshold: lowStockThreshold,
        currency
      });
      if (res.success) {
        alert("Settings saved successfully!");
      } else {
        alert("Failed to save settings");
      }
    } catch (err: any) {
      alert(err.message || "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <PageContainer title="Settings" description="Loading settings...">
        <div className="flex h-64 items-center justify-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title="Settings"
      description="Manage your business preferences."
      action={
        <Button variant="primary" onClick={handleSave} disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save Changes"}
        </Button>
      }
    >
      <div className="flex flex-col gap-24">
        {/* Tabs */}
        <div className="flex overflow-x-auto border-b border-border">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap border-b-2 px-16 py-10 text-body font-medium transition-colors ${
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-text-secondary hover:border-border hover:text-text-primary"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1">
          <form onSubmit={handleSave}>
            {activeTab === "business" && (
              <Card>
                <CardHeader>
                  <CardTitle>Business Information</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 gap-24 sm:grid-cols-2">
                  <Input label="Business Name" value={businessName} onChange={(e) => setBusinessName(e.target.value)} required />
                  <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                  <Input label="Phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
                  <div className="sm:col-span-2">
                    <Input label="Address" value={address} onChange={(e) => setAddress(e.target.value)} />
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === "inventory" && (
              <Card>
                <CardHeader>
                  <CardTitle>Inventory Settings</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 gap-24 sm:grid-cols-2">
                  <Input label="Default Low Stock Threshold" type="number" value={lowStockThreshold} onChange={(e) => setLowStockThreshold(Number(e.target.value))} />
                  <Input label="Default Margin (%) (Readonly Demo)" type="number" value="40" disabled />
                  <Input label="Default Discount (%) (Readonly Demo)" type="number" value="0" disabled />
                </CardContent>
              </Card>
            )}

            {activeTab === "currency" && (
              <Card>
                <CardHeader>
                  <CardTitle>Currency</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 gap-24 sm:grid-cols-2">
                  <Select 
                    label="Currency" 
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    options={[
                      { label: "Indian Rupee (INR - ₹)", value: "INR" },
                      { label: "US Dollar (USD - $)", value: "USD" },
                      { label: "Euro (EUR - €)", value: "EUR" },
                    ]} 
                  />
                </CardContent>
              </Card>
            )}

            {activeTab === "account" && (
              <Card>
                <CardHeader>
                  <CardTitle>Account Settings (Read-Only Preview)</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 gap-24 sm:grid-cols-2">
                  <Input label="Admin Name" value={user?.name || ""} disabled />
                  <Input label="Admin Email" type="email" value={user?.email || ""} disabled />
                  <div className="sm:col-span-2">
                    <p className="text-sm text-text-secondary">Password changes are handled via Profile Settings.</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </form>
        </div>
      </div>
    </PageContainer>
  );
}
