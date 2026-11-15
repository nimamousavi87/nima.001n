
import { supabase, isConfigured } from "./supabase.js";

const form = document.getElementById("statusForm");
const statusInput = document.getElementById("status");
const titleInput = document.getElementById("title");
const messageInput = document.getElementById("message");
const saveButton = document.getElementById("saveButton");
const result = document.getElementById("result");
const currentStatus = document.getElementById("currentStatus");

const statusNames = {
  active: "فعال",
  maintenance: "در حال تعمیر و به‌روزرسانی",
  notice: "نمایش اطلاعیه"
};

function showResult(message, success = false) {
  result.textContent = message;
  result.style.color = success ? "#35d78b" : "#ff6872";
}

async function verifyAdmin() {
  if (!isConfigured || !supabase) {
    throw new Error("اتصال Supabase تنظیم نشده است.");
  }

  const { data, error } = await supabase.auth.getSession();

  if (error || !data.session) {
    throw new Error("ابتدا وارد حساب مدیر شو.");
  }

  const { data: admin, error: adminError } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", data.session.user.id)
    .maybeSingle();

  if (adminError || !admin) {
    throw new Error("شما دسترسی مدیریت ندارید.");
  }
}

async function loadSettings() {
  try {
    await verifyAdmin();

    const { data, error } = await supabase
      .from("site_settings")
      .select("*")
      .eq("id", 1)
      .single();

    if (error) throw error;

    statusInput.value = data.status;
    titleInput.value = data.title;
    messageInput.value = data.message;
    currentStatus.textContent = statusNames[data.status] || "نامشخص";

    showResult("تنظیمات با موفقیت دریافت شد.", true);

  } catch (error) {
    console.error(error);
    showResult(error.message);
  }
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  saveButton.disabled = true;
  saveButton.textContent = "در حال ذخیره...";

  try {
    await verifyAdmin();

    const settings = {
      id: 1,
      status: statusInput.value,
      title: titleInput.value.trim(),
      message: messageInput.value.trim(),
      updated_at: new Date().toISOString()
    };

    if (!settings.title || !settings.message) {
      throw new Error("عنوان و متن پیام را وارد کن.");
    }

    const { error } = await supabase
      .from("site_settings")
      .upsert(settings, { onConflict: "id" });

    if (error) throw error;

    currentStatus.textContent = statusNames[settings.status];
    showResult("تنظیمات با موفقیت ذخیره شد.", true);

  } catch (error) {
    console.error(error);
    showResult(error.message || "ذخیره تنظیمات انجام نشد.");
  } finally {
    saveButton.disabled = false;
    saveButton.textContent = "ذخیره تنظیمات";
  }
});

loadSettings();
  
