import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup
} from "@/components/ui/select"
import { useEffect, useState } from "react"

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Textarea } from "./ui/textarea"
import { createNewProduct, getCategories } from "@/services/api"
import { Category } from "@/interfaces/Interfaces"

export function AddProductButton() {
  const [newProductData, setNewProductData] = useState({
    name: "",
    description: "",
    price: 0,
    category: "",
    category_id: ""
  }) 
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const getCategoriesData = async () => {
    try {
      setLoading(true)
      const categories = await getCategories();
      setCategories(categories)
      setLoading(false)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load products'
      setError(errorMessage)
      setLoading(false)
    }
  }
  useEffect(() => {
    getCategoriesData()
  }, []);

  if (loading) return (
    <div className="p-8">
      <p>Loading categories...</p>
    </div>
  )

  console.log("newProductData", newProductData)
  const handleSubmitNewProduct = async () => {
    try {
      const addNewProduct = await createNewProduct(newProductData);
      console.log("addNewProduct", addNewProduct)

    } catch (error) {
      console.log("error", error)
    }
  }
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button className="bg-black text-white">Add New Product</Button>
      </PopoverTrigger>
      <PopoverContent className="mr-8 bg-white">
        <div className="grid gap-4">
          {error ? <p>Error loading categories</p> : <Dialog>
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
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Name
                  </Label>
                  <Input 
                    id="name" 
                    value={newProductData.name} 
                    className="col-span-3" 
                    onChange={(event) => setNewProductData({...newProductData, name: event.target.value})} />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="username" className="text-right">
                    Description
                  </Label>
                  <Textarea 
                    id="description" 
                    value={newProductData.description} 
                    className="col-span-3"  
                    onChange={(event) => setNewProductData({...newProductData, description: event.target.value})}/>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="price" className="text-right">
                    Price
                  </Label>
                  <Input 
                    type="number" 
                    id="price" 
                    value={newProductData.price} 
                    className="col-span-3"  
                    onChange={(event) => setNewProductData({...newProductData, price: Number(event.target.value)})} />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="price" className="text-right">
                    Category
                  </Label>
                  {
                    <Select onValueChange={(categoryId) => setNewProductData({...newProductData, category_id: categoryId})}>
                    <SelectTrigger className="w-[280px]">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent className="bg-white p-2">
                      <SelectGroup>
                        {categories.map((category) => 
                          (<SelectItem 
                            key={category.id} 
                            value={category.id.toString()}>
                              {category.name}
                            </SelectItem>)
                          )}
                      </SelectGroup>
                    </SelectContent>
                  </Select>}
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" onClick={handleSubmitNewProduct}>Save changes</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>}
          <Button variant="outline">Upload products from CSV</Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
