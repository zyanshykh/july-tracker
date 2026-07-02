// ==============================
// Live Date & Time
// ==============================

function updateDateTime() {

    const now = new Date();

    const dateOptions = {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric"
    };

    const timeOptions = {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
    };

    document.getElementById("current-date").textContent =
        now.toLocaleDateString("en-US", dateOptions);

    document.getElementById("current-time").textContent =
        now.toLocaleTimeString("en-US", timeOptions);

}

updateDateTime();

setInterval(updateDateTime, 1000);