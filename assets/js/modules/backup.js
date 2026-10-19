import { storage, APP_KEYS, dayKey } from './storage.js';

const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5 MB is far more than this app ever stores

/** What shape each saved key must have, so a wrong/corrupt file can't break the app. */
const VALIDATORS = {
    july_tasks: v => Array.isArray(v) && v.every(isObject),
    july_projects: v => Array.isArray(v) && v.every(isObject),
    july_earnings: v => Array.isArray(v) && v.every(isObject),
    july_streak: v => isObject(v),
    daily_scratchpad: v => typeof v === 'string'
};

function isObject(v) {
    return v !== null && typeof v === 'object' && !Array.isArray(v);
}

/** Build the backup object from localStorage. */
export function buildBackup() {
    const data = {};
    APP_KEYS.forEach(key => {
        const value = storage.get(key, undefined);
        if (value !== undefined) data[key] = value;
    });
    return {
        app: 'july-tracker',
        version: 3,
        exportedAt: new Date().toISOString(),
        data
    };
}

/**
 * Check a parsed backup file. Returns { ok: true, data } or { ok: false, error }.
 * Unknown keys are ignored, known keys must have the right shape.
 */
export function validateBackup(parsed) {
    if (!isObject(parsed) || parsed.app !== 'july-tracker' || !isObject(parsed.data)) {
        return { ok: false, error: 'This is not a July Tracker backup file.' };
    }
    const data = {};
    for (const key of APP_KEYS) {
        if (!(key in parsed.data)) continue;
        if (!VALIDATORS[key](parsed.data[key])) {
            return { ok: false, error: `The backup is damaged: "${key}" has the wrong format.` };
        }
        data[key] = parsed.data[key];
    }
    if (Object.keys(data).length === 0) {
        return { ok: false, error: 'The backup file contains no data.' };
    }
    return { ok: true, data };
}

function downloadJson(obj, filename) {
    const blob = new Blob([JSON.stringify(obj, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function initBackup() {
    const exportBtn = document.getElementById('export-data-btn');
    const importBtn = document.getElementById('import-data-btn');
    const fileInput = document.getElementById('import-file-input');
    const status = document.getElementById('backup-status');

    function say(message, isError = false) {
        if (!status) return;
        status.textContent = message;
        status.classList.toggle('backup-error', isError);
    }

    exportBtn?.addEventListener('click', () => {
        const backup = buildBackup();
        downloadJson(backup, `july-tracker-backup-${dayKey()}.json`);
        const n = Object.keys(backup.data).length;
        say(n ? `Backup downloaded (${n} data sections).` : 'Backup downloaded, but there is no data saved yet.');
    });

    importBtn?.addEventListener('click', () => fileInput?.click());

    fileInput?.addEventListener('change', async () => {
        const file = fileInput.files?.[0];
        fileInput.value = ''; // allow choosing the same file again later
        if (!file) return;

        if (file.size > MAX_FILE_BYTES) {
            say('That file is too large to be a July Tracker backup.', true);
            return;
        }

        let parsed;
        try {
            parsed = JSON.parse(await file.text());
        } catch {
            say('Could not read the file. Is it a valid .json backup?', true);
            return;
        }

        const result = validateBackup(parsed);
        if (!result.ok) {
            say(result.error, true);
            return;
        }

        const exported = parsed.exportedAt ? new Date(parsed.exportedAt) : null;
        const when = exported && !isNaN(exported) ? ` from ${exported.toLocaleString()}` : '';
        if (!confirm(`Replace ALL current data with the backup${when}? This cannot be undone.`)) {
            say('Import cancelled. Nothing was changed.');
            return;
        }

        APP_KEYS.forEach(key => storage.remove(key));
        Object.entries(result.data).forEach(([key, value]) => storage.set(key, value));

        // replaceState does not fire "hashchange", so the reload is not interrupted
        history.replaceState(null, '', '#dashboard');
        window.location.reload();
    });
}
