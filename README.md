# Zenwire AI

Premium landing page and Flask backend for a custom WhatsApp AI assistant business.

## Included

- Premium landing page for WhatsApp AI assistants
- Animated WhatsApp demo and click-to-play welcome voice
- Pricing with Razorpay order creation
- Payment method trust strip for UPI, cards, net banking, wallets, and invoices
- WhatsApp-powered demo/contact form
- Starter legal pages: privacy, terms, refund, and data processing

## Run locally

```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
copy .env.example .env
flask run
```

Open `http://127.0.0.1:5000`.

## Razorpay setup

Set these environment variables in `.env`:

```env
RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=xxxxx
WHATSAPP_NUMBER=91yourwhatsappnumber
```

The frontend calls `/api/create-order`, then opens Razorpay Checkout with the returned order id. If Razorpay is not configured, checkout buttons gracefully send the customer to WhatsApp instead.
