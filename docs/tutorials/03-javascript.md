# JavaScript Tutorial for Beginners

**Welcome!** In this tutorial, you'll learn how to add interactivity to our clock interface using JavaScript. We'll create a fully functional countdown timer with visual feedback and keyboard controls.

## What You'll Learn

By the end of this tutorial, you'll understand:
- **What** JavaScript does and how it connects HTML, CSS, and user actions
- **How** to manage application state (like countdown time)
- **How** to manipulate SVG elements dynamically
- **How** to handle user input (keyboard and mouse)
- **How** to create smooth animations and visual feedback
- **How** to communicate between JavaScript and Tauri (Rust backend)

## Understanding JavaScript Basics

### What is JavaScript?

JavaScript is the **programming language of the web** that makes websites interactive. While HTML provides structure and CSS provides styling, JavaScript provides **behavior and logic**.

**What JavaScript can do:**
- ✅ **Respond to user actions** (clicks, key presses, mouse movements)
- ✅ **Change content on the fly** (update text, show/hide elements)
- ✅ **Manipulate styles** (change colors, sizes, positions)
- ✅ **Communicate with servers** (fetch data, send information)
- ✅ **Work with time** (countdowns, animations, scheduled events)

### How JavaScript Fits with HTML and CSS

Think of it like a restaurant:
- **HTML** = The menu and table layout (structure)
- **CSS** = The table settings and decoration (appearance)
- **JavaScript** = The waiter who takes orders, brings food, and handles requests (interactivity)

### Key JavaScript Concepts

**Variables**: Store information that can change
```javascript
let countdownSeconds = 60;  // Stores our countdown time
let isRunning = false;      // Stores whether timer is active
```

**Functions**: Reusable blocks of code
```javascript
function startTimer() {
    console.log("Timer started!");
}
```

**Events**: Actions that trigger code
```javascript
button.addEventListener('click', startTimer);  // Run startTimer when button clicked
```

**DOM Manipulation**: Changing HTML/CSS from JavaScript
```javascript
document.getElementById('timer').textContent = "5:00";  // Change text
```

## Project: Interactive Countdown Timer

We're creating a timer that:
- Shows remaining time as a red wedge that shrinks as time passes
- Allows clicking on minute marks to start countdowns
- Flashes tick marks when minute boundaries are crossed
- Responds to keyboard shortcuts for quick control
- Communicates with Tauri to resize the window

### Step 1: Setting Up the JavaScript Structure

Add this script before your closing `</body>` tag:

```html
<script>
    // =================================
    // 1. STATE MANAGEMENT
    // =================================

    // Timer state
    let remainingSeconds = 0;        // How many seconds left in countdown
    let timerInterval = null;       // The setInterval ID for stopping timer
    let lastWholeMinutes = null;    // Track previous minute for flashing

    // UI state
    let labelsVisible = true;       // Whether numbers are shown
    let tickLineMap = new Map();   // Store tick mark information

    // =================================
    // 2. DOM ELEMENT REFERENCES
    // =================================

    const redPath = document.getElementById('redPath');
    const tickMarks = document.getElementById('tickMarks');
    const svg = document.querySelector('svg');
    const body = document.body;
</script>
```

**Understanding this structure:**

**State Management**: We keep all our important data in variables at the top. This makes it easy to see what information our app needs to track.

**DOM References**: We grab HTML elements once at the beginning and store them in constants. This is more efficient than searching for elements repeatedly.

**Why use `let` vs `const`?**
- `let`: Variables that will change (remainingSeconds, labelsVisible)
- `const`: Variables that won't be reassigned (DOM elements references)

### Step 2: Creating the Clock Interface

Let's build functions that create our clock elements:

```javascript
// Position numbers around the clock face
function positionNumbers() {
    const numbers = [
        { id: 'num0', minute: 0 },   // 12 o'clock
        { id: 'num5', minute: 5 },   // 1 o'clock
        { id: 'num10', minute: 10 },  // 2 o'clock
        // ... continue for all 12 positions
    ];

    numbers.forEach(({ id, minute }) => {
        const element = document.getElementById(id);
        const angle = (minute * 6) - 90;  // 6° per minute, -90° to start at top
        const radians = (angle * Math.PI) / 180;

        const radius = 160;  // Distance from center
        const centerX = 250;
        const centerY = 250;

        const x = centerX + radius * Math.cos(radians);
        const y = centerY + radius * Math.sin(radians) + 6;  // +6 for text baseline

        element.setAttribute('x', x);
        element.setAttribute('y', y);
        element.textContent = minute === 0 ? 12 : minute / 5;
    });
}
```

**Understanding the math:**

**Clock Math**: A circle has 360°, divided by 60 minutes = 6° per minute.

**Coordinate System**: Our SVG coordinate system starts at the top (12 o'clock), but standard math starts at the right (3 o'clock). So we subtract 90° to rotate the system.

**Trigonometry**: We use `cos()` and `sin()` to convert angles to x,y coordinates:
- `cos(angle)` gives the horizontal position
- `sin(angle)` gives the vertical position

### Step 3: Creating Interactive Tick Marks

Now let's create the clickable minute marks around our clock:

```javascript
function createTickMarks() {
    tickMarks.innerHTML = '';  // Clear existing ticks

    for (let minute = 0; minute < 60; minute++) {
        const isLongTick = minute % 5 === 0;  // Every 5 minutes gets a longer tick

        // Calculate positions
        const angle = (minute * 6) - 90;
        const radians = (angle * Math.PI) / 180;

        const innerRadius = isLongTick ? 165 : 175;
        const outerRadius = 185;

        const centerX = 250;
        const centerY = 250;

        const x1 = centerX + innerRadius * Math.cos(radians);
        const y1 = centerY + innerRadius * Math.sin(radians);
        const x2 = centerX + outerRadius * Math.cos(radians);
        const y2 = centerY + outerRadius * Math.sin(radians);

        // Create invisible click area (wedge shape)
        const clickArea = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        const nextAngle = ((minute + 1) * 6) - 90;
        const nextRadians = (nextAngle * Math.PI) / 180;
        const x3 = centerX + outerRadius * Math.cos(nextRadians);
        const y3 = centerY + outerRadius * Math.sin(nextRadians);

        const pathData = `M ${centerX} ${centerY} L ${x2} ${y2} A ${outerRadius} ${outerRadius} 0 0 1 ${x3} ${y3} Z`;
        clickArea.setAttribute('d', pathData);
        clickArea.setAttribute('fill', 'transparent');
        clickArea.setAttribute('data-minute', minute);

        // Create visible tick line
        const tickLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        tickLine.setAttribute('x1', x1);
        tickLine.setAttribute('y1', y1);
        tickLine.setAttribute('x2', x2);
        tickLine.setAttribute('y2', y2);
        tickLine.setAttribute('stroke', '#6b7280');
        tickLine.setAttribute('stroke-width', isLongTick ? 2.5 : 1);
        tickLine.setAttribute('stroke-linecap', 'round');

        // Store line information for later
        tickLineMap.set(minute, { line: tickLine, isLong: isLongTick });

        // Add hover effects
        clickArea.addEventListener('mouseenter', () => {
            tickLine.setAttribute('stroke', '#ef4444');
            tickLine.setAttribute('stroke-width', isLongTick ? 4 : 2);
        });

        clickArea.addEventListener('mouseleave', () => {
            tickLine.setAttribute('stroke', '#6b7280');
            tickLine.setAttribute('stroke-width', isLongTick ? 2.5 : 1);
        });

        // Add click handler to start timer
        clickArea.addEventListener('click', () => {
            startTimerFromMinute(minute);
        });

        tickMarks.appendChild(clickArea);
        tickMarks.appendChild(tickLine);
    }
}
```

