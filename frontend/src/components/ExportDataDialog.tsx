// components/ExportDataDialog.tsx
'use client'

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useState } from "react"

export function ExportDataDialog() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleExport = async (type: 'products' | 'sales') => {
    try {
      setLoading(true)
      
      // Cria um link temporário para forçar o download
      const a = document.createElement('a')
      a.href = `http://localhost:8080/export/${type}`
      a.download = `${type}_export.csv`
      a.click()
      
      
      setOpen(false)
    } catch (error) {
      console.error("error exporting CSV", error)
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
          Export Data
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-white rounded-lg border border-gray-200">
        <DialogHeader className="bg-gradient-to-r from-blue-50 to-gray-50 p-6 border-b border-gray-200 rounded-t-lg">
          <DialogTitle className="text-lg font-semibold text-gray-800">Export Data to CSV</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <Button 
            variant="outline" 
            className="
              bg-gradient-to-r from-blue-600 to-blue-500
              text-white font-medium
              shadow-md hover:shadow-lg
              transition-all duration-200
              hover:from-blue-700 hover:to-blue-600
              px-6 py-3
              rounded-lg
              border border-blue-700/20
              w-full
              "
            onClick={() => handleExport('products')}
            disabled={loading}
          >
            Export Products
          </Button>
          <Button 
            variant="outline" 
            className="
              bg-gradient-to-r from-blue-600 to-blue-500
              text-white font-medium
              shadow-md hover:shadow-lg
              transition-all duration-200
              hover:from-blue-700 hover:to-blue-600
              px-6 py-3
              rounded-lg
              border border-blue-700/20
              w-full
              "
            onClick={() => handleExport('sales')}
            disabled={loading}
          >
            Export Sales
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}