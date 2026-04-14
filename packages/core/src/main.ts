import "./style.css";
import { Cursor } from "./index";

// Demo target DOM elements
const btn1 = document.getElementById("btn1") as HTMLButtonElement;
const btn1Text = document.getElementById("btn1-text") as HTMLParagraphElement;  

const btn2 = document.getElementById("btn2") as HTMLButtonElement;
const btn2Text = document.getElementById("btn2-text") as HTMLParagraphElement;  

const input1 = document.getElementById("input1") as HTMLInputElement;

btn1?.addEventListener("click", (e) => {
  console.log("Btn1 clicked!", e);
  btn1Text.innerText = `Clicked! (Real X: ${e.clientX}, Y: ${e.clientY})`;   
  btn1Text.style.color = "#42b983";
});

btn2?.addEventListener("click", () => {
  btn2Text.innerText = `Deep Button Clicked!`;
  btn2Text.style.color = "#42b983";
});

input1?.addEventListener("input", (e) => {
  console.log("Native Input event:", (e.target as HTMLInputElement).value);     
});

// START ACTOR DEMO...
const actor = new Cursor({ humanize: true, speed: 0.5, showIndicator: true });   

async function runDemo() {
  // Reset demo statuses
  btn1Text.innerText = "Demo started. Cursor incoming...";
  btn1Text.style.color = "#666";
  btn2Text.innerText = "Not clicked yet.";
  btn2Text.style.color = "#666";
  input1.value = "";

  // 1. Enqueue virtual moves and implicitly await execution
  await actor.wait(1000); // Small delay before start

  await actor
    .hover("#btn1") // Hover to the first button (humanized ease curves)
    .wait(600) // Wait briefly on hover
    .click("#btn1") // Trigger click
    .wait(1000) // Wait so we can read it
    .type("#input1", "Hello World! Cursor.js in action...", {
      delay: 50,
    } as any) // Type text into input with human-like typing
    .wait(1500)
    .hover("#btn2") // Scroll to deep out-of-view button (scrollIntoView triggered)
    .wait(800)
    .click("#btn2"); // Click the bottom button

  console.log("Demo Task Successfully Completed!");
}

// Start Button injected into demo view
const startBtn = document.createElement("button");
startBtn.innerText = "▶ Start Demo";
startBtn.style.cssText = `
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
  padding: 12px 24px;
  background: #ff4757;
  color: white;
  border: none;
  cursor: pointer;
  border-radius: 8px;
  font-weight: bold;
  font-size: 16px;
  box-shadow: 0 4px 10px rgba(255, 71, 87, 0.4);
`;

document.body.appendChild(startBtn);

startBtn.addEventListener("click", () => {
  runDemo();
  startBtn.innerText = "⏳ Demo Running...";
  startBtn.disabled = true;
  startBtn.style.background = "#ccc";

  setTimeout(() => {
    startBtn.innerText = "▶ Restart Demo";
    startBtn.disabled = false;
    startBtn.style.background = "#ff4757";
  }, 9000); // Demo completion length avg
});
