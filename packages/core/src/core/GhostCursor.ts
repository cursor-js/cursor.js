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
      margin-top: -8px;
      margin-left: -8px;
      width: 16px; height: 16px;
      border-radius: 50%;
      background: rgba(0, 0, 0, 0.5);
      pointer-events: none;
      z-index: 999999;
      transform-origin: center center;
      transition: transform 0.05s linear;
    `;

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
