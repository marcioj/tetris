import getControls from "./controls.js";

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function sample(array) {
  return array[rand(0, array.length - 1)];
}

// prettier-ignore
const tetriminos = [
  [
    0, 0, 2, 0,
    0, 2, 2, 0,
    0, 2, 0, 0,
    0, 0, 0, 0,
  ],
  [
    0, 3, 0, 0,
    0, 3, 3, 0,
    0, 0, 3, 0,
    0, 0, 0, 0,
  ],
  [
    0, 4, 4, 0,
    0, 4, 0, 0,
    0, 4, 0, 0,
    0, 0, 0, 0,
  ],
  [
    0, 0, 0, 0,
    0, 5, 5, 0,
    0, 5, 5, 0,
    0, 0, 0, 0,
  ],
  [
    0, 6, 6, 0,
    0, 0, 6, 0,
    0, 0, 6, 0,
    0, 0, 0, 0,
  ],
  [
    0, 0, 7, 0,
    0, 7, 7, 0,
    0, 0, 7, 0,
    0, 0, 0, 0,
  ],
  [
    0, 0, 8, 0,
    0, 0, 8, 0,
    0, 0, 8, 0,
    0, 0, 8, 0,
  ]
]

export default class Game {
  constructor(canvas) {
    canvas.style.border = "1px solid black";
    this.ctx = canvas.getContext("2d");
    this.cols = 12;
    this.rows = 22;
    this.board = Array(this.rows * this.cols).fill(0);
    this.colors = [
      null,
      "#666666",
      "#ff0000",
      "#00ff00",
      "#0000ff",
      "#ffff00",
      "#ffa500",
      "#800080",
      "#00ffff",
    ];

    for (let x = 0; x < this.cols; x++) {
      for (let y = 0; y < this.rows; y++) {
        const i = y * this.cols + x;
        if (x === 0 || x === this.cols - 1 || y === this.rows - 1) {
          this.board[i] = 1;
        }
      }
    }

    this.newTetrimino();
    this.prevControls = getControls();
    this.holdThreshold = 0;
    this.ticks = 0;
    this.state = "playing";
  }
  newTetrimino() {
    this.player = {
      x: this.cols / 2 - 1,
      y: 0,
      rotation: 0,
      tetrimino: sample(tetriminos),
    };
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
  collide(x, y, rotation) {
    const { tetrimino } = this.player;
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        const px = x + col;
        const py = y + row;
        if (
          tetrimino[this.rotate(col, row, rotation)] !== 0 &&
          this.board[py * this.cols + px]
        ) {
          return true;
        }
      }
    }
  }
  removeFilledLines() {
    nextline: for (let row = this.rows - 2; row >= 0; row--) {
      for (let col = this.cols - 1; col >= 0; col--) {
        if (this.board[row * this.cols + col] === 0) {
          continue nextline;
        }
      }

      // The current row should be removed
      this.board.splice(row * this.cols, this.cols);

      // Prepend a new line at the beginning
      for (let col = 0; col < this.cols; col++) {
        if (col === 0 || col === this.cols - 1) {
          this.board.unshift(1);
        } else {
          this.board.unshift(0);
        }
      }
    }
  }
  update() {
    const { prevControls, player } = this;
    const controls = getControls();

    if (this.state === "playing") {
      this.removeFilledLines();

      if (this.collide(player.x, player.y, player.rotation)) {
        this.state = "gameover";
        return;
      }

      if (controls.left || controls.right || controls.down || controls.rotate) {
        if (this.holdThreshold % 5 === 0) {
          if (controls.left) {
            if (!this.collide(player.x - 1, player.y, player.rotation)) {
              player.x--;
            }
          } else if (controls.right) {
            if (!this.collide(player.x + 1, player.y, player.rotation)) {
              player.x++;
            }
          } else if (controls.down) {
            if (this.collide(player.x, player.y + 1, player.rotation)) {
              this.lockTetrimino();
              this.newTetrimino();
            } else {
              player.y++;
            }
          }
        }
        if (this.holdThreshold % 10 === 0) {
          if (controls.rotate) {
            if (!this.collide(player.x, player.y, player.rotation + 1)) {
              player.rotation++;
            }
          }
        }
        this.holdThreshold++;
      }

      if (
        (prevControls.left && !controls.left) ||
        (prevControls.right && !controls.right) ||
        (prevControls.down && !controls.down) ||
        (prevControls.start && !controls.start) ||
        (prevControls.rotate && !controls.rotate)
      ) {
        this.holdThreshold = 0;
      }

      this.ticks++;
      if (this.ticks % 30 === 0) {
        if (this.collide(player.x, player.y + 1, player.rotation)) {
          this.lockTetrimino();
          this.newTetrimino();
        } else {
          this.player.y++;
        }
      }

      this.prevControls = controls;
    }
  }
  lockTetrimino() {
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        const { x, y, tetrimino, rotation } = this.player;
        const px = x + col;
        const py = y + row;
        const i = py * this.cols + px;
        const color = tetrimino[this.rotate(col, row, rotation)];
        if (color !== 0) {
          this.board[i] = color;
        }
      }
    }
  }
  renderGameOver() {
    this.ctx.fillStyle = "#000000";
    this.ctx.font = "20px Gameplay";
    this.ctx.fillText("Game Over", this.width / 2 - 60, this.height / 2);
  }
  render() {
    this.renderBoard();
    this.renderPlayer();
    if (this.state === "gameover") {
      this.renderGameOver();
    }
  }
  renderPlayer() {
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        const { x, y, tetrimino, rotation } = this.player;
        this.renderBlock(
          x + col,
          y + row,
          tetrimino[this.rotate(col, row, rotation)]
        );
      }
    }
  }
  rotate(x, y, rotation) {
    switch (rotation % 4) {
      case 0:
        return y * 4 + x;
      case 1:
        return 12 + y - 4 * x;
      case 2:
        return 15 - x - 4 * y;
      case 3:
        return 3 - y + 4 * x;
    }
  }
  renderBoard() {
    for (let col = 0; col < this.cols; col++) {
      for (let row = 0; row < this.rows; row++) {
        this.renderBlock(col, row, this.board[row * this.cols + col]);
      }
    }
  }
  renderBlock(x, y, colorIndex) {
    if (colorIndex === 0) return;
    const blockWidth = this.width / this.cols;
    const blockHeight = this.height / this.rows;
    this.ctx.fillStyle = this.colors[colorIndex];
    this.ctx.fillRect(x * blockWidth, y * blockHeight, blockWidth, blockHeight);
    this.ctx.fillStyle = "#000000";
    this.ctx.beginPath();
    this.ctx.rect(x * blockWidth, y * blockHeight, blockWidth, blockHeight);
    this.ctx.stroke();
  }
  nextFrame() {
    this.clear();
    this.update();
    this.render();
  }
}
