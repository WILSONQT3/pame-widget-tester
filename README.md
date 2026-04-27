# PAME Widget Tester Pro

An advanced, dark-themed test harness for the **PAME (Personal AI Memory Engine)** clone widget. This enhanced version includes comprehensive debugging tools to diagnose and fix issues with widget initialization, message sending, and DOM interaction for your `wilson-ecaat` clone.

## Tech Stack

- **HTML5** – Semantic structure with enhanced controls
- **CSS3** – Dark theme, responsive layout, smooth transitions, toast notifications
- **JavaScript (Vanilla)** – Advanced widget detection, DOM monitoring, message injection, event logging
- **PAME Widget API** – `https://pame.cc/api/clone/widget.js`

## Features

### Core Features
- ✅ **Widget Status Card** – Real-time detection of script, API, and chat input elements
- ✅ **Interactive Controls** – Open, reload, and destroy the widget with one click
- ✅ **Live Event Log** – Monochrome terminal-style log with timestamps and color-coded entries
- ✅ **Configuration Display** – Shows the exact script tag for easy copy-paste

### Advanced Features
- 🔍 **Widget Inspector** – Scan DOM to find all widget-related elements (scripts, iframes, inputs)
- 📝 **Message Injection** – Programmatically inject text into the chat input field
- 📤 **Send Test Message** – Attempt to send messages via multiple methods (API, DOM click, event dispatch)
- 🎯 **Enter Key Interception** – Captures and logs Enter key presses in chat inputs for debugging
- 🔄 **Auto DOM Watch** – Continuously monitors for new chat input elements and attaches debug listeners
- 📋 **Log Export** – Export the event log as a text file for sharing/debugging
- 🔔 **Toast Notifications** – Visual feedback for all actions

### Keyboard Shortcuts
| Key | Action |
|-----|--------|
| `L` | Clear log |
| `O` | Open widget |
| `R` | Reload widget |
| `D` | Destroy widget |
| `S` | Scan DOM |

## Setup

1. **Clone or download** this repository
2. **Open `index.html`** in any modern web browser (Chrome, Firefox, Safari, Edge)
3. **No build step required** – it works directly in the browser

## How to Use

### Basic Testing
1. Open `index.html` in your browser
2. The app will automatically detect the widget script and wait for initialization
3. Once the widget is ready, all controls become active
4. Use the buttons to test widget functionality

### Debugging Message Send Issues
If messages aren't being sent when you press Enter:

1. **Open the widget** using the 💬 button
2. **Type a message** in the chat input
3. **Press Enter** – the app will intercept and log the event
4. **Check the Event Log** for details about what happened
5. **Use "Send Test Message"** to try alternative sending methods
6. **Use "Scan DOM"** to see what elements the widget created
7. **Use "Inject Test Message"** to programmatically fill the chat input

### Troubleshooting Tips
- If the widget doesn't load, try the **Reload Widget** button
- If messages aren't sending, check if the chat input is inside an iframe (the app will warn you)
- Use **Export Log** to share debugging information
- The app tries 3 methods to send messages: API call, button click, and Enter key dispatch

## Customization

To test a different clone, update the `data-slug` attribute in the script tag inside `index.html`:

```html
data-slug="your-clone-slug"
```

You can also change `data-position`, `data-label`, `data-delay`, or `data-theme` as needed.

## Notes

- The widget may take a few seconds to initialize after page load
- If the widget uses an iframe, the app cannot directly access chat inputs inside it
- The "Destroy" action removes all elements with pame-related classes/IDs
- For iframe-based widgets, message sending must be handled by the widget's own API

## License

MIT – Built for testing purposes with [PAME](https://pame.cc).