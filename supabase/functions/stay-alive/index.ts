import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  return new Response(
    JSON.stringify({ message: "I'm awake!", timestamp: new Date().toISOString() }),
    { 
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200 
    }
  );
});
