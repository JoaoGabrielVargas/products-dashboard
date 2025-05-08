export interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  description: string;
  revenue: number;
  total_sold: number;
}

export interface ProductProps {
  product: Product;
}

export interface Sale {
  date: string;
  id: number;
  product_id: number;
  profit: number;
  quantity: number;
  total_price: number;
  unit_price: number;
}

export interface Meta {
  generated_at: string;
  total_products: number;
  total_profit: number;
  total_sales: number;
}

export interface SalesReportResponse {
  sales: Sale[];
  products: Product[];
  meta: Meta;
}

export interface Category {
  id: number;
  name: string;
}

export interface NewProduct {
  name: string;
  description: string;
  price: number;
  category_id: string;
}

export interface UploadProductsCSVResponse {
  message: string;
  count: number;
  errors?: string[];
}

export interface UploadOptions {
  onUploadProgress?: (progressEvent: ProgressEvent) => void;
}

export interface MonthlySaleData {
  monthKey: string;
  month: string;
  quantity: number;
  total_price: number;
  profit: number;
  salesCount: number;
}