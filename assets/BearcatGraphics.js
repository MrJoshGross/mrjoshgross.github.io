/**
 * Wrapper class to make canvas drawing easier + provide targeted functionality for educational purposes
 * @author https://github.com/mrjoshgross
 */
class BearcatGraphics {
    static RADTODEG = Math.PI / 180;
    static STAR_ROTATION_CORRECTION = -18; // determine the correct formula iot not need this

    // Enum of event types that map to their respective (canvas/JS/HTML) event type names 
    static EVENT_TYPES = {
        CLICK: "click",
        DOUBLECLICK: "dblclick",
        DRAG: "drag",
        DRAGSTART: "dragstart",
        DRAGEND: "dragend",
        KEYDOWN: "keydown",
        KEYPRESS: "keypress",
        KEYUP: "keyup",
        WHEEL: "wheel",
        MOUSEENTER: "mouseenter",
        MOUSEMOVE: "mousemove",
        MOUSELEAVE: "mouseleave",
        MOUSEDOWN: "mousedown",
        MOUSEUP: "mouseup",
    };

    /**
     * Creates an instance of the wrapper class that makes canvas drawing operations easier.
     * @param {*} updateFunction    The callback method to execute every frame graphics are to be drawn.
     * @param {*} width             The width of the canvas to create.
     * @param {*} height            The height of the canvas to create.
     * @param {*} canvasName        The id of the canvas to create.  
     */
    constructor(updateFunction, width, height, canvasName) {
        if (width == null) width = 600;
        if (height == null) height = 450;
        if (canvasName == null) canvasName = "Test";
        if (!document.body) this.#createBody();
        this.#buildDebug();
        this.canvas = this.#createCanvas(width, height, canvasName);
        this.setFillColor("white");
        this.setBorderColor("black");
        this.width = width;
        this.height = height;
        this.fontSize = 12;
        this.fontFamily = "Arial";
        this.canvas.textAlign = "center";
        this.canvas.textBaseline = "middle";
        this.canvas.lineWidth = 5;
        this.fps = 60;
        this.mouseX = -1;
        this.mouseY = -1;
        this.time = 0;
        this.days = 1;
        this.years = 1;
        this.timeScale = 10;
        this.debug = true;
        this.setUpdateFunction(updateFunction);
        this.addEventListener(BearcatGraphics.EVENT_TYPES.MOUSEMOVE, (e) => { this.mouseX = this.getMouseX(e); this.mouseY = this.getMouseY(e); });
        this.addEventListener(BearcatGraphics.EVENT_TYPES.MOUSELEAVE, () => { this.mouseX = -1; this.mouseY = -1 });
    }

