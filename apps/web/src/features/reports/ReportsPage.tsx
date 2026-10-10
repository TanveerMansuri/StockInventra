import { useState } from "react";
import { PageContainer } from "../../components/layout/PageContainer";
import { Button, Card, CardHeader, CardTitle, CardContent, CardDescription } from "@stock-inventra/ui";
import { FileBarChart, Download, Eye, Loader2 } from "lucide-react";
import { DateRangeFilter } from "../../components/common/DateRangeFilter";
import { ReportModal } from "./ReportModal";
import { apiClient } from "../../services/api/apiClient";

export function ReportsPage() {
  const [period, setPeriod] = useState("thisMonth");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  
  const [modalOpen, setModalOpen] = useState(false);
  const [activeReport, setActiveReport] = useState<{ id: string, title: string } | null>(null);
  const [reportData, setReportData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [periodLabel, setPeriodLabel] = useState("");

  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const reports = [
    { id: "sales", title: "Sales Report", description: "Detailed breakdown of all sales transactions." },
    { id: "profit", title: "Profit Report", description: "Gross and net profit analysis by category." },
    { id: "inventory", title: "Inventory Report", description: "Current stock levels and valuation." },
    { id: "products", title: "Product Performance Report", description: "Top selling and slow moving products." },
  ];

  const buildQuery = () => {
    let q = `?period=${period}`;
    if (period === "custom" && startDate && endDate) {
      q += `&startDate=${startDate}&endDate=${endDate}`;
    }
    return q;
  };

  const handleView = async (id: string, title: string) => {
    setActiveReport({ id, title });
    
    let label = "";
    if (period === "today") label = "Today";
    else if (period === "thisWeek") label = "This Week";
    else if (period === "thisMonth") label = "This Month";
    else if (period === "custom") label = `${startDate} - ${endDate}`;
    setPeriodLabel(label);

    setModalOpen(true);
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiClient.get<{ success: boolean, data: any }>(`/reports/${id}${buildQuery()}`);
      setReportData(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Failed to load report");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async (id: string) => {
    setDownloadingId(id);
    try {
      const url = `/api/v1/reports/${id}${buildQuery()}&format=csv`;
      const response = await fetch(url, { credentials: "include" });
      if (!response.ok) throw new Error("Failed to generate CSV");
      
      const blob = await response.blob();
      const objUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = objUrl;
      link.setAttribute('download', `stock-inventra-${id}-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(objUrl);
    } catch (err: any) {
      alert("Failed to download CSV.");
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <PageContainer
      title="Reports"
      description="Generate and view business reports."
    >
      <DateRangeFilter 
        value={period} 
        onChange={setPeriod}
        startDate={startDate}
        endDate={endDate}
        onCustomDateChange={(s, e) => {
          setStartDate(s);
          setEndDate(e);
        }}
      />

      <div className="grid grid-cols-1 gap-24 lg:grid-cols-2">
        {reports.map((report) => (
          <Card key={report.id} className="flex flex-col">
            <CardHeader className="flex flex-row items-start gap-16 space-y-0">
              <div className="flex h-48 w-48 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <FileBarChart className="h-24 w-24" />
              </div>
              <div className="flex-1">
                <CardTitle>{report.title}</CardTitle>
                <CardDescription className="mt-4">{report.description}</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="mt-auto flex gap-12 border-t border-border pt-16">
              <Button variant="secondary" className="flex-1" onClick={() => handleView(report.id, report.title)}>
                <Eye className="mr-8 h-16 w-16" />
                View
              </Button>
              <Button variant="primary" className="flex-1" onClick={() => handleDownload(report.id)} disabled={downloadingId === report.id}>
                {downloadingId === report.id ? <Loader2 className="mr-8 h-16 w-16 animate-spin" /> : <Download className="mr-8 h-16 w-16" />}
                Generate CSV
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <ReportModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)}
        title={activeReport?.title || "Report"}
        reportData={reportData}
        isLoading={isLoading}
        error={error}
        periodLabel={periodLabel}
      />
    </PageContainer>
  );
}
