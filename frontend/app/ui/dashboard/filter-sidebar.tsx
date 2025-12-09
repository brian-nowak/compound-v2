'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default function FilterSidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams)
    if (value === 'all') {
      params.delete(key)
    } else {
      params.set(key, value)
    }
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Filters</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Date Range Filter */}
        <div className="space-y-2">
          <Label>Date Range</Label>
          <Select
            value={searchParams.get('dateRange') || 'all'}
            onValueChange={(value) => updateFilter('dateRange', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
              <SelectItem value="90d">Last 90 Days</SelectItem>
              <SelectItem value="1y">Last Year</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Category Filter */}
        <div className="space-y-2">
          <Label>Category</Label>
          <Select
            value={searchParams.get('category') || 'all'}
            onValueChange={(value) => updateFilter('category', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="Food and Drink">Food & Drink</SelectItem>
              <SelectItem value="Shops">Shopping</SelectItem>
              <SelectItem value="Travel">Travel</SelectItem>
              <SelectItem value="Transportation">Transportation</SelectItem>
              <SelectItem value="Entertainment">Entertainment</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  )
}
