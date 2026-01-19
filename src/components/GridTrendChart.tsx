import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from "recharts";
import { format, subDays, subWeeks, subMonths } from "date-fns";

type TimeRange = "daily" | "weekly" | "monthly";

interface GridDataPoint {
  created_at: string;
  generation_mw: number | null;
  frequency: number | null;
  load_percent: number | null;
}

interface ChartDataPoint {
  time: string;
  generation: number;
  load: number;
}

export function GridTrendChart() {
  const [timeRange, setTimeRange] = useState<TimeRange>("daily");
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      let startDate: Date;
      const now = new Date();
      
      switch (timeRange) {
        case "daily":
          startDate = subDays(now, 1);
          break;
        case "weekly":
          startDate = subWeeks(now, 1);
          break;
        case "monthly":
          startDate = subMonths(now, 1);
          break;
        default:
          startDate = subDays(now, 1);
      }

      try {
        const { data, error } = await supabase
          .from("grid_data")
          .select("created_at, generation_mw, frequency, load_percent")
          .gte("created_at", startDate.toISOString())
          .order("created_at", { ascending: true });

        if (error) {
          console.error("Error fetching grid trend data:", error);
          setChartData(generatePlaceholderData(timeRange));
          return;
        }

        if (data && data.length > 0) {
          const formattedData = formatDataForTimeRange(data, timeRange);
          setChartData(formattedData);
        } else {
          setChartData(generatePlaceholderData(timeRange));
        }
      } catch (error) {
        console.error("Error fetching grid trend data:", error);
        setChartData(generatePlaceholderData(timeRange));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [timeRange]);

  return (
    <Card className="animate-fade-in" style={{ animationDelay: "400ms" }}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="flex items-center gap-2 text-base text-foreground">
            <TrendingUp className="w-4 h-4 text-primary" />
            Grid Trend
          </CardTitle>
          <Tabs value={timeRange} onValueChange={(v) => setTimeRange(v as TimeRange)}>
            <TabsList className="h-8">
              <TabsTrigger value="daily" className="text-xs px-3 h-6">
                Daily
              </TabsTrigger>
              <TabsTrigger value="weekly" className="text-xs px-3 h-6">
                Weekly
              </TabsTrigger>
              <TabsTrigger value="monthly" className="text-xs px-3 h-6">
                Monthly
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-[280px] flex items-center justify-center text-muted-foreground">
            Loading chart data...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={chartData} margin={{ top: 10, right: 50, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis 
                dataKey="time" 
                tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                tickLine={false}
                axisLine={{ stroke: "hsl(var(--border))" }}
                interval={timeRange === "daily" ? 3 : timeRange === "monthly" ? 4 : 0}
              />
              <YAxis 
                yAxisId="left"
                tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                tickLine={false}
                axisLine={{ stroke: "hsl(var(--border))" }}
                tickFormatter={(value) => `${(value / 1000).toFixed(1)}k`}
                width={40}
              />
              <YAxis 
                yAxisId="right"
                orientation="right"
                tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                tickLine={false}
                axisLine={{ stroke: "hsl(var(--border))" }}
                tickFormatter={(value) => `${value}%`}
                width={45}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: "12px"
                }}
                labelStyle={{ color: "hsl(var(--foreground))" }}
              />
              <Legend 
                wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }}
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="generation"
                name="Generation (MW)"
                stroke="hsl(var(--chart-1))"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: "hsl(var(--chart-1))" }}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="load"
                name="Load (%)"
                stroke="hsl(var(--chart-2))"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: "hsl(var(--chart-2))" }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

function formatDataForTimeRange(data: GridDataPoint[], timeRange: TimeRange): ChartDataPoint[] {
  switch (timeRange) {
    case "daily": {
      // Group by hour and take latest value for each hour
      const hourlyMap = new Map<string, ChartDataPoint>();
      data.forEach((point) => {
        const hour = format(new Date(point.created_at), "HH:00");
        hourlyMap.set(hour, {
          time: hour,
          generation: point.generation_mw ?? 0,
          load: point.load_percent ?? 0,
        });
      });
      // Ensure all 24 hours are represented
      const result: ChartDataPoint[] = [];
      for (let i = 0; i < 24; i++) {
        const hour = `${i.toString().padStart(2, "0")}:00`;
        result.push(hourlyMap.get(hour) || { time: hour, generation: 0, load: 0 });
      }
      return result;
    }
    case "weekly": {
      const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
      const dayMap = new Map<string, { generation: number[]; load: number[] }>();
      days.forEach(day => dayMap.set(day, { generation: [], load: [] }));
      
      data.forEach((point) => {
        const day = format(new Date(point.created_at), "EEE");
        const existing = dayMap.get(day);
        if (existing) {
          if (point.generation_mw) existing.generation.push(point.generation_mw);
          if (point.load_percent) existing.load.push(point.load_percent);
        }
      });
      
      return days.map(day => {
        const values = dayMap.get(day)!;
        return {
          time: day,
          generation: values.generation.length > 0 
            ? Math.round(values.generation.reduce((a, b) => a + b, 0) / values.generation.length)
            : 0,
          load: values.load.length > 0
            ? Math.round(values.load.reduce((a, b) => a + b, 0) / values.load.length)
            : 0,
        };
      });
    }
    case "monthly": {
      const dayMap = new Map<string, { generation: number[]; load: number[] }>();
      
      data.forEach((point) => {
        const day = format(new Date(point.created_at), "dd");
        if (!dayMap.has(day)) {
          dayMap.set(day, { generation: [], load: [] });
        }
        const existing = dayMap.get(day)!;
        if (point.generation_mw) existing.generation.push(point.generation_mw);
        if (point.load_percent) existing.load.push(point.load_percent);
      });
      
      return Array.from(dayMap.entries()).map(([day, values]) => ({
        time: day,
        generation: values.generation.length > 0 
          ? Math.round(values.generation.reduce((a, b) => a + b, 0) / values.generation.length)
          : 0,
        load: values.load.length > 0
          ? Math.round(values.load.reduce((a, b) => a + b, 0) / values.load.length)
          : 0,
      }));
    }
    default:
      return [];
  }
}

function generatePlaceholderData(timeRange: TimeRange): ChartDataPoint[] {
  switch (timeRange) {
    case "daily":
      return Array.from({ length: 24 }, (_, i) => ({
        time: `${i.toString().padStart(2, "0")}:00`,
        generation: Math.floor(Math.random() * 2000) + 3000,
        load: Math.floor(Math.random() * 30) + 60,
      }));
    case "weekly":
      const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
      return days.map((day) => ({
        time: day,
        generation: Math.floor(Math.random() * 2000) + 3000,
        load: Math.floor(Math.random() * 30) + 60,
      }));
    case "monthly":
      return Array.from({ length: 30 }, (_, i) => ({
        time: (i + 1).toString().padStart(2, "0"),
        generation: Math.floor(Math.random() * 2000) + 3000,
        load: Math.floor(Math.random() * 30) + 60,
      }));
    default:
      return [];
  }
}
