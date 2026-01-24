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
  frequency: number;
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
      <CardContent className="px-2 sm:px-4">
        {loading ? (
          <div className="h-[280px] flex items-center justify-center text-muted-foreground">
            Loading chart data...
          </div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis 
                  dataKey="time" 
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  tickLine={false}
                  axisLine={{ stroke: "hsl(var(--border))" }}
                  interval={timeRange === "daily" ? 3 : 0}
                />
                <YAxis 
                  yAxisId="left"
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${(value / 1000).toFixed(1)}k`}
                  width={35}
                />
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  tick={{ fontSize: 11, fill: "hsl(45, 93%, 47%)" }}
                  tickLine={false}
                  axisLine={false}
                  domain={[48, 52]}
                  width={30}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px"
                  }}
                  labelStyle={{ color: "hsl(var(--foreground))" }}
                  formatter={(value: number, name: string) => {
                    if (name === "Generation (MW)") {
                      return [`${value.toLocaleString()} MW`, "Generation"];
                    }
                    return [`${value.toFixed(2)} Hz`, "Frequency"];
                  }}
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
                  dataKey="frequency"
                  name="Frequency (Hz)"
                  stroke="hsl(45, 93%, 47%)"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: "hsl(45, 93%, 47%)" }}
                />
              </LineChart>
            </ResponsiveContainer>
            <div className="flex items-center justify-center gap-6 mt-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-3 h-0.5 rounded-full bg-[hsl(var(--chart-1))]" />
                <span>Grid Power (MW)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-0.5 rounded-full bg-[hsl(45,93%,47%)]" />
                <span>Grid Frequency (Hz)</span>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function formatDataForTimeRange(data: GridDataPoint[], timeRange: TimeRange): ChartDataPoint[] {
  switch (timeRange) {
    case "daily": {
      // Group by hour and take latest value for each hour
      const hourlyMap = new Map<string, { generation: number; frequency: number }>();
      let lastKnownGeneration = 0;
      let lastKnownFrequency = 50;
      
      data.forEach((point) => {
        const hour = format(new Date(point.created_at), "HH:00");
        const generation = point.generation_mw ?? 0;
        const frequency = point.frequency ?? 0;
        
        if (generation > 0) {
          lastKnownGeneration = generation;
        }
        if (frequency > 0) {
          lastKnownFrequency = frequency;
        }
        
        hourlyMap.set(hour, {
          generation: generation > 0 ? generation : lastKnownGeneration,
          frequency: frequency > 0 ? frequency : lastKnownFrequency,
        });
      });
      
      // Build result with carry-forward for missing hours
      const result: ChartDataPoint[] = [];
      let carryForwardGeneration = 0;
      let carryForwardFrequency = 50;
      
      for (let i = 0; i < 24; i++) {
        const hour = `${i.toString().padStart(2, "0")}:00`;
        const existing = hourlyMap.get(hour);
        if (existing) {
          if (existing.generation > 0) carryForwardGeneration = existing.generation;
          if (existing.frequency > 0) carryForwardFrequency = existing.frequency;
          result.push({ 
            time: hour, 
            generation: existing.generation > 0 ? existing.generation : carryForwardGeneration,
            frequency: existing.frequency > 0 ? existing.frequency : carryForwardFrequency,
          });
        } else if (carryForwardGeneration > 0) {
          result.push({ 
            time: hour, 
            generation: carryForwardGeneration,
            frequency: carryForwardFrequency,
          });
        } else {
          result.push({ time: hour, generation: 0, frequency: 50 });
        }
      }
      return result;
    }
    case "weekly": {
      const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
      const dayMap = new Map<string, { generations: number[]; frequencies: number[] }>();
      days.forEach(day => dayMap.set(day, { generations: [], frequencies: [] }));
      
      data.forEach((point) => {
        const day = format(new Date(point.created_at), "EEE");
        const existing = dayMap.get(day);
        if (existing) {
          if (point.generation_mw) existing.generations.push(point.generation_mw);
          if (point.frequency) existing.frequencies.push(point.frequency);
        }
      });
      
      let lastGen = 0;
      let lastFreq = 50;
      
      return days.map(day => {
        const values = dayMap.get(day)!;
        const avgGen = values.generations.length > 0 
          ? Math.round(values.generations.reduce((a, b) => a + b, 0) / values.generations.length)
          : lastGen;
        const avgFreq = values.frequencies.length > 0 
          ? values.frequencies.reduce((a, b) => a + b, 0) / values.frequencies.length
          : lastFreq;
        
        if (avgGen > 0) lastGen = avgGen;
        if (avgFreq > 0) lastFreq = avgFreq;
        
        return {
          time: day,
          generation: avgGen,
          frequency: avgFreq,
        };
      });
    }
    case "monthly": {
      // Group by week number
      const weekMap = new Map<string, { generations: number[]; frequencies: number[] }>();
      
      data.forEach((point) => {
        const weekNum = format(new Date(point.created_at), "'W'w");
        if (!weekMap.has(weekNum)) {
          weekMap.set(weekNum, { generations: [], frequencies: [] });
        }
        const week = weekMap.get(weekNum)!;
        if (point.generation_mw) week.generations.push(point.generation_mw);
        if (point.frequency) week.frequencies.push(point.frequency);
      });
      
      let lastGen = 0;
      let lastFreq = 50;
      
      return Array.from(weekMap.entries())
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([week, values]) => {
          const avgGen = values.generations.length > 0 
            ? Math.round(values.generations.reduce((a, b) => a + b, 0) / values.generations.length)
            : lastGen;
          const avgFreq = values.frequencies.length > 0 
            ? values.frequencies.reduce((a, b) => a + b, 0) / values.frequencies.length
            : lastFreq;
          
          if (avgGen > 0) lastGen = avgGen;
          if (avgFreq > 0) lastFreq = avgFreq;
          
          return {
            time: week,
            generation: avgGen,
            frequency: avgFreq,
          };
        });
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
        frequency: 49.5 + Math.random(),
      }));
    case "weekly":
      const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
      return days.map((day) => ({
        time: day,
        generation: Math.floor(Math.random() * 2000) + 3000,
        frequency: 49.5 + Math.random(),
      }));
    case "monthly":
      return Array.from({ length: 4 }, (_, i) => ({
        time: `W${i + 1}`,
        generation: Math.floor(Math.random() * 2000) + 3000,
        frequency: 49.5 + Math.random(),
      }));
    default:
      return [];
  }
}
