'use client'

import { ChartContainer, type ChartConfig, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import {Bar, BarChart, CartesianGrid, XAxis} from 'recharts';
import { useEffect, useState } from "react";
import { getSalesReport } from "@/services/api";
import { Sale, SalesReportResponse } from "@/interfaces/Interfaces";

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "#2563eb",
  },
  mobile: {
    label: "Mobile",
    color: "#60a5fa",
  },
} satisfies ChartConfig

export default function Home() {
  const [sales, setSales] = useState<Sale[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null) 

  const getSalesData = async () => {
    try {
      setLoading(true)
      const { sales } = await getSalesReport() as SalesReportResponse
      setSales(sales)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
      console.error("Erro ao buscar vendas:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getSalesData()
  }, [])

  if (loading) return <div>Loading charts...</div>
  if (error) return <div>Error: {error}</div>
  if (!sales.length) return <div>{`We don't have sales to display`}</div>

  return (
    <div className="flex flex-col p-4">
      <ChartContainer config={chartConfig} className="min-h-[200px] w-2/3">
        <BarChart accessibilityLayer data={sales}>
          <CartesianGrid  vertical={false}/>
          <XAxis 
            dataKey={'date'}
            // tickLine={false}
            // tickMargin={10}
            // axisLine={false}
            // tickFormatter={(value) => value.slice(0, 3)}
          />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar dataKey={"quantity"} fill="var(--color-desktop)" radius={4} />
        </BarChart>
      </ChartContainer>
    </div>
  );
}
