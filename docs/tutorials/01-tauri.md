# Tauri Tutorial for Beginners

**Welcome!** This tutorial will teach you how to build desktop applications using web technologies you already know (HTML, CSS, JavaScript) with Tauri.

## What You'll Learn

By the end of this tutorial, you'll understand:
- **What** Tauri is and why it's useful
- **How** Tauri connects web code to native desktop features
- **How** to build a resizable desktop application
- **How** to automate building and distributing your app

## What is Tauri?

### The Problem Tauri Solves
Creating desktop applications traditionally required learning platform-specific languages:
- **Windows**: C# or C++
- **macOS**: Swift or Objective-C
- **Linux**: C++ or Vala

If you wanted your app on all platforms, you'd need to write it three times!

### Tauri's Solution
Tauri lets you build desktop applications using web technologies:

**How it works:**
1. **Frontend**: You write HTML, CSS, and JavaScript - just like a website
2. **Backend**: Rust handles native desktop features (window controls, file system, etc.)
3. **Bridge**: JavaScript can call Rust functions and vice versa

**Why this is great:**
- ✅ **Single codebase** works on Windows, macOS, and Linux
- ✅ **Tiny applications** (usually 5-10MB vs 100MB+ for Electron)
- ✅ **Fast performance** because you're not shipping a full web browser
- ✅ **Use skills you already have** if you know web development

### Key Architecture Concepts

**WebView**: Tauri displays your web interface in a native "webview" - essentially an embedded browser without the browser UI (no address bar, buttons, etc.).

**Rust Backend**: A small Rust program that creates the window, manages the webview, and provides access to native desktop features.

**IPC Bridge**: Inter-Process Communication lets your JavaScript safely call Rust functions and get responses back.

## Project Structure

Let's look at the important files in this project:

```
visual-countdown/
├── src-tauri/          # Rust backend code
│   ├── src/
│   │   ├── main.rs     # Entry point - starts the app
│   │   └── lib.rs      # Your custom Rust commands
│   └── tauri.conf.json # App configuration
├── src/
│   └── index.html      # Your web interface (HTML/CSS/JS)
└── .github/workflows/
    └── main.yml        # Automated building and releasing
```

### Understanding the Key Files

**`src-tauri/src/main.rs`** - The Application Starter
This is where your app begins. It sets up the window and loads your web interface.

**`src-tauri/src/lib.rs`** - Your Custom Commands
Here you write Rust functions that JavaScript can call, like resizing the window or accessing the file system.

**`src/index.html`** - The User Interface
This contains all your HTML, CSS, and JavaScript - everything the user sees and interacts with.

**`.github/workflows/main.yml`** - The Automated Builder
This file tells GitHub to automatically build your app for all platforms when you release a new version.

## Building Your First Tauri App: Step by Step

### Prerequisites

Before we start, make sure you have:
- **Node.js and npm** (for managing dependencies and running Tauri commands)
- **Rust** (for the backend - Tauri will guide you through installation)
- **Basic knowledge** of HTML, CSS, and JavaScript

### Step 1: Create a New Tauri Project

First, install the Tauri CLI:
```bash
npm install -g @tauri-apps/cli
```

Now create your first app:
```bash
npx tauri init
```

The setup wizard will ask you several questions:
- **Project name**: Choose something descriptive
- **Frontend**: Select "vanilla" (plain HTML/CSS/JS) for this tutorial
- **Styling**: Choose your preferred CSS approach

### Step 2: Understand the Basic Structure

After initialization, you'll see these key files:

**`src-tauri/Cargo.toml`** - Rust dependencies
Lists what Rust libraries your app needs.

**`src-tauri/src/main.rs`** - The main Rust file
```rust
fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![greet])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

**`src/index.html`** - Your web interface
```html
<!DOCTYPE html>
<html>
<head>
    <title>My App</title>
</head>
<body>
    <h1>Hello from Tauri!</h1>
