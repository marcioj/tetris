export default class Game {
  constructor(canvas) {
    canvas.style.border = "1px solid black";
    this.ctx = canvas.getContext("2d");
    this.cols = 12;
    this.rows = 22;
    this.board = Array(this.rows * this.cols).fill(0);
    this.colors = ["#ffffff", "#000000"];
    this.forEachBlock((x, y, i) => {
      if (x === 0 || x === this.cols - 1) {
        this.board[i] = 1;
      }
      if (y === 0 || y === this.rows - 1) {
        this.board[i] = 1;
      }
    });
  }
  get width() {
    return this.ctx.canvas.width;
  }
  get height() {
    return this.ctx.canvas.height;
  }
  clear() {
    this.ctx.clearRect(0, 0, this.width, this.height);
  }
  update() {}
  render() {
    this.forEachBlock((x, y, i) => {
      this.renderBlock(x, y, this.board[i]);
    });
  }
  forEachBlock(cb) {
    for (let i = 0; i < this.cols * this.rows; i++) {
      const x = i % this.cols;
      const y = Math.floor(i / this.cols);
      cb(x, y, i);
    }
  }
  renderBlock(x, y, colorIndex) {
    const blockWidth = this.width / this.cols;
    const blockHeight = this.height / this.rows;
    this.ctx.fillStyle = this.colors[colorIndex];
    this.ctx.fillRect(x * blockWidth, y * blockHeight, blockWidth, blockHeight);
  }
  nextFrame() {
    this.clear();
    this.update();
    this.render();
  }
}
