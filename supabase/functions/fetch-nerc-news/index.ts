import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Fetching NERC news...");
    
    // Fetch the NERC news page
    const response = await fetch("https://nerc.gov.ng/media-category/news/", {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch NERC page: ${response.status}`);
    }

    const html = await response.text();
    console.log("Fetched NERC page, parsing news items...");

    // Parse news items from HTML
    const newsItems: Array<{
      title: string;
      description: string | null;
      type: string;
      region: string | null;
    }> = [];

    // Match article titles and content - looking for common patterns in news pages
    const titlePattern = /<h[2-4][^>]*class="[^"]*(?:entry-title|post-title|title)[^"]*"[^>]*>[\s\S]*?<a[^>]*href="[^"]*"[^>]*>([^<]+)<\/a>/gi;
    const excerptPattern = /<(?:div|p)[^>]*class="[^"]*(?:excerpt|summary|entry-content)[^"]*"[^>]*>([\s\S]*?)<\/(?:div|p)>/gi;

    let match;
    const titles: string[] = [];
    
    // Try to find article titles
    while ((match = titlePattern.exec(html)) !== null && titles.length < 10) {
      const title = match[1].trim().replace(/\s+/g, ' ');
      if (title && title.length > 10 && !titles.includes(title)) {
        titles.push(title);
      }
    }

    // If no titles found with the pattern, try alternative patterns
    if (titles.length === 0) {
      const altPattern = /<a[^>]*href="https?:\/\/nerc\.gov\.ng\/[^"]*"[^>]*>([^<]{20,})<\/a>/gi;
      while ((match = altPattern.exec(html)) !== null && titles.length < 10) {
        const title = match[1].trim().replace(/\s+/g, ' ');
        if (title && !title.includes('Read More') && !title.includes('Click') && !titles.includes(title)) {
          titles.push(title);
        }
      }
    }

    // Create news items from titles
    for (const title of titles) {
      const isAlert = title.toLowerCase().includes('warning') || 
                      title.toLowerCase().includes('urgent') ||
                      title.toLowerCase().includes('notice');
      const isUpdate = title.toLowerCase().includes('update') ||
                       title.toLowerCase().includes('new') ||
                       title.toLowerCase().includes('announce');
      
      newsItems.push({
        title: title.substring(0, 200),
        description: `Latest update from NERC regarding ${title.substring(0, 100)}...`,
        type: isAlert ? 'alert' : isUpdate ? 'update' : 'info',
        region: null,
      });
    }

    // If still no news found, add placeholder news
    if (newsItems.length === 0) {
      console.log("No news items found in HTML, adding placeholder");
      newsItems.push({
        title: "NERC Updates Available",
        description: "Check nerc.gov.ng for the latest regulatory updates and announcements.",
        type: "info",
        region: null,
      });
    }

    console.log(`Found ${newsItems.length} news items`);

    // Store in Supabase
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Insert news items (limit to 5 most recent)
    const itemsToInsert = newsItems.slice(0, 5);
    
    for (const item of itemsToInsert) {
      const { error } = await supabase
        .from("grid_news")
        .insert(item);
      
      if (error) {
        console.error("Error inserting news item:", error);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Fetched ${itemsToInsert.length} news items`,
        items: itemsToInsert
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error fetching NERC news:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error" 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
