import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Fetching grid data from power.gov.ng...");
    
    // Fetch the power.gov.ng page
    const response = await fetch('http://power.gov.ng/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      },
    });

    if (!response.ok) {
      console.error(`Failed to fetch: ${response.status} ${response.statusText}`);
      throw new Error(`Failed to fetch power.gov.ng: ${response.status}`);
    }

    const html = await response.text();
    console.log("Successfully fetched HTML, length:", html.length);

    let generationMw: number | null = null;
    let frequency: number | null = null;
    let loadPercent: number | null = null;
    let status: string = "stable";

    // Look for the "Grid @" card which has current data
    // Pattern: "Grid @ 06:00 Hrs for 08/01/2026 Generation: 4,876.45MW Frequency: 50.18Hz | 2.45 % (119.30)"
    const gridCardPattern = /Grid\s*@[\s\S]*?Generation:?\s*([0-9,]+\.?\d*)\s*MW[\s\S]*?Frequency:?\s*([0-9]+\.?\d*)\s*Hz/i;
    const gridCardMatch = html.match(gridCardPattern);
    
    if (gridCardMatch) {
      generationMw = parseFloat(gridCardMatch[1].replace(/,/g, ''));
      frequency = parseFloat(gridCardMatch[2]);
      console.log("Found grid card data - Generation:", generationMw, "Frequency:", frequency);
    }

    // Alternative pattern for the grid section with colons
    if (!generationMw || !frequency) {
      const altGridPattern = /Generation\s*:\s*<\/span>\s*([0-9,]+\.?\d*)\s*MW[\s\S]*?Frequency\s*:\s*<\/span>\s*([0-9]+\.?\d*)\s*Hz/i;
      const altMatch = html.match(altGridPattern);
      if (altMatch) {
        generationMw = parseFloat(altMatch[1].replace(/,/g, ''));
        frequency = parseFloat(altMatch[2]);
        console.log("Found grid data (alt) - Generation:", generationMw, "Frequency:", frequency);
      }
    }

    // Try to find generation from any MW value near "Generation"
    if (!generationMw) {
      const genMatch = html.match(/Generation[:\s]*([0-9,]+\.?\d*)\s*MW/i);
      if (genMatch) {
        generationMw = parseFloat(genMatch[1].replace(/,/g, ''));
        console.log("Found generation (simple):", generationMw);
      }
    }

    // Try to find frequency from any Hz value
    if (!frequency) {
      const freqMatch = html.match(/Frequency[:\s]*([0-9]+\.?\d*)\s*Hz/i);
      if (freqMatch) {
        frequency = parseFloat(freqMatch[1]);
        console.log("Found frequency (simple):", frequency);
      }
    }

    // Fallback: find any MW value that looks like generation (usually 4000-6000 range)
    if (!generationMw) {
      const mwMatches = html.match(/([0-9,]+\.?\d*)\s*MW/gi);
      if (mwMatches) {
        for (const match of mwMatches) {
          const value = parseFloat(match.replace(/,/g, '').replace(/MW/i, ''));
          if (value > 2000 && value < 10000) {
            generationMw = value;
            console.log("Found generation (fallback):", generationMw);
            break;
          }
        }
      }
    }

    // Fallback: find Hz value
    if (!frequency) {
      const hzMatch = html.match(/([0-9]+\.[0-9]+)\s*Hz/i);
      if (hzMatch) {
        frequency = parseFloat(hzMatch[1]);
        console.log("Found frequency (fallback):", frequency);
      }
    }

    // Extract percentage trend from grid card: "| 2.45 % (119.30)"
    const trendMatch = html.match(/\|\s*([\-\+]?\d+\.?\d*)\s*%/i);
    if (trendMatch) {
      loadPercent = parseFloat(trendMatch[1]);
      console.log("Found trend percentage:", loadPercent);
    }

    // Determine status based on frequency
    if (frequency) {
      if (frequency >= 49.5 && frequency <= 50.5) {
        status = "stable";
      } else if (frequency >= 49.0 && frequency <= 51.0) {
        status = "stressed";
      } else {
        status = "critical";
      }
    }

    console.log("Parsed data:", { generationMw, frequency, loadPercent, status });

    // Store in Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data, error } = await supabase
      .from('grid_data')
      .insert({
        generation_mw: generationMw,
        frequency: frequency,
        load_percent: loadPercent,
        status: status,
        source: 'power.gov.ng',
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
      throw error;
    }

    console.log("Successfully stored grid data:", data);

    return new Response(
      JSON.stringify({ 
        success: true, 
        data,
        message: "Grid data fetched and stored successfully" 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error('Error fetching grid data:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: errorMessage 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
