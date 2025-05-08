// components/ProductForm.tsx
'use client'

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Category } from "@/interfaces/Interfaces"
import { useCallback, useState } from "react"
import { DialogFooter } from "./ui/dialog"

interface ProductFormProps {
  categories: Category[]
  onSubmit: (data: { 
    name: string
    description: string
    price: number
    category_id: string
  }) => Promise<void>
  loading?: boolean
}

export function NewProductForm({ categories, onSubmit, loading = false }: ProductFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 0,
    category_id: ""
  })

  const handleChange = useCallback((field: keyof typeof formData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit({
      ...formData,
      price: Number(formData.price) // Garantir que price seja number
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-4 py-4">
        {/* Campo Name */}
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="name" className="text-right">
            Name
          </Label>
          <Input
            id="name"
            value={formData.name}
            className="col-span-3"
            onChange={(e) => handleChange('name', e.target.value)}
          />
        </div>

        {/* Campo Description */}
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="description" className="text-right">
            Description
          </Label>
          <Textarea
            id="description"
            value={formData.description}
            className="col-span-3"
            onChange={(e) => handleChange('description', e.target.value)}
          />
        </div>

        {/* Campo Price */}
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
          />
        </div>

        {/* Campo Category */}
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="category" className="text-right">
            Category
          </Label>
          <Select 
            onValueChange={(value) => handleChange('category_id', value)}
            value={formData.category_id}
          >
            <SelectTrigger className="w-[280px]">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent className="bg-white p-2">
              <SelectGroup>
                {categories.map((category) => (
                  <SelectItem
                    key={category.id}
                    value={category.id.toString()}
                  >
                    {category.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>
      <DialogFooter>
        <Button 
          type="submit"
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save changes'}
        </Button>
      </DialogFooter>
    </form>
  )
}