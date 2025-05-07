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

export interface SalesReportResponse {
  sales: Sale[]
  products: Product[] 
}

export interface Category {
  id: number;
  name: string;
}

export interface NewProduct {
  name: string;
  description: string;
  price: number;
  category: string;
}