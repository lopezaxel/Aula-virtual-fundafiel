import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// URL de producción — el enlace del correo apuntará aquí
const SITE_URL = Deno.env.get("SITE_URL") ?? "https://aula.fundacionfiel.com";

Deno.serve(async (req) => {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const authHeader = req.headers.get("Authorization");
        if (!authHeader) {
            return new Response(JSON.stringify({ error: "No authorization header" }), {
                status: 401,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        const supabaseAdmin = createClient(
            Deno.env.get("SUPABASE_URL") ?? "",
            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false,
                },
            }
        );

        // Verify the caller is an admin
        const supabaseClient = createClient(
            Deno.env.get("SUPABASE_URL") ?? "",
            Deno.env.get("SUPABASE_ANON_KEY") ?? "",
            {
                global: { headers: { Authorization: authHeader } },
            }
        );

        const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
        if (userError || !user) {
            return new Response(JSON.stringify({ error: "Invalid token" }), {
                status: 401,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        const { data: profile, error: profileError } = await supabaseAdmin
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();

        if (profileError || profile?.role !== "admin") {
            return new Response(JSON.stringify({ error: "Unauthorized: Admin only" }), {
                status: 403,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        // Process request
        const { email, password, name, role } = await req.json();

        if (!email || !password || !name || !role) {
            return new Response(JSON.stringify({ error: "Missing fields" }), {
                status: 400,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        // 1. Crear el usuario con email confirmado y contraseña temporal
        const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { name, role },
        });

        if (createError) {
            return new Response(JSON.stringify({ error: createError.message }), {
                status: 400,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        // 2. Generar enlace de recuperación de contraseña apuntando a la URL de producción
        //    Este es el enlace que recibirá el usuario en el correo de bienvenida/invitación
        const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
            type: "recovery",
            email,
            options: {
                redirectTo: `${SITE_URL}/reset-password`,
            },
        });

        if (linkError) {
            console.error("Error generando el enlace de recuperación:", linkError.message);
            // No interrumpimos el flujo, el usuario fue creado
        }

        // 3. Actualizar el perfil con nombre y rol
        const { error: updateProfileError } = await supabaseAdmin
            .from("profiles")
            .update({ name, role })
            .eq("id", newUser.user.id);

        if (updateProfileError) {
            console.error("Error actualizando perfil:", updateProfileError.message);
        }

        return new Response(
            JSON.stringify({
                user: newUser.user,
                // Devolvemos el enlace de reseteo para que el admin pueda compartirlo manualmente si lo necesita
                resetLink: linkData?.properties?.action_link ?? null,
            }),
            {
                status: 200,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
        );
    } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
});
