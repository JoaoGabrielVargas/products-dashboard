'use client'

import { ChartContainer, type ChartConfig, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import {Bar, BarChart, CartesianGrid, XAxis, YAxis, LineChart, Line, ResponsiveContainer} from 'recharts';
import { useEffect, useState } from "react";
import { getSalesReport, getCategories, updateMonthlySales } from "@/services/api";
import { Meta, MonthlySaleData, SalesReportResponse, Category } from "@/interfaces/Interfaces";
import { groupSalesByMonth } from "@/utils/salesDataProcessor";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { EditableCell } from "@/components/EditableCell";
import { ExportDataDialog } from "@/components/ExportDataDialog";

const chartConfig = {
  sales: {
    label: "Quantity",
    color: "#3b82f6", 
  },
  profit: {
    label: "Profit",
    color: "#10b981"
  }
} satisfies ChartConfig


export default function Home() {
  const [sales, setSales] = useState<MonthlySaleData[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [meta, setMeta] = useState<Meta>()
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null) 

  const getSalesData = async (categoryId = 'all') => {
    try {
      setLoading(true)
      const salesReportData = await getSalesReport(categoryId === 'all' ? undefined : categoryId) as SalesReportResponse
      const monthlySales = groupSalesByMonth(salesReportData.sales)
      setSales(monthlySales)
      setMeta(salesReportData.meta)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
      console.error("Error fetching sales data:", err)
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const data = await getCategories()
      setCategories(data)
    } catch (err) {
      console.error('Failed to load categories:', err)
    }
  }

  useEffect(() => {
    getSalesData(selectedCategory)
    fetchCategories()
  }, [selectedCategory])

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value)
  }

  const handleEditClick = (monthKey: string) => {
    setSales(prev => prev.map(item => 
      item.monthKey === monthKey 
        ? { 
            ...item, 
            isEditing: true,
            tempQuantity: item.quantity,
            tempPrice: item.total_price / (item.quantity || 1) 
          } 
        : item
    ))
  }
  
  const handleSave = async (monthKey: string) => {
    try {
      const editedItem = sales.find(item => item.monthKey === monthKey)
      if (!editedItem) return
  
      setLoading(true)
      
      // Aqui você precisará implementar a chamada API para atualizar os dados
      await updateMonthlySales(monthKey, {
        quantity: editedItem.tempQuantity!,
        price: editedItem.tempPrice!
      })
  
  
      setSales(prev => prev.map(item => 
        item.monthKey === monthKey && editedItem.tempQuantity && editedItem.tempPrice
          ? { 
              ...item, 
              quantity: editedItem.tempQuantity,
              total_price: editedItem.tempQuantity * editedItem.tempPrice,
              profit: editedItem.tempQuantity * editedItem.tempPrice, 
              isEditing: false 
            }
          : item
      ))
  
    } catch (error) {
      console.error("Failed to update monthly sales:", error)
    } finally {
      setLoading(false)
    }
  }
  
  const handleCancel = (monthKey: string) => {
    setSales(prev => prev.map(item => 
      item.monthKey === monthKey 
        ? { ...item, isEditing: false } 
        : item
    ))
  }
  
  const handleValueChange = (monthKey: string, field: 'tempQuantity' | 'tempPrice', value: number) => {
    setSales(prev => prev.map(item => 
      item.monthKey === monthKey 
        ? { ...item, [field]: value } 
        : item
    ))
  }

  if (loading) return <div className="flex items-center justify-center h-64">Loading sales data...</div>
  if (error) return <div className="flex items-center justify-center h-64 text-red-500">Error: {error}</div>
  // if (!sales.length) return <div className="flex items-center justify-center h-64">No sales data available</div>

  return (
    <div className="p-4">
      <div className="p-4 flex justify-between">
        <h1 className="text-2xl font-bold mb-6">Sales Dashboard</h1>
        {selectedCategory !== 'all' && (
              <p className="text-sm text-gray-600 mt-1">
                Showing data for: {categories.find(c => String(c.id) === selectedCategory)?.name || 'selected category'}
              </p>
          )}
      <div className="flex items-center gap-4">
        <span>Filter by product category: </span>
      <Select value={selectedCategory} onValueChange={handleCategoryChange}>
          <SelectTrigger className="
            w-[200px]
            bg-white
            border border-gray-300
            rounded-lg
            hover:border-gray-400
            focus:ring-2 focus:ring-blue-500
            transition-colors
            text-gray-800">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent className="
            bg-white
            border border-gray-300
            rounded-lg
            shadow-lg
            mt-1
          ">
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(category => (
              <SelectItem key={category.id} value={String(category.id)}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <ExportDataDialog />
        </div>
        </div>
      <div className="grid grid-cols-3 gap-6 mb-14">
        <Card className="w-full max-w-sm hover:shadow-lg transition-shadow duration-300 border border-gray-200 rounded-lg overflow-hidden !p-0">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-gray-50 p-6 border-b border-gray-200 rounded-t-lg">
            <CardTitle className="text-xl font-semibold text-gray-800 truncate">
              Total Profit
            </CardTitle>
            <CardDescription className="mt-2 text-gray-600 line-clamp-2">
              Value per year
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-3">
            <span className="text-lg font-bold text-green-600">U${meta?.total_profit.toFixed(2)}</span>
          </CardContent>
        </Card>
        <Card className="w-full max-w-sm hover:shadow-lg transition-shadow duration-300 border border-gray-200 rounded-lg overflow-hidden !p-0">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-gray-50 p-6 border-b border-gray-200 rounded-t-lg">
            <CardTitle className="text-xl font-semibold text-gray-800 truncate">
              Total Sales
            </CardTitle>
            <CardDescription className="mt-2 text-gray-600 line-clamp-2">
              Total sales for this year
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-3">
            <span className="text-lg font-bold text-blue-600">{meta?.total_sales}</span>
          </CardContent>
        </Card>
        <Card className="w-full max-w-sm hover:shadow-lg transition-shadow duration-300 border border-gray-200 rounded-lg overflow-hidden !p-0">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-gray-50 p-6 border-b border-gray-200 rounded-t-lg">
            <CardTitle className="text-xl font-semibold text-gray-800 truncate">
              Total Products
            </CardTitle>
            <CardDescription className="mt-2 text-gray-600 line-clamp-2">
              Total products sold this year
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-3">
            <span className="text-lg font-bold text-blue-600">{meta?.total_products}</span>
          </CardContent>
        </Card>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-14">
        <div className="bg-white rounded-lg shadow p-4 h-[400px]">
        <h2 className="text-lg font-semibold mb-4">
            {selectedCategory === 'all' 
              ? 'Monthly Sales Volume' 
              : `Monthly Sales - ${categories.find(c => String(c.id) === selectedCategory)?.name || ''}`}
          </h2>
          <ChartContainer config={chartConfig} className="h-full w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sales}>
                <CartesianGrid vertical={false} stroke="#f0f0f0" />
                <XAxis 
                  dataKey="month"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  tick={{ fill: '#6b7280' }}
                />
                <YAxis 
                  tick={{ fill: '#6b7280' }}
                  axisLine={false}
                  tickLine={false}
                />
                <ChartTooltip 
                  content={<ChartTooltipContent className="bg-white border border-gray-200 rounded shadow-lg p-2" />} 
                />
                <Bar 
                  dataKey="quantity" 
                  fill="var(--color-sales)" 
                  radius={[4, 4, 0, 0]} 
                  name="Units Sold"
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
        <div className="bg-white rounded-lg shadow p-4 h-[400px]">
        <h2 className="text-lg font-semibold mb-4">
            {selectedCategory === 'all' 
              ? 'Monthly Revenue' 
              : `Monthly Revenue - ${categories.find(c => String(c.id) === selectedCategory)?.name || ''}`}
          </h2>
          <ChartContainer config={chartConfig} className="h-full w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sales}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="month"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  tick={{ fill: '#6b7280' }}
                />
                <YAxis 
                  tick={{ fill: '#6b7280' }}
                  axisLine={false}
                  tickLine={false}
                  tickMargin={10}
                />
                <ChartTooltip 
                  content={<ChartTooltipContent className="bg-white border border-gray-200 rounded shadow-lg p-2" />} 
                />
                <Line 
                  type="monotone" 
                  dataKey="total_price" 
                  stroke="var(--color-profit)" 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Profit (USD)"
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
  <h2 className="text-lg font-semibold mb-4">Monthly Sales Data</h2>
  <div className="overflow-x-auto">
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Month</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Price</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Revenue</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {sales.map((item) => (
          <tr key={item.monthKey}>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.month}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {item.isEditing ? (
                <EditableCell
                  value={item.tempQuantity || 0}
                  onSave={() => handleSave(item.monthKey)}
                  onCancel={() => handleCancel(item.monthKey)}
                  onChange={(value) => handleValueChange(item.monthKey, 'tempQuantity', value)}
                  type="quantity"
                />
              ) : (
                item.quantity
              )}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {item.isEditing ? (
                <EditableCell
                  value={item.tempPrice || 0}
                  onSave={() => handleSave(item.monthKey)}
                  onCancel={() => handleCancel(item.monthKey)}
                  onChange={(value) => handleValueChange(item.monthKey, 'tempPrice', value)}
                  type="price"
                />
              ) : (
                `U$ ${(item.total_price / (item.quantity || 1)).toFixed(2)}`
              )}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              U$ {item.total_price.toFixed(2)}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {!item.isEditing && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditClick(item.monthKey)}
                  disabled={loading}
                >
                  Edit
                </Button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</div>
    </div>
  );
}