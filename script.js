const API_KEY = "pk_0b8abc6f834b444f949f727e88a728e0";
const STATION_ID = "cutters-choice-radio";
const BASE_URL = "https://api.radiocult.fm/api";
const FALLBACK_ART = "https://i.imgur.com/qWOfxOS.png";
const MIXCLOUD_PASSWORD = "cutters44";

// 1. Proper Google Calendar link generator
function createGoogleCalLink(title, startUtc, endUtc) {
  if (!startUtc || !endUtc) return "#";
  const fmt = dt => new Date(dt)
    .toISOString()
    .replace(/[-:]|\.\d{3}/g, "");
  const startStr = fmt(startUtc);
  const endStr   = fmt(endUtc);
  const url = new URL("https://calendar.google.com/calendar/render");
  url.searchParams.set("action", "TEMPLATE");
  url.searchParams.set("text", title);
  url.searchParams.set("dates", `${startStr}/${endStr}`);
  url.searchParams.set("details", "Cutters Choice Radio");
  url.searchParams.set("location", "https://cutterschoiceradio.com");
  return url.toString();
}

// 2. Fetch helper
async function rcFetch(path) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "x-api-key": API_KEY }
  });
  if (!res.ok) throw new Error(`rcFetch ${res.status}`);
  return await res.json();
}

// 3. Live‐now and schedule
async function fetchLiveNow() {
  // … your existing logic for live show …
}
async function fetchWeeklySchedule() {
  // … your existing logic for schedule …
}

// 4. Shuffle archive iframes once per day
function shuffleIframesDaily() {
  const container = document.getElementById("mixcloud-list");
  if (!container) return;
  const iframes = Array.from(container.querySelectorAll("iframe"));
  const lastShuffle = localStorage.getItem("lastShuffleDate");
  const today = new Date().toISOString().split("T")[0];
  if (lastShuffle === today) return;
  for (let i = iframes.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [iframes[i], iframes[j]] = [iframes[j], iframes[i]];
  }
  container.innerHTML = "";
  iframes.forEach(f => container.appendChild(f));
  localStorage.setItem("lastShuffleDate", today);
}

// 5. Pop‐out player
window.addEventListener("DOMContentLoaded", () => {
  // initial calls
  fetchLiveNow();
  fetchWeeklySchedule();
  shuffleIframesDaily();

  // live now polling
  setInterval(fetchLiveNow, 30000);
  setInterval(fetchWeeklySchedule, 60000);

  // wire up the pop-out player button
  const popOutBtn = document.getElementById("popOutBtn");
  if (popOutBtn) {
    popOutBtn.addEventListener("click", () => {
      const src = document.getElementById("inlinePlayer").src;
      const pop = window.open(
        "",
        "CCRPlayer",
        "width=400,height=200,resizable=yes"
      );
      pop.document.write(\`
        <!DOCTYPE html>
        <html lang="en">
          <head><title>CCR Player</title></head>
          <body style="margin:0">
            <iframe src="\${src}" allow="autoplay" style="width:100%;height:100%;border:none"></iframe>
          </body>
        </html>
      \`);
      pop.document.close();
    });
  }
});

// 6. Pop-out chat
function openChatPopup() {
  const chatUrl = "https://app.radiocult.fm/embed/chat/cutters-choice-radio?theme=midnight&primaryColor=%235A8785&corners=sharp";
  window.open(
    chatUrl,
    "CuttersChoiceChat",
    "width=400,height=700,resizable=yes,scrollbars=yes"
  );
}

// 7. Add Mixcloud show
function addMixcloud() {
  const url = document.getElementById("mixcloud-url").value.trim();
  if (!url) return alert("Please paste a valid Mixcloud URL.");
  const widget = document.createElement("iframe");
  widget.src = \`https://www.mixcloud.com/widget/iframe/?hide_cover=1&light=1&feed=\${encodeURIComponent(url)}\`;
  widget.style.width = "100%";
  widget.style.height = "120px";
  document.getElementById("mixcloud-list").appendChild(widget);
  document.getElementById("mixcloud-url").value = "";
  widget.onload = () => widget.scrollIntoView({ behavior: "smooth" });
}
