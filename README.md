# PAME Widget Tester

A simple, dark-themed test harness for the **PAME (Personal AI Memory Engine)** clone widget. This app helps you verify that your `wilson-ecaat` clone widget is loading, initializing, and functioning correctly in a browser environment.

## Tech Stack

- **HTML5** – Semantic structure
- **CSS3** – Dark theme, responsive layout, smooth transitions
- **JavaScript (Vanilla)** – Widget detection, event logging, interactive controls
- **PAME Widget API** – `https://pame.cc/api/clone/widget.js`

## Features

- ✅ **Widget Status Card** – Shows real-time detection status of the widget script and its configuration parameters
- ✅ **Interactive Controls** – Open, reload, and destroy the widget with one click
- ✅ **Live Event Log** – Monochrome terminal-style log showing all widget-related events with timestamps
- ✅ **Configuration Display** – Shows the exact script tag used for easy copy-paste
- ✅ **Dark Theme** – GitHub-inspired dark UI with accent colors for status indicators
- ✅ **Responsive** – Works on desktop and mobile devices
- ✅ **Keyboard Shortcut** – Press `L` to clear the event log

## Setup

1. **Clone or download** this repository
2. **Open `index.html`** in any modern web browser (Chrome, Firefox, Safari, Edge)
3. **No build step required** – it works directly in the browser

The widget script is already included in the HTML:

```html
<script 
    src="https://pame.cc/api/clone/widget.js" 
    data-slug="wilson-ecaat" 
    data-position="bottom-right" 
    data-label="💬 Chat with me" 
    data-delay="0" 
    data-theme="dark" 
    defer>
</script>
```

## How to Use

1. Open `index.html` in your browser
2. The app will automatically detect the widget script and wait for initialization
3. Once the widget is ready, the control buttons become active
4. Use the buttons to:
   - **💬 Open Widget** – Manually trigger the chat bubble
   - **🔄 Reload Widget** – Re-inject the widget script (useful for testing re-initialization)
   - **🗑️ Destroy Widget** – Remove the widget from the DOM
5. Watch the **Event Log** for real-time feedback

## Customization

To test a different clone, update the `data-slug` attribute in the script tag inside `index.html`:

```html
data-slug="your-clone-slug"
```

You can also change `data-position`, `data-label`, `data-delay`, or `data-theme` as needed.

## Notes

- The widget may take a few seconds to initialize after page load
- If the widget doesn't load, try refreshing the page or checking your internet connection
- The "Destroy" action removes all elements that match `[class*="pame"]` or `[id*="pame"]` – if your widget uses different selectors, you may need to update `app.js`

## License

MIT – Built for testing purposes with [PAME](https://pame.cc).