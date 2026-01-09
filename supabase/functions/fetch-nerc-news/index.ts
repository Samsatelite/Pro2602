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
      published_at: string | null;
    }> = [];

    // Match article blocks with title, date, and link
    // NERC typically has articles in a structure with date like "January 8, 2025" or "08/01/2025"
    const articlePattern = /<article[^>]*>[\s\S]*?<\/article>/gi;
    const articles = html.match(articlePattern) || [];
    
    for (const article of articles.slice(0, 10)) {
      // Extract title from h2 or h3 with entry-title class
      const titleMatch = article.match(/<h[2-4][^>]*class="[^"]*entry-title[^"]*"[^>]*>[\s\S]*?<a[^>]*>([^<]+)<\/a>/i) ||
                         article.match(/<a[^>]*>([^<]{20,100})<\/a>/i);
      
      // Extract date - look for common date formats
      // Format: "January 8, 2025" or "8 January 2025" or "08/01/2025" or "2025-01-08"
      const dateMatch = article.match(/(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}/i) ||
                        article.match(/\d{1,2}\s+(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}/i) ||
                        article.match(/\d{1,2}\/\d{1,2}\/\d{4}/) ||
                        article.match(/\d{4}-\d{2}-\d{2}/);
      
      if (titleMatch) {
        const title = titleMatch[1].trim().replace(/\s+/g, ' ');
        
        if (title && title.length > 10 && !newsItems.some(item => item.title === title)) {
          let publishedAt: string | null = null;
          
          if (dateMatch) {
            try {
              const dateStr = dateMatch[0];
              const parsedDate = new Date(dateStr);
              if (!isNaN(parsedDate.getTime())) {
                publishedAt = parsedDate.toISOString();
              }
            } catch {
              console.log("Could not parse date:", dateMatch[0]);
            }
          }
          
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
            published_at: publishedAt,
          });
        }
      }
    }

    // Fallback: try to find titles without article wrapper
    if (newsItems.length === 0) {
      const titlePattern = /<h[2-4][^>]*class="[^"]*(?:entry-title|post-title|title)[^"]*"[^>]*>[\s\S]*?<a[^>]*href="[^"]*"[^>]*>([^<]+)<\/a>/gi;
      let match;
      
      while ((match = titlePattern.exec(html)) !== null && newsItems.length < 10) {
        const title = match[1].trim().replace(/\s+/g, ' ');
        if (title && title.length > 10 && !newsItems.some(item => item.title === title)) {
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
            published_at: null,
          });
        }
      }
    }

    // If still no news found, add placeholder
    if (newsItems.length === 0) {
      console.log("No news items found in HTML, adding placeholder");
      newsItems.push({
        title: "NERC Updates Available",
        description: "Check nerc.gov.ng for the latest regulatory updates and announcements.",
        type: "info",
        region: null,
        published_at: null,
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
