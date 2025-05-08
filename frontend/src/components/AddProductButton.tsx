'use client'

import { Button } from "@/components/ui/button"
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { createNewProduct, getCategories } from "@/services/api"
import { Category } from "@/interfaces/Interfaces"
import { NewProductForm } from "./NewProductForm"
import { useCallback, useState, useEffect } from "react"

interface AddProductButtonProps {
  onProductAdded?: () => void 
}

export function AddProductButton({ onProductAdded }: AddProductButtonProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [formSubmitting, setFormSubmitting] = useState(false)

  const loadCategories = useCallback(async () => {
    try {
      setLoading(true)
      const data = await getCategories()
      setCategories(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load categories')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadCategories()
  }, [loadCategories])

  const handleSubmit = useCallback(async (formData: {
    name: string
    description: string
    price: number
    category_id: string
  }) => {
    try {
      setFormSubmitting(true)
      await createNewProduct(formData)
      onProductAdded?.()
    } catch (error) {
      console.error("Error creating product:", error)
    } finally {
      setFormSubmitting(false)
    }
  }, [onProductAdded])

  if (loading) return <div className="p-8">Loading categories...</div>

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button className="bg-black text-white">Add New Product</Button>
      </PopoverTrigger>
      <PopoverContent className="mr-8 bg-white">
        <div className="grid gap-4">
          {error ? (
            <p className="text-red-500">{error}</p>
          ) : (
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">Create new product form</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px] bg-white">
                <DialogHeader>
                  <DialogTitle>Create New Product</DialogTitle>
                  <DialogDescription>
                    Add informations for the new product here. Click save when you finish!
                  </DialogDescription>
                </DialogHeader>
                <NewProductForm 
                  categories={categories} 
                  onSubmit={handleSubmit}
                  loading={formSubmitting}
                />
              </DialogContent>
            </Dialog>
          )}
          <Button variant="outline">Upload products from CSV</Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}