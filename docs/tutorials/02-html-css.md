# HTML & CSS Tutorial for Beginners

**Welcome!** In this tutorial, you'll learn how to create a beautiful, responsive clock interface using HTML and CSS. This clock will be the visual foundation for our countdown timer application.

## What You'll Learn

By the end of this tutorial, you'll understand:
- **What** HTML and CSS do and how they work together
- **How** to create responsive layouts that adapt to different screen sizes
- **How** to use SVG for scalable graphics
- **How** CSS variables make styling more maintainable
- **How** to size elements proportionally (keeping circles circular!)

## Understanding the Basics

### What is HTML?

HTML (HyperText Markup Language) provides the **structure and content** of your webpage. Think of it as the skeleton:

```html
<!-- This is a heading -->
<h1>My Clock</h1>

<!-- This is a container -->
<div class="clock-container">
    <!-- Clock content goes here -->
</div>
```

**Key concepts:**
- **Elements**: Tags like `<div>`, `<h1>`, `<span>` that create content boxes
- **Attributes**: Properties like `class="clock-container"` that help identify elements
- **Hierarchy**: Elements can be nested inside each other

### What is CSS?

CSS (Cascading Style Sheets) provides the **visual styling and layout**. Think of it as the appearance:

```css
/* This styles all heading elements */
h1 {
    color: blue;
    font-size: 24px;
}

/* This styles elements with the clock-container class */
.clock-container {
    width: 300px;
    height: 300px;
    border: 2px solid black;
}
```

**Key concepts:**
- **Selectors**: How you choose which elements to style (by tag, class, id)
- **Properties**: Visual attributes like `color`, `width`, `border`
- **Values**: The specific settings for each property

### What is SVG?

SVG (Scalable Vector Graphics) creates **graphics using code instead of images**. Unlike pixel-based images (JPG, PNG), SVGs:

- ✅ **Scale perfectly** at any size without becoming blurry
- ✅ **Are text-based** so they compress well in your code
- ✅ **Can be styled** with CSS and manipulated with JavaScript
- ✅ **Support animations** and interactive elements

## Project: Building a Visual Clock

We're creating a circular clock interface that:
- Shows hour marks around the circle
- Displays numbers at key positions (12, 1, 2, 3, etc.)
- Resizes smoothly to fit different window sizes
- Can hide the numbers to show a clean dial

### Step 1: Creating the Basic HTML Structure

Let's start with a clean HTML file. Create `src/index.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Visual Countdown Timer</title>
    <style>
        /* We'll add CSS here */
    </style>
</head>
<body class="preset-m">
    <div class="timer-wrapper">
        <svg viewBox="0 0 500 500" preserveAspectRatio="xMidYMid meet">
            <!-- Clock elements will go here -->
        </svg>
    </div>
</body>
</html>
```

**Understanding this structure:**

**`<!DOCTYPE html>`**: Tells browsers this is a modern HTML5 document

**`<meta charset="UTF-8">`**: Ensures proper text encoding (important for special characters)

**`<meta name="viewport">`**: Makes the page responsive on mobile devices

**`<body class="preset-m">`**: We start with a "medium" size preset that CSS will define

**`<div class="timer-wrapper">`**: A container that will help us center and size our clock

**`<svg viewBox="0 0 500 500">`**:
- `viewBox="0 0 500 500"` creates a 500x500 coordinate system
- `preserveAspectRatio="xMidYMid meet"` keeps the SVG centered and proportional

### Step 2: Setting Up Global CSS Rules

Add these CSS rules inside your `<style>` tag:

```css
/* Reset browser defaults for consistent sizing */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

/* Make html and body fill the entire window */
html, body {
    width: 100%;
    height: 100%;
    overflow: hidden; /* Prevent scrollbars */
}

/* Center content in the middle of the page */
body {
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #f5f5f5;
    font-family: 'Inter', system-ui, sans-serif;

    /* These variables will control our sizing */
    --padding: 40px;
    --font-size: 16px;
    --control-font-size: 12px;
}
```

**Why these rules matter:**

**`box-sizing: border-box`**: Makes sizing intuitive. When you set `width: 100px`, the total width including borders and padding is 100px, not 100px + borders + padding.

**`overflow: hidden`**: Prevents scrollbars from appearing, which would ruin our clock's centered appearance.

**`display: flex; align-items: center; justify-content: center`**: This is the modern way to center content both horizontally and vertically.

**CSS Variables (`--variable-name`)**: These are custom properties we can change dynamically and reuse throughout our styles.

### Step 3: Creating Size Presets

Add these size presets to your CSS:

```css
/* Extra Small preset - for compact displays */
body.preset-xxs {
    --padding: 8px;
    --font-size: 12px;
    --control-font-size: 10px;
}

/* Small preset */
body.preset-xs {
    --padding: 16px;
    --font-size: 14px;
    --control-font-size: 11px;
}

/* Medium preset (our default) */
body.preset-s {
    --padding: 24px;
    --font-size: 15px;
    --control-font-size: 11px;
}

body.preset-m {
    --padding: 40px;
    --font-size: 16px;
    --control-font-size: 12px;
}

/* Large preset - for spacious displays */
body.preset-l {
    --padding: 80px;
    --font-size: 20px;
    --control-font-size: 14px;
}
```

**Why use presets instead of fixed sizes?**

This approach makes it easy to resize the entire interface by just changing the class on the `<body>` element. All measurements automatically adjust because they reference the CSS variables.

### Step 4: Making the Clock Container Responsive

```css
/* The wrapper that contains our SVG clock */
.timer-wrapper {
    width: calc(100vw - var(--padding));
    height: calc(100vh - var(--padding));
    max-width: calc(100vh - var(--padding));
    max-height: calc(100vw - var(--padding));

    display: flex;
    align-items: center;
    justify-content: center;
}

/* Make the SVG fill its container */
.timer-wrapper svg {
    width: 100%;
    height: 100%;
}
```

**Understanding this sizing logic:**

**`calc(100vw - var(--padding))`**: Takes the full viewport width and subtracts our padding, leaving space around the clock.

**`max-width: calc(100vh - var(--padding))`**: This is the clever part that keeps our clock circular! It ensures the width never exceeds the height (minus padding), preventing the circle from becoming oval-shaped on tall windows.

**The result**: On any window shape, the clock remains a perfect circle with consistent padding around it.

### Step 5: Building the SVG Clock Structure

Now let's add the visual elements inside your `<svg>` tag:

```svg
<!-- Background circle -->
<circle cx="250" cy="250" r="180"
        fill="white"
        stroke="#e5e7eb"
        stroke-width="2"/>

<!-- Group for tick marks (JavaScript will fill this) -->
<g id="tickMarks"></g>

<!-- Group for the time-remaining indicator -->
<g id="redDisk">
    <path id="redPath" fill="#ef4444" />
</g>

<!-- Hour numbers -->
<text id="num0" x="250" y="80" text-anchor="middle">12</text>
<text id="num5" x="400" y="255" text-anchor="middle">1</text>
<text id="num10" x="355" y="400" text-anchor="middle">2</text>
<text id="num15" x="250" y="430" text-anchor="middle">3</text>
<text id="num20" x="145" y="400" text-anchor="middle">4</text>
<text id="num25" x="100" y="255" text-anchor="middle">5</text>
<text id="num30" x="145" y="110" text-anchor="middle">6</text>
<text id="num35" x="250" y="80" text-anchor="middle">7</text>
<text id="num40" x="355" y="110" text-anchor="middle">8</text>
<text id="num45" x="400" y="255" text-anchor="middle">9</text>
<text id="num50" x="355" y="400" text-anchor="middle">10</text>
<text id="num55" x="100" y="255" text-anchor="middle">11</text>

<!-- Center decoration -->
<circle cx="250" cy="250" r="8" fill="#374151"/>
```

**Understanding SVG coordinates:**

**Coordinate system**: Our `viewBox="0 0 500 500"` means:
- Top-left corner is (0, 0)
- Bottom-right corner is (500, 500)
- Center point is (250, 250)

**Circle elements**:
- `cx`, `cy`: Center coordinates
- `r`: Radius
- `fill`: Interior color
- `stroke`: Border color
- `stroke-width`: Border thickness

**Text elements**:
- `x`, `y`: Position coordinates
- `text-anchor="middle"`: Centers the text horizontally at the x position

### Step 6: Styling the Clock Numbers

Add these styles for the text elements:

```css
/* Default styling for all SVG text elements */
svg text {
    font-size: var(--font-size);
    font-weight: 500;
    fill: #374151;
    user-select: none; /* Prevent text selection */
    pointer-events: none; /* Allow clicking through text */
}
```

**Why these properties:**

**`user-select: none`**: Prevents users from accidentally selecting the numbers when clicking on the clock.

**`pointer-events: none`**: Allows mouse clicks to pass through the text to elements underneath (important for our click interaction later).

### Step 7: Adding Label Visibility Control

Add this rule for hiding labels:

```css
/* When body has this class, hide all text labels */
body.labels-hidden svg text {
    display: none;
}
```

**Why this approach?**

Instead of removing text elements with JavaScript (which would require rebuilding the SVG), we simply toggle a CSS class. This is:
- ✅ **Faster**: No DOM manipulation
- ✅ **Simpler**: Just add/remove one class
- ✅ **Preserves structure**: Elements remain for future use

### Step 8: Testing Your Clock

At this point, you should see a clean white circle with numbers around the edge. Let's add a temporary test to see the class switching in action:

Add this JavaScript before the closing `</body>` tag:

```javascript
// Test: Press 'h' to toggle labels
document.addEventListener('keydown', (e) => {
    if (e.key === 'h' || e.key === 'H') {
        document.body.classList.toggle('labels-hidden');
    }

    // Test size presets with number keys 1-4
    if (e.key === '1') {
        document.body.className = 'preset-xxs';
    }
    if (e.key === '2') {
        document.body.className = 'preset-s';
    }
    if (e.key === '3') {
        document.body.className = 'preset-m';
    }
    if (e.key === '4') {
        document.body.className = 'preset-l';
    }
});
```

**What you should see:**
- Press **'h'**: Numbers appear and disappear
- Press **'1'-'4'**: Clock gets smaller or larger
- Resize the window: Clock stays perfectly circular

### Step 9: Understanding What We've Built

Let's review the key concepts:

**Responsive Design**: Our clock adapts to any window size while maintaining its circular shape using the `max-width`/`max-height` trick.

**CSS Variables**: By using `--padding` and `--font-size` variables, we can create multiple size presets without recalculating any measurements.

**SVG Graphics**: We're creating graphics with code rather than images, which means they scale perfectly and can be manipulated with CSS and JavaScript.

**Modular Classes**: The body classes control the entire appearance, making it easy to switch between different configurations.

**Semantic HTML**: Our structure clearly separates the container (timer-wrapper), the graphics (SVG), and different functional groups (tickMarks, redDisk).

## Common Questions

**Q: Why use SVG instead of Canvas?**
A: SVG keeps elements as individual objects that can be styled with CSS and accessed with JavaScript. Canvas is like painting on a single surface - you can't easily modify individual elements later.

**Q: What's the difference between `vw` and `%`?**
A: `vw` (viewport width) is relative to the browser window, while `%` is relative to the parent element. For full-page layouts, `vw` is often more predictable.

**Q: Why use `calc()` instead of just percentages?**
A: `calc()` lets us combine different units (like subtracting a pixel value from a percentage), which is essential for creating consistent padding.

**Q: Can I use CSS Grid instead of Flexbox?**
A: Absolutely! CSS Grid would work well too. Flexbox is often simpler for centering single items, but Grid gives you more control for complex layouts.

## Next Steps

Now that you have the visual foundation:

1. **Add tick marks**: Use JavaScript to create the minute marks around the circle
2. **Create the red wedge**: Draw a path that shows remaining time
3. **Add interactions**: Make tick marks clickable to start timers
4. **Animate changes**: Smooth transitions when switching size presets

## Key Takeaways

1. **Structure first, style second**: HTML provides meaning, CSS provides appearance
2. **Think responsively from the start**: Design for different screen sizes from day one
3. **CSS variables are powerful**: They make theming and resizing much easier
4. **SVG scales perfectly**: Vector graphics are ideal for interfaces that need to work at multiple sizes
5. **Class-based state management**: Toggle classes instead of manipulating styles directly

You now have a solid foundation in creating responsive, scalable interfaces with HTML and CSS!