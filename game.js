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

    this.prevControls = getControls();
    this.initialState();
  }
  initializeBoard() {
    this.board = Array(this.rows * this.cols).fill(0);
    for (let x = 0; x < this.cols; x++) {
      for (let y = 0; y < this.rows; y++) {
        const i = y * this.cols + x;
        if (x === 0 || x === this.cols - 1 || y === this.rows - 1) {
          this.board[i] = 1;
        }
      }
    }
  }
  newTetrimino() {
    this.player = {
      x: this.cols / 2 - 1,
      y: 0,
      rotation: 0,
      tetrimino: this.nextTetrimino || sample(tetriminos),
    };
    this.nextTetrimino = sample(tetriminos);
  }
  get tetrisWidth() {
    return (this.width / 100) * 60;
  }
  get width() {
    return this.ctx.canvas.width;
  }
  get height() {
    return this.ctx.canvas.height;
  }
  clear() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.ctx.fillStyle = "#000000";
    this.ctx.fillRect(0, 0, this.width, this.height);
  }
  collide(x, y, rotation) {
    const { tetrimino } = this.player;
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        const px = x + col;
        const py = y + row;
        if (
          tetrimino[this.getTetriminoIndex(col, row, rotation)] !== 0 &&
          this.board[py * this.cols + px]
        ) {
          return true;
        }
      }
    }
  }
  removeFilledRows() {
    let rowsToRemove = [];
    nextline: for (let row = this.rows - 2; row >= 0; row--) {
      for (let col = this.cols - 1; col >= 0; col--) {
        if (this.board[row * this.cols + col] === 0) {
          continue nextline;
        }
      }

      rowsToRemove.push(row);
    }

    const rowsToRemoveCount = rowsToRemove.length;

    if (rowsToRemoveCount) {
      this.state = "removing";
      let row;
      let time = 0;

      while ((row = rowsToRemove.shift())) {
        const r = row;
        time += 100;
        setTimeout(() => {
          // The current row should be removed
          this.board.splice(r * this.cols, this.cols);

          // Prepend a new line at the beginning
          for (let col = 0; col < this.cols; col++) {
            if (col === 0 || col === this.cols - 1) {
              this.board.unshift(1);
            } else {
              this.board.unshift(0);
            }
          }
        }, time);
      }
      setTimeout(() => {
        this.state = "playing";
        this.score += 2 ** rowsToRemoveCount * 10;
      }, time);
    }
  }
  initialState() {
    this.initializeBoard();
    this.newTetrimino();
    this.holdThreshold = 0;
    this.ticks = 0;
    this.state = "playing";
    this.score = 0;
  }
  update() {
    const { prevControls, player } = this;
    const controls = getControls();

    if (this.state === "playing") {
      this.removeFilledRows();

      if (this.collide(player.x, player.y, player.rotation)) {
        this.state = "gameover";
      }

      if (prevControls.start && !controls.start) {
        this.state = "paused";
      } else if (
        controls.left ||
        controls.right ||
        controls.down ||
        controls.rotate
      ) {
        if (this.holdThreshold % 8 === 0) {
          if (controls.left) {
            if (!this.collide(player.x - 1, player.y, player.rotation)) {
              player.x--;
            }
          } else if (controls.right) {
            if (!this.collide(player.x + 1, player.y, player.rotation)) {
              player.x++;
            }
          }
        }

        if (
          this.holdThreshold % 20 === 0 &&
          controls.rotate &&
          !this.collide(player.x, player.y, player.rotation + 1)
        ) {
          player.rotation++;
        }

        if (this.holdThreshold % 4 === 0 && controls.down) {
          if (this.collide(player.x, player.y + 1, player.rotation)) {
            this.lockTetrimino();
            this.newTetrimino();
          } else {
            player.y++;
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
      if (!controls.down && this.ticks % 30 === 0) {
        if (this.collide(player.x, player.y + 1, player.rotation)) {
          this.lockTetrimino();
          this.newTetrimino();
        } else {
          this.player.y++;
        }
      }
    } else if (this.state === "gameover") {
      if (prevControls.start && !controls.start) {
        this.initialState();
      }
    } else if (this.state === "paused") {
      if (prevControls.start && !controls.start) {
        this.state = "playing";
      }
    }

    this.prevControls = controls;
  }
  getTetriminoIndex(col, row, rotation) {
    switch (rotation % 4) {
      case 0:
        return row * 4 + col;
      case 1:
        return 12 + row - 4 * col;
      case 2:
        return 15 - col - 4 * row;
      case 3:
        return 3 - row + 4 * col;
    }
  }
  lockTetrimino() {
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        const { x, y, tetrimino, rotation } = this.player;
        const px = x + col;
        const py = y + row;
        const i = py * this.cols + px;
        const color = tetrimino[this.getTetriminoIndex(col, row, rotation)];
        if (color !== 0) {
          this.board[i] = color;
        }
      }
    }
  }
  renderGameOver() {
    this.ctx.fillStyle = "#ffffff";
    this.ctx.font = "20px Gameplay";
    this.ctx.fillText("GAME OVER", this.tetrisWidth / 2 - 60, this.height / 2);
  }
  renderPaused() {
    this.ctx.fillStyle = "#ffffff";
    this.ctx.font = "20px Gameplay";
    this.ctx.fillText("PAUSED", this.tetrisWidth / 2 - 40, this.height / 2);
  }
  renderScore() {
    const x = this.tetrisWidth + 30;
    const y = 35;
    this.ctx.fillStyle = "#ffffff";
    this.ctx.font = "14px Gameplay";
    this.ctx.fillText("SCORE", x, y);
    this.ctx.fillText(this.score.toString().padStart(8, "0"), x, y + 20);
  }
  renderNextTetrimino() {
    const x = this.tetrisWidth + 30;
    const y = 90;
    this.ctx.fillStyle = "#ffffff";
    this.ctx.font = "14px Gameplay";
    this.ctx.fillText("Next", x, y);

    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        this.renderBlock(
          x,
          y + 20,
          col,
          row,
          this.nextTetrimino[this.getTetriminoIndex(col, row, 0)]
        );
      }
    }
  }
  render() {
    this.renderBoard();
    this.renderPlayer();
    this.renderScore();
    this.renderNextTetrimino();
    if (this.state === "gameover") {
      this.renderGameOver();
    } else if (this.state === "paused") {
      this.renderPaused();
    }
  }
  renderPlayer() {
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        const { x, y, tetrimino, rotation } = this.player;
        this.renderBlock(
          0,
          0,
          x + col,
          y + row,
          tetrimino[this.getTetriminoIndex(col, row, rotation)]
        );
      }
    }
  }
  renderBoard() {
    for (let col = 0; col < this.cols; col++) {
      for (let row = 0; row < this.rows; row++) {
        this.renderBlock(0, 0, col, row, this.board[row * this.cols + col]);
      }
    }
  }
  renderBlock(x, y, col, row, colorIndex) {
    if (colorIndex === 0) return;
    const blockWidth = this.tetrisWidth / this.cols;
    const blockHeight = this.height / this.rows;
    this.ctx.fillStyle = this.colors[colorIndex];
    this.ctx.fillRect(
      x + col * blockWidth,
      y + row * blockHeight,
      blockWidth,
      blockHeight
    );
    this.ctx.fillStyle = "#000000";
    this.ctx.beginPath();
    this.ctx.rect(
      x + col * blockWidth,
      y + row * blockHeight,
      blockWidth,
      blockHeight
    );
    this.ctx.stroke();
  }
  nextFrame() {
    this.clear();
    this.update();
    this.render();
  }
}
