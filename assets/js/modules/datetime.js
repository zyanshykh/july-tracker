/**
 * Date and Live Real-Time Tick Sync Module
 */
export function initDateTime() {
    const dateEl = document.getElementById('header-date');
    const timeEl = document.getElementById('header-time');

    function updateClock() {
        const now = new Date();
        
        // Setup options to print readable system dates
        const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        dateEl.textContent = now.toLocaleDateString('en-US', dateOptions);
        
        timeEl.textContent = now.toLocaleTimeString('en-US', { hour12: true });
    }

    updateClock();
    setInterval(updateClock, 1000);
}