export interface GhostCursorOptions {}

export class GhostCursor {
  public el: HTMLDivElement;
  public x: number = 0;
  public y: number = 0;
  public scale: number = 1;

  constructor(_options: GhostCursorOptions = {}) {
    this.el = document.createElement('div');
    this.el.style.cssText = `
      position: absolute;
      top: 0; left: 0;
      width: 24px; height: 24px;
      pointer-events: none;
      z-index: 999999;
      transform-origin: top left;
      transition: transform 0.05s linear;
    `;

    // Default SVG GhostCursor design
    this.el.innerHTML = `<svg width="24" height="24" viewBox="-1 -1 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M0 0 L 13 13 H 5 L 1.5 18 L 0 0 Z" fill="white" stroke="black" stroke-width="1.5" stroke-linejoin="round"/>
    </svg>`;

    document.body.appendChild(this.el);
  }

  setSize(scale: number) {
    this.scale = scale;
    this.el.style.transform = `translate(${this.x}px, ${this.y}px) scale(${this.scale})`;
  }

  moveTo(pageX: number, pageY: number) {
    this.x = pageX;
    this.y = pageY;
    // position relative to document page
    this.el.style.transform = `translate(${pageX}px, ${pageY}px) scale(${this.scale})`;
  }

  destroy() {
    if (this.el && this.el.parentNode) {
      this.el.parentNode.removeChild(this.el);
    }
  }
}