**Understanding this code:**

**SVG Namespace**: We use `createElementNS()` with the SVG namespace because we're creating SVG elements, not HTML elements.

**Click Areas**: We create invisible wedge shapes that are larger than just the tick lines, making them easier to click.

**Event Handling**: Each tick mark has:
- `mouseenter`: Turns the tick red when mouse hovers over it
- `mouseleave`: Restores the original color when mouse leaves
- `click`: Starts a countdown from that minute

**Data Storage**: We store each tick line in `tickLineMap` so we can easily find and modify it later (for flashing effects).

### Step 4: Drawing the Time-Remaining Wedge

Now let's create the red wedge that shows how much time is left:

```javascript
function updateRedWedge() {
    if (remainingSeconds <= 0) {
        redPath.setAttribute('d', '');  // Clear the path
        return;
    }

    const totalMinutes = 60;  // Full hour
    const currentMinutes = Math.ceil(remainingSeconds / 60);
    const progress = currentMinutes / totalMinutes;

    // Convert to angle (starting from top, going clockwise)
    const startAngle = -90;  // Start at 12 o'clock
    const endAngle = startAngle + (progress * 360);

    // Build SVG arc path
    const centerX = 250;
    const centerY = 250;
    const radius = 160;

    // Convert angles to radians
    const startRadians = (startAngle * Math.PI) / 180;
    const endRadians = (endAngle * Math.PI) / 180;

    // Calculate arc endpoints
    const x1 = centerX + radius * Math.cos(startRadians);
    const y1 = centerY + radius * Math.sin(startRadians);
    const x2 = centerX + radius * Math.cos(endRadians);
    const y2 = centerY + radius * Math.sin(endRadians);

    // Determine if arc should be large (> 180 degrees)
    const largeArc = (endAngle - startAngle) > 180 ? 1 : 0;

    // Build the path data
    let pathData;
    if (progress >= 1) {
        // Full circle
        pathData = `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 1 1 ${x1} ${y1} Z`;
    } else {
        // Partial arc
        pathData = `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
    }

    redPath.setAttribute('d', pathData);
}
```

**Understanding the SVG path:**

**Path Commands**: SVG path data uses commands:
- `M x y`: Move to point (don't draw)
- `L x y`: Draw a line to point
- `A rx ry rotation largeArc sweep x y`: Draw an arc
- `Z`: Close the path (draw back to start)

**Arc Parameters**:
- `rx ry`: Radii of the arc (both equal for circles)
- `rotation`: How much to rotate the arc (0 for us)
- `largeArc`: 0 if arc is < 180°, 1 if > 180°
- `sweep`: 1 for clockwise, 0 for counter-clockwise

### Step 5: Managing the Countdown Timer

Now let's create the core timer functionality:

```javascript
function startTimerFromMinute(minute) {
    // Clear any existing timer
    if (timerInterval) {
        clearInterval(timerInterval);
    }

    // Set up new timer
    remainingSeconds = minute * 60;  // Convert minutes to seconds
    lastWholeMinutes = Math.ceil(remainingSeconds / 60);

    // Update display immediately
    updateRedWedge();

    // Start the countdown
    timerInterval = setInterval(() => {
        remainingSeconds--;

        if (remainingSeconds <= 0) {
            // Timer finished
            clearInterval(timerInterval);
            timerInterval = null;
            remainingSeconds = 0;
            updateRedWedge();

            console.log('Timer finished!');
            // Could add sound/notification here
        } else {
            // Timer running
            updateRedWedge();

            // Check if we crossed a minute boundary
            const currentMinutes = Math.ceil(remainingSeconds / 60);
            if (currentMinutes !== lastWholeMinutes) {
                highlightTick(currentMinutes);
                lastWholeMinutes = currentMinutes;
            }
        }
    }, 1000);  // Run every second (1000ms)
}
```

**Understanding this timer logic:**

**Timer Management**:
- We always clear any existing timer before starting a new one
- `setInterval()` returns an ID we can use to stop the timer later
- We store the timer ID in `timerInterval` so we can clean it up

**Minute Boundary Detection**:
- We track `lastWholeMinutes` to detect when the countdown crosses a minute mark
- When it happens, we call `highlightTick()` to flash the appropriate tick mark

**Edge Cases**:
- When `remainingSeconds` reaches 0, we clear the timer and update the display
- The timer continues running even if the user switches to another browser tab

### Step 6: Adding Visual Feedback

Let's create the flashing effect for minute boundaries:

```javascript
function highlightTick(minute) {
    const tickInfo = tickLineMap.get(minute);
    if (!tickInfo) return;

    const { line, isLong } = tickInfo;

    // Flash the tick red and wider
    line.setAttribute('stroke', '#ef4444');
    line.setAttribute('stroke-width', isLong ? 4 : 2.5);

    // Restore after a short delay
    setTimeout(() => {
        line.setAttribute('stroke', '#6b7280');
        line.setAttribute('stroke-width', isLong ? 2.5 : 1);
    }, 350);  // Flash for 350 milliseconds
}
```

**Why this approach:**

**Immediate Feedback**: The tick flashes immediately when a minute boundary is crossed.

**Non-blocking**: We use `setTimeout()` instead of blocking code, so the timer continues running smoothly.

**State Restoration**: We restore the original appearance based on whether it's a long or short tick.

### Step 7: Managing UI State

Let's add functions to control the interface:

```javascript
function setLabelVisibility(visible) {
    labelsVisible = visible;

    if (visible) {
        body.classList.remove('labels-hidden');
        svg.setAttribute('viewBox', '0 0 500 500');  // Show full clock
    } else {
        body.classList.add('labels-hidden');
        // Zoom in when labels are hidden (remove outer padding)
        svg.setAttribute('viewBox', '40 40 420 420');
    }
}

