// app/api/checkout/route.ts
import Stripe from 'stripe';

export const runtime = 'nodejs'; // Stripe ne fonctionne pas en edge

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export async function POST(req: Request) {
  try {
    const { priceId, mode = 'subscription' } = await req.json();
    if (!priceId) {
      return new Response(JSON.stringify({ error: 'priceId manquant' }), { status: 400 });
    }

    const origin = req.headers.get('origin') ?? 'http://localhost:3000';

    const session = await stripe.checkout.sessions.create({
      mode: mode as 'payment' | 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/pricing`,
      automatic_tax: { enabled: true },
    });

    return Response.json({ url: session.url });
  } catch (err: any) {
    console.error('Checkout error:', err);
    return new Response(JSON.stringify({ error: err.message ?? 'Erreur inconnue' }), { status: 500 });
  }
}
