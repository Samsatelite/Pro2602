import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { CartesianGrid, Line, LineChart, XAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
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
  generation: number | null;
  load: number | null;
}

const chartConfig = {
  generation: {
    label: "Generation (MW)",
    color: "hsl(var(--chart-1))",
  },
  load: {
    label: "Load (%)",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

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
          return;
        }

        if (data && data.length > 0) {
          const formattedData = data.map((point: GridDataPoint) => {
            let timeLabel: string;
            switch (timeRange) {
              case "daily":
                timeLabel = format(new Date(point.created_at), "HH:00");
                break;
              case "weekly":
                timeLabel = format(new Date(point.created_at), "EEE");
                break;
              case "monthly":
                timeLabel = format(new Date(point.created_at), "MMM dd");
                break;
              default:
                timeLabel = format(new Date(point.created_at), "HH:00");
            }
            
            return {
              time: timeLabel,
              generation: point.generation_mw,
              load: point.load_percent,
            };
          });
          setChartData(formattedData);
        } else {
          // Generate placeholder data for demo
          const placeholderData = generatePlaceholderData(timeRange);
          setChartData(placeholderData);
        }
      } catch (error) {
        console.error("Error fetching grid trend data:", error);
        const placeholderData = generatePlaceholderData(timeRange);
        setChartData(placeholderData);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [timeRange]);

  const getDescription = () => {
    switch (timeRange) {
      case "daily":
        return "00:00 - 23:00";
      case "weekly":
        return "Mon - Sun";
      case "monthly":
        return "Last 30 days";
      default:
        return "";
    }
  };

  return (
    <Card className="animate-fade-in border-border" style={{ animationDelay: "400ms" }}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="w-4 h-4 text-primary" />
              Grid Trend
            </CardTitle>
            <CardDescription>{getDescription()}</CardDescription>
          </div>
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
          <div className="h-[250px] flex items-center justify-center text-muted-foreground">
            Loading chart data...
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-[250px] w-full">
            <LineChart
              accessibilityLayer
              data={chartData}
              margin={{
                left: 12,
                right: 12,
              }}
            >
              <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="time"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                className="text-xs fill-muted-foreground"
              />
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
              <Line
                dataKey="generation"
                type="monotone"
                stroke="var(--color-generation)"
                strokeWidth={2}
                dot={false}
              />
              <Line
                dataKey="load"
                type="monotone"
                stroke="var(--color-load)"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
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
      return Array.from({ length: 30 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - 29 + i);
        return {
          time: format(date, "MMM dd"),
          generation: Math.floor(Math.random() * 2000) + 3000,
          load: Math.floor(Math.random() * 30) + 60,
        };
      });
    default:
      return [];
  }
}
