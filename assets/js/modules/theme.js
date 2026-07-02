// ==============================
// Theme Toggle
// ==============================

const themeButton = document.getElementById("theme-toggle");

// Load saved theme
const savedTheme = localStorage.getItem("theme");

if (savedTheme === "light") {

    document.body.classList.add("light");

    themeButton.textContent = "☀️";

}

// Toggle Theme

themeButton.addEventListener("click", () => {

    document.body.classList.toggle("light");

    const isLight = document.body.classList.contains("light");

    themeButton.textContent = isLight ? "☀️" : "🌙";

    localStorage.setItem("theme", isLight ? "light" : "dark");

}); 