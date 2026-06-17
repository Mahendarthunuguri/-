const config = window.ZENWIRE_CONFIG || {};
const whatsappNumber = config.whatsappNumber || "919999999999";
const whatsappText = encodeURIComponent("Hi, I want a custom WhatsApp AI assistant demo for my business.");
const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappText}`;

const progress = document.getElementById("progress");
const header = document.getElementById("siteHeader");
const menuButton = document.getElementById("menuButton");
const mobileNav = document.getElementById("mobileNav");
const toast = document.getElementById("toast");

document.getElementById("whatsappDemoTop").href = whatsappUrl;
document.getElementById("whatsappFinal").href = whatsappUrl;

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove("show"), 4200);
}

function updateScrollState() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const ratio = max > 0 ? window.scrollY / max : 0;
  progress.style.width = `${ratio * 100}%`;
  header.classList.toggle("scrolled", window.scrollY > 24);
}

window.addEventListener("scroll", updateScrollState, { passive: true });
updateScrollState();

menuButton.addEventListener("click", () => {
  const open = !mobileNav.classList.contains("open");
  mobileNav.classList.toggle("open", open);
  menuButton.setAttribute("aria-expanded", String(open));
});

mobileNav.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    mobileNav.classList.remove("open");
    menuButton.setAttribute("aria-expanded", "false");
  });
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.14 }
);

document.querySelectorAll(".reveal").forEach((element) => revealObserver.observe(element));

const chatWindow = document.getElementById("chatWindow");
const chatMessages = [
  ["in", "Hi, gym timings and membership price?"],
  ["out", "Hi! HSR Fit Studio is open 5 AM to 10 PM.\n\nMonthly membership starts at Rs. 1,500. Personal training starts at Rs. 3,000/month."],
  ["in", "Can I come for a trial today?"],
  ["out", "Yes. Trial slots are available today after 6 PM.\n\nPlease share your name and preferred time. Our team will confirm on WhatsApp."],
];

function renderChatLoop() {
  chatWindow.innerHTML = "";
  chatMessages.forEach(([type, text], index) => {
    window.setTimeout(() => {
      const message = document.createElement("div");
      message.className = `message ${type}`;
      message.textContent = text;
      chatWindow.appendChild(message);
      chatWindow.scrollTop = chatWindow.scrollHeight;
    }, index * 1150);
  });
}

renderChatLoop();
window.setInterval(renderChatLoop, 7600);

document.querySelectorAll(".faq-item").forEach((item) => {
  item.addEventListener("click", () => {
    const expanded = item.getAttribute("aria-expanded") === "true";
    document.querySelectorAll(".faq-item").forEach((other) => other.setAttribute("aria-expanded", "false"));
    item.setAttribute("aria-expanded", String(!expanded));
  });
});

async function createOrder(plan) {
  const response = await fetch("/api/create-order", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ plan }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || data.error || "Unable to create Razorpay order");
  }
  return data;
}

async function startCheckout(plan) {
  if (!window.Razorpay || !config.razorpayKeyId) {
    showToast("Razorpay is not configured yet. Opening WhatsApp inquiry instead.");
    window.open(`${whatsappUrl}%20Plan:%20${encodeURIComponent(plan)}`, "_blank", "noreferrer");
    return;
  }

  try {
    const order = await createOrder(plan);
    const checkout = new window.Razorpay({
      key: config.razorpayKeyId,
      amount: order.amount,
      currency: order.currency,
      name: "Zenwire AI",
      description: `${order.planName} monthly plan`,
      order_id: order.id,
      theme: { color: "#20d46b" },
      handler(payment) {
        showToast(`Payment received. ID: ${payment.razorpay_payment_id}`);
      },
      modal: {
        ondismiss() {
          showToast("Checkout closed. You can restart anytime.");
        },
      },
    });
    checkout.open();
  } catch (error) {
    showToast(error.message);
    window.open(`${whatsappUrl}%20Plan:%20${encodeURIComponent(plan)}`, "_blank", "noreferrer");
  }
}

document.querySelectorAll(".pay-button").forEach((button) => {
  button.addEventListener("click", () => startCheckout(button.dataset.plan));
});

const speakButton = document.getElementById("speakWelcome");
const welcomeScript = "Welcome to Zenwire AI. We make your business grow on WhatsApp with instant replies, smarter lead capture, and a premium customer experience.";

if (speakButton) {
  speakButton.addEventListener("click", () => {
    if (!("speechSynthesis" in window)) {
      showToast("Voice is not supported in this browser, but the welcome demo is visible on screen.");
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(welcomeScript);
    utterance.rate = 0.92;
    utterance.pitch = 1;
    utterance.volume = 1;
    speakButton.textContent = "Speaking...";
    utterance.onend = () => {
      speakButton.textContent = "Play welcome voice";
    };
    utterance.onerror = () => {
      speakButton.textContent = "Play welcome voice";
      showToast("Voice playback was blocked. Tap again or check browser audio settings.");
    };
    window.speechSynthesis.speak(utterance);
  });
}

const contactForm = document.getElementById("contactForm");

if (contactForm) {
  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const form = new FormData(contactForm);
    const message = [
      "Hi Zenwire AI, I want a free demo.",
      `Name: ${form.get("name")}`,
      `Business: ${form.get("business")}`,
      `WhatsApp: ${form.get("phone")}`,
      `Type: ${form.get("type")}`,
      `Details: ${form.get("message") || "Please contact me."}`,
    ].join("\n");

    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`, "_blank", "noreferrer");
    showToast("Opening WhatsApp with your demo request.");
    contactForm.reset();
  });
}
