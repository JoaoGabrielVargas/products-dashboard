// components/EditableCell.tsx
'use client'

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Check, X } from "lucide-react"

interface EditableCellProps {
  value: number
  onSave: (newValue: number) => void
  onCancel: () => void
  onChange: (value: number) => void
  type?: 'quantity' | 'price'
}

export function EditableCell({ 
  value, 
  onSave, 
  onCancel, 
  onChange,
  type = 'quantity'
}: EditableCellProps) {
  return (
    <div className="flex items-center gap-2">
      <Input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-24 h-8"
        min={0}
        step={type === 'price' ? 0.01 : 1}
      />
      <Button 
        size="sm" 
        variant="outline" 
        className="h-8 w-8 p-0"
        onClick={() => onSave(value)}
      >
        <Check className="h-4 w-4" />
      </Button>
      <Button 
        size="sm" 
        variant="outline" 
        className="h-8 w-8 p-0"
        onClick={onCancel}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  )
}