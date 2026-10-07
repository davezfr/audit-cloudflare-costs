const status = document.querySelector("#status");
let timer;
let token = "";
let inFlight = false;
let errors = 0;

function stopViewing() {
  clearInterval(timer);
  timer = undefined;
  token = "";
}

async function pollStatus() {
  if (inFlight || !token) return;
  inFlight = true;
  try {
    const response = await fetch("/api/status", {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
      signal: AbortSignal.timeout(2500),
    });
    if (!response.ok) throw new Error("Status unavailable");
    const result = await response.json();
    status.textContent = result.phase;
    errors = 0;
    if (["complete", "failed", "quota-held", "paused", "idle"].includes(result.phase)) stopViewing();
  } catch {
    errors += 1;
    status.textContent = "Status unavailable";
    if (errors >= 3) stopViewing();
  } finally {
    inFlight = false;
  }
}

document.querySelector("#watch").addEventListener("submit", (event) => {
  event.preventDefault();
  stopViewing();
  token = document.querySelector("#token").value;
  document.querySelector("#token").value = "";
  errors = 0;
  timer = setInterval(pollStatus, 3000);
  void pollStatus();
});
document.querySelector("#stop").addEventListener("click", stopViewing);
window.addEventListener("pagehide", stopViewing);
