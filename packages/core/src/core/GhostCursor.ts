export interface GhostCursorOptions {
  showIndicator?: boolean;
}

export class GhostCursor {
  public el: HTMLDivElement;
  public indicator: HTMLDivElement;
  public x: number = 0;
  public y: number = 0;
  private showIndicator: boolean;

  constructor(options: GhostCursorOptions = {}) {
    this.showIndicator = options.showIndicator || false;

    this.el = document.createElement("div");
    this.el.style.cssText = `
      position: absolute;
      top: 0; left: 0;
      width: 20px; height: 20px;
      background: radial-gradient(circle at center, rgba(0, 0, 0, 0.8) 0%, rgba(255, 255, 255, 0.2) 100%);
      border-radius: 50%;
      pointer-events: none;
      z-index: 999999;
      transform: translate(-50%, -50%);
      transition: transform 0.05s linear;
      box-shadow: 0 0 10px rgba(0,0,0,0.5);
    `;

    // Default SVG GhostCursor design can go here
    this.el.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M5.5 3L18.5 16H10.5L7 21L5.5 3Z" fill="white" stroke="black" stroke-width="1.5" stroke-linejoin="round"/>
    </svg>`;

    this.el.style.background = "none";
    this.el.style.boxShadow = "none";

    document.body.appendChild(this.el);

    this.indicator = document.createElement("div");
    this.indicator.style.cssText = `
      position: fixed;
      width: 40px; height: 6px;
      background: #ff4757;
      border-radius: 4px;
      pointer-events: none;
      z-index: 999998;
      opacity: 0;
      transition: opacity 0.2s, transform 0.1s linear;
      transform: translateX(-50%);
      box-shadow: 0 0 8px rgba(255, 71, 87, 0.6);
    `;
    document.body.appendChild(this.indicator);

    window.addEventListener("scroll", this.updateIndicator);
    window.addEventListener("resize", this.updateIndicator);
  }

  private updateIndicator = () => {
    if (!this.showIndicator) return;

    // Calculate viewport relative positions
    const scrollY = window.scrollY;
    const scrollX = window.scrollX;
    const vHeight = window.innerHeight;
    const vWidth = window.innerWidth;

    const clientY = this.y - scrollY;
    const clientX = this.x - scrollX;

    let isVisible = false;

    if (clientY < 0) {
      // GhostCursor is above the viewport
      this.indicator.style.top = "6px";
      this.indicator.style.bottom = "auto";
      this.indicator.style.left = `${Math.max(20, Math.min(vWidth - 20, clientX))}px`;
      isVisible = true;
    } else if (clientY > vHeight) {
      // GhostCursor is below the viewport
      this.indicator.style.top = "auto";
      this.indicator.style.bottom = "6px";
      this.indicator.style.left = `${Math.max(20, Math.min(vWidth - 20, clientX))}px`;
      isVisible = true;
    }

    this.indicator.style.opacity = isVisible ? "1" : "0";
  };

  moveTo(pageX: number, pageY: number) {
    this.x = pageX;
    this.y = pageY;
    // position relative to document page
    this.el.style.transform = `translate(${pageX}px, ${pageY}px)`;
    this.updateIndicator();
  }

  destroy() {
    if (this.el && this.el.parentNode) {
      this.el.parentNode.removeChild(this.el);
    }
    if (this.indicator && this.indicator.parentNode) {
      this.indicator.parentNode.removeChild(this.indicator);
    }
    window.removeEventListener("scroll", this.updateIndicator);
    window.removeEventListener("resize", this.updateIndicator);
  }
}
