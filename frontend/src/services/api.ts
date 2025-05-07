import { NewProduct, SalesReportResponse } from "@/interfaces/Interfaces";

export async function getSalesReport(): Promise<SalesReportResponse> {
    const res = await fetch('http://localhost:8080/sales-report');
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