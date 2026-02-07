document.addEventListener("DOMContentLoaded", () => {
  const scanBtn = document.getElementById("scanBtn");
  const resultBox = document.getElementById("result");
  const errorBox = document.getElementById("errorBox");
  const reasonsList = document.getElementById("reasons");
  const urlText = document.getElementById("urlText");
  const risk = document.getElementById("risk");
  const prob = document.getElementById("prob");
  const statusBadge = document.getElementById("statusBadge");
  const viewBtn = document.getElementById("viewDetails");

  if (!scanBtn) {
    console.error("Scan button not found");
    return;
  }

  scanBtn.addEventListener("click", async () => {
    scanBtn.textContent = "Scanning...";
    scanBtn.disabled = true;
    errorBox?.classList.add("hidden");

    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      const url = tabs[0]?.url;

      if (!url || !url.startsWith("http")) {
        showError("Cannot scan this page.");
        return reset();
      }

      // 🔐 Get JWT from Chrome storage
      chrome.storage.local.get(["token"], async (result) => {
        const token = result.token;

        if (!token) {
          showError("Not logged in. Open PhishAI web app first.");
          return reset();
        }

        try {
          const response = await fetch("http://127.0.0.1:8000/scan", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ url }),
          });

          if (!response.ok) {
            if (response.status === 401) {
              throw new Error("Session expired. Please login again.");
            }
            throw new Error("Backend error");
          }

          const data = await response.json();

          // Populate reasons
          if (reasonsList) {
            reasonsList.innerHTML = "";

            if (data.reasons && data.reasons.length > 0) {
              data.reasons.forEach(reason => {
                const li = document.createElement("li");
                li.textContent = reason;
                reasonsList.appendChild(li);
              });
            } else {
              const li = document.createElement("li");
              li.textContent = "No suspicious indicators found.";
              reasonsList.appendChild(li);
            }
          }

          // Save for web app
          chrome.storage.local.set({
            scanResult: {
              ...data,
              scannedUrl: url,
              source: "chrome-extension",
              time: new Date().toLocaleString(),
            },
          });

          // UI update
          resultBox.classList.remove("hidden");
          urlText.textContent = url;
          risk.textContent = data.risk_level;
          prob.textContent = (data.probability * 100).toFixed(2) + "%";

          statusBadge.textContent = data.risk_level;
          statusBadge.className = "badge " + data.risk_level.toLowerCase();

          if (viewBtn) {
            viewBtn.disabled = false;
            viewBtn.onclick = () => {
              chrome.tabs.create({ url: "http://localhost:5173" });
            };
          }

        } catch (err) {
          console.error(err);
          showError(err.message || "Backend not reachable.");
        } finally {
          reset();
        }
      });
    });
  });

  function showError(msg) {
    if (!errorBox) return;
    errorBox.textContent = "❌ " + msg;
    errorBox.classList.remove("hidden");
  }

  function reset() {
    scanBtn.textContent = "Scan Current Site";
    scanBtn.disabled = false;
  }
});
