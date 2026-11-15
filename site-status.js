
import { supabase, isConfigured } from "./admin/supabase.js";

async function applySiteStatus() {
  if (!isConfigured || !supabase) return;

  try {
    const { data, error } = await supabase
      .from("site_settings")
      .select("status, title, message")
      .eq("id", 1)
      .single();

    if (error) throw error;
    if (!data || data.status === "active") return;

    const container = document.createElement("div");

    container.id = "siteStatusNotice";

    const title = document.createElement("h2");
    title.textContent = data.title;

    const message = document.createElement("p");
    message.textContent = data.message;

    container.append(title, message);

    const style = document.createElement("style");
    style.textContent = `
      #siteStatusNotice {
        position: fixed;
        z-index: 999999;
        font-family: inherit;
        direction: rtl;
        text-align: center;
        color: #fff;
        background: #111;
        border: 1px solid rgba(255,49,85,.5);
        box-shadow: 0 0 35px rgba(255,49,85,.15);
        padding: 24px;
        box-sizing: border-box;
      }

      #siteStatusNotice h2 {
        color: #ff3155;
        margin: 0 0 12px;
        font-size: 22px;
      }

      #siteStatusNotice p {
        margin: 0;
        line-height: 2;
        white-space: pre-wrap;
      }

      #siteStatusNotice[data-mode="maintenance"] {
        inset: 0;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        padding: 30px;
      }

      #siteStatusNotice[data-mode="notice"] {
        top: 12px;
        right: 12px;
        left: 12px;
        border-radius: 14px;
      }
    `;

    container.dataset.mode = data.status;

    document.head.appendChild(style);
    document.body.appendChild(container);

  } catch (error) {
    console.error("Site status error:", error);
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", applySiteStatus);
} else {
  applySiteStatus();
}
