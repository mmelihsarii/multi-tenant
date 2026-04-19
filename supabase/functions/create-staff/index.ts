// @ts-ignore: Deno global is available in Deno runtime
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// @ts-ignore: Deno global is available in Deno runtime
Deno.serve(async (req: Request) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // @ts-ignore: Deno global is available in Deno runtime
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    // @ts-ignore: Deno global is available in Deno runtime
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

    // Body'yi parse et
    const body = await req.json()
    
    // DELETE İŞLEMİ - Body'de _method: 'DELETE' varsa veya HTTP method DELETE ise
    if (req.method === 'DELETE' || body._method === 'DELETE') {
      const { userId } = body

      if (!userId) {
        return new Response(JSON.stringify({ error: 'userId gerekli' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        })
      }

      // 1. Önce users tablosundan sil (CASCADE ile ilişkili kayıtlar da silinir)
      const dbRes = await fetch(`${supabaseUrl}/rest/v1/users?id=eq.${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'apikey': supabaseServiceKey,
        }
      })

      if (!dbRes.ok) {
        const dbError = await dbRes.text()
        console.error('DB Delete Error:', dbError)
        return new Response(JSON.stringify({ error: 'Veritabanından silinemedi: ' + dbError }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        })
      }

      // 2. Sonra Auth sisteminden sil
      const authRes = await fetch(`${supabaseUrl}/auth/v1/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'apikey': supabaseServiceKey,
        }
      })

      if (!authRes.ok) {
        const authError = await authRes.text()
        console.error('Auth Delete Error:', authError)
        // Auth'dan silinemese bile devam et (zaten DB'den silindi)
      }

      return new Response(JSON.stringify({ message: 'Personel başarıyla silindi' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    // POST İŞLEMİ - Personel Oluşturma
    const { email, password, fullName, companyId } = body

    if (!email || !password || !fullName || !companyId) {
      return new Response(JSON.stringify({ error: 'Eksik parametreler' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    // 1. AUTH SİSTEMİNE KAYIT (Direct REST API Call)
    const authRes = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'apikey': supabaseServiceKey,
      },
      body: JSON.stringify({
        email,
        password,
        user_metadata: { full_name: fullName },
        email_confirm: true
      })
    })

    const authData = await authRes.json()
    if (!authRes.ok) {
      console.error('Auth Create Error:', authData)
      return new Response(JSON.stringify({ error: authData.msg || authData.error_description || 'Auth hatası' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    // 2. PUBLIC.USERS TABLOSUNA KAYIT (Direct REST API Call)
    const dbRes = await fetch(`${supabaseUrl}/rest/v1/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'apikey': supabaseServiceKey,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        id: authData.user?.id || authData.id,
        company_id: companyId,
        full_name: fullName,
        role: 'staff'
      })
    })

    if (!dbRes.ok) {
      const dbError = await dbRes.json()
      console.error('DB Create Error:', dbError)
      return new Response(JSON.stringify({ error: dbError.message || 'Veritabanına yazılamadı' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    return new Response(JSON.stringify({ message: 'Personel başarıyla oluşturuldu!' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error: any) {
    console.error('Edge Function Error:', error)
    return new Response(JSON.stringify({ error: error.message || 'Bilinmeyen hata' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
