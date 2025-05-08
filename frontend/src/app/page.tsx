'use client'

import { ChartContainer, type ChartConfig, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import {Bar, BarChart, CartesianGrid, XAxis, YAxis, LineChart, Line, ResponsiveContainer} from 'recharts';
import { useEffect, useState } from "react";
import { getSalesReport, getCategories } from "@/services/api";
import { Meta, MonthlySaleData, SalesReportResponse, Category } from "@/interfaces/Interfaces";
import { groupSalesByMonth } from "@/utils/salesDataProcessor";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

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
      console.log("salesReportData 1", salesReportData)
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

  if (loading) return <div className="flex items-center justify-center h-64">Loading sales data...</div>
  if (error) return <div className="flex items-center justify-center h-64 text-red-500">Error: {error}</div>
  if (!sales.length) return <div className="flex items-center justify-center h-64">No sales data available</div>

  console.log("sales", sales)
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
    </div>
  );
}