    /**
     * Creates a div containing debug information such as mouse X and Y coordinates.
     */
    #buildDebug() {
        let div = document.createElement("div");
        div.id = "debug";
        div.style.fontSize = "48px";
        div.style.border = "2px solid black";
        div.style.float = "right";
        document.body.appendChild(div);
    }

    /**
     * Updates mouse X and Y debug information within debug div.
     */
    #handleDebug() {
        if (this.debug && this.mouseX != -1 && this.mouseY != -1)
            document.getElementById("debug").innerHTML = `Mouse x: ${this.mouseX}<br>Mouse y: ${this.mouseY}`;
    }

    /**
     * Creates a canvas element to invoke drawing methods on. 
     * @param {number} width            The width of the canvas to create.
     * @param {number} height           The height of the canvas to create.
     * @param {string} canvasName       The id of the canvas to create.
     * @returns {canvas.getContext}     A 2D canvas context for the created canvas.
     */
    #createCanvas(width, height, canvasName) {
        let canvas = this.#buildCanvas(width, height, canvasName);
        document.body.appendChild(canvas);
        console.log("Created canvas sucessfully!");
        this.canvasElement = document.getElementById(canvasName);
        return this.canvasElement.getContext("2d");
    }

    /**
     * Creates a canvas element to invoke drawing methods on. 
     * @param {number} width        The width of the canvas to create.
     * @param {number} height       The height of the canvas to create.
     * @param {string} canvasName   The id of the canvas to create.
     * @returns {canvas}            A 2D canvas context for the created canvas.
     */
    #buildCanvas(width, height, canvasName) {
        let canvas = document.createElement("canvas");
        canvas.id = canvasName;
        canvas.width = width;
        canvas.height = height;
        canvas.style.border = "4px solid black";
        canvas.innerHTML = "<p> Use a browser that supports canvases! </p>";
        return canvas;
    }

    /**
     * Sets the time in a 24 hour time cycle
     * @param {number} time the time value, between 0 and 2359, to set to
     */
    setTime = (time) => this.time = time;

    /**
     * Sets the time scale of a 24 hour time cycle
     * @param {number} timeScale the amount of minutes that pass in the 24 hour time cycle each real life second; set to negative to reverse time
     */
    setTimeScale = (timeScale) => this.timeScale = timeScale;

    /**
     * Creates HTML body element if it's missing.
     */
    #createBody = () => document.body = document.createElement("body");

    /**
     * @param {string} color either a supported color name or rgb hex
     */
    setFillColor = (color) => this.canvas.fillStyle = color;

    /**
     * @param {Array} arr   an array containing two numbers to indicate line width and spacing,
     *                      or an empty array to indicate a solid line
     */
    setLineDash = (arr) => this.canvas.setLineDash(arr);

    /**
     * @param {string} color either a supported color name or rgb hex
     */
    setBorderColor = (color) => this.canvas.strokeStyle = color;

    /**
     * @param {*} percent a number (between 0 and 1) representing the percentage of opacity to apply
     */
    setOpacity = (percent) => this.canvas.globalAlpha = percent;

    /**
     * @param {number} thickness 
     */
    setLineThickness = (thickness) => this.canvas.lineWidth = thickness;

    /**
     * Overwrites all contents in the canvas with a white fill, black frame rectangle.
     */
    clear() {
        this.setFillColor("white");
        this.setBorderColor("black");
        this.drawRectangle(this.width / 2, this.height / 2, this.width, this.height);
    }

    /**
     * Draws a rectangle with the given information. To change the color, call `setFillColor(color)` or `setBorderColor(color)` beforehand.
     * @param {Number} x                                The X coordinate of the center of the rectangle, between 0 and `canvas.width`, starting from the left edge of the canvas.
     * @param {Number} y                                The Y coordinate of the center of the rectangle, between 0 and `canvas.height`, starting from the top of the canvas.
     * @param {Number} width                            The width of the rectangle. The distance from the (x, y) to the left or right edge of the rectangle is `width/2`.
     * @param {Number} height                           The height of the rectangle. The distance from the (x, y) to the top or bottom edge of the rectangle is `height/2`.
     * @param {*} style                                 The style to apply to the rectangle. Valid values are `FILL`, `FRAME`, and `FILLFRAME`. Default: `FILLFRAME`.
     * @param {Number | RotationAnchor} rotation        Either the amount of degrees to rotate around the center of this rectangle, or a point around which to rotate. See `#rotate` for more information.
     */
    drawRectangle(x, y, width, height, style = FILLFRAME, rotation) {
        if (rotation) this.#rotate(x, y, rotation);
        if (style === FILL) this.canvas.fillRect(x - width / 2, y - height / 2, width, height)
        else if (style === FRAME) this.canvas.strokeRect(x - width / 2, y - height / 2, width, height)
        else if (style === FILLFRAME) {
            this.canvas.strokeRect(x - width / 2, y - height / 2, width, height);
            this.canvas.fillRect(x - width / 2, y - height / 2, width, height);
        } else console.error("Invalid style type: " + style + "; valid style types are FILL, FRAME, and FILLFRAME");
        if (rotation) this.resetCanvasRotation();
    }

    drawSquare = (x, y, length, style = FILLFRAME, rotation) => this.drawRectangle(x, y, length, length, style, rotation);

    drawOval(x, y, xRadius, yRadius, style = FILLFRAME, rotation = 0) {
        if (rotation) this.#rotate(x, y, rotation);
        this.canvas.beginPath();
        this.canvas.ellipse(x, y, xRadius, yRadius, 0, 0, 2 * Math.PI);
        if (style === FILL) this.canvas.fill();
        else if (style === FRAME) this.canvas.stroke();
        else if (style === FILLFRAME) {
            this.canvas.stroke();
            this.canvas.fill();
        }
        else console.error("Invalid style type: " + style + "; valid style types are FILL, FRAME, and FILLFRAME");
        if (rotation) this.resetCanvasRotation();
    }

    drawCircle = (x, y, radius, style = FILLFRAME, rotation) => this.drawOval(x, y, radius, radius, style, rotation);

    drawTriangle = (x, y, length, style = FILLFRAME, rotation) => this.drawEquilateralTriangle(x, y, length, style, rotation);

    drawEquilateralTriangle(x, y, length, style = FILLFRAME, rotation) {
        let h = Math.sqrt(3 * length * length) / 2;
        let p1 = new Point(x - (length / 2), y + (h / 3));
        let p2 = new Point(x, y - (2 * h / 3));
        let p3 = new Point(x + (length / 2), y + (h / 3));
        this.#drawTriangle(x, y, p1, p2, p3, style, rotation);
    }

    drawIsoscelesTriangle(x, y, base, height, style = FILLFRAME, rotation) {
        let p1 = new Point(x - (base / 2), y + (height / 3));
        let p2 = new Point(x, y - (2 * height / 3));
        let p3 = new Point(x + (base / 2), y + (height / 3));
        this.#drawTriangle(x, y, p1, p2, p3, style, rotation);
    }

    drawRightTriangle(x, y, length, style = FILLFRAME, rotation) {
        let p1 = new Point(x - (length / 3), y + (length / 3));
        let p2 = new Point(x - (length / 3), y - (2 * length / 3));
        let p3 = new Point(x + (2 * length / 3), y + (length / 3));
        this.#drawTriangle(x, y, p1, p2, p3, style, rotation);
    }

    drawHexagon(x, y, length, style = FILLFRAME, rotation) {
        let h = Math.sqrt(3 * length * length) / 2;
        if (rotation) this.#rotate(x, y, rotation);
        this.canvas.beginPath();
        this.canvas.moveTo(x - length / 2, y + h);
        this.canvas.lineTo(x + length / 2, y + h);
        this.canvas.lineTo(x + length, y);
        this.canvas.lineTo(x + length / 2, y - h);
        this.canvas.lineTo(x - length / 2, y - h);
        this.canvas.lineTo(x - length, y);
        this.canvas.lineTo(x - length / 2, y + h);
        if (style === FRAME || style === FILLFRAME) this.canvas.lineTo(x + length / 2, y + h); // prevents jagged p1 corner on stroke
        if (style === FILL) this.canvas.fill();
        else if (style === FRAME) this.canvas.stroke();
        else if (style === FILLFRAME) {
            this.canvas.stroke();
            this.canvas.fill();
        }
        else console.error("Invalid style type: " + style + "; valid style types are FILL, FRAME, and FILLFRAME");
        if (rotation) this.resetCanvasRotation();
    }

    drawStar(x, y, length, style = FILLFRAME, rotation, rotateAroundPoint) {
        if (!rotation) rotation = BearcatGraphics.STAR_ROTATION_CORRECTION; // determine the correct formula iot not need this
        let points = [];
        for (let i = 0; i < 5; i++) {
            // outer
            points.push(new Point(x + length * Math.cos(((2 * Math.PI * i) / 5)), y + length * Math.sin(((2 * Math.PI * i) / 5))));

            // inner
            points.push(new Point(x + 2 * length / 5 * Math.cos((2 * Math.PI * i / 5 + Math.PI / 5)), y + 2 * length / 5 * Math.sin((2 * Math.PI * i / 5 + Math.PI / 5))));
        }
        this.drawPolygon(points, style, rotation, rotateAroundPoint);
    }

    drawPolygon(points, style = FILLFRAME, rotation, rotateAroundPoint) {
        if (rotation) {
            let p = rotateAroundPoint === undefined ? this.findCenter(points) : rotateAroundPoint;
            this.#rotate(p.x, p.y, rotation);
        }
        this.canvas.beginPath();
        this.canvas.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++)
            this.canvas.lineTo(points[i].x, points[i].y);
        this.canvas.lineTo(points[0].x, points[0].y);
        if (style === FRAME || style === FILLFRAME) this.canvas.lineTo(points[1].x, points[1].y); // prevents jagged p1 corner on stroke
        if (style === FILL) this.canvas.fill();
        else if (style === FRAME) this.canvas.stroke();
        else if (style === FILLFRAME) {
            this.canvas.stroke();
            this.canvas.fill();
        }
        else console.error("Invalid style type: " + style + "; valid style types are FILL, FRAME, and FILLFRAME");
        if (rotation) this.resetCanvasRotation();
    }

    drawLine(p1, p2, style = FILLFRAME, rotation) {
        if (rotation) this.#rotate((p1.x + p2.x) / 2, (p1.y + p2.y) / 2, rotation);
        this.canvas.beginPath();
        this.canvas.moveTo(p1.x, p1.y);
        this.canvas.lineTo(p2.x, p2.y);
        if (style == FRAME) this.canvas.stroke();
        else if (style == FILL) this.canvas.fill();
        else if (style == FILLFRAME) {
            this.canvas.stroke();
            this.canvas.fill();
        }
        if (rotation) this.resetCanvasRotation();
    }

    findCenter(points) {
        let xAverage = 0;
        let yAverage = 0;
        for (let p of points) {
            xAverage += p.x;
            yAverage += p.y;
        }
        return new Point(xAverage / points.length, yAverage / points.length);
    }

    #drawTriangle(x, y, p1, p2, p3, style, rotation) {
        if (rotation) this.#rotate(x, y, rotation);
        this.canvas.beginPath();
        this.canvas.moveTo(p1.x, p1.y);
        this.canvas.lineTo(p2.x, p2.y);
        this.canvas.lineTo(p3.x, p3.y);
        this.canvas.lineTo(p1.x, p1.y);
        if (style === FRAME || style === FILLFRAME) this.canvas.lineTo(p2.x, p2.y); // prevents jagged p1 corner on stroke
        if (style === FILL) this.canvas.fill();
        else if (style === FRAME) this.canvas.stroke();
        else if (style === FILLFRAME) {
            this.canvas.stroke();
            this.canvas.fill();
        }
        else console.error("Invalid style type: " + style + "; valid style types are FILL, FRAME, and FILLFRAME");
        if (rotation) this.resetCanvasRotation();
    }

    /* 
        #################################
        #################################
        ##### Student-Created Assets ####
        #################################
        #################################
    */

    // adapted from code written by Santiago L, Fall 2023
    drawPerson(x, y, width, height, color, rotation) {
        if (rotation) rotation = { x: x, y: y, amount: rotation };
        if (color) canvas.setFillColor(color);
        canvas.drawRectangle(x, y, width / 2, height, FILLFRAME, rotation);
        canvas.drawRectangle(x - width / 3, y - height / 8, width / 4, 3 * height / 4, FILLFRAME, rotation);
        canvas.drawRectangle(x + width / 3, y - height / 8, width / 4, 3 * height / 4, FILLFRAME, rotation);
        canvas.drawOval(x, y - height, width / 2, height / 2, FILLFRAME, rotation);
        canvas.drawRectangle(x - width / 8, y + 7 * height / 8, width / 4, 3 * height / 4, FILLFRAME, rotation);
        canvas.drawRectangle(x + width / 8, y + 7 * height / 8, width / 4, 3 * height / 4, FILLFRAME, rotation);
    }

    // adapted from code written by Yuddy N, Fall 2023
    drawFoodTruck(x, y, direction, rotation) {
        if (rotation) rotation = { x: x, y: y, amount: rotation };
        if (!direction) direction = RIGHT;
        canvas.setFillColor("white");
        canvas.drawRectangle(x, y, 150, 75, FILLFRAME, rotation);
        canvas.setFillColor("black");
        canvas.drawRectangle(x - (69 * direction), y, 0.5, 70, FILLFRAME, rotation);
        canvas.setFillColor("red");
        canvas.drawCircle(x, y + 5, 20, FILLFRAME, rotation);
        canvas.setFillColor("green");
        canvas.drawCircle(x - (5 * direction), y - 20, 5, FILLFRAME, rotation);
        canvas.setFillColor("brown");
        canvas.drawRectangle(x, y - 15, 2, 5, FILLFRAME, rotation);
        canvas.setFillColor("red");
        canvas.drawRectangle(x + (110 * direction), y + 7, 50, 61, FILLFRAME, rotation);
        canvas.setFillColor("lightblue");
        canvas.drawRectangle(x + (100 * direction), y - 33, 5, 13, FILLFRAME, rotation);
        canvas.drawRectangle(x + (97 * direction), y - 40, 8, 3, FILLFRAME, rotation);
        canvas.setFillColor("lightblue");
        canvas.drawRectangle(x + (120 * direction), y - 2, 25, 23, FILLFRAME, rotation);
        canvas.setFillColor("lightblue");
        canvas.drawRectangle(x + (30 * direction), y + 40, 210, 5, FILLFRAME, rotation);
        canvas.setFillColor("yellow");
        canvas.drawRectangle(x + (130 * direction), y + 23, 5, 5, FILLFRAME, rotation);
        canvas.setFillColor("orange");
        canvas.drawRectangle(x + (130 * direction), y + 30, 5, 5, FILLFRAME, rotation);
        canvas.setFillColor("white");
        canvas.drawRectangle(x + (107 * direction), y + 23, 25, 15, FILLFRAME, rotation);
        canvas.setFillColor("red");
        canvas.drawRectangle(x + (100 * direction), y + 21, 4, 2, FILLFRAME, rotation);
        canvas.setFillColor("brown");
        canvas.drawCircle(x - (55 * direction), y + 55, 15, FILLFRAME, rotation);
        canvas.drawCircle(x - (21 * direction), y + 55, 15, FILLFRAME, rotation);
        canvas.drawCircle(x + (13 * direction), y + 55, 15, FILLFRAME, rotation);
        canvas.drawCircle(x + (85 * direction), y + 55, 14, FILLFRAME, rotation);
        canvas.drawCircle(x + (116 * direction), y + 55, 14, FILLFRAME, rotation);
        canvas.setFillColor("black");
        canvas.drawCircle(x - (55 * direction), y + 55, 1, FILLFRAME, rotation);
        canvas.drawCircle(x - (21 * direction), y + 55, 1, FILLFRAME, rotation);
        canvas.drawCircle(x + (13 * direction), y + 55, 1, FILLFRAME, rotation);
        canvas.drawCircle(x + (85 * direction), y + 55, 1, FILLFRAME, rotation);
        canvas.drawCircle(x + (116 * direction), y + 55, 1, FILLFRAME, rotation);
    }

    drawImage(path, x, y, width, height, rotation) {
        const image = new Image(width, height)
        image.src = path;
        if (rotation) this.#rotate(x, y, rotation);
        this.canvas.drawImage(image, x + width / 2, y + height / 2, width, height);
        if (rotation) this.resetCanvasRotation();
    }

    #rotate(x, y, rotation) {
        if (rotation.x && rotation.y) {
            this.canvas.translate(rotation.x, rotation.y);
            this.canvas.rotate(rotation.amount * BearcatGraphics.RADTODEG);
            this.canvas.translate(-rotation.x, -rotation.y);
        }
        this.canvas.translate(x, y);
        this.canvas.rotate(rotation * BearcatGraphics.RADTODEG);
        this.canvas.translate(-x, -y);
    }

    resetCanvasRotation = () => this.canvas.setTransform(1, 0, 0, 1, 0, 0);

    addEventListener = (type, func) => {
        if (type == BearcatGraphics.EVENT_TYPES.KEYDOWN || type == BearcatGraphics.EVENT_TYPES.KEYPRESS || type == BearcatGraphics.EVENT_TYPES.KEYUP) window.addEventListener(type, func);
        this.canvasElement.addEventListener(type, func);
    }

    getMouseX = (e) => e.x - this.canvasElement.getBoundingClientRect().left;

    getMouseY = (e) => e.y - this.canvasElement.getBoundingClientRect().top;

    mouseIsInScreen = () => this.mouseX > -1 && this.mouseX <= this.width && this.mouseY > -1 && this.mouseY <= this.height;

    setUpdateFunction(func) {
        if (!func) return;
        this.update = () => { this.clear(); this.#calculateTime(); func(); this.#handleDebug() };
        setInterval(this.update, 1000 / this.fps);
    }

    setFontSize(size) {
        this.fontSize = size;
        this.#setFont();
    }

    setFontFamily = (fontFamily) => {
        this.fontFamily = fontFamily;
        this.#setFont();
    }

    drawText(text, x, y, style = FILLFRAME, rotation) {
        if (rotation) this.#rotate(x, y, rotation);
        if (style == FILL)
            this.canvas.fillText(text, x, y);
        else if (style == FRAME)
            this.canvas.strokeText(text, x, y);
        else if (style == FILLFRAME) {
            this.canvas.strokeText(text, x, y);
            this.canvas.fillText(text, x, y);
        }
        else
            console.error("Invalid fill style: " + style + " | Valid fill styles are FILL, FRAME");
        if (rotation) this.resetCanvasRotation();
    }

    drawTimeText(x, y, style = FILLFRAME, rotation) {
        this.drawText(this.getTimeText(), x, y, style, rotation);
    }

    #setFont = () => this.canvas.font = `${this.fontSize}px ${this.fontFamily}`;

    #calculateTime() {
        this.time = (this.time + this.timeScale / this.fps);
        if (this.time >= 2400) {
            this.time -= 2400;
            this.days++;
            if (this.days == 366) {
                this.years++;
                this.days = 1;
            }
        }
        else if (this.time < 0) {
            this.time += 2400;
            this.days--;
            if (this.days == 0) {
                this.years--;
                this.days = 365;
            }
        }
        if (this.time % 100 > 60) {
            if (this.timeScale > 0) this.time += 40;
            else this.time -= 40;
        }
    }

    getTimeText24Hours() {
        return Math.floor((this.time / 100)) + ":" + String(Math.floor((this.time % 100)).toFixed(0)).padStart(2, "0");
    }

    getTimeText() {
        let hours = Math.floor(this.time / 100);
        let minutes = String(Math.floor((this.time % 100)).toFixed(0)).padStart(2, "0");
        let post = "";
        if (hours <= 11) {
            if (hours == 0)
                hours = 12;
            post = "a";
        } else {
            if (hours != 12)
                hours -= 12;
            post = "p";
        }
        return hours + ":" + minutes + post;
    }

    getDays = () => this.days;

    getYears = () => this.years;

    getRandomColor() {
        let r = Math.floor(Math.random() * 255);
        let g = Math.floor(Math.random() * 255);
        let b = Math.floor(Math.random() * 255);
        return "#" + r.toString(16).padStart(2, "0") + g.toString(16).padStart(2, "0") + b.toString(16).padStart(2, "0");
    }

    getRandomDecimal = () => Math.random();

    getRandomDecimal = (max) => Math.random() / (1 / max);

    // exclusive
    getRandomInteger = (max) => Math.floor(Math.random() * max);

    getRandomIntegerInRange = (min, max) => min + this.getRandomInteger(max - min);
}

