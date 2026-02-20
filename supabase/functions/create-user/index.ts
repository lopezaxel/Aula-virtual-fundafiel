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

        // Cliente admin: para operaciones privilegiadas (crear usuario, actualizar perfil)
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

        // Cliente autenticado: para verificar que el llamador es un admin
        const supabaseClient = createClient(
            Deno.env.get("SUPABASE_URL") ?? "",
            Deno.env.get("SUPABASE_ANON_KEY") ?? "",
            {
                global: { headers: { Authorization: authHeader } },
            }
        );

        // Cliente público limpio: para enviar el email de recuperación
        const supabasePublic = createClient(
            Deno.env.get("SUPABASE_URL") ?? "",
            Deno.env.get("SUPABASE_ANON_KEY") ?? ""
        );

        // 1. Verificar que el llamador es un admin
        const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
        if (userError || !user) {
            return new Response(JSON.stringify({ error: "Token inválido o sesión expirada" }), {
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

        // 2. Leer datos del nuevo usuario
        const { email, password, name, role } = await req.json();

        if (!email || !password || !name || !role) {
            return new Response(JSON.stringify({ error: "Missing fields" }), {
                status: 400,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        // 3. Crear el usuario con email confirmado y contraseña temporal
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

        // 4. Actualizar el perfil con nombre y rol
        const { error: updateProfileError } = await supabaseAdmin
            .from("profiles")
            .update({ name, role })
            .eq("id", newUser.user.id);

        if (updateProfileError) {
            console.error("Error actualizando perfil:", updateProfileError.message);
        }

        // 5. Enviar email de recuperación de contraseña apuntando a la URL de producción.
        //    Usamos el cliente público (sin token de usuario) para que Supabase envíe el correo.
        const { error: resetError } = await supabasePublic.auth.resetPasswordForEmail(email, {
            redirectTo: `${SITE_URL}/reset-password`,
        });

        if (resetError) {
            console.error("Error enviando email de recuperación:", resetError.message);
            // No interrumpimos: el usuario fue creado correctamente,
            // el admin puede reenviar el correo manualmente si es necesario.
        }

        return new Response(
            JSON.stringify({ user: newUser.user }),
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
