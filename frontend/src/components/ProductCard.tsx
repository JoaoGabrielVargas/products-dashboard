import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {ProductProps} from "@/interfaces/Interfaces"

export default function ProductCard({ product }: ProductProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{product.name}</CardTitle>
        <CardDescription>{product.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Price: U$ {product.price.toFixed(2)}</p>
        <p>Total Sold: {product.total_sold}</p>
        <p>Revenue: {product.revenue.toFixed(2)}</p>
      </CardContent>
      <CardFooter>
        <p>Categoria: {product.category}</p>
      </CardFooter>
    </Card>
  )
}