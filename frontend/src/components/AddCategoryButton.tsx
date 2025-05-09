// components/AddCategoryDialog.tsx
'use client'

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"

interface AddCategoryDialogProps {
  onCategoryAdded: () => void
}

export function AddCategoryButton({ onCategoryAdded }: AddCategoryDialogProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(false)


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    try {
      setLoading(true)
      const response = await fetch('http://localhost:8080/create-category', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create category')
      }
      setName("")
      setOpen(false)
      onCategoryAdded()
    } catch (error) {
      console.error("Error adding category", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="
          bg-gradient-to-r from-blue-600 to-blue-500
          text-white font-medium
          shadow-md hover:shadow-lg
          transition-all duration-200
          hover:from-blue-700 hover:to-blue-600
          px-6 py-3
          rounded-lg
          border border-blue-700/20
        ">
          + New Category
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-white rounded-lg border border-gray-200">
        <DialogHeader className="bg-gradient-to-r from-blue-50 to-gray-50 p-6 border-b border-gray-200 rounded-t-lg">
          <DialogTitle className="text-lg font-semibold text-gray-800">Create New Category</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Category Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter category name"
              required
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Category"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}