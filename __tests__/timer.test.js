import { jest } from "@jest/globals";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { TextDecoder, TextEncoder } from "node:util";

if (!global.TextEncoder) {
    global.TextEncoder = TextEncoder;
}

if (!global.TextDecoder) {
    global.TextDecoder = TextDecoder;
}

let JSDOMClass;

beforeAll(async () => {
    ({ JSDOM: JSDOMClass } = await import("jsdom"));
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const html = fs.readFileSync(
    path.join(__dirname, "..", "src", "index.html"),
    "utf8",
);

async function renderDom() {
    jest.useFakeTimers();

    const dom = new JSDOMClass(html, {
        runScripts: "dangerously",
        resources: "usable",
        url: "http://localhost",
        beforeParse(window) {
            // Prevent Tauri calls during tests
            window.__TAURI__ = null;
            // Use Jest-controlled timers so we can advance time deterministically
            window.setTimeout = setTimeout;
            window.clearTimeout = clearTimeout;
            window.setInterval = setInterval;
            window.clearInterval = clearInterval;
        },
    });

    return dom;
}

describe("Visual Countdown Timer behavior", () => {
    let dom;

    afterEach(() => {
        if (dom) {
            dom.window.close();
            dom = null;
        }
        jest.useRealTimers();
    });

    test("loads with labels visible and preset-m applied", async () => {
        dom = await renderDom();
        const { document } = dom.window;

        expect(document.body.classList.contains("preset-m")).toBe(true);
        expect(document.body.classList.contains("labels-hidden")).toBe(false);
        expect(document.querySelector("svg").getAttribute("viewBox")).toBe(
            "0 0 500 500",
        );
    });

    test("toggling labels updates class and viewBox", async () => {
        dom = await renderDom();
        const { document, toggleLabelVisibility } = dom.window;
        const svg = document.querySelector("svg");

        toggleLabelVisibility();
        expect(document.body.classList.contains("labels-hidden")).toBe(true);
        expect(svg.getAttribute("viewBox")).toBe("40 40 420 420");

        toggleLabelVisibility();
        expect(document.body.classList.contains("labels-hidden")).toBe(false);
        expect(svg.getAttribute("viewBox")).toBe("0 0 500 500");
    });

    test("applying presets keeps other body flags intact", async () => {
        dom = await renderDom();
        const { document, setLabelVisibility, applyPreset } = dom.window;

        setLabelVisibility(false);
        applyPreset("preset-l");

        expect(document.body.classList.contains("preset-l")).toBe(true);
        expect(document.body.classList.contains("labels-hidden")).toBe(true);
    });

    test("creates 60 tick marks and 60 wedges", async () => {
        dom = await renderDom();
        const { document } = dom.window;

        expect(document.querySelectorAll("#tickMarks line")).toHaveLength(60);
        expect(document.querySelectorAll("#tickMarks path")).toHaveLength(60);
    });

    test("minute boundary flashes the corresponding tick", async () => {
        dom = await renderDom();
        const { document, startTimerFromMinute } = dom.window;
        const targetLine = document.querySelector(
            '#tickMarks line[data-minute="1"]',
        );
        const baseWidth = targetLine.getAttribute("stroke-width");

        startTimerFromMinute(2);
        jest.advanceTimersByTime(60000);
        expect(targetLine.getAttribute("stroke")).toBe("#ef4444");

        jest.advanceTimersByTime(350);
        expect(targetLine.getAttribute("stroke")).toBe("#1f2937");
        expect(targetLine.getAttribute("stroke-width")).toBe(baseWidth);
    });
});
