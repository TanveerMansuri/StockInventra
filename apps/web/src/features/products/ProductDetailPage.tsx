import { useParams, Link } from "react-router-dom";
import { PageContainer } from "../../components/layout/PageContainer";
import { Button, Card, CardHeader, CardTitle, CardContent, Badge } from "@stock-inventra/ui";
import { Pencil, ArrowLeft } from "lucide-react";
import { ProductAvatar } from "../../components/common/ProductAvatar";
import { useProduct } from "../../hooks/useProduct";
import { useCurrencyFormatter } from "../../hooks/useCurrencyFormatter";
import { formatQuantityWithUnit } from "@stock-inventra/types";

export function ProductDetailPage() {
  const { id } = useParams();
  const { data: product, isLoading, error } = useProduct(id || "");
  const formatCurrency = useCurrencyFormatter();

  if (isLoading) {
    return (
      <PageContainer title="Product Details" description="Loading product...">
        <div className="flex h-64 items-center justify-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </PageContainer>
    );
  }

  if (error || !product) {
    return (
      <PageContainer title="Product Details" description="Error">
        <div className="flex h-64 items-center justify-center text-red-500">
          {error || "Product not found"}
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title={product.name}
      description={`SKU: ${product.sku}`}
      action={
        <div className="flex items-center gap-12">
          <Link to="/products">
            <Button variant="secondary">
              <ArrowLeft className="mr-8 h-18 w-18" />
              Back
            </Button>
          </Link>
          <Button variant="primary">
            <Pencil className="mr-8 h-18 w-18" />
            Edit
          </Button>
        </div>
      }
    >
      <div className="grid grid-cols-1 gap-24 lg:grid-cols-3">
        {/* Left Column - Details */}
        <div className="flex flex-col gap-24 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Product Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-24">
                <ProductAvatar name={product.name} image={product.image} size="xl" />
                <div className="grid flex-1 grid-cols-2 gap-y-16">
                  <div>
                    <p className="text-small text-text-secondary">Category</p>
                    <p className="text-body-strong">{product.categoryId}</p>
                  </div>
                  <div>
                    <p className="text-small text-text-secondary">Status</p>
                    <Badge variant={product.status === "OUT_OF_STOCK" ? "danger" : product.status === "LOW_STOCK" ? "warning" : "success"} className="mt-4">
                      {product.status.replace("_", " ")}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-small text-text-secondary">Unit</p>
                    <p className="text-body-strong">{product.unit || "Piece"}</p>
                  </div>
                  <div>
                    <p className="text-small text-text-secondary">Purchase Price</p>
                    <p className="text-body-strong">{formatCurrency(product.purchasePrice)}</p>
                  </div>
                  <div>
                    <p className="text-small text-text-secondary">Selling Price</p>
                    <p className="text-body-strong">{formatCurrency(product.finalPrice)}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-small text-text-secondary">Description</p>
                    <p className="text-body mt-4">{product.description || "No description provided."}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Stock & Performance */}
        <div className="flex flex-col gap-24">
          <Card>
            <CardHeader>
              <CardTitle>Inventory Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-16">
                <div className="flex items-center justify-between border-b border-border pb-12">
                  <span className="text-body text-text-secondary">Current Stock</span>
                  <span className="text-section-title">{formatQuantityWithUnit(product.currentStock, product.unit)}</span>
                </div>
                <div className="flex items-center justify-between border-b border-border pb-12">
                  <span className="text-body text-text-secondary">Low Stock Threshold</span>
                  <span className="text-body-strong">{formatQuantityWithUnit(product.lowStockThreshold, product.unit)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-body text-text-secondary">Total Value</span>
                  <span className="text-body-strong font-semibold">{formatCurrency(product.currentStock * product.finalPrice)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Sales Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-text-secondary">
                Performance data will be available soon.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}
