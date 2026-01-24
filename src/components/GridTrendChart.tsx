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
  ResponsiveContainer
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
            <LineChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis 
                dataKey="time" 
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                tickLine={false}
                axisLine={{ stroke: "hsl(var(--border))" }}
                interval={timeRange === "daily" ? 3 : 0}
              />
              <YAxis 
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                tickLine={false}
                axisLine={{ stroke: "hsl(var(--border))" }}
                tickFormatter={(value) => `${(value / 1000).toFixed(1)}k`}
                width={45}
                label={{ 
                  value: "MW", 
                  angle: -90, 
                  position: "insideLeft",
                  style: { fontSize: 11, fill: "hsl(var(--muted-foreground))" }
                }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: "12px"
                }}
                labelStyle={{ color: "hsl(var(--foreground))" }}
                formatter={(value: number) => [`${value.toLocaleString()} MW`, "Generation"]}
              />
              <Line
                type="monotone"
                dataKey="generation"
                name="Generation (MW)"
                stroke="hsl(var(--chart-1))"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: "hsl(var(--chart-1))" }}
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
      let lastKnownGeneration = 0;
      
      data.forEach((point) => {
        const hour = format(new Date(point.created_at), "HH:00");
        const generation = point.generation_mw ?? 0;
        if (generation > 0) {
          lastKnownGeneration = generation;
        }
        hourlyMap.set(hour, {
          time: hour,
          generation: generation > 0 ? generation : lastKnownGeneration,
        });
      });
      
      // Build result with carry-forward for missing hours
      const result: ChartDataPoint[] = [];
      let carryForwardValue = 0;
      
      for (let i = 0; i < 24; i++) {
        const hour = `${i.toString().padStart(2, "0")}:00`;
        const existing = hourlyMap.get(hour);
        if (existing && existing.generation > 0) {
          carryForwardValue = existing.generation;
          result.push(existing);
        } else if (carryForwardValue > 0) {
          result.push({ time: hour, generation: carryForwardValue });
        } else {
          result.push({ time: hour, generation: 0 });
        }
      }
      return result;
    }
    case "weekly": {
      const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
      const dayMap = new Map<string, number[]>();
      days.forEach(day => dayMap.set(day, []));
      
      data.forEach((point) => {
        const day = format(new Date(point.created_at), "EEE");
        const existing = dayMap.get(day);
        if (existing && point.generation_mw) {
          existing.push(point.generation_mw);
        }
      });
      
      return days.map(day => {
        const values = dayMap.get(day)!;
        return {
          time: day,
          generation: values.length > 0 
            ? Math.round(values.reduce((a, b) => a + b, 0) / values.length)
            : 0,
        };
      });
    }
    case "monthly": {
      // Group by week number
      const weekMap = new Map<string, number[]>();
      
      data.forEach((point) => {
        const weekNum = format(new Date(point.created_at), "'W'w");
        if (!weekMap.has(weekNum)) {
          weekMap.set(weekNum, []);
        }
        if (point.generation_mw) {
          weekMap.get(weekNum)!.push(point.generation_mw);
        }
      });
      
      return Array.from(weekMap.entries())
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([week, values]) => ({
          time: week,
          generation: values.length > 0 
            ? Math.round(values.reduce((a, b) => a + b, 0) / values.length)
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
      }));
    case "weekly":
      const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
      return days.map((day) => ({
        time: day,
        generation: Math.floor(Math.random() * 2000) + 3000,
      }));
    case "monthly":
      return Array.from({ length: 4 }, (_, i) => ({
        time: `W${i + 1}`,
        generation: Math.floor(Math.random() * 2000) + 3000,
      }));
    default:
      return [];
  }
}