let COLORS = {
    darkred: "#7D0000",
    red: "#FF0000",
    pink: "#FF9696",
    darkorange: "#A35200",
    orange: "#FF8000",
    lightorange: "#FFB366",
    darkyellow: "#9C9C00",
    yellow: "FFFF00",
    lightyellow: "#FFFF63",
    darkgreen: "#009100",
    green: "#00FF00",
    lightgreen: "#6EFF6E",
    darkblue: "#000082",
    blue: "#0000FF",
    lightblue: "#5E5EFF",
    darkpurple: "#7D0099",
    purple: "#D000FF",
    lightpurple: "#E46BFF",
};

let FILL = -123456789;
let FRAME = 123456789;
let FILLFRAME = 0;
let RIGHT = 1;
let LEFT = -1;

function color(colorString) { return COLORS[colorString]; }

function color(r, g, b) { return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`; }

class RotationAnchor {
    constructor(x, y, rotation) {
        this.x = x;
        this.y = y;
        this.rotation = rotation;
    }
}

class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    distanceTo = (other) => Math.sqrt(((other.y - this.y) * (other.y - this.y)) + ((other.x - this.x) * (other.x - this.x)));
}

class BearcatPlatformer {

    static GRAVITY = 9.81;
    static COLLISION_EPSILON = 10;

    constructor(width = 800, height = 800) {
        this.canvas = new BearcatGraphics(() => this.#update(), width, height);
        this.player = null;
        this.canvas.addEventListener(BearcatGraphics.EVENT_TYPES.KEYDOWN, (e) => { this.handleKeyDown(e, this) });
        this.canvas.addEventListener(BearcatGraphics.EVENT_TYPES.KEYUP, (e) => (this.handleKeyUp(e, this)));
        this.#init();
        this.currentLevel = "Level 1";
    }

    handleKeyDown(e, game) {
        if (e.key === "r" || e.key === "R") game.reloadLevel();
        if (game.player)
            switch (e.key) {
                case " ":
                case "w":
                case "W":
                case "ArrowUp":
                    game.player.jumpKeyDown = true;
                    break;
                case "d":
                case "D":
                case "ArrowRight":
                    game.player.moveRightKeyDown = true;
                    break;
                case "a":
                case "A":
                case "ArrowLeft":
                    game.player.moveLeftKeyDown = true;
                    break;
            }
    }

    handleKeyUp(e, game) {
        switch (e.key) {
            case " ":
            case "w":
            case "W":
            case "ArrowUp":
                game.player.jumpKeyDown = false;
                break;
            case "d":
            case "D":
            case "ArrowRight":
                game.player.moveRightKeyDown = false;
                break;
            case "a":
            case "A":
            case "ArrowLeft":
                game.player.moveLeftKeyDown = false;
                break;
        }
    }

    #init() {
        this.objects = [];
        this.levels = {};
        this.timeSinceGameStart = 0;
        this.timeSinceLevelStart = 0;
        this.score = 0;
        this.scoreEarnedThisLevel = 0;
        this.showScore = true;
        this.showTime = true;
        this.showLevel = true; 
    }

    #update() {
        this.#drawGUI();
        this.#handleLogic();
    }

    setBackgroundFunction(func) {
        this.backgroundFunction = func;
    }

    #drawGUI() {
        if (this.backgroundFunction) this.backgroundFunction();
        this.#drawObjects();
        this.#drawDisplay();
    }

    #drawDisplay() {
        if (this.showScore === true) {
            this.canvas.setFillColor("white");
            this.canvas.setFontSize(20);
            let scoreText = this.scoreEarnedThisLevel !== 0 ? `Score: ${this.score} (+${this.scoreEarnedThisLevel})` : `Score: ${this.score}`;
            this.canvas.drawText(scoreText, 100, 25);
        }
        if (this.showTime === true) {
            let timeText = `Time: ${this.timeSinceLevelStart.toFixed(2)}`;
            this.canvas.drawText(timeText, 400, 25);
        }
        if (this.showLevel === true)
            this.canvas.drawText(this.currentLevel, 600, 25);
    }

    #drawObjects() {
        for (let obj of this.objects) {
            obj.render(canvas);
        }
    }

    #handleLogic() {
        let objsAlreadyCollided = [];
        for (let obj of this.objects) {
            if (obj.collisionType !== GameObject.COLLIDE_STATES.NOCOLLIDE)
                this.#checkForCollisions(obj, objsAlreadyCollided);
            if (obj.update) obj.update(this);
        }
        this.timeSinceLevelStart += 1 / this.canvas.fps;
    }

    #checkForCollisions(obj, objsAlreadyCollided) {
        for (let o of this.objects) {
            if (o === obj || o.collisionType === GameObject.COLLIDE_STATES.NOCOLLIDE) continue;
            if (!objsAlreadyCollided[o])
                objsAlreadyCollided[o] = [];
            if ((!objsAlreadyCollided[o][obj]) && o.inVerticalBounds(obj) && o.inHorizontalBounds(obj)) {
                obj.handleCollision(o);
                o.handleCollision(obj);
                if (!objsAlreadyCollided[obj])
                    objsAlreadyCollided[obj] = [];
                objsAlreadyCollided[o][obj] = 1;
                objsAlreadyCollided[obj][o] = 1;
            }
        }
    }

    createLevel(name, func) {
        this.levels[name] = func;
    }

    reloadLevel() {
        this.scoreEarnedThisLevel = 0;
        this.loadLevel(this.currentLevel);
    }

    loadLevel(name) {
        if (!this.levels[name])
            console.error(`Cannot find level ${name}`);
        else {
            this.objects = [];
            this.player = null;
            if (this.scoreEarnedThisLevel !== 0) {
                this.score += this.scoreEarnedThisLevel;
                this.scoreEarnedThisLevel = 0;
            }
            this.timeSinceLevelStart = 0;
            this.currentLevel = name;
            this.levels[name]();
        }
    }

    addStar(x, y, worth, size) {
        let star = new Star(x, y, size, worth);
        this.objects.push(star);
        return star;
    }

    addDoor(x, y, levelName, width = 30, height = 50, enabled = true) {
        let door = new Door(x, y, width, height, levelName, enabled);
        this.objects.push(door);
        return door;
    }

    addPlayer(x = 25, y = 750, width = 30, height = 30, moveSpeed = 5, jumpHeight = 6, gravity = 1, xVelocity = 0, yVelocity = 0, canMove = true) {
        let player = new Player(this, x, y, width, height, moveSpeed, jumpHeight, gravity, xVelocity, yVelocity, canMove);
        this.player = player;
        this.objects.push(player);
        return player;
    }

    addEnemy(x, y, width = 20, height = 20, movementDirection = Enemy.MOVEMENT_AXES.HORIZONTAL, movementSpeed = 1, maxDistance = 20) {
        let enemy = new Enemy(x, y, width, height, movementDirection, movementSpeed, maxDistance);
        this.objects.push(enemy);
        return enemy;
    }

    addPlatform(x, y, width = 50, height = 20) {
        let platform = new Platform(x, y, width, height);
        this.objects.push(platform);
        return platform;
    }
}

class GameObject {

    static COLLIDE_STATES = {
        COLLIDABLE: 1,
        TRIGGER: 0,
        NOCOLLIDE: -1
    };

    static RENDER_TYPES = {
        COLOR: -123,
        IMAGE: 123
    }

    constructor(x, y, width, height, collisionType = GameObject.COLLIDE_STATES.COLLIDABLE, renderType = GameObject.RENDER_TYPES.COLOR, renderString) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.collisionType = collisionType;
        this.renderType = renderType;
        this.renderString = renderString;
    }

    handleCollision(other) {
        switch (this.collisionType) {
            case GameObject.COLLIDE_STATES.NOCOLLIDE: return;
            case GameObject.COLLIDE_STATES.TRIGGER: this.onTrigger(other); break;
            case GameObject.COLLIDE_STATES.COLLIDABLE: this.onCollision(other); break;
        }
    }

    render(canvas) {
        throw new Error("Must implement 'render' in subclasses!");
    }

    onTrigger() {

    }

    onCollision() {

    }


    isRightOf(other) {
        return this.x - this.width / 2 + BearcatPlatformer.COLLISION_EPSILON >= other.x + other.width / 2 && this.x - this.width / 2 - BearcatPlatformer.COLLISION_EPSILON <= other.x + other.width / 2;
    }

    isLeftOf(other) {
        return this.x + this.width / 2 + BearcatPlatformer.COLLISION_EPSILON >= other.x - other.width / 2 && this.x + this.width / 2 - BearcatPlatformer.COLLISION_EPSILON <= other.x - other.width / 2;
    }

    inHorizontalBounds(other) {
        return this.x + this.width / 2 > other.x - other.width / 2 && this.x - this.width / 2 < other.x + other.width / 2;
    }

    inVerticalBounds(other) {
        return this.y + this.height / 2 > other.y - other.height / 2 && this.y - this.height / 2 < other.y + other.height / 2;
    }

    isBelow(other) {
        return this.y + this.height / 2 >= other.y - other.height / 2 - BearcatPlatformer.COLLISION_EPSILON && this.y + this.height / 2 <= other.y - other.height / 2 + BearcatPlatformer.COLLISION_EPSILON;
    }

    isAbove(other) {
        return this.y - this.height / 2 >= other.y + other.height / 2 - BearcatPlatformer.COLLISION_EPSILON && this.y - this.height / 2 <= other.y + other.height / 2 + BearcatPlatformer.COLLISION_EPSILON;
    }

    distanceTo(other){
        return Math.sqrt((this.x - other.x)*(this.x - other.x)+(this.y - other.y)*(this.y - other.y));
    }
}

class Platform extends GameObject {
    constructor(x, y, width = 30, height = 5, renderType = GameObject.RENDER_TYPES.COLOR, renderString = "BROWN") {
        super(x, y, width, height, GameObject.COLLIDE_STATES.COLLIDABLE, renderType, renderString);
    }

    render(canvas) {
        if (this.renderType === GameObject.RENDER_TYPES.COLOR) {
            if (this.renderString)
                canvas.setFillColor(this.renderString);
            else
                console.warn("Render type set to GameObject.RENDER_TYPES.COLOR but no color was provided.")
            canvas.drawRectangle(this.x, this.y, this.width, this.height);
        }
        else if (this.renderType === GameObject.RENDER_TYPES.IMAGE) {
            // TODO draw image representing this platform
        }
        else
            console.error(`${this.renderType} IS AN INVALID RENDERING TYPE; VALID TYPES ARE: GameObject.RENDER_TYPES.COLOR, GameObject.RENDER_TYPES.IMAGE`);
    }
}

class Star extends GameObject {
    constructor(x, y, size = 30, worth = 100, renderType = GameObject.RENDER_TYPES.COLOR, renderString = "YELLOW") {
        super(x, y, size, size, GameObject.COLLIDE_STATES.TRIGGER, renderType, renderString);
        this.worth = worth;
    }

    onTrigger(other){
        if(other.constructor.name === "Player"){
            other.game.objects.splice(other.game.objects.indexOf(this), 1);
            other.game.scoreEarnedThisLevel += this.worth;
        }
    }

    render(canvas) {
        if (this.renderType === GameObject.RENDER_TYPES.COLOR) {
            if (this.renderString)
                canvas.setFillColor(this.renderString);
            else
                console.warn("Render type set to GameObject.RENDER_TYPES.COLOR but no color was provided.")
            canvas.drawStar(this.x, this.y, this.width / 2);
        }
        else if (this.renderType === GameObject.RENDER_TYPES.IMAGE) {
            // TODO draw image representing this platform
        }
        else
            console.error(`${this.renderType} IS AN INVALID RENDERING TYPE; VALID TYPES ARE: GameObject.RENDER_TYPES.COLOR, GameObject.RENDER_TYPES.IMAGE`);
    }
}

class Enemy extends GameObject {
    static MOVEMENT_TYPES = {
        FORWARD: 1,
        BACKWARD: -1
    };

    static MOVEMENT_AXES = {
        VERTICAL: 1,
        HORIZONTAL: 2,
        INCREASING_DIAGONAL: 3,
        DECREASING_DIAGONAL: 4,
        CIRCLE: 5,
        FOLLOW: 6
    };

    constructor(x, y, width, height, movementAxis, movementSpeed, maxDistance, renderType = GameObject.RENDER_TYPES.COLOR, renderString = "RED") {
        super(x, y, width, height, GameObject.COLLIDE_STATES.COLLIDABLE, renderType, renderString)
        this.movementAxis = movementAxis;
        this.anchorX = x;
        this.anchorY = y;
        this.movementDirection = Enemy.MOVEMENT_TYPES.FORWARD;
        this.movementSpeed = movementSpeed;
        this.maxDistance = maxDistance;
        this.theta = 0;
    }

    onCollision(other){
        if(other.constructor.name === "Player")
            other.game.reloadLevel();
    }

    update(game) {
        switch (this.movementAxis) {
            case Enemy.MOVEMENT_AXES.VERTICAL:
                this.y += this.movementSpeed * this.movementDirection;
                if (Math.abs(this.anchorY - this.y) >= this.maxDistance)
                    this.movementDirection *= -1;
                break;
            case Enemy.MOVEMENT_AXES.HORIZONTAL:
                this.x += this.movementSpeed * this.movementDirection;
                if (Math.abs(this.anchorX - this.x) >= this.maxDistance)
                    this.movementDirection *= -1;
                break;
            case Enemy.MOVEMENT_AXES.INCREASING_DIAGONAL:
                this.x += this.movementSpeed * this.movementDirection;
                this.y -= this.movementSpeed * this.movementDirection;
                let dist = Math.sqrt((this.x - this.anchorX) * (this.x - this.anchorX) + (this.y - this.anchorY) * (this.y - this.anchorY));
                if (dist >= this.maxDistance)
                    this.movementDirection *= -1;
                break;
            case Enemy.MOVEMENT_AXES.DECREASING_DIAGONAL:
                this.x += this.movementSpeed * this.movementDirection;
                this.y += this.movementSpeed * this.movementDirection;
                if (Math.sqrt((this.x - this.anchorX) * (this.x - this.anchorX) + (this.y - this.anchorY) * (this.y - this.anchorY)) >= this.maxDistance)
                    this.movementDirection *= -1;
                break;
            case Enemy.MOVEMENT_AXES.CIRCLE:
                this.x = this.anchorX + this.maxDistance * Math.sin(this.theta);
                this.y = this.anchorY + this.maxDistance * Math.cos(this.theta);
                break;
            case Enemy.MOVEMENT_AXES.FOLLOW:
                if(!game.player) return;
                else if(this.distanceTo(game.player) <= this.maxDistance){
                    let xDir = this.x > game.player.x ? -1 : 1;
                    let yDir = this.y > game.player.y ? -1 : 1;
                    this.x += this.movementSpeed * xDir;
                    this.y += this.movementSpeed * yDir;
                }
                break;
            default:
                console.error(`${this.movementAxis} IS AN INVALID MOVEMENT AXIS; VALID AXES ARE: VERTICAL, HORIZONTAL, INCREASING_DIAGONAL, DECREASING_DIAGONAL, CIRCLE`);
                break;
        }
        this.theta += (this.movementSpeed / 60) % 360;
    }

    render(canvas) {
        if (this.renderType === GameObject.RENDER_TYPES.COLOR) {
            if (this.renderString)
                canvas.setFillColor(this.renderString);
            else
                console.warn("Render type set to GameObject.RENDER_TYPES.COLOR but no color was provided.")
            canvas.drawRectangle(this.x, this.y, this.width, this.height);
        }
        else if (this.renderType === GameObject.RENDER_TYPES.IMAGE) {
            // TODO draw image representing this platform
        }
        else
            console.error(`${this.renderType} IS AN INVALID RENDERING TYPE; VALID TYPES ARE: GameObject.RENDER_TYPES.COLOR, GameObject.RENDER_TYPES.IMAGE`);
    }
}

class Door extends GameObject {
    constructor(x, y, width = 30, height = 50, levelName, enabled = true, renderType = GameObject.RENDER_TYPES.COLOR, renderString = { doorColor: "BROWN", knobColor: "YELLOW" }) {
        super(x, y, width, height, GameObject.COLLIDE_STATES.TRIGGER, renderType, renderString);
        this.levelName = levelName;
        this.enabled = enabled;
    }

    render(canvas) {
        if(this.enabled === false){
            canvas.setFillColor("#00000000");
            canvas.setLineDash([5, 5])
            canvas.drawRectangle(this.x, this.y, this.width * 1.2, this.height * 1.2);
            canvas.setLineDash([])
            canvas.drawCircle(this.x + this.width / 3, this.y, this.width / 8);
        }
        else if (this.renderType === GameObject.RENDER_TYPES.COLOR) {
            if (this.renderString) {
                canvas.setFillColor(this.renderString.doorColor ? this.renderString.doorColor : "BROWN");
                canvas.drawRectangle(this.x, this.y, this.width * 1.2, this.height * 1.2);
                canvas.setFillColor(this.renderString.knobColor ? this.renderString.knobColor : "YELLOW");
                canvas.drawCircle(this.x + this.width / 3, this.y, this.width / 8);
            }
            else
                console.warn("Render type set to GameObject.RENDER_TYPES.COLOR but no color was provided.")
        }
        else if (this.renderType === GameObject.RENDER_TYPES.IMAGE) {
            // TODO draw image representing this platform
        }
        else
            console.error(`${this.renderType} IS AN INVALID RENDERING TYPE; VALID TYPES ARE: GameObject.RENDER_TYPES.COLOR, GameObject.RENDER_TYPES.IMAGE`);
    }

    onTrigger(other) {
        if(this.enabled === false) return;
        if (other.constructor.name === "Player") {
            other.game.loadLevel(this.levelName);
        }
    }
}

class Player extends GameObject {
    constructor(
        game, x = 25, y = 750, width = 30, height = 30, moveSpeed = 5, jumpHeight = 6, gravity = 1, xVelocity = 0, yVelocity = 0, canMove = true, renderType = GameObject.RENDER_TYPES.COLOR, renderString = "green"
    ) {
        super(x, y, width, height, GameObject.COLLIDE_STATES.TRIGGER, renderType, renderString);
        this.game = game;
        this.moveSpeed = moveSpeed;
        this.jumpHeight = jumpHeight;
        this.gravity = gravity;
        this.xVelocity = xVelocity;
        this.yVelocity = yVelocity;
        this.canMove = canMove;
        this.moveLeftKeyDown = false;
        this.moveRightKeyDown = false;
        this.jumpKeyDown = false;
        this.collidingAbove = false;
        this.collidingBelow = false;
        this.collidingLeft = false;
        this.collidingRight = false;
    }

 

    update() {
        this.#handleMovement();
    }

    #handleMovement() {

        // check for collisions
        for (let obj of this.game.objects) {
            if (obj.constructor.name === "Platform") {
                if (this.inHorizontalBounds(obj) && this.inVerticalBounds(obj)) {
                    if (this.isRightOf(obj)) this.collidingLeft = true;
                    else if (this.isLeftOf(obj)) this.collidingRight = true;
                    else if (this.isAbove(obj)) this.collidingAbove = true;
                    else if (this.isBelow(obj)) this.collidingBelow = true;
                }
            }
        }

        this.xVelocity = 0;
        if (!this.canMove) return;
        else if (this.moveLeftKeyDown && !this.collidingLeft) this.xVelocity = -this.moveSpeed;
        else if (this.moveRightKeyDown && !this.collidingRight) this.xVelocity = this.moveSpeed;
        this.x += this.xVelocity;

        if (this.collidingAbove && this.yVelocity > 0)
            this.yVelocity = -this.yVelocity * 0.5;
        if (this.collidingBelow)
            this.yVelocity = 0;
        else
            this.yVelocity -= BearcatPlatformer.GRAVITY / canvas.fps;

        if (this.jumpKeyDown && this.collidingBelow)
            this.yVelocity += this.jumpHeight;
        this.y -= this.yVelocity;

        if(this.y >= this.game.canvas.height + this.game.canvas.height/10)
            this.game.reloadLevel();
        

        this.collidingLeft = false;
        this.collidingRight = false;
        this.collidingAbove = false;
        this.collidingBelow = false;
    }

    render(canvas) {
        canvas.setFillColor(this.renderString);
        canvas.drawRectangle(this.x, this.y, this.width, this.height);
    }

    onCollision(other) {
        switch (other.constructor.name) {
            // case "Platform":
            //     if (this.isRightOf(other)) {
            //         this.collidingLeft = true;
            //     }
            //     if (this.isLeftOf(other)) {
            //         this.collidingRight = true;
            //     }
            //     if (this.isAbove(other)) {
            //         this.y = other.y + other.height / 2 + this.height / 2;
            //         this.collidingAbove = true;
            //     }
            //     if (this.isBelow(other)) {
            //         this.y = other.y - other.height / 2 - this.height / 2;
            //         this.collidingBelow = true;
            //     }
            //     console.log(this.collidingBelow);
            //     break;
            case "Enemy":
                this.game.reloadLevel();
                break;
            case "Door":
                this.game.loadLevel(other.levelName);
                break;
            case "Star":
                this.game.objects.splice(this.game.objects.indexOf(other), 1);
                this.game.scoreEarnedThisLevel += 100;
                break;
        }
    }
}

// DZ was here