/* =============================================
   PAME Widget Tester — Application Logic
   ============================================= */

(function () {
    'use strict';

    // --- DOM References ---
    const statusBadge = document.getElementById('statusBadge');
    const scriptStatus = document.getElementById('scriptStatus');
    const openBtn = document.getElementById('openWidgetBtn');
    const reloadBtn = document.getElementById('reloadWidgetBtn');
    const destroyBtn = document.getElementById('destroyWidgetBtn');
    const logContainer = document.getElementById('logContainer');
    const clearLogBtn = document.getElementById('clearLogBtn');

    // --- State ---
    let widgetLoaded = false;
    let widgetInstance = null;
    let checkInterval = null;

    // --- Logger ---
    function log(type, message) {
        const now = new Date();
        const time = now.toLocaleTimeString('en-US', { hour12: false });
        const entry = document.createElement('div');
        entry.className = `log-entry log-${type}`;
        entry.innerHTML = `<span class="log-time">${time}</span><span class="log-msg">${message}</span>`;
        logContainer.appendChild(entry);
        logContainer.scrollTop = logContainer.scrollHeight;
    }

    function clearLog() {
        logContainer.innerHTML = '';
        log('info', 'Log cleared.');
    }

    // --- Widget Detection ---
    function detectWidget() {
        // Check if the widget script tag exists in the DOM
        const scriptTag = document.querySelector(
            'script[src="https://pame.cc/api/clone/widget.js"]'
        );
        if (scriptTag) {
            scriptStatus.textContent = '✅ Script tag found in DOM';
            statusBadge.textContent = 'Detected';
            statusBadge.style.background = 'var(--accent-green)';
            log('success', 'Widget script tag detected in DOM.');
            return true;
        } else {
            scriptStatus.textContent = '❌ Script tag NOT found';
            statusBadge.textContent = 'Missing';
            statusBadge.style.background = 'var(--accent-red)';
            log('error', 'Widget script tag NOT found in DOM.');
            return false;
        }
    }

    // --- Check for Widget Initialization ---
    function checkWidgetReady() {
        // The widget may expose itself on window or create a DOM element
        // Common patterns: window.PameWidget, window.__PAME__, or a specific div
        const possibleWidgets = [
            window.PameWidget,
            window.__PAME__,
            window.pameWidget,
            document.querySelector('[data-pame-widget]'),
            document.querySelector('.pame-widget'),
            document.querySelector('#pame-widget'),
        ];

        for (const candidate of possibleWidgets) {
            if (candidate) {
                widgetInstance = candidate;
                widgetLoaded = true;
                return true;
            }
        }

        // Also check if the widget created a chat bubble element
        const chatBubble = document.querySelector(
            '[data-pame-chat], .pame-chat-bubble, [class*="pame"]'
        );
        if (chatBubble) {
            widgetInstance = chatBubble;
            widgetLoaded = true;
            return true;
        }

        return false;
    }

    // --- Enable Controls ---
    function enableControls() {
        openBtn.disabled = false;
        reloadBtn.disabled = false;
        destroyBtn.disabled = false;
        statusBadge.textContent = 'Ready';
        statusBadge.style.background = 'var(--accent-green)';
        log('success', 'Widget is ready. Controls enabled.');
    }

    function disableControls() {
        openBtn.disabled = true;
        reloadBtn.disabled = true;
        destroyBtn.disabled = true;
    }

    // --- Wait for Widget ---
    function waitForWidget() {
        log('info', 'Waiting for widget to initialize...');
        let attempts = 0;
        const maxAttempts = 30; // ~15 seconds

        checkInterval = setInterval(() => {
            attempts++;
            if (checkWidgetReady()) {
                clearInterval(checkInterval);
                enableControls();
                log('success', `Widget initialized after ~${attempts * 0.5}s`);
            } else if (attempts >= maxAttempts) {
                clearInterval(checkInterval);
                statusBadge.textContent = 'Timeout';
                statusBadge.style.background = 'var(--accent-orange)';
                log('warn', 'Widget did not initialize within timeout. Try reloading the page.');
                // Keep detect status
                detectWidget();
            }
        }, 500);
    }

    // --- Actions ---
    function openWidget() {
        log('info', 'Attempting to open widget...');

        if (widgetInstance && typeof widgetInstance.open === 'function') {
            widgetInstance.open();
            log('success', 'Widget opened via API.');
        } else if (widgetInstance && widgetInstance.click) {
            widgetInstance.click();
            log('success', 'Widget element clicked.');
        } else {
            // Try to find and click the chat bubble
            const bubble = document.querySelector(
                '[data-pame-chat], .pame-chat-bubble, [class*="pame"] button, [class*="pame"] a'
            );
            if (bubble) {
                bubble.click();
                log('success', 'Chat bubble clicked.');
            } else {
                log('warn', 'Could not find widget element to click. It may not be interactive yet.');
            }
        }
    }

    function reloadWidget() {
        log('info', 'Reloading widget...');
        disableControls();
        widgetLoaded = false;
        widgetInstance = null;

        // Remove existing widget elements (if any)
        const widgetElements = document.querySelectorAll(
            '[data-pame-widget], .pame-widget, [class*="pame"]'
        );
        widgetElements.forEach(el => el.remove());

        // Re-add the script tag
        const oldScript = document.querySelector(
            'script[src="https://pame.cc/api/clone/widget.js"]'
        );
        if (oldScript) {
            oldScript.remove();
        }

        const newScript = document.createElement('script');
        newScript.src = 'https://pame.cc/api/clone/widget.js';
        newScript.setAttribute('data-slug', 'wilson-ecaat');
        newScript.setAttribute('data-position', 'bottom-right');
        newScript.setAttribute('data-label', '💬 Chat with me');
        newScript.setAttribute('data-delay', '0');
        newScript.setAttribute('data-theme', 'dark');
        newScript.defer = true;
        document.body.appendChild(newScript);

        log('info', 'Widget script re-injected. Waiting for initialization...');
        waitForWidget();
    }

    function destroyWidget() {
        log('info', 'Destroying widget...');

        if (widgetInstance && typeof widgetInstance.destroy === 'function') {
            widgetInstance.destroy();
            log('success', 'Widget destroyed via API.');
        } else {
            // Remove all elements that look like they belong to the widget
            const widgetElements = document.querySelectorAll(
                '[data-pame-widget], .pame-widget, [class*="pame"], [id*="pame"]'
            );
            widgetElements.forEach(el => {
                el.remove();
                log('info', `Removed element: ${el.tagName}${el.className ? '.' + el.className : ''}`);
            });

            // Also remove the script tag
            const scriptTag = document.querySelector(
                'script[src="https://pame.cc/api/clone/widget.js"]'
            );
            if (scriptTag) {
                scriptTag.remove();
                log('info', 'Removed widget script tag.');
            }
        }

        widgetLoaded = false;
        widgetInstance = null;
        disableControls();
        statusBadge.textContent = 'Destroyed';
        statusBadge.style.background = 'var(--accent-red)';
        scriptStatus.textContent = '❌ Widget destroyed';
        log('warn', 'Widget has been destroyed. Reload page to restore.');
    }

    // --- Initialize ---
    function init() {
        log('info', 'App initialized. Checking for widget...');

        // Detect the script tag
        detectWidget();

        // Start waiting for widget initialization
        waitForWidget();

        // --- Event Listeners ---
        openBtn.addEventListener('click', openWidget);
        reloadBtn.addEventListener('click', reloadWidget);
        destroyBtn.addEventListener('click', destroyWidget);
        clearLogBtn.addEventListener('click', clearLog);

        // Keyboard shortcut: 'L' to clear log
        document.addEventListener('keydown', (e) => {
            if (e.key === 'l' || e.key === 'L') {
                if (!e.target.closest('input, textarea, button')) {
                    clearLog();
                }
            }
        });

        log('info', 'App ready. Press L to clear log.');
    }

    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();