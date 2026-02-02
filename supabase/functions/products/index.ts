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
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const url = new URL(req.url);
    const path = url.pathname.replace('/products', '');

    // GET /products/search
    if (path.startsWith('/search') && req.method === 'GET') {
      const q = url.searchParams.get('q') || '';
      const category = url.searchParams.get('category');
      const priceMin = url.searchParams.get('price_min');
      const priceMax = url.searchParams.get('price_max');
      const inStock = url.searchParams.get('in_stock');
      const sort = url.searchParams.get('sort') || 'relevance';
      const page = parseInt(url.searchParams.get('page') || '1');
      const limit = parseInt(url.searchParams.get('limit') || '20');

      let query = supabase
        .from('products')
        .select('*', { count: 'exact' })
        .eq('is_active', true);

      if (q) {
        query = query.or(`name.ilike.%${q}%,part_number.ilike.%${q}%,description.ilike.%${q}%`);
      }
      if (category) {
        query = query.eq('category', category);
      }
      if (priceMin) {
        query = query.gte('selling_price', parseFloat(priceMin));
      }
      if (priceMax) {
        query = query.lte('selling_price', parseFloat(priceMax));
      }
      if (inStock === 'true') {
        query = query.gt('stock_quantity', 0);
      }

      // Sorting
      switch (sort) {
        case 'price_asc':
          query = query.order('selling_price', { ascending: true });
          break;
        case 'price_desc':
          query = query.order('selling_price', { ascending: false });
          break;
        case 'newest':
          query = query.order('created_at', { ascending: false });
          break;
        case 'best_selling':
          query = query.order('total_reviews', { ascending: false });
          break;
        default:
          query = query.order('average_rating', { ascending: false });
      }

      // Pagination
      const offset = (page - 1) * limit;
      query = query.range(offset, offset + limit - 1);

      const { data, count, error } = await query;

      if (error) throw error;

      return new Response(JSON.stringify({
        success: true,
        data: {
          total: count,
          page,
          limit,
          products: data?.map(p => ({
            id: p.id,
            name: p.name,
            part_number: p.part_number,
            price: p.selling_price,
            mrp: p.mrp,
            discount_percentage: p.discount_percentage,
            rating: p.average_rating,
            reviews_count: p.total_reviews,
            in_stock: p.stock_quantity > 0,
            stock_quantity: p.stock_quantity,
            image_url: p.images?.[0]?.url || null,
            badges: p.badges,
            fast_track_available: p.fast_track_available,
          }))
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // GET /products/categories
    if (path === '/categories' && req.method === 'GET') {
      const { data, error } = await supabase
        .from('products')
        .select('category')
        .eq('is_active', true);

      if (error) throw error;

      const categoryCount = (data || []).reduce((acc: Record<string, number>, p) => {
        acc[p.category] = (acc[p.category] || 0) + 1;
        return acc;
      }, {});

      const categories = Object.entries(categoryCount).map(([name, count]) => ({
        id: name.toLowerCase().replace(/\s+/g, '_'),
        name,
        product_count: count
      }));

      return new Response(JSON.stringify({
        success: true,
        data: categories
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // GET /products/:id
    const idMatch = path.match(/^\/([a-f0-9-]+)$/i);
    if (idMatch && req.method === 'GET') {
      const productId = idMatch[1];

      const { data: product, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();

      if (error) throw error;

      // Get reviews
      const { data: reviews } = await supabase
        .from('product_reviews')
        .select('*')
        .eq('product_id', productId)
        .order('created_at', { ascending: false })
        .limit(10);

      return new Response(JSON.stringify({
        success: true,
        data: {
          ...product,
          reviews: reviews || []
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // GET /products/autocomplete
    if (path.startsWith('/autocomplete') && req.method === 'GET') {
      const q = url.searchParams.get('q') || '';

      if (q.length < 2) {
        return new Response(JSON.stringify({
          success: true,
          suggestions: []
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const { data, error } = await supabase
        .from('products')
        .select('id, name, category, selling_price, stock_quantity')
        .eq('is_active', true)
        .or(`name.ilike.%${q}%,part_number.ilike.%${q}%`)
        .limit(10);

      if (error) throw error;

      const suggestions = (data || []).map(p => ({
        type: 'product',
        name: p.name,
        category: p.category,
        in_stock: p.stock_quantity > 0,
        price: p.selling_price,
        product_id: p.id
      }));

      return new Response(JSON.stringify({
        success: true,
        suggestions
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Products API error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
