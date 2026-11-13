
import { supabase, isConfigured } from "./supabase.js";

const loginSection = document.getElementById("loginSection");
const dashboardSection = document.getElementById("dashboardSection");
const loginForm = document.getElementById("loginForm");
const loginMessage = document.getElementById("loginMessage");
const loginButton = document.getElementById("loginButton");
const logoutButton = document.getElementById("logoutButton");
const togglePassword = document.getElementById("togglePassword");
const passwordInput = document.getElementById("password");
const databaseStatus = document.getElementById("databaseStatus");

// نمایش صفحات
function showDashboard() {
  loginSection.classList.add("hidden");
  dashboardSection.classList.remove("hidden");
}

function showLogin() {
  dashboardSection.classList.add("hidden");
  loginSection.classList.remove("hidden");
}

// پیام ورود
function showMessage(message, success = false) {
  loginMessage.textContent = message;
  loginMessage.style.color = success ? "#35d78b" : "#ff6872";
}

// نمایش و مخفی کردن رمز
togglePassword.addEventListener("click", () => {
  const isPassword = passwordInput.type === "password";
  passwordInput.type = isPassword ? "text" : "password";
});

// بررسی دسترسی مدیر
async function verifyAdmin(user) {
  if (!user) {
    showLogin();
    return false;
  }

  try {
    const { data, error } = await supabase
      .from("admin_users")
      .select("user_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      console.error("Admin verification error:", error);
      await supabase.auth.signOut();
      showLogin();
      showMessage("خطا در بررسی دسترسی مدیر. تنظیمات دیتابیس را بررسی کن.");
      return false;
    }

    if (!data) {
      await supabase.auth.signOut();
      showLogin();
      showMessage("شما اجازه دسترسی به پنل مدیریت را ندارید.");
      return false;
    }

    showDashboard();
    return true;

  } catch (error) {
    console.error(error);
    showLogin();
    showMessage("خطا در ارتباط با سرور.");
    return false;
  }
}

// بررسی تنظیمات Supabase
if (!isConfigured || !supabase) {

  databaseStatus.textContent = "تنظیم نشده";
  showLogin();
  showMessage("اطلاعات Supabase را در فایل supabase.js بررسی کن.");

} else {

  databaseStatus.textContent = "متصل";

  // ورود
  loginForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = passwordInput.value;

    loginButton.disabled = true;
    loginButton.querySelector("span").textContent = "در حال ورود...";

    showMessage("");

    try {

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      const isAdmin = await verifyAdmin(data.user);

      if (isAdmin) {
        showMessage("ورود مدیر با موفقیت انجام شد.", true);
      }

    } catch (error) {

      console.error("Login error:", error.message);

      showLogin();
      showMessage("ورود ناموفق بود. ایمیل و رمز عبور را بررسی کن.");

    } finally {

      loginButton.disabled = false;
      loginButton.querySelector("span").textContent = "ورود به پنل";

    }

  });

  // خروج
  logoutButton.addEventListener("click", async () => {

    logoutButton.disabled = true;

    try {

      const { error } = await supabase.auth.signOut();

      if (error) throw error;

      showLogin();
      passwordInput.value = "";
      showMessage("با موفقیت خارج شدی.", true);

    } catch (error) {

      console.error("Logout error:", error);
      alert("خروج انجام نشد. دوباره تلاش کن.");

    } finally {

      logoutButton.disabled = false;

    }

  });

  // بررسی نشست قبلی
  async function checkSession() {

    showLogin();

    const { data, error } = await supabase.auth.getSession();

    if (error) {
      console.error("Session error:", error);
      showLogin();
      return;
    }

    if (data.session) {
      await verifyAdmin(data.session.user);
    } else {
      showLogin();
    }

  }

  checkSession();

}
