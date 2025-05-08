'use client'

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useCallback, useState } from "react"
import { DialogFooter } from "./ui/dialog"
import { Product } from "@/interfaces/Interfaces"
import { updateProduct } from "@/services/api"

interface EditProductFormProps {
  product: Product
  onSubmit: (updatedProduct: Product) => void 
  loading?: boolean
}

export function EditProductForm({ onSubmit, product, loading = false }: EditProductFormProps) {
  const [formData, setFormData] = useState({
    price: product.price,
    total_sold: product.total_sold
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = useCallback((field: keyof typeof formData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      const numericData = {
        price: Number(formData.price),
        total_sold: Number(formData.total_sold)
      }
      
      await updateProduct(product.id, numericData)
      // Chama a função onSubmit com o produto atualizado
      onSubmit({
        ...product,
        ...numericData,
        revenue: numericData.price * numericData.total_sold
      })
      
    } catch (error) {
      console.error("error updating product", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="price" className="text-right">
            Price
          </Label>
          <Input
            type="number"
            id="price"
            value={formData.price}
            className="col-span-3"
            onChange={(e) => handleChange('price', e.target.value)}
            min="0"
            step="0.01"
            required
          />
        </div>
      </div>
      <DialogFooter>
        <Button 
          type="submit"
          disabled={isLoading || loading}
        >
          {isLoading ? 'Saving...' : 'Save changes'}
        </Button>
      </DialogFooter>
    </form>
  )
}