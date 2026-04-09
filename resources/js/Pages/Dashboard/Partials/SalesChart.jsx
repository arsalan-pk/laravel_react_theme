import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { usePage } from "@inertiajs/react"

export const description = "An interactive area chart"

const chartConfig = {
  visitors: {
    label: "Sales",
  },
  sale: {
    label: "Sales",
    color: "var(--chart-2)",
  },
  cash: {
    label: "Cash",
    color: "var(--chart-4)",
  },
}

export function SalesChart() {
  // Static chart data instead of dynamic data
  const chartData = [
    { date: "2026-03-01", cash: 45000, sale: 52000 },
    { date: "2026-03-02", cash: 38000, sale: 41000 },
    { date: "2026-03-03", cash: 52000, sale: 58000 },
    { date: "2026-03-04", cash: 41000, sale: 45000 },
    { date: "2026-03-05", cash: 48000, sale: 51000 },
    { date: "2026-03-06", cash: 55000, sale: 62000 },
    { date: "2026-03-07", cash: 49000, sale: 53000 },
    { date: "2026-03-08", cash: 51000, sale: 57000 },
    { date: "2026-03-09", cash: 47000, sale: 49000 },
    { date: "2026-03-10", cash: 53000, sale: 59000 },
    { date: "2026-03-11", cash: 56000, sale: 61000 },
    { date: "2026-03-12", cash: 42000, sale: 48000 },
    { date: "2026-03-13", cash: 50000, sale: 55000 },
    { date: "2026-03-14", cash: 58000, sale: 64000 },
    { date: "2026-03-15", cash: 46000, sale: 52000 },
    { date: "2026-03-16", cash: 54000, sale: 60000 },
    { date: "2026-03-17", cash: 49000, sale: 56000 },
    { date: "2026-03-18", cash: 57000, sale: 63000 },
    { date: "2026-03-19", cash: 43000, sale: 49000 },
    { date: "2026-03-20", cash: 52000, sale: 58000 },
    { date: "2026-03-21", cash: 59000, sale: 65000 },
    { date: "2026-03-22", cash: 47000, sale: 54000 },
    { date: "2026-03-23", cash: 55000, sale: 61000 },
    { date: "2026-03-24", cash: 50000, sale: 57000 },
    { date: "2026-03-25", cash: 48000, sale: 55000 },
    { date: "2026-03-26", cash: 56000, sale: 62000 },
    { date: "2026-03-27", cash: 44000, sale: 50000 },
    { date: "2026-03-28", cash: 53000, sale: 59000 },
    { date: "2026-03-29", cash: 57000, sale: 63000 },
    { date: "2026-03-30", cash: 49000, sale: 56000 },
  ]

  const [timeRange, setTimeRange] = React.useState("90d")

  const filteredData = chartData.filter((item) => {
    const date = new Date(item.date)
    const referenceDate = new Date()
    let daysToSubtract = 90
    if (timeRange === "30d") {
      daysToSubtract = 30
    } else if (timeRange === "7d") {
      daysToSubtract = 7
    }
    const startDate = new Date(referenceDate)
    startDate.setDate(startDate.getDate() - daysToSubtract)
    return date >= startDate
  })

  return (
    <Card className="pt-0 w-full h-full">
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1">
          <CardTitle>SALES</CardTitle>
          <CardDescription>
            Showing total sales for the last 3 months
          </CardDescription>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger
            className="hidden w-[160px] rounded-lg sm:ml-auto sm:flex"
            aria-label="Select a value"
          >
            <SelectValue placeholder="Last 3 months" />
          </SelectTrigger>
          <SelectContent className="rounded-xl bg-white">
            <SelectItem value="90d" className="rounded-lg">
              Last 3 months
            </SelectItem>
            <SelectItem value="30d" className="rounded-lg">
              Last 30 days
            </SelectItem>
            <SelectItem value="7d" className="rounded-lg">
              Last 7 days
            </SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillCash" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-cash)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-cash)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillSale" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-sale)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-sale)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              }}
            />
            {/* <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickCount={2}
            /> */}
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                className="bg-white"
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  }}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="sale"
              type="natural"
              fill="url(#fillSale)"
              stroke="var(--color-sale)"
              stackId="a"
            />
            <Area
              dataKey="cash"
              type="natural"
              fill="url(#fillCash)"
              stroke="var(--color-cash)"
              stackId="a"
            />
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
