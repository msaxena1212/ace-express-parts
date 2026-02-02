import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const userId = claimsData.claims.sub;
    const url = new URL(req.url);
    const path = url.pathname.replace('/machines', '');

    // GET /machines - List user's machines
    if ((path === '' || path === '/') && req.method === 'GET') {
      const { data, error } = await supabase
        .from('user_equipment')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return new Response(JSON.stringify({
        success: true,
        data: {
          total: data?.length || 0,
          machines: data?.map(m => ({
            id: m.id,
            name: m.name,
            model: m.model,
            serial_number: m.serial_number,
            equipment_type: m.equipment_type,
            status: m.status,
            next_service_due: m.next_service_due,
            image_url: m.image_url
          }))
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // POST /machines/add
    if (path === '/add' && req.method === 'POST') {
      const body = await req.json();
      const { equipment_type, model, serial_number, machine_name, location } = body;

      if (!equipment_type || !model || !machine_name) {
        return new Response(JSON.stringify({ error: 'Missing required fields' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const { data, error } = await supabase
        .from('user_equipment')
        .insert({
          user_id: userId,
          equipment_type,
          model,
          serial_number,
          name: machine_name,
          status: 'active'
        })
        .select()
        .single();

      if (error) throw error;

      return new Response(JSON.stringify({
        success: true,
        machine: {
          id: data.id,
          name: data.name,
          model: data.model
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // GET /machines/:id
    const idMatch = path.match(/^\/([a-f0-9-]+)$/i);
    if (idMatch && req.method === 'GET') {
      const machineId = idMatch[1];

      const { data: machine, error } = await supabase
        .from('user_equipment')
        .select('*')
        .eq('id', machineId)
        .eq('user_id', userId)
        .single();

      if (error) throw error;

      // Get service history
      const { data: serviceHistory } = await supabase
        .from('service_requests')
        .select('*')
        .eq('equipment_id', machineId)
        .order('created_at', { ascending: false })
        .limit(10);

      return new Response(JSON.stringify({
        success: true,
        data: {
          ...machine,
          service_history: serviceHistory || []
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // POST /machines/:id/request-service
    const serviceMatch = path.match(/^\/([a-f0-9-]+)\/request-service$/i);
    if (serviceMatch && req.method === 'POST') {
      const machineId = serviceMatch[1];
      const body = await req.json();
      const { service_type, priority, description, preferred_date, preferred_time_slot } = body;

      const { data, error } = await supabase
        .from('service_requests')
        .insert({
          user_id: userId,
          equipment_id: machineId,
          service_type: service_type || 'maintenance',
          priority: priority || 'normal',
          description,
          preferred_date,
          preferred_time_slot,
          status: 'open'
        })
        .select()
        .single();

      if (error) throw error;

      return new Response(JSON.stringify({
        success: true,
        service_request: {
          id: data.id,
          status: data.status,
          estimated_cost: null
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // DELETE /machines/:id
    const deleteMatch = path.match(/^\/([a-f0-9-]+)$/i);
    if (deleteMatch && req.method === 'DELETE') {
      const machineId = deleteMatch[1];

      const { error } = await supabase
        .from('user_equipment')
        .delete()
        .eq('id', machineId)
        .eq('user_id', userId);

      if (error) throw error;

      return new Response(JSON.stringify({
        success: true,
        message: 'Machine deleted successfully'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Machines API error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
