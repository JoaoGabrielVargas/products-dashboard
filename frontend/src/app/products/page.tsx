'use client'

import { getSalesReport } from "@/services/api"
import { useEffect, useState } from "react"
import { Product, SalesReportResponse } from "@/interfaces/Interfaces"
import ProductCard from "@/components/ProductCard"
import { AddProductButton } from "@/components/AddProductButton"

export default function Products() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const getProductsData = async () => {
    try {
      setLoading(true)
      const { products } = await getSalesReport() as SalesReportResponse;
      console.log("products", products)
      setProducts(products)
      setLoading(false)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load products'
      setError(errorMessage)
      setLoading(false)
    }
  }
  useEffect(() => {
    getProductsData()
  }, []);

  if (loading) return (
    <div className="p-8">
      <div className="flex justify-between">
        <h1 className="text-2xl font-bold mb-4">Products</h1>

      </div>
      <p>Loading products...</p>
    </div>
  )

  if (error) return (
    <div className="p-8">
      <div className="flex justify-between">
        <h1 className="text-2xl font-bold mb-4">Products</h1>

      </div>
      <p className="text-red-500">Erro: {error}</p>
    </div>
  )

  // 7. Verificação de dados vazios
  if (products.length <= 0) return (
    <div className="p-8">
      <div className="flex justify-between">
        <h1 className="text-2xl font-bold mb-4">Products</h1>
        <AddProductButton />
      </div>
      <p>No products registered</p>
    </div>
  )

  return (
    <div className="p-8">
      <div className="flex justify-between">
        <h1 className="text-2xl font-bold mb-4">Products</h1>
        <AddProductButton />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {products && products.map((product) => (
          <ProductCard product={product} key={product.id} />
        ))}
      </div>
    </div>

  )
}