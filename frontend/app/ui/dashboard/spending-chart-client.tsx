'use client'

import { formatCurrency } from '@/app/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer } from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, LabelList } from 'recharts';

interface ChartData {
  category: string;
  amount: number;
  fill: string;
}

interface SpendingChartClientProps {
  data: ChartData[];
  dateRangeText: string;
}

export default function SpendingChartClient({ data, dateRangeText }: SpendingChartClientProps) {
  // Define matching shades of blue
  const blueShades = [
    'hsl(210, 100%, 70%)',  // Light blue
    'hsl(210, 100%, 60%)',  // Medium-light blue
    'hsl(210, 100%, 50%)',  // Medium blue
    'hsl(210, 100%, 40%)',  // Medium-dark blue
    'hsl(210, 100%, 30%)',  // Dark blue
    'hsl(210, 100%, 25%)',  // Darker blue
    'hsl(210, 100%, 20%)',  // Darkest blue
  ];

  // Build dynamic chart config based on data
  const chartConfig = data.reduce((config, item, index) => {
    const key = item.category.toLowerCase().replace(/[^a-z0-9]/g, '_');
    config[key] = {
      label: item.category,
      color: blueShades[index % blueShades.length],
    };
    return config;
  }, {} as Record<string, { label: string; color: string }>);


  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Spending Categories</CardTitle>
        <CardDescription>{dateRangeText}</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            No spending data available for the selected filters
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <BarChart data={data}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="category"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value) => value.slice(0, 15)}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              />
              <Bar dataKey="amount" radius={8}>
                <LabelList
                  dataKey="amount"
                  position="top"
                  formatter={(value: number) => formatCurrency(value)}
                  className="fill-foreground text-xs"
                />
              </Bar>
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
