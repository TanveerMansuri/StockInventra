import { useState, useEffect } from "react";
import { PageContainer } from "../../components/layout/PageContainer";
import { Button, Card, CardHeader, CardTitle, CardContent, Input } from "@stock-inventra/ui";
import { useSettings } from "../../hooks/useSettings";
import { settingsService } from "../../services/api";
import { useAuth } from "../../features/auth/AuthProvider";
import { CurrencySelect } from "./CurrencySelect";

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState("business");
  const { data: settingsData, isLoading, refetch } = useSettings();
  const { user } = useAuth();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [lowStockThreshold, setLowStockThreshold] = useState(20);
  const [defaultMargin, setDefaultMargin] = useState(40);
  const [defaultDiscount, setDefaultDiscount] = useState(0);
  const [currency, setCurrency] = useState("USD");
  const [taxRate, setTaxRate] = useState(18);

  useEffect(() => {
    if (settingsData) {
      setBusinessName(settingsData.business?.businessName || "");
      setEmail(settingsData.business?.email || "");
      setPhone(settingsData.business?.phone || "");
      setAddress(settingsData.business?.address || (settingsData as any).address || "");
      
      setLowStockThreshold(settingsData.inventory?.lowStockThreshold ?? (settingsData as any).defaultLowStockThreshold ?? 20);
      setDefaultMargin(settingsData.inventory?.defaultMargin ?? 40);
      setDefaultDiscount(settingsData.inventory?.defaultDiscount ?? 0);
      
      const currObj = settingsData.currency;
      let rawCurrency = typeof currObj === 'string' ? currObj : currObj?.currency || "INR";
      
      const safeRaw = String(rawCurrency);
      
      // Normalize to exact dropdown values to ensure it renders correctly
      let matchedCurrency = "INR";
      if (safeRaw.includes("USD") || safeRaw.includes("Dollar") || safeRaw === "$") {
        matchedCurrency = "USD";
      } else if (safeRaw.includes("EUR") || safeRaw.includes("Euro") || safeRaw === "€") {
        matchedCurrency = "EUR";
      } else if (safeRaw.includes("INR") || safeRaw.includes("Rupee") || safeRaw === "₹") {
        matchedCurrency = "INR";
      } else if (["INR", "USD", "EUR"].includes(safeRaw)) {
        matchedCurrency = safeRaw;
      }
      
      setCurrency(matchedCurrency || "USD");
      setTaxRate(typeof currObj === 'string' ? 18 : currObj?.taxRate ?? 18);
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
        business: {
          businessName,
          email,
          phone,
          address,
        },
        inventory: {
          lowStockThreshold,
          defaultMargin,
          defaultDiscount,
        },
        currency: {
          currency,
          taxRate,
        }
      });
      if (res.success) {
        refetch();
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
                  <Input label="Default Margin (%)" type="number" value={defaultMargin} onChange={(e) => setDefaultMargin(Number(e.target.value))} />
                  <Input label="Default Discount (%)" type="number" value={defaultDiscount} onChange={(e) => setDefaultDiscount(Number(e.target.value))} />
                </CardContent>
              </Card>
            )}

            {activeTab === "currency" && (
              <Card>
                <CardHeader>
                  <CardTitle>Regional & Currency</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 gap-24 sm:grid-cols-2">
                  <CurrencySelect 
                    label="Currency" 
                    value={currency || "USD"}
                    onChange={(newCurrency) => {
                      if (newCurrency !== currency) {
                        if (window.confirm(`Are you sure you want to change the currency to ${newCurrency}? Existing numerical amounts will remain unchanged and their currency display will change. No automatic conversion will be performed.`)) {
                          setCurrency(newCurrency);
                        }
                      }
                    }} 
                  />
                  <Input label="Tax Rate (%)" type="number" value={taxRate} onChange={(e) => setTaxRate(Number(e.target.value))} />
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
