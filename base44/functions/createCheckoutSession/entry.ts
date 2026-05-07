import Stripe from 'npm:stripe@17.5.0';
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

const PLANS = {
  basico:  { price_id: 'price_1TUFKYPlIpNLhDPT62dq5evn', name: 'Básico'  },
  premium: { price_id: 'price_1TUFKYPlIpNLhDPTEfZKaazN', name: 'Premium' },
  family:  { price_id: 'price_1TUFKYPlIpNLhDPT1H0MMgjO', name: 'Family'  },
};

Deno.serve(async (req) => {
  try {
    const { plan, success_url, cancel_url } = await req.json();
    if (!plan || !PLANS[plan]) {
      return Response.json({ error: 'Plano inválido' }, { status: 400 });
    }

    const base44 = createClientFromRequest(req);
    let user = null;
    try { user = await base44.auth.me(); } catch { /* no-op */ }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: PLANS[plan].price_id, quantity: 1 }],
      success_url: success_url || `${req.headers.get('origin') || ''}/configuracoes?status=success`,
      cancel_url:  cancel_url  || `${req.headers.get('origin') || ''}/planos?status=cancel`,
      customer_email: user?.email || undefined,
      metadata: {
        base44_app_id: Deno.env.get('BASE44_APP_ID'),
        plan,
        user_email: user?.email || 'guest',
      },
    });

    return Response.json({ url: session.url });
  } catch (err) {
    console.error('createCheckoutSession error:', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
});