function toggleLabelVisibility() {
    setLabelVisibility(!labelsVisible);
}
```

**Understanding the viewBox trick:**

**When labels are visible**: We show the full `500x500` coordinate system, including space around the clock for the labels.

**When labels are hidden**: We zoom in to `40 40 420 420`, which:
- Starts at (40, 40) instead of (0, 0) - removes 40px from left/top
- Shows 420x420 instead of 500x500 - removes 40px from right/bottom
- Effectively crops the SVG to just the clock face, making it appear larger

### Step 8: Adding Keyboard Controls

Let's add keyboard shortcuts for quick control:

```javascript
// Window size presets
const windowPresets = {
    'preset-xxs': { width: 300, height: 300, className: 'preset-xxs' },
    'preset-xs':  { width: 400, height: 400, className: 'preset-xs' },
    'preset-s':   { width: 500, height: 500, className: 'preset-s' },
    'preset-m':   { width: 600, height: 600, className: 'preset-m' },
    'preset-l':   { width: 800, height: 800, className: 'preset-l' }
};

function applyPreset(presetKey) {
    const preset = windowPresets[presetKey];
    if (!preset) return;

    // Remove all preset classes and add the new one
    Object.keys(windowPresets).forEach(key => {
        body.classList.remove(key);
    });
    body.classList.add(preset.className);

    // Resize the native window if Tauri is available
    if (window.__TAURI__) {
        window.__TAURI__.core.invoke('resize_window', {
            width: preset.width,
            height: preset.height
        }).catch(error => {
            console.log('Could not resize window:', error);
        });
    }
}

// Keyboard event listener
document.addEventListener('keydown', (event) => {
    // Check if Ctrl or Cmd is pressed (for our shortcuts)
    if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
            case '1': applyPreset('preset-xxs'); break;
            case '2': applyPreset('preset-xs'); break;
            case '3': applyPreset('preset-s'); break;
            case '4': applyPreset('preset-m'); break;
            case '5': applyPreset('preset-l'); break;
            case 'h':
            case 'H': toggleLabelVisibility(); break;
        }
    }
});
```

**Understanding the keyboard shortcuts:**

**Modifier Keys**: We require Ctrl (Windows/Linux) or Cmd (macOS) to avoid conflicts with normal typing.

**Number Keys**: 1-5 correspond to different size presets, making it easy to quickly resize the timer.

**Tauri Integration**: When running in Tauri (not in a regular browser), `window.__TAURI__` is available and we can call our Rust `resize_window` command.

### Step 9: Initializing Everything

Let's create a function that sets up our application when the page loads:

```javascript
function initializeApp() {
    // Set initial UI state
    setLabelVisibility(true);
    applyPreset('preset-m');  // Start with medium size

    // Build the clock interface
    positionNumbers();
    createTickMarks();
    updateRedWedge();  // Start with empty wedge

    console.log('Timer initialized!');
}

// Start the application when the page loads
document.addEventListener('DOMContentLoaded', initializeApp);
```

**Why `DOMContentLoaded`?**

This event fires when the HTML document has been completely loaded and parsed, but before subresources like images have finished loading. This is the perfect time to start initializing our interface.

## Testing Your Timer

At this point, your countdown timer should be fully functional! Here's how to test it:

**Basic functionality:**
1. **Click any tick mark**: Timer should start from that minute
2. **Watch the red wedge**: It should shrink as time counts down
3. **Minute boundaries**: Watch for the flashing tick when each minute passes
4. **Timer completion**: After the countdown, the wedge should disappear

**Keyboard controls:**
1. **Press Ctrl/Cmd + 1-5**: Window should resize to different presets
2. **Press Ctrl/Cmd + H**: Numbers should appear/disappear
3. **Try different combinations**: Hide labels and change sizes

**Visual feedback:**
1. **Hover over ticks**: They should turn red and get thicker
2. **Click ticks**: Timer starts from that position
3. **Minute flashes**: Ticks flash red when minute boundaries cross

## Common Questions

**Q: Why use `setInterval` instead of `setTimeout` in a loop?**
A: `setInterval` runs consistently every second regardless of how long your code takes to execute. `setTimeout` in a loop can drift if your code takes time to run.

**Q: What happens if the user clicks multiple ticks quickly?**
A: Each click clears the previous timer and starts a new one, so you always get the most recent selection.

**Q: Why store tick information in a Map instead of querying the DOM?**
A: It's much faster! DOM queries are relatively expensive, and we need quick access for the flashing effect.

**Q: Will the timer keep running if I switch to another tab?**
A: Most browsers slow down timers in background tabs, but the timer continues. When you return, it may "catch up" quickly.

**Q: How does the Tauri integration work?**
A: In a regular browser, `window.__TAURI__` doesn't exist, so the code silently ignores the resize. In Tauri, this object provides access to native functionality.

## Next Steps

Once you understand these basics, try:

1. **Add pause/resume functionality**: Store whether timer is running and stop/start the interval without losing progress
2. **Add sound effects**: Play a tick sound each second and a completion sound when done
3. **Add presets for common times**: Quick buttons for 5, 10, 15, 30 minutes
4. **Add visual themes**: Different color schemes for the clock
5. **Add persistence**: Save the current timer state so it survives page refreshes

## Key Takeaways

1. **State management**: Keep track of important values in variables at the top of your code
2. **DOM efficiency**: Grab element references once, reuse them throughout your code
3. **Event-driven programming**: Respond to user actions and timer events appropriately
4. **Math for graphics**: Use trigonometry for circular layouts and positioning
5. **Visual feedback**: Provide immediate response to user interactions
6. **Modular functions**: Break your code into small, focused functions
7. **Cross-platform considerations**: Handle both browser and Tauri environments gracefully

You now have a fully functional, interactive countdown timer with professional features!