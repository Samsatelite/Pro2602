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

    // Pattern for peak generation: look for PEAK GENERATION section with MW value
    // HTML structure: PEAK GENERATION ... <span class="bold my-0 size24">4,919.90</span><span class="size15">MW</span>
    const peakGenSection = html.match(/PEAK GENERATION[\s\S]*?<span[^>]*>([0-9,]+\.?\d*)<\/span><span[^>]*>MW<\/span>/i);
    if (peakGenSection) {
      generationMw = parseFloat(peakGenSection[1].replace(/,/g, ''));
      console.log("Found peak generation:", generationMw);
    }

    // Alternative: look for bold size24 followed by MW
    if (!generationMw) {
      const boldMwMatch = html.match(/<span[^>]*class="bold[^"]*size24"[^>]*>([0-9,]+\.?\d*)<\/span><span[^>]*>MW<\/span>/i);
      if (boldMwMatch) {
        generationMw = parseFloat(boldMwMatch[1].replace(/,/g, ''));
        console.log("Found generation (bold):", generationMw);
      }
    }

    // Find frequency from the Grid @ section: "Frequency: 50.23Hz"
    const gridFreqMatch = html.match(/Frequency:?\s*<\/span>\s*([0-9]+\.?\d*)Hz/i);
    if (gridFreqMatch) {
      frequency = parseFloat(gridFreqMatch[1]);
      console.log("Found frequency (grid section):", frequency);
    }

    // Alternative frequency pattern: look for Hz values
    if (!frequency) {
      const freqMatch = html.match(/Freq\.?:?\s*<strong>([0-9]+\.?\d*)<\/strong>Hz/i);
      if (freqMatch) {
        frequency = parseFloat(freqMatch[1]);
        console.log("Found frequency (alt):", frequency);
      }
    }

    // Fallback frequency pattern
    if (!frequency) {
      const hzMatch = html.match(/([0-9]+\.[0-9]+)Hz/i);
      if (hzMatch) {
        frequency = parseFloat(hzMatch[1]);
        console.log("Found frequency (fallback):", frequency);
      }
    }

    // Extract percentage trend from peak generation section
    const trendMatch = html.match(/PEAK GENERATION[\s\S]*?([\-\+]?\d+\.?\d*)\s*%/i);
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
