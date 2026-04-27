/* =============================================
   PAME Widget Tester Pro — Application Logic
   ============================================= */

(function () {
    'use strict';

    // --- DOM References ---
    const statusBadge = document.getElementById('statusBadge');
    const scriptStatus = document.getElementById('scriptStatus');
    const apiStatus = document.getElementById('apiStatus');
    const inputStatus = document.getElementById('inputStatus');
    const openBtn = document.getElementById('openWidgetBtn');
    const reloadBtn = document.getElementById('reloadWidgetBtn');
    const destroyBtn = document.getElementById('destroyWidgetBtn');
    const testMessageInput = document.getElementById('testMessageInput');
    const sendTestBtn = document.getElementById('sendTestBtn');
    const logContainer = document.getElementById('logContainer');
    const clearLogBtn = document.getElementById('clearLogBtn');
    const exportLogBtn = document.getElementById('exportLogBtn');
    const scanDOMBtn = document.getElementById('scanDOMBtn');
    const injectMessageBtn = document.getElementById('injectMessageBtn');
    const inspectorResults = document.getElementById('inspectorResults');

    // --- State ---
    let widgetLoaded = false;
    let widgetInstance = null;
    let checkInterval = null;
    let domWatchInterval = null;
    let messageCount = 0;

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

    function exportLog() {
        const entries = logContainer.querySelectorAll('.log-entry');
        let text = 'PAME Widget Tester - Event Log\n';
        text += '='.repeat(50) + '\n\n';
        
        entries.forEach(entry => {
            const time = entry.querySelector('.log-time').textContent;
            const msg = entry.querySelector('.log-msg').textContent;
            text += `[${time}] ${msg}\n`;
        });

        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `pame-widget-log-${Date.now()}.txt`;
        a.click();
        URL.revokeObjectURL(url);
        log('success', 'Log exported as text file.');
    }

    // --- Toast Notification ---
    function showToast(message, type = 'info') {
        const existing = document.querySelector('.toast');
        if (existing) existing.remove();

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);

        requestAnimationFrame(() => {
            toast.classList.add('show');
        });

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // --- Widget Detection ---
    function detectWidget() {
        const scriptTag = document.querySelector(
            'script[src="https://pame.cc/api/clone/widget.js"]'
        );
        if (scriptTag) {
            scriptStatus.textContent = '✅ Script tag found in DOM';
            log('success', 'Widget script tag detected in DOM.');
            return true;
        } else {
            scriptStatus.textContent = '❌ Script tag NOT found';
            log('error', 'Widget script tag NOT found in DOM.');
            return false;
        }
    }

    // --- Check for Widget API ---
    function detectWidgetAPI() {
        // Check various possible API locations
        const apis = [
            { name: 'window.PameWidget', obj: window.PameWidget },
            { name: 'window.__PAME__', obj: window.__PAME__ },
            { name: 'window.pameWidget', obj: window.pameWidget },
            { name: 'window.PameChat', obj: window.PameChat },
            { name: 'window.__PAME_WIDGET__', obj: window.__PAME_WIDGET__ }
        ];

        for (const api of apis) {
            if (api.obj) {
                widgetInstance = api.obj;
                apiStatus.textContent = `✅ ${api.name}`;
                log('success', `Widget API found: ${api.name}`);
                return api.obj;
            }
        }

        // Check for iframe-based widget
        const iframe = document.querySelector('iframe[src*="pame"]');
        if (iframe) {
            apiStatus.textContent = '✅ iframe widget found';
            log('success', 'Widget iframe found in DOM');
            return iframe;
        }

        apiStatus.textContent = '❌ No API detected';
        return null;
    }

    // --- Check for Chat Input ---
    function detectChatInput() {
        // Look for input fields that might be the chat input
        const possibleInputs = document.querySelectorAll(
            'input[type="text"], input[type="search"], textarea, [contenteditable="true"]'
        );
        
        // Filter to likely chat inputs (inside widget containers)
        const chatInputs = Array.from(possibleInputs).filter(input => {
            const parent = input.closest('[class*="pame"], [class*="chat"], [class*="widget"], [id*="pame"], [id*="chat"]');
            return parent !== null;
        });

        if (chatInputs.length > 0) {
            inputStatus.textContent = `✅ ${chatInputs.length} input(s) found`;
            log('success', `Found ${chatInputs.length} potential chat input(s)`);
            return chatInputs;
        }

        // Also check for inputs inside any iframe
        const iframes = document.querySelectorAll('iframe');
        if (iframes.length > 0) {
            inputStatus.textContent = `⚠️ ${iframes.length} iframe(s) - inputs may be inside`;
            log('warn', 'Chat inputs may be inside iframe(s) - cannot directly access');
            return [];
        }

        inputStatus.textContent = '❌ No chat input found';
        return [];
    }

    // --- Check Widget Ready ---
    function checkWidgetReady() {
        // Check API
        const api = detectWidgetAPI();
        if (api) {
            widgetInstance = api;
            widgetLoaded = true;
            return true;
        }

        // Check for widget DOM elements
        const widgetElements = document.querySelectorAll(
            '[data-pame-widget], [class*="pame-"], [id*="pame-"], [class*="Pame"], [id*="Pame"]'
        );
        
        if (widgetElements.length > 0) {
            widgetInstance = widgetElements[0];
            widgetLoaded = true;
            apiStatus.textContent = `✅ DOM element found`;
            log('success', `Widget DOM element found: ${widgetElements[0].tagName}`);
            return true;
        }

        return false;
    }

    // --- Enable/Disable Controls ---
    function enableControls() {
        openBtn.disabled = false;
        reloadBtn.disabled = false;
        destroyBtn.disabled = false;
        testMessageInput.disabled = false;
        sendTestBtn.disabled = false;
        statusBadge.textContent = 'Ready';
        statusBadge.style.background = 'var(--accent-green)';
        log('success', 'Widget is ready. All controls enabled.');
        
        // Check for chat input availability
        setTimeout(() => {
            detectChatInput();
        }, 1000);
    }

    function disableControls() {
        openBtn.disabled = true;
        reloadBtn.disabled = true;
        destroyBtn.disabled = true;
        testMessageInput.disabled = true;
        sendTestBtn.disabled = true;
    }

    // --- Wait for Widget ---
    function waitForWidget() {
        log('info', 'Waiting for widget to initialize...');
        let attempts = 0;
        const maxAttempts = 60; // ~30 seconds

        checkInterval = setInterval(() => {
            attempts++;
            if (checkWidgetReady()) {
                clearInterval(checkInterval);
                enableControls();
                log('success', `Widget initialized after ~${attempts * 0.5}s`);
                
                // Start DOM watching for chat elements
                startDOMWatch();
            } else if (attempts >= maxAttempts) {
                clearInterval(checkInterval);
                statusBadge.textContent = 'Timeout';
                statusBadge.style.background = 'var(--accent-orange)';
                log('warn', 'Widget did not initialize within timeout. Try reloading the page.');
                detectWidget();
            }
        }, 500);
    }

    // --- DOM Watch for Chat Elements ---
    function startDOMWatch() {
        if (domWatchInterval) clearInterval(domWatchInterval);
        
        domWatchInterval = setInterval(() => {
            const inputs = detectChatInput();
            if (inputs.length > 0) {
                // Found chat inputs, attach event listeners
                inputs.forEach(input => {
                    if (!input.dataset.pameWatched) {
                        input.dataset.pameWatched = 'true';
                        input.addEventListener('keydown', (e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                e.stopPropagation();
                                log('warn', 'Enter key pressed in chat input - message send intercepted for debugging');
                                log('debug', `Input value: "${input.value || input.textContent}"`);
                                
                                // Try to programmatically send
                                attemptSendMessage(input);
                            }
                        });
                        log('info', `Watching chat input: ${input.tagName}${input.id ? '#' + input.id : ''}`);
                    }
                });
            }
        }, 2000);
    }

    // --- Attempt to Send Message ---
    function attemptSendMessage(input) {
        const message = input.value || input.textContent || '';
        if (!message.trim()) {
            log('warn', 'Cannot send empty message');
            return;
        }

        log('info', `Attempting to send message: "${message.substring(0, 50)}${message.length > 50 ? '...' : ''}"`);

        // Method 1: Try API send method
        if (widgetInstance && typeof widgetInstance.send === 'function') {
            try {
                widgetInstance.send(message);
                log('success', 'Message sent via widget.send() API');
                showToast('✅ Message sent via API', 'success');
                return;
            } catch (err) {
                log('error', `API send failed: ${err.message}`);
            }
        }

        // Method 2: Try to find and click send button
        const sendButtons = document.querySelectorAll(
            'button[class*="send"], button[class*="submit"], button[aria-label*="send"], button[aria-label*="Send"], [class*="send-btn"], [class*="send-button"]'
        );
        
        const sendBtn = Array.from(sendButtons).find(btn => {
            const parent = btn.closest('[class*="pame"], [class*="chat"], [class*="widget"]');
            return parent !== null;
        });

        if (sendBtn) {
            // Trigger input event first
            const inputEvent = new Event('input', { bubbles: true });
            input.dispatchEvent(inputEvent);
            
            // Then click send
            setTimeout(() => {
                sendBtn.click();
                log('success', 'Send button clicked');
                showToast('✅ Send button clicked', 'success');
            }, 100);
            return;
        }

        // Method 3: Dispatch Enter key on the input
        const enterEvent = new KeyboardEvent('keydown', {
            key: 'Enter',
            code: 'Enter',
            keyCode: 13,
            which: 13,
            bubbles: true,
            cancelable: true
        });
        
        input.dispatchEvent(enterEvent);
        log('warn', 'Dispatched Enter key event - check if message was sent');
        showToast('⚠️ Enter key dispatched', 'warn');
    }

    // --- Actions ---
    function openWidget() {
        log('info', 'Attempting to open widget...');

        // Method 1: API open
        if (widgetInstance && typeof widgetInstance.open === 'function') {
            widgetInstance.open();
            log('success', 'Widget opened via API.');
            showToast('✅ Widget opened', 'success');
            return;
        }

        // Method 2: API toggle
        if (widgetInstance && typeof widgetInstance.toggle === 'function') {
            widgetInstance.toggle();
            log('success', 'Widget toggled via API.');
            showToast('✅ Widget toggled', 'success');
            return;
        }

        // Method 3: Click widget element
        if (widgetInstance && widgetInstance.click) {
            widgetInstance.click();
            log('success', 'Widget element clicked.');
            showToast('✅ Widget clicked', 'success');
            return;
        }

        // Method 4: Find and click chat bubble
        const bubble = document.querySelector(
            '[class*="pame-chat"], [class*="chat-bubble"], [class*="widget-trigger"], [data-pame-trigger]'
        );
        if (bubble) {
            bubble.click();
            log('success', 'Chat bubble clicked.');
            showToast('✅ Chat bubble clicked', 'success');
            return;
        }

        log('warn', 'Could not find widget to open. Try reloading.');
        showToast('⚠️ Could not open widget', 'warn');
    }

    function reloadWidget() {
        log('info', 'Reloading widget...');
        disableControls();
        widgetLoaded = false;
        widgetInstance = null;
        
        if (domWatchInterval) {
            clearInterval(domWatchInterval);
            domWatchInterval = null;
        }

        // Remove existing widget elements
        const widgetElements = document.querySelectorAll(
            '[data-pame-widget], [class*="pame-"], [id*="pame-"], [class*="Pame"], [id*="Pame"], iframe[src*="pame"]'
        );
        widgetElements.forEach(el => {
            el.remove();
            log('info', `Removed widget element: ${el.tagName}`);
        });

        // Remove script tag
        const oldScript = document.querySelector(
            'script[src="https://pame.cc/api/clone/widget.js"]'
        );
        if (oldScript) {
            oldScript.remove();
        }

        // Re-inject script
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
        showToast('🔄 Widget reloading...', 'info');
        waitForWidget();
    }

    function destroyWidget() {
        log('info', 'Destroying widget...');

        // Method 1: API destroy
        if (widgetInstance && typeof widgetInstance.destroy === 'function') {
            widgetInstance.destroy();
            log('success', 'Widget destroyed via API.');
        } else {
            // Remove all widget elements
            const widgetElements = document.querySelectorAll(
                '[data-pame-widget], [class*="pame-"], [id*="pame-"], [class*="Pame"], [id*="Pame"], iframe[src*="pame"]'
            );
            widgetElements.forEach(el => {
                el.remove();
                log('info', `Removed element: ${el.tagName}`);
            });

            // Remove script tag
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
        
        if (domWatchInterval) {
            clearInterval(domWatchInterval);
            domWatchInterval = null;
        }

        disableControls();
        statusBadge.textContent = 'Destroyed';
        statusBadge.style.background = 'var(--accent-red)';
        scriptStatus.textContent = '❌ Widget destroyed';
        apiStatus.textContent = '❌ No API';
        inputStatus.textContent = '❌ No input';
        log('warn', 'Widget has been destroyed. Reload page to restore.');
        showToast('🗑️ Widget destroyed', 'warn');
    }

    function sendTestMessage() {
        const message = testMessageInput.value.trim();
        if (!message) {
            log('warn', 'Please type a message first');
            showToast('⚠️ Type a message first', 'warn');
            return;
        }

        log('info', `Test message: "${message.substring(0, 50)}${message.length > 50 ? '...' : ''}"`);

        // First, ensure widget is open
        openWidget();

        // Wait a bit for widget to open, then try to send
        setTimeout(() => {
            const inputs = detectChatInput();
            if (inputs.length > 0) {
                const input = inputs[0];
                input.value = message;
                input.dispatchEvent(new Event('input', { bubbles: true }));
                
                setTimeout(() => {
                    attemptSendMessage(input);
                }, 200);
            } else {
                log('error', 'No chat input found to send message');
                showToast('❌ No chat input found', 'error');
            }
        }, 1500);
    }

    // --- DOM Scanner ---
    function scanDOM() {
        log('info', 'Scanning DOM for widget elements...');
        inspectorResults.innerHTML = '';
        
        const results = [];
        
        // Check for script
        const script = document.querySelector('script[src*="pame"]');
        if (script) {
            results.push(`📜 Script: <span class="tag">script</span> src="<span class="val">${script.src}</span>"`);
        }

        // Check for iframes
        const iframes = document.querySelectorAll('iframe');
        iframes.forEach(iframe => {
            if (iframe.src.includes('pame')) {
                results.push(`🖼️ Iframe: <span class="tag">iframe</span> src="<span class="val">${iframe.src}</span>"`);
            }
        });

        // Check for elements with pame classes
        const pameElements = document.querySelectorAll('[class*="pame"], [id*="pame"], [class*="Pame"], [id*="Pame"]');
        pameElements.forEach(el => {
            const classes = el.className || '';
            const id = el.id || '';
            results.push(`🔷 Element: <span class="tag">${el.tagName}</span>${id ? ` id="<span class="val">${id}</span>"` : ''}${classes ? ` class="<span class="val">${classes}</span>"` : ''}`);
        });

        // Check for inputs
        const inputs = document.querySelectorAll('input, textarea, [contenteditable="true"]');
        inputs.forEach(input => {
            const parent = input.closest('[class*="pame"], [class*="chat"], [class*="widget"]');
            if (parent) {
                results.push(`⌨️ Input: <span class="tag">${input.tagName}</span>${input.id ? ` id="<span class="val">${input.id}</span>"` : ''}${input.placeholder ? ` placeholder="<span class="val">${input.placeholder}</span>"` : ''}`);
            }
        });

        if (results.length === 0) {
            results.push('No widget-related elements found in DOM');
        }

        results.forEach(result => {
            const div = document.createElement('div');
            div.className = 'result-item';
            div.innerHTML = result;
            inspectorResults.appendChild(div);
        });

        log('success', `DOM scan complete: found ${results.length} widget-related elements`);
        showToast(`🔍 Found ${results.length} elements`, 'success');
    }

    function injectIntoChat() {
        const message = testMessageInput.value.trim() || 'Hello! This is a test message.';
        
        log('info', `Attempting to inject message into chat input: "${message}"`);
        
        const inputs = detectChatInput();
        if (inputs.length > 0) {
            const input = inputs[0];
            
            // Try different input methods
            if (input.tagName === 'INPUT' || input.tagName === 'TEXTAREA') {
                input.value = message;
            } else if (input.contentEditable === 'true') {
                input.textContent = message;
            }
            
            // Dispatch events
            input.dispatchEvent(new Event('input', { bubbles: true }));
            input.dispatchEvent(new Event('change', { bubbles: true }));
            
            log('success', `Message injected: "${message}"`);
            showToast(`📝 Message injected: "${message.substring(0, 30)}..."`, 'success');
            
            // Focus the input
            input.focus();
        } else {
            log('error', 'No chat input found to inject message');
            showToast('❌ No chat input found', 'error');
        }
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
        sendTestBtn.addEventListener('click', sendTestMessage);
        clearLogBtn.addEventListener('click', clearLog);
        exportLogBtn.addEventListener('click', exportLog);
        scanDOMBtn.addEventListener('click', scanDOM);
        injectMessageBtn.addEventListener('click', injectIntoChat);

        // Enter key in test message input
        testMessageInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                sendTestMessage();
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (!e.target.closest('input, textarea, button, [contenteditable]')) {
                switch (e.key) {
                    case 'l':
                    case 'L':
                        clearLog();
                        break;
                    case 'o':
                    case 'O':
                        openWidget();
                        break;
                    case 'r':
                    case 'R':
                        reloadWidget();
                        break;
                    case 'd':
                    case 'D':
                        destroyWidget();
                        break;
                    case 's':
                    case 'S':
                        scanDOM();
                        break;
                }
            }
        });

        log('info', 'App ready. Keyboard shortcuts: L=clear log, O=open, R=reload, D=destroy, S=scan DOM');
    }

    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();