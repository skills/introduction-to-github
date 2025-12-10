# Sovereign TV Payments

Production-ready Flask application for handling Stripe/PayPal subscriptions for the Sovereign TV platform.

## Features

- **Stripe Checkout Integration**: Secure payment processing for subscription services
- **PayPal Support**: Alternative payment method via PayPal IPN
- **Webhook Handling**: Processes `checkout.session.completed` and other Stripe events
- **Subscription Tiers**: Free, Founding Supporter, Genesis, and Divine tiers
- **ScrollCoin Rewards**: Automatic reward allocation based on subscription tier
- **NFT Discounts**: Tiered discounts for FlameDNA and OmniVerse NFTs

## Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Landing page with subscription options |
| `/subscribe` | GET | Stripe Checkout route for subscription services |
| `/subscribe/checkout` | POST | Create Stripe checkout session |
| `/success` | GET | Confirmation page after successful checkout |
| `/webhook` | POST | Handles Stripe webhook events (checkout.session.completed) |
| `/webhook/paypal` | POST | PayPal IPN webhook handler |
| `/api/health` | GET | Health check endpoint |
| `/api/tiers` | GET | Get all subscription tiers |
| `/api/tiers/<tier_id>` | GET | Get specific tier details |

## Deployment

### Render
```bash
# render.yaml is pre-configured
# Just connect your repository to Render
```

### Railway
```bash
# railway.json is pre-configured
# Deploy via Railway CLI or dashboard
```

### Local Development
```bash
# Copy environment file
cp .env.example .env

# Install dependencies
pip install -r requirements.txt

# Run the application
python app.py
```

### Docker
```bash
docker build -t sovereign-tv-payments .
docker run -p 5002:5002 sovereign-tv-payments
```

## Configuration

Set the following environment variables:

```env
# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Stripe Price IDs (create in Stripe Dashboard)
STRIPE_PRICE_FOUNDING=price_...
STRIPE_PRICE_GENESIS=price_...
STRIPE_PRICE_DIVINE=price_...

# PayPal (optional)
PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=...
PAYPAL_MODE=live
```

## Subscription Tiers

| Tier | Price | ScrollCoin/mo | NFT Discount |
|------|-------|---------------|--------------|
| Free | $0 | 0 | 0% |
| Founding Supporter | $9.99 | 100 | 10% |
| Genesis | $29.99 | 500 | 25% |
| Divine | $99.99 | 2000 | 50% |

## Author

Chais Hill - OmniTech1
