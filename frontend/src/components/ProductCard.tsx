import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

import { ProductProps, Product } from "@/interfaces/Interfaces"
import { EditProductForm } from "./EditProductForm"

export default function ProductCard({ product, onUpdate }: ProductProps) {
  const handleProductUpdated = (updatedProduct: Product) => {
    onUpdate?.(updatedProduct) // Propaga a atualização para o componente pai
  }
  return (
    <Dialog>
      <DialogTrigger asChild>

      
    <Card className="w-full max-w-sm hover:shadow-lg transition-shadow duration-300 border border-gray-200 rounded-lg overflow-hidden !p-0 cursor-pointer">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-gray-50 p-6 border-b border-gray-200 rounded-t-lg">
        <CardTitle className="text-xl font-semibold text-gray-800 truncate">
          {product.name}
        </CardTitle>
        <CardDescription className="mt-2 text-gray-600 line-clamp-2">
          {product.description}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="p-6 space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-500">Price:</span>
          <span className="text-lg font-bold text-blue-600">
            U$ {product.price.toFixed(2)}
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-500">Total Sold:</span>
          <span className="text-lg font-semibold text-gray-700">
            {product.total_sold}
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-500">Revenue:</span>
          <span className="text-lg font-bold text-green-600">
            U$ {product.revenue.toFixed(2)}
          </span>
        </div>
      </CardContent>
      
      <CardFooter className="bg-gray-50 p-6 border-t border-gray-200 rounded-b-lg">
        <div className="flex items-center">
          <span className="text-sm font-medium text-gray-500 mr-2">Category:</span>
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {product.category}
          </span>
        </div>
      </CardFooter>
    </Card>
    </DialogTrigger>
    <DialogContent className="sm:max-w-[425px] bg-white rounded-lg border border-gray-200">
      <DialogHeader className="bg-gradient-to-r from-blue-50 to-gray-50 p-6 border-b border-gray-200 rounded-t-lg">
        <DialogTitle className="text-lg font-semibold text-gray-800">{product.name}</DialogTitle>
        <DialogDescription className="text-gray-600">{product.description}</DialogDescription>
      </DialogHeader>
      <EditProductForm product={product} onSubmit={handleProductUpdated}/>
    </DialogContent>
    </Dialog>
  )
}