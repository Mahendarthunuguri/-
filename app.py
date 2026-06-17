import os
from decimal import Decimal

from flask import Flask, jsonify, render_template, request

try:
    import razorpay
except ImportError:  # Keeps the landing page usable before dependencies are installed.
    razorpay = None


app = Flask(__name__)

PLANS = {
    "starter": {"name": "Starter", "amount": Decimal("999.00")},
    "professional": {"name": "Professional", "amount": Decimal("1500.00")},
    "growth": {"name": "Growth", "amount": Decimal("3500.00")},
}


def paise(amount: Decimal) -> int:
    return int(amount * 100)


def razorpay_client():
    key_id = os.getenv("RAZORPAY_KEY_ID")
    key_secret = os.getenv("RAZORPAY_KEY_SECRET")

    if not razorpay or not key_id or not key_secret:
        return None

    return razorpay.Client(auth=(key_id, key_secret))


@app.route("/")
def home():
    return render_template(
        "index.html",
        razorpay_key_id=os.getenv("RAZORPAY_KEY_ID", ""),
        whatsapp_number=os.getenv("WHATSAPP_NUMBER", "919999999999"),
    )


@app.route("/privacy-policy")
def privacy_policy():
    return render_template("policy.html", page="Privacy Policy")


@app.route("/terms")
def terms():
    return render_template("policy.html", page="Terms of Service")


@app.route("/refund-policy")
def refund_policy():
    return render_template("policy.html", page="Refund Policy")


@app.route("/data-processing")
def data_processing():
    return render_template("policy.html", page="Data Processing Addendum")


@app.post("/api/create-order")
def create_order():
    data = request.get_json(silent=True) or {}
    plan_id = data.get("plan")

    if plan_id not in PLANS:
        return jsonify({"error": "Unknown plan"}), 400

    plan = PLANS[plan_id]
    client = razorpay_client()

    if not client:
        return jsonify(
            {
                "error": "Razorpay is not configured",
                "message": "Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to enable checkout.",
            }
        ), 503

    order = client.order.create(
        {
            "amount": paise(plan["amount"]),
            "currency": "INR",
            "payment_capture": 1,
            "notes": {"plan": plan_id, "plan_name": plan["name"]},
        }
    )

    return jsonify(
        {
            "id": order["id"],
            "amount": order["amount"],
            "currency": order["currency"],
            "plan": plan_id,
            "planName": plan["name"],
        }
    )


if __name__ == "__main__":
    app.run(debug=True)
