import { PageContainer } from "../../components/layout/PageContainer";
import { Button, Card, CardHeader, CardTitle, CardContent, CardDescription } from "@stock-inventra/ui";
import { FileBarChart, Download, Eye } from "lucide-react";

export function ReportsPage() {
  const reports = [
    { title: "Sales Report", description: "Detailed breakdown of all sales transactions.", lastGenerated: "Today, 10:00 AM" },
    { title: "Profit Report", description: "Gross and net profit analysis by category.", lastGenerated: "Yesterday, 06:00 PM" },
    { title: "Inventory Report", description: "Current stock levels and valuation.", lastGenerated: "2 Days ago" },
    { title: "Product Performance Report", description: "Top selling and slow moving products.", lastGenerated: "Last Week" },
  ];

  return (
    <PageContainer
      title="Reports"
      description="Generate and view business reports."
    >
      <div className="grid grid-cols-1 gap-24 lg:grid-cols-2">
        {reports.map((report, idx) => (
          <Card key={idx} className="flex flex-col">
            <CardHeader className="flex flex-row items-start gap-16 space-y-0">
              <div className="flex h-48 w-48 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <FileBarChart className="h-24 w-24" />
              </div>
              <div className="flex-1">
                <CardTitle>{report.title}</CardTitle>
                <CardDescription className="mt-4">{report.description}</CardDescription>
                <p className="mt-8 text-caption text-text-secondary">Last generated: {report.lastGenerated}</p>
              </div>
            </CardHeader>
            <CardContent className="mt-auto flex gap-12 border-t border-border pt-16">
              <Button variant="secondary" className="flex-1">
                <Eye className="mr-8 h-16 w-16" />
                View
              </Button>
              <Button variant="primary" className="flex-1">
                <Download className="mr-8 h-16 w-16" />
                Generate
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </PageContainer>
  );
}
