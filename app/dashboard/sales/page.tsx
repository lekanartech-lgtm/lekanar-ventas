import { Card, CardContent } from '@/components/ui/card'
import { ShoppingCart } from 'lucide-react'

export default function SalesPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Mis ventas</h1>
        <p className="text-sm text-muted-foreground">
          Ventas cerradas y en proceso
        </p>
      </div>

      <Card>
        <CardContent className="py-12 text-center">
          <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
          <p className="text-muted-foreground">
            El módulo de ventas estará disponible próximamente
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
