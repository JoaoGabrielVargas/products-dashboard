import { NewProduct, SalesReportResponse, UploadProductsCSVResponse, UploadOptions, Product } from "@/interfaces/Interfaces";

export async function getSalesReport(categoryId?: string): Promise<SalesReportResponse> {
  const url = categoryId 
      ? `http://localhost:8080/sales-report?category_id=${categoryId}`
      : 'http://localhost:8080/sales-report';
  
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch data');
  return res.json();
}

  export async function getCategories() {
    const res = await fetch('http://localhost:8080/categories');
    if (!res.ok) throw new Error('Failed to fetch data');
    return res.json();
  }

  export async function createNewProduct(newProductData: NewProduct){
    const res = await fetch('http://localhost:8080/add-product', {headers: {
      "Content-Type": "application/json",
    }, method: "POST", body: JSON.stringify(newProductData) });
    if (!res.ok) throw new Error('Failed to fetch data');
    return res.json();
  }

  export const uploadProductsCSV = async (
    formData: FormData,
    options?: UploadOptions
  ): Promise<UploadProductsCSVResponse> => {
    console.log("options", options)
    try {
      const response = await fetch('http://localhost:8080/upload-csv', {
        method: 'POST',
        body: formData,
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }
  
      return await response.json();
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Unknown error');
    }
  };

  // services/api.ts
export async function updateProduct(
  productId: number, 
  data: { price: number; total_sold: number }
): Promise<{ 
  message: string;
  product: Product;
}> {
  const response = await fetch(`http://localhost:8080/products/${productId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to update product');
  }

  return response.json();
}

export async function updateMonthlySales(
  monthKey: string,
  data: { quantity: number; price: number }
): Promise<{ 
  message: string;
  month: string;
  quantity: number;
  price: number;
}> {
  const response = await fetch(`http://localhost:8080/sales/monthly/${monthKey}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to update monthly sales');
  }

  return response.json();
}