</body>
</html>
```

### Step 3: Add a Custom Command

Let's create a command that can resize the window from JavaScript.

**Why we need this:** Web pages running in browsers can't resize their own windows for security reasons. But with Tauri, your JavaScript can safely ask the Rust backend to do it.

**In `src-tauri/src/lib.rs`:**
```rust
#[tauri::command]
async fn resize_window(window: tauri::Window, width: f64, height: f64) -> Result<(), String> {
    window
        .set_size(tauri::Size::Physical(tauri::PhysicalSize {
            width: width as u32,
            height: height as u32,
        }))
        .map_err(|e| format!("Failed to resize window: {}", e))?;
    Ok(())
}
```

**Understanding this code:**
- `#[tauri::command]` tells Tauri this function can be called from JavaScript
- `window: tauri::Window` gives us access to the application window
- `set_size()` changes the window dimensions
- `map_err()` converts Rust errors into strings JavaScript can understand

### Step 4: Register Your Command

Now we need to tell Tauri about our new command. Update `src-tauri/src/main.rs`:

```rust
fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![greet, resize_window])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

The change: We added `resize_window` to the list of available commands.

### Step 5: Call the Command from JavaScript

In your `src/index.html`, add this JavaScript:

```javascript
async function resizeApp(width, height) {
    try {
        await window.__TAURI__.core.invoke("resize_window", {
            width: width,
            height: height
        });
        console.log(`Window resized to ${width}x${height}`);
    } catch (error) {
        console.error("Failed to resize window:", error);
    }
}

// Example usage:
resizeApp(800, 600);
```

**What's happening here:**
- `window.__TAURI__` is automatically injected by Tauri
- `core.invoke()` calls our Rust command by name
- We pass the parameters as an object
- The `await` keyword waits for the Rust code to finish

### Step 6: Running Your Application

**Development mode:**
```bash
npm run tauri dev
```

This starts your app with:
- **Live reloading**: Changes to HTML/CSS/JS refresh automatically
- **Debug console**: Browser dev tools open automatically
- **Fast startup**: Uses your local development files

**Building for distribution:**
```bash
npm run tauri build
```

This creates:
- **Windows**: `.exe` installer
- **macOS**: `.dmg` disk image
- **Linux**: `.deb` or `.AppImage` package

## Advanced: Automated Building with GitHub Actions

The included `.github/workflows/main.yml` automatically builds your app when you:

1. **Create a git tag** (version number): `git tag v1.0.0`
2. **Push the tag**: `git push origin v1.0.0`

**What the workflow does:**
- **Triggers** on version tags (like `v1.0.0`, `v1.1.0`, etc.)
- **Builds** on Windows, macOS, and Linux simultaneously
- **Installs** required system dependencies automatically
- **Creates** installers for each platform
- **Uploads** everything to a GitHub Release draft

**Why this matters:** You don't need to own three different computers to build for all platforms!

## Common Questions

**Q: Why use Rust instead of Node.js?**
A: Rust is extremely fast and memory-safe, creating tiny applications (5-10MB) compared to Electron apps (100MB+).

**Q: Can I use React/Vue/Svelte instead of vanilla JavaScript?**
A: Yes! Tauri works with any frontend framework. For this tutorial, we use vanilla JS to keep things simple.

**Q: What desktop features can I access?**
A: Windows, menus, file system, notifications, system tray, clipboard, and much more - all through simple Rust commands.

**Q: How do I debug problems?**
A: Use browser dev tools for frontend issues, and Rust's excellent error messages for backend problems.

## Next Steps

Once you understand these basics, try:
- **Adding more commands**: File operations, system notifications, custom menus
- **Integrating a framework**: React, Vue, or Svelte for complex UIs
- **System integration**: Tray icons, auto-start, file associations
- **Distribution**: Publishing to app stores or creating auto-updaters

## Key Takeaways

1. **Tauri bridges web and native**: Write once in web tech, deploy everywhere
2. **Commands are the bridge**: JavaScript calls Rust functions for native features
3. **Tiny and fast**: No bundling a full browser = small, efficient apps
4. **Automated building**: GitHub Actions handle cross-platform compilation

You now understand how Tauri works and can build your own desktop applications!