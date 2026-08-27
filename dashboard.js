const API = "/api";
let currentUser = null;
let selectedTrain = null;
let selectedClass = null;
let passengerCount = 0;

const CLASS_LABELS = { SLEEPER: "Sleeper", AC3: "AC 3 Tier", AC2: "AC 2 Tier", AC1: "AC First" };
const CLASS_KEYS = [
  ["SLEEPER", "sleeper_price", "sleeper_seats"],
  ["AC3", "ac3_price", "ac3_seats"],
  ["AC2", "ac2_price", "ac2_seats"],
  ["AC1", "ac1_price", "ac1_seats"],
];

// ---------- Auth gate ----------
async function init() {
  try {
    const res = await fetch(`${API}/auth/me`, { credentials: "include" });
    if (!res.ok) throw new Error();
    const { user } = await res.json();
    currentUser = user;
    document.getElementById("greeting").textContent = `Welcome back, ${user.full_name.split(" ")[0]}`;
    document.getElementById("navAuthArea").innerHTML = `<button class="btn btn-primary" id="logoutBtn">Log out</button>`;
    document.getElementById("logoutBtn").addEventListener("click", async () => {
      await fetch(`${API}/auth/logout`, { method: "POST", credentials: "include" });
      window.location.href = "index.html";
    });
  } catch (_) {
    window.location.href = "index.html";
  }
}
init();

// ---------- Tabs ----------
document.querySelectorAll(".dash-tabs button").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".dash-tabs button").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    const panel = btn.dataset.panel;
    document.getElementById("searchPanel").style.display = panel === "search" ? "block" : "none";
    document.getElementById("bookingsPanel").style.display = panel === "bookings" ? "block" : "none";
    if (panel === "bookings") loadMyBookings();
  });
});

// ---------- Search ----------
const params = new URLSearchParams(window.location.search);
if (params.get("source")) document.getElementById("dSource").value = params.get("source");
if (params.get("destination")) document.getElementById("dDestination").value = params.get("destination");
if (params.get("date")) document.getElementById("dDate").value = params.get("date");
document.getElementById("dDate").min = new Date().toISOString().split("T")[0];
if (!document.getElementById("dDate").value) {
  document.getElementById("dDate").value = new Date().toISOString().split("T")[0];
}

document.getElementById("dashSearchForm").addEventListener("submit", (e) => {
  e.preventDefault();
  runSearch();
});

async function runSearch() {
  const source = document.getElementById("dSource").value.trim();
  const destination = document.getElementById("dDestination").value.trim();
  const date = document.getElementById("dDate").value;
  const qs = new URLSearchParams();
  if (source) qs.set("source", source);
  if (destination) qs.set("destination", destination);

  const res = await fetch(`${API}/trains?${qs.toString()}`);
  const { trains } = await res.json();
  renderTrains(trains, date);
}

function renderTrains(trains, date) {
  const container = document.getElementById("trainResults");
  if (!trains.length) {
    container.innerHTML = `<div class="empty-state">No trains found for that route. Try different cities.</div>`;
    return;
  }
  container.innerHTML = trains
    .map((t) => {
      const classOptions = CLASS_KEYS.map(([key, priceCol, seatCol]) => {
        const price = t[priceCol];
        const seats = t[seatCol];
        if (!price || price <= 0) return "";
        return `<div class="class-opt ${seats <= 0 ? "disabled" : ""}" data-train="${t.id}" data-class="${key}" data-price="${price}">
          <div class="price">₹${price}</div>
          <div class="seats">${CLASS_LABELS[key]}</div>
          <div class="seats">${seats > 0 ? seats + " left" : "Sold out"}</div>
        </div>`;
      }).join("");

      return `
      <div class="train-card">
        <div class="train-meta">
          <h3>${t.name}</h3>
          <div class="num">#${t.train_number} · ${t.duration} · ${t.runs_on}</div>
        </div>
        <div class="train-times">
          <div class="t"><div class="time">${t.departure_time}</div><div class="city">${t.source}</div></div>
          <div class="arrow">→</div>
          <div class="t"><div class="time">${t.arrival_time}</div><div class="city">${t.destination}</div></div>
        </div>
        <div class="class-picker">${classOptions}</div>
      </div>`;
    })
    .join("");

  container.querySelectorAll(".class-opt").forEach((el) => {
    el.addEventListener("click", () => {
      const trainId = el.dataset.train;
      const train = trains.find((t) => String(t.id) === trainId);
      selectedTrain = { ...train, journey_date: date };
      selectedClass = el.dataset.class;
      openBookingModal();
    });
  });
}

// ---------- Booking modal ----------
const bookModal = document.getElementById("bookModal");
document.getElementById("closeBookModal").addEventListener("click", () => bookModal.classList.remove("open"));
bookModal.addEventListener("click", (e) => { if (e.target === bookModal) bookModal.classList.remove("open"); });

function openBookingModal() {
  passengerCount = 0;
  document.getElementById("passengerRows").innerHTML = "";
  document.getElementById("bookError").classList.remove("show");
  document.getElementById("bookModalTitle").textContent = `${selectedTrain.name} · ${CLASS_LABELS[selectedClass]}`;
  document.getElementById("bookModalSub").textContent =
    `${selectedTrain.source} → ${selectedTrain.destination} on ${selectedTrain.journey_date}`;
  addPassengerRow();
  updateTotal();
  bookModal.classList.add("open");
}

document.getElementById("addPassenger").addEventListener("click", () => {
  if (passengerCount >= 6) return;
  addPassengerRow();
  updateTotal();
});

function addPassengerRow() {
  passengerCount++;
  const row = document.createElement("div");
  row.className = "passenger-row";
  row.innerHTML = `
    <input type="text" placeholder="Full name" class="p-name" required />
    <input type="number" placeholder="Age" class="p-age" min="1" max="120" required />
    <select class="p-gender"><option value="M">M</option><option value="F">F</option><option value="O">Other</option></select>
    <button type="button" class="remove-p">✕</button>`;
  row.querySelector(".remove-p").addEventListener("click", () => {
    row.remove();
    passengerCount--;
    updateTotal();
  });
  document.getElementById("passengerRows").appendChild(row);
}

function updateTotal() {
  const price = Number(selectedTrain ? getPriceForClass(selectedTrain, selectedClass) : 0);
  const rows = document.querySelectorAll(".passenger-row").length;
  document.getElementById("bookTotal").textContent = `₹${price * rows}`;
}
document.getElementById("passengerRows").addEventListener("input", updateTotal);

function getPriceForClass(train, cls) {
  const map = { SLEEPER: "sleeper_price", AC3: "ac3_price", AC2: "ac2_price", AC1: "ac1_price" };
  return train[map[cls]];
}

document.getElementById("confirmBookBtn").addEventListener("click", async () => {
  const errBox = document.getElementById("bookError");
  errBox.classList.remove("show");

  const passengers = Array.from(document.querySelectorAll(".passenger-row")).map((row) => ({
    name: row.querySelector(".p-name").value.trim(),
    age: Number(row.querySelector(".p-age").value),
    gender: row.querySelector(".p-gender").value,
  }));

  if (passengers.some((p) => !p.name || !p.age)) {
    errBox.textContent = "Please fill in every passenger's name and age.";
    errBox.classList.add("show");
    return;
  }

  try {
    const res = await fetch(`${API}/bookings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        train_id: selectedTrain.id,
        journey_date: selectedTrain.journey_date,
        travel_class: selectedClass,
        passengers,
      }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Booking failed.");

    bookModal.classList.remove("open");
    document.querySelector('.dash-tabs button[data-panel="bookings"]').click();
  } catch (err) {
    errBox.textContent = err.message;
    errBox.classList.add("show");
  }
});

// ---------- My bookings ----------
async function loadMyBookings() {
  const res = await fetch(`${API}/bookings/mine`, { credentials: "include" });
  const { bookings } = await res.json();
  const container = document.getElementById("myBookings");

  if (!bookings.length) {
    container.innerHTML = `<div class="empty-state">No bookings yet. Search for a train to get started.</div>`;
    return;
  }

  container.innerHTML = bookings
    .map(
      (b) => `
    <div class="booking-card">
      <div class="booking-top">
        <div>
          <strong>${b.train_name}</strong> <span class="num" style="color:var(--steel);">#${b.train_number}</span>
        </div>
        <div style="display:flex; gap:10px; align-items:center;">
          <span class="pnr-tag">PNR ${b.pnr}</span>
          <span class="status-tag ${b.status}">${b.status}</span>
        </div>
      </div>
      <div style="color:var(--steel); font-size:.9rem;">
        ${b.source} → ${b.destination} · ${b.journey_date} · ${CLASS_LABELS[b.travel_class] || b.travel_class} · ₹${b.total_fare}
      </div>
      <div class="passenger-list">${b.passengers.map((p) => `${p.name} (${p.age}${p.gender})`).join(", ")}</div>
      ${
        b.status === "CONFIRMED"
          ? `<button class="btn btn-danger" style="margin-top:12px;" data-pnr="${b.pnr}">Cancel booking</button>`
          : ""
      }
    </div>`
    )
    .join("");

  container.querySelectorAll("[data-pnr]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      if (!confirm("Cancel this booking?")) return;
      await fetch(`${API}/bookings/${btn.dataset.pnr}/cancel`, { method: "POST", credentials: "include" });
      loadMyBookings();
    });
  });
}

// Auto search if query params were present
if (params.get("source") || params.get("destination")) {
  runSearch();
}
