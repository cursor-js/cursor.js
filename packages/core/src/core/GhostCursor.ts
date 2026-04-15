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

    this.el.style.background = 'none';
    this.el.style.boxShadow = 'none';

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
