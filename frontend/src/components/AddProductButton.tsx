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
import { createNewProduct, getCategories, uploadProductsCSV } from "@/services/api"
import { Category } from "@/interfaces/Interfaces"
import { NewProductForm } from "./NewProductForm"
import { useCallback, useState, useEffect, useRef } from "react"
import { Progress } from "@/components/ui/progress"

interface AddProductButtonProps {
  onProductAdded?: () => void 
}

export function AddProductButton({ onProductAdded }: AddProductButtonProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [formSubmitting, setFormSubmitting] = useState(false)
  const [csvUploading, setCsvUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

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
      console.log("error", error)
    } finally {
      setFormSubmitting(false)
    }
  }, [onProductAdded])

  const handleCsvUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setCsvUploading(true)
      setUploadProgress(0)
      
      const formData = new FormData()
      formData.append('file', file)

      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval)
            return prev
          }
          return prev + 10
        })
      }, 300)

      await uploadProductsCSV(formData, {
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            )
            setUploadProgress(percentCompleted)
          }
        }
      })

      clearInterval(interval)
      setUploadProgress(100)
      onProductAdded?.()
    } catch (error) {
      console.error("CSV upload error:", error)
    } finally {
      setCsvUploading(false)
      setUploadProgress(0)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

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
            <>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline">Create new product form</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px] bg-white">
                  <DialogHeader>
                    <DialogTitle>Create New Product</DialogTitle>
                    <DialogDescription>
                      Add informations for the new product here.
                    </DialogDescription>
                  </DialogHeader>
                  <NewProductForm 
                    categories={categories} 
                    onSubmit={handleSubmit}
                    loading={formSubmitting}
                  />
                </DialogContent>
              </Dialog>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".csv"
                className="hidden"
              />

              <Button 
                variant="outline" 
                onClick={handleCsvUploadClick}
                disabled={csvUploading}
              >
                {csvUploading ? 'Uploading...' : 'Upload products from CSV'}
              </Button>

              {csvUploading && (
                <div className="space-y-2">
                  <p className="text-sm">Uploading CSV file...</p>
                  <Progress value={uploadProgress} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    {uploadProgress}% completed
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}