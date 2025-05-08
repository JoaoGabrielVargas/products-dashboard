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
        <Button className="
          bg-gradient-to-r from-blue-600 to-blue-500
          text-white font-medium
          shadow-md hover:shadow-lg
          transition-all duration-200
          hover:from-blue-700 hover:to-blue-600
          px-6 py-3
          rounded-lg
          border border-blue-700/20
        ">
          + Add New Product
        </Button>
      </PopoverTrigger>
      <PopoverContent className="
        w-72 p-0
        rounded-lg
        border border-gray-200
        shadow-lg
        overflow-hidden
        bg-white
      ">
        <div className="grid gap-0 divide-y divide-gray-200">
          {error ? (
            <p className="p-4 text-red-500 text-sm">{error}</p>
          ) : (
            <>
              <Dialog>
                <DialogTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="
                      w-full
                      justify-start
                      rounded-none
                      hover:bg-blue-50
                      px-6 py-3
                      text-gray-800
                    "
                  >
                    <span className="text-sm font-medium">Create new product</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px] bg-white rounded-lg border border-gray-200">
                  <DialogHeader className="bg-gradient-to-r from-blue-50 to-gray-50 p-6 border-b border-gray-200 rounded-t-lg">
                    <DialogTitle className="text-lg font-semibold text-gray-800">
                      Create New Product
                    </DialogTitle>
                    <DialogDescription className="text-gray-600">
                      Add information for the new product
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
                variant="ghost"
                onClick={handleCsvUploadClick}
                disabled={csvUploading}
                className="
                  w-full
                  justify-start
                  rounded-none
                  hover:bg-blue-50
                  px-6 py-3
                  text-gray-800
                "
              >
                <span className="text-sm font-medium">
                  {csvUploading ? 'Uploading...' : 'Upload from CSV'}
                </span>
              </Button>

              {csvUploading && (
                <div className="p-4 space-y-2 bg-gray-50">
                  <p className="text-sm text-gray-600">Uploading CSV file...</p>
                  <Progress 
                    value={uploadProgress} 
                    className="h-2 bg-gray-200"
                  />
                  <p className="text-xs text-gray-500">
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