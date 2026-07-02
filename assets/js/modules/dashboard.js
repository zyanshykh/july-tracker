// ==============================
// Dashboard Progress
// ==============================

function updateDashboard() {

    const completedTasks =
        document.querySelectorAll(".task:checked").length;

    const totalTasks =
        document.querySelectorAll(".task").length;

    const percent =
        Math.round((completedTasks / totalTasks) * 100);

    // Progress %

    document.getElementById("progress-percent").textContent =
        percent + "%";

    // Progress Bar

    document.getElementById("progress-fill").style.width =
        percent + "%";

    // Projects Card

    document.getElementById("projects-count").textContent =
        completedTasks + " / 30";

    // Hero

    document.getElementById("progress-projects").textContent =
        "Projects : " + completedTasks + " / 30";

    // Goal

    document.getElementById("goal-progress").textContent =
        percent + "%";

}