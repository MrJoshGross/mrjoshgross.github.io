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
        this.rawTime = 0;
        this.days = 1;
        this.years = 1;
        this.timeScale = 10;
        this.debug = true;
        this.intervalID = -1;
        this.setUpdateFunction(updateFunction);
        this.addEventListener(BearcatGraphics.EVENT_TYPES.MOUSEMOVE, (e) => { this.mouseX = this.getMouseX(e); this.mouseY = this.getMouseY(e); });
        this.addEventListener(BearcatGraphics.EVENT_TYPES.MOUSELEAVE, () => { this.mouseX = -1; this.mouseY = -1 });
    }

    setFPS = (fps) => {
        this.fps = fps;
        clearInterval(this.intervalID);
        this.intervalID = setInterval(this.update, 1000 / this.fps);
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
     * @param {string} color either a supported color name or rgb hex
     */
    setBorderColor = (color) => this.canvas.strokeStyle = color;

    setColors = (color) => { this.setFillColor(color); this.setBorderColor(color) };

    /**
     * @param {Array} arr   an array containing two numbers to indicate line width and spacing,
     *                      or an empty array to indicate a solid line
     */
    setLineDash = (arr) => this.canvas.setLineDash(arr);

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

    drawPoint = (x, y) => {
        this.canvas.fillRect(x, y, 1, 1);
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

    dibujaRectangulo = (x, y, width, height, style, rotation) => this.drawRectangle(x, y, width, height, style, rotation);

    drawSquare = (x, y, length, style = FILLFRAME, rotation) => this.drawRectangle(x, y, length, length, style, rotation);

    dibujaCuadrado = (x, y, length, style = FILLFRAME, rotation) => this.drawSquare(x, y, length, style, rotation);

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

    dibujaOval = (x, y, xRadius, yRadius, style, rotation) => this.drawOval(x, y, xRadius, yRadius, style, rotation);

    drawCircle = (x, y, radius, style = FILLFRAME, rotation) => this.drawOval(x, y, radius, radius, style, rotation);

    drawHalfCircle = (x, y, radius, isTopHalf = true, style = FILLFRAME, rotation = 0) => {
        if (rotation) this.#rotate(x, y, rotation);
        this.canvas.beginPath();
        this.canvas.moveTo(x - radius, y);
        this.canvas.arc(x, y, radius, 0, Math.PI, isTopHalf);
        if (style === FRAME || style === FILLFRAME) this.canvas.lineTo(x + radius, y);
        if (style === FILL) this.canvas.fill();
        else if (style === FRAME) this.canvas.stroke();
        else if (style === FILLFRAME) {
            this.canvas.stroke();
            this.canvas.fill();
        }
        if (rotation) this.resetCanvasRotation();
    }

    dibujaCirculo = (x, y, radius, style = FILLFRAME, rotation) => this.drawCircle(x, y, radius, style, rotation);

    drawTriangle = (x, y, length, style = FILLFRAME, rotation) => this.drawEquilateralTriangle(x, y, length, style, rotation);

    dibujaTriangulo = (x, y, length, style, rotation) => this.drawTriangle(x, y, length, style, rotation);

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

    dibujaHexagono = (x, y, length, style, rotation) => this.drawHexagon(x, y, length, style, rotation);

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

    dibujaEstrella = (x, y, length, style, rotation, rotateAroundPoint) => this.drawStar(x, y, length, style, rotation, rotateAroundPoint);

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

    dibujaPoligono = (points, style, rotation, rotateAroundPoint) => this.drawPolygon(points, style, rotation, rotateAroundPoint);

    drawLine(p1, p2, style = FILLFRAME, rotation) {
        if (rotation) this.#rotate((p1.x + p2.x) / 2, (p1.y + p2.y) / 2, rotation);
        this.canvas.beginPath();
        this.canvas.moveTo(p1.x, p1.y);
        this.canvas.lineTo(p2.x, p2.y);
        if (style === FRAME) this.canvas.stroke();
        else if (style === FILL) this.canvas.fill();
        else if (style === FILLFRAME) {
            this.canvas.stroke();
            this.canvas.fill();
        }
        if (rotation) this.resetCanvasRotation();
    }

    dibujaLinea = (p1, p2, style, rotation) => this.drawLine(p1, p2, style, rotation);

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

    dibujaPersona = (x, y, width, height, color, rotation) => this.drawPerson(x, y, width, height, color, rotation);

    // adapted from code written by Santiago L, Fall 2023
    drawMrGross(x = 200, y = 580, widthPercent = 1, heightPercent = 1) {
        canvas.translate(x, y);
        canvas.scale(widthPercent, heightPercent);
        canvas.setFillColor("black");
        canvas.drawRectangle(0, 0, 45, 90);
        canvas.setFontSize(15);
        canvas.setFillColor("white");
        canvas.drawRectangle(-30, -15, 17, 60);
        canvas.drawRectangle(30, -15, 17, 60);
        canvas.setFillColor("black");
        canvas.drawSquare(-30, -35, 17);
        canvas.drawSquare(30, -35, 17);
        canvas.setFillColor("white");
        canvas.drawCircle(0, -45, 15,);
        canvas.drawCircle(0, -80, 40);
        canvas.drawText("FEAR", 0, -5);
        canvas.drawSquare(-15, -85, 15);
        canvas.drawSquare(15, -85, 15);
        canvas.drawLine({ x: -7, y: -86 }, { x: 5, y: -86 });
        canvas.drawLine({ x: -35, y: -102 }, { x: -23, y: -91 });
        canvas.drawLine({ x: 36, y: -102 }, { x: 24, y: -90 });
        canvas.setFillColor("black");
        canvas.drawCircle(-15, -85, 1);
        canvas.drawCircle(15, -85, 1);
        canvas.drawRectangle(-13, 74, 19, 55);
        canvas.drawRectangle(13, 74, 19, 55);
        canvas.setFillColor(color(80, 90, 37));
        canvas.drawRectangle(0, 30, 46, 10);
        canvas.drawRectangle(0, 30, 6, 10);
        canvas.drawLine({ x: -7, y: -60 }, { x: 8, y: -60 });
        canvas.resetCanvasRotation();
    }

    dibujaSrGross = (x, y, widthPercent, heightPercent) => this.drawMrGross(x, y, widthPercent, heightPercent);

    // adapted from code written by Yuddy N, Fall 2023
    drawFoodTruck(x, y, direction = RIGHT, rotation, widthPercent = 1, heightPercent = 1) {
        canvas.canvas.translate(x, y);
        canvas.canvas.scale(widthPercent, heightPercent);
        if (rotation) rotation = { x: 0, y: 0, amount: rotation };
        canvas.setBorderColor("black");
        canvas.setFillColor("white");
        canvas.drawRectangle(0, 0, 150, 75, FILLFRAME, rotation);
        canvas.setFillColor("black");
        canvas.drawRectangle(-(69 * direction), 0, 0.5, 70, FILLFRAME, rotation);
        canvas.setFillColor("red");
        canvas.drawCircle(0, 5, 20, FILLFRAME, rotation);
        canvas.setFillColor("green");
        canvas.drawCircle(-(5 * direction), -20, 5, FILLFRAME, rotation);
        canvas.setFillColor("brown");
        canvas.drawRectangle(0, -15, 2, 5, FILLFRAME, rotation);
        canvas.setFillColor("red");
        canvas.drawRectangle((110 * direction), 7, 50, 61, FILLFRAME, rotation);
        canvas.setFillColor("lightblue");
        canvas.drawRectangle((100 * direction), -33, 5, 13, FILLFRAME, rotation);
        canvas.drawRectangle((97 * direction), -40, 8, 3, FILLFRAME, rotation);
        canvas.setFillColor("lightblue");
        canvas.drawRectangle((120 * direction), -2, 25, 23, FILLFRAME, rotation);
        canvas.setFillColor("lightblue");
        canvas.drawRectangle((30 * direction), 40, 210, 5, FILLFRAME, rotation);
        canvas.setFillColor("yellow");
        canvas.drawRectangle((130 * direction), 23, 5, 5, FILLFRAME, rotation);
        canvas.setFillColor("orange");
        canvas.drawRectangle((130 * direction), 30, 5, 5, FILLFRAME, rotation);
        canvas.setFillColor("white");
        canvas.drawRectangle((107 * direction), 23, 25, 15, FILLFRAME, rotation);
        canvas.setFillColor("red");
        canvas.drawRectangle((100 * direction), 21, 4, 2, FILLFRAME, rotation);
        canvas.setFillColor("brown");
        canvas.drawCircle(-(55 * direction), 55, 15, FILLFRAME, rotation);
        canvas.drawCircle(-(21 * direction), 55, 15, FILLFRAME, rotation);
        canvas.drawCircle((13 * direction), 55, 15, FILLFRAME, rotation);
        canvas.drawCircle((85 * direction), 55, 14, FILLFRAME, rotation);
        canvas.drawCircle((116 * direction), 55, 14, FILLFRAME, rotation);
        canvas.setFillColor("black");
        canvas.drawCircle(-(55 * direction), 55, 1, FILLFRAME, rotation);
        canvas.drawCircle(-(21 * direction), 55, 1, FILLFRAME, rotation);
        canvas.drawCircle((13 * direction), 55, 1, FILLFRAME, rotation);
        canvas.drawCircle((85 * direction), 55, 1, FILLFRAME, rotation);
        canvas.drawCircle((116 * direction), 55, 1, FILLFRAME, rotation);
        canvas.resetCanvasRotation();
    }

    dibujaCamionDeComida = (x, y, direction = RIGHT, rotation, widthPercent, heightPercent) => this.drawFoodTruck(x, y, direction, rotation, widthPercent, heightPercent);

    // adapted from code written by Cristian I, Fall 2023
    drawSoccerBall(x, y, scalePercent = 1) {
        canvas.canvas.translate(x, y);
        canvas.canvas.scale(scalePercent, scalePercent);
        canvas.setFillColor("white")
        canvas.drawCircle(0, 0, 25);
        canvas.setFillColor("black");
        canvas.drawHexagon(0, 0, 4, FILLFRAME);
        canvas.drawHexagon(-10, 17, 4, FILLFRAME);
        canvas.drawHexagon(15, 15, 4, FILLFRAME);
        canvas.drawHexagon(-20, -5, 4, FILLFRAME);
        canvas.drawHexagon(20, -5, 4, FILLFRAME);
        canvas.drawHexagon(0, -20, 4, FILLFRAME);
        canvas.resetCanvasRotation();
    }

    dibujaBalonDeFutbol = (x, y, scalePercent) => this.drawSoccerBall(x, y, scalePercent);

    // adapted from code written by Cristian I, Fall 2023
    drawPizza(x, y, scalePercent = 1, showToppings = true) {
        canvas.canvas.translate(x, y);
        canvas.canvas.scale(scalePercent, scalePercent);
        canvas.setFillColor("tan");
        canvas.drawTriangle(0, 0, 45);
        canvas.setFillColor("red");
        canvas.drawTriangle(0, -5, 30);
        canvas.setFillColor("yellow");
        canvas.drawTriangle(0, -10, 30);
        if (showToppings) {
            canvas.setFillColor("red");
            canvas.drawCircle(5, -7, 2);
            canvas.drawCircle(0, -19, 2);
            canvas.drawCircle(-5, -10, 2);
        }
        canvas.resetCanvasRotation();
    }

    translate(x, y) {
        this.canvas.translate(x, y);
    }

    scale(widthScale, heightScale) {
        this.canvas.scale(widthScale, heightScale);
    }

    drawImage(path, x, y, width, height, rotation) {
        const image = new Image(width, height)
        image.src = path;
        if (rotation) this.#rotate(x, y, rotation);
        this.canvas.drawImage(image, x - width / 2, y - height / 2, width, height);
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
        this.intervalID = setInterval(this.update, 1000 / this.fps);
    }

    setFontTotally(color, size, fontFamily) {
        this.setColors(color);
        if (size) this.setFontSize(size);
        if (fontFamily) this.setFontFamily(fontFamily);
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
        this.rawTime = (this.rawTime + this.timeScale / this.fps);
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

function color(colorString) { return COLORS[colorString]; }

function colorRGB(r, g, b) {
    if (r < 0) r = 0; else if (r > 255) r = 255;
    if (g < 0) g = 0; else if (g > 255) g = 255;
    if (b < 0) b = 0; else if (b > 255) b = 255;
    return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

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
    static COLLISION_EPSILON_X = 0;
    static COLLISION_EPSILON_Y = 10;

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

    static DEFAULT_IMAGE_RENDER_STRINGS_PATH = "./Bearcat Platformer Assets/images/";

    constructor(width = 800, height = 800) {
        this.canvas = new BearcatGraphics(() => this.#update(), width, height);
        this.player = null;
        this.canvas.addEventListener(BearcatGraphics.EVENT_TYPES.KEYDOWN, (e) => { this.handleKeyDown(e, this) });
        this.canvas.addEventListener(BearcatGraphics.EVENT_TYPES.KEYUP, (e) => (this.handleKeyUp(e, this)));
        this.#init();
        this.currentLevel = "Level 1";
        this.createLevel("Game Over", createGameOverScreenLevel);
        this.createLevel("Victory", createVictoryScreenLevel);
    }



    enableLivesSystem() {
        this.livesEnabled = true;
    }
    enableCountDownSystem() {
        this.countDownEnabled = true;
    }

    toggleAirResistance() {
        this.airResistanceEnabled = !this.airResistanceEnabled;
    }

    setLineThickness(thickness) {
        this.canvas.setLineThickness(thickness);
        BearcatPlatformer.VERTICAL_COLLISION_EPSILON = thickness;
        BearcatPlatformer.HORIZONTAL_COLLISION_EPSILON = thickness;
    }
    destroy(obj) {
        if (this.objects.includes(obj)) {
            this.objects.splice(this.objects.indexOf(obj), 1);
            this.collisions.removeAll(obj);
            if (obj.onDestroy)
                obj.onDestroy();
        }
        else
            console.error("Attempting to delete object ", obj, "but it isn't in the list of objects in this level.");
    }

    clearCurrentLevelExceptPlayer = () => this.objects = [this.player];

    handleKeyDown(e, game) {
        if (e.key === "r" || e.key === "R") game.reloadLevel();
        if (game.player)
            switch (e.key) {
                case " ":
                case "w":
                case "W":
                case "ArrowUp":
                    game.player.jumpKeyDown = true;
                    game.player.jumpKeyCount++;
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
                case "s":
                case "S":
                case "ArrowDown":
                    game.player.moveDownKeyDown = true;
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
            case "s":
            case "S":
            case "ArrowDown":
                game.player.moveDownKeyDown = false;
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
        this.active = true;
        this.collisions = new CollisionMap();
        this.livesEnabled = false;
        this.countDownEnabled = false;
        this.lives = 5;
        this.airResistanceEnabled = false;
        this.airResistanceCoefficient = 0.99;
    }

    #update() {
        if (this.active === false) return;
        this.#drawGUI();
        this.#handleLogic();
    }

    setBackgroundFunction(func) {
        this.backgroundFunction = func;
    }

    setForegroundFunction(func) {
        this.foregroundFunction = func;
    }

    #drawGUI() {
        if (this.backgroundFunction) this.backgroundFunction();
        this.#drawObjects();
        this.#drawDisplay();
        if (this.foregroundFunction) this.foregroundFunction();
    }

    #drawDisplay() {
        if (this.showScore) {
            this.canvas.setFillColor("white");
            this.canvas.setFontSize(20);
            let scoreText = this.scoreEarnedThisLevel !== 0 ? `Score: ${this.score} (+${this.scoreEarnedThisLevel})` : `Score: ${this.score}`;
            this.canvas.drawText(scoreText, 75, 25);
        }
        if (this.showTime) {
            let timeText = `Time: ${this.timeSinceLevelStart.toFixed(2)}`;
            this.canvas.drawText(timeText, 250, 25);
        }
        if (this.showLevel)
            this.canvas.drawText(this.currentLevel, 600, 25);
        if (this.livesEnabled)
            this.canvas.drawText(`Lives: ${this.lives}`, 425, 25);
    }

    #drawObjects() {
        for (let obj of this.objects) {
            obj.render(canvas);
        }
    }

    #handleLogic() {
        if (this.livesEnabled && this.lives <= 0) {
            this.loadLevel("Game Over");
            return;
        }
        for (let obj of this.objects) {
            if (obj.collisionType !== GameObject.COLLIDE_STATES.NOCOLLIDE || obj !== this.player)
                this.#checkForCollisions(obj);
            if (obj.update) obj.update(this);
        }
        this.timeSinceLevelStart += 1 / this.canvas.fps;
    }

    #checkForCollisions(obj) {
        for (let o of this.objects) {
            if (o === this.player || o === obj || o.collisionType === GameObject.COLLIDE_STATES.NOCOLLIDE) continue;
            if (o.inVerticalBounds(obj) && o.inHorizontalBounds(obj)) {
                // collision stay
                let alreadyColliding = false;
                if (this.collisions.contains(o, obj)) {
                    obj.handleCollision(o);
                    o.handleCollision(obj);
                    alreadyColliding = true;
                }

                // collision enter
                if (!alreadyColliding) {
                    this.collisions.add(o, obj);
                    obj.handleCollisionEnter(o);
                    o.handleCollisionEnter(obj);
                }
            } else {
                // collision exit
                if (this.collisions.contains(o, obj)) {
                    this.collisions.remove(o, obj);
                    obj.handleCollisionExit(o);
                    o.handleCollisionExit(obj);
                }
            }
        }
    }

    createLevel(name, func) {
        this.levels[name] = func;
    }

    reloadLevel() {
        this.loadLevel(this.currentLevel);
    }

    handleLevelComplete() {
        this.score += this.scoreEarnedThisLevel;
    }

    handleLevelFail() {
        if (this.livesEnabled) {
            this.lives--;
            if (this.lives <= 0)
                this.loadLevel("Game Over");
            else
                this.reloadLevel();
        } else this.reloadLevel();
    }

    loadLevel(name) {
        this.active = false;
        if (!this.levels[name])
            console.error(`Cannot find level ${name}`);
        else {
            this.objects = [];
            this.player = null;
            this.scoreEarnedThisLevel = 0;
            this.timeSinceLevelStart = 0;
            this.currentLevel = name;
            this.levels[name]();
        }
        this.active = true;
    }

    #addGameObject(go) {
        if (go.renderType == GameObject.RENDER_TYPES.IMAGE && !go.renderString)
            go.renderString = BearcatPlatformer.DEFAULT_IMAGE_RENDER_STRINGS_PATH + go.constructor.name.toLowerCase() + ".png";
        this.objects.push(go);
        return go;
    }


    addStar(x, y, size = 30, worth = 100) {
        let star = new Star(x, y, size, worth);
        return this.#addGameObject(star)
    }

    addInvincibilityStar(x, y, size = 30, duration = 5) {
        let star = new InvincibilityStar(x, y, size, duration);
        return this.#addGameObject(star);
    }

    addDoor(x, y, levelName, enabled = true, width = 30, height = 50) {
        let door = new Door(x, y, width, height, levelName, enabled);
        return this.#addGameObject(door)
    }



    addPlayer(x = 25, y = 750, width = 30, height = 30, moveSpeed = 5, jumpHeight = 6, gravity = 1, xVelocity = 0, yVelocity = 0, canMove = true) {
        let player = new Player(this, x, y, width, height, moveSpeed, jumpHeight, gravity, xVelocity, yVelocity, canMove);
        this.player = player;
        return this.#addGameObject(player);
    }

    addEnemy(x, y, width = 20, height = 20, movementDirection = HORIZONTAL, movementSpeed = 1, maxDistance = 20) {
        let enemy = new Enemy(x, y, width, height, movementDirection, movementSpeed, maxDistance);
        return this.#addGameObject(enemy)
    }

    addPlatform(x, y, width = 50, height = 20, renderType, renderString) {
        let platform = new Platform(x, y, width, height, renderType, renderString);
        return this.#addGameObject(platform);
    }

    addSizeChanger(x, y, width = 50, height = 50, changeAmount = 1.0, changeType = SizeChanger.CHANGE_TYPES.GROW) {
        let sc = new SizeChanger(x, y, width, height, changeAmount, changeType);
        this.objects.push(sc);
        return sc;
    }

    addAntiGravityBlock(x, y, width = 50, height = 50) {
        let agb = new AntiGravityBlock(x, y, width, height);
        this.objects.push(agb);
        return agb;
    }

    addZeroGravityBlock(x, y, width = 50, height = 50) {
        let zgb = new ZeroGravityBlock(x, y, width, height);
        this.objects.push(zgb);
        return zgb;
    }

    addTreadmill(x, y, width = 50, height = 30, direction = LEFT, speed = 1) {
        let t = new Treadmill(x, y, width, height, direction, speed);
        this.objects.push(t);
        return t;
    }

    addTrampoline(x, y, width = 20, height = 20, bounceCoefficient = 0.8) {
        let t = new Trampoline(x, y, width, height, bounceCoefficient);
        this.objects.push(t);
        return t;
    }

    addMovingTrampoline(x, y, width = 20, height = 20, movementDirection = BearcatPlatformer.MOVEMENT_AXES.HORIZONTAL, movementSpeed = 1, maxDistance = 20, bounceCoefficient = 0.8) {
        let mt = new MovingTrampoline(x, y, width, height, movementDirection, movementSpeed, maxDistance, bounceCoefficient);
        this.objects.push(mt);
        return mt;
    }

    addMovingPlatform(x, y, width = 20, height = 20, movementDirection = BearcatPlatformer.MOVEMENT_AXES.HORIZONTAL, movementSpeed = 1, maxDistance = 20) {
        let mp = new MovingPlatform(x, y, width, height, movementDirection, movementSpeed, maxDistance);
        this.objects.push(mp);
        return mp;
    }

    addFoodTruck(x, y, direction = LEFT, widthPercent = 1, heightPercent = 1) {
        let truckBody = new Platform(x, y + 15, 150 * widthPercent, 105 * heightPercent);
        let truckHead = new Platform(x + (110 * widthPercent * direction), y + 25, 50 * widthPercent, 95 * heightPercent);
        truckBody.render = (canvas) => {
            canvas.drawFoodTruck(x, y, direction, 0, widthPercent, heightPercent);
            // canvas.drawRectangle(x, y + 15, 150*widthPercent, 110*heightPercent);
            // canvas.drawRectangle(x + (110*widthPercent * direction), y + 25, 50*widthPercent, 100*heightPercent);
        }
        truckHead.dontRender();
        this.objects.push(truckBody);
        this.objects.push(truckHead);
        return { truckBody: truckBody, truckHead: truckHead };
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

    constructor(x, y, width, height, collisionType = GameObject.COLLIDE_STATES.COLLIDABLE, renderType = GameObject.RENDER_TYPES.COLOR, renderString, renderFunc = (canvas) => canvas.drawRectangle(this.x, this.y, this.width, this.height)) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.collisionType = collisionType;
        this.renderType = renderType;
        this.renderString = renderString;
        this.renderFunc = renderFunc;
    }

    handleCollision(other) {
        switch (this.collisionType) {
            case GameObject.COLLIDE_STATES.NOCOLLIDE: return;
            case GameObject.COLLIDE_STATES.TRIGGER: this.onTrigger(other); break;
            case GameObject.COLLIDE_STATES.COLLIDABLE: this.onCollision(other); break;
        }
    }

    handleCollisionEnter(other) {
        switch (this.collisionType) {
            case GameObject.COLLIDE_STATES.NOCOLLIDE: return;
            case GameObject.COLLIDE_STATES.TRIGGER: this.onTriggerEnter(other); break;
            case GameObject.COLLIDE_STATES.COLLIDABLE: this.onCollisionEnter(other); break;
        }
    }

    handleCollisionExit(other) {
        switch (this.collisionType) {
            case GameObject.COLLIDE_STATES.NOCOLLIDE: return;
            case GameObject.COLLIDE_STATES.TRIGGER: this.onTriggerExit(other); break;
            case GameObject.COLLIDE_STATES.COLLIDABLE: this.onCollisionExit(other); break;
        }
    }

    render(canvas) {
        if (this.renderType === GameObject.RENDER_TYPES.COLOR) {
            if (this.renderString && this.renderString.fillColor && this.renderString.borderColor) {
                canvas.setFillColor(this.renderString.fillColor);
                canvas.setBorderColor(this.renderString.borderColor);
            }
            else
                console.warn("Render type set to GameObject.RENDER_TYPES.COLOR but no color was provided.")
            this.renderFunc(canvas);
        }
        else if (this.renderType === GameObject.RENDER_TYPES.IMAGE)
            if (!this.renderString)
                console.error("Render type set to GameObject.RENDER_TYPES.IMAGE but no image was provided.");
            else
                canvas.drawImage(this.renderString, this.x, this.y, this.width, this.height);
        else
            console.error(`${this.renderType} IS AN INVALID RENDERING TYPE; VALID TYPES ARE: GameObject.RENDER_TYPES.COLOR, GameObject.RENDER_TYPES.IMAGE`);
    }

    dontRender() {
        this.render = () => { };
    }

    onTrigger() { }

    onTriggerEnter() { }

    onTriggerExit() { }

    onCollision() { }

    onCollisionEnter() { }

    onCollisionExit() { }


    isRightOf(other) {
        let buffer = 20 / other.width;
        return this.x - this.width / 2 + BearcatPlatformer.COLLISION_EPSILON_X + buffer >= other.x + other.width / 2 && this.x - this.width / 2 - BearcatPlatformer.COLLISION_EPSILON_X - buffer <= other.x + other.width / 2;
    }

    isLeftOf(other) {
        let buffer = 20 / other.width;
        let otherLeftSide = other.x - other.width / 2;
        let rightSide = this.x + this.width / 2;
        return rightSide >= otherLeftSide - BearcatPlatformer.COLLISION_EPSILON_X - buffer && rightSide <= otherLeftSide + BearcatPlatformer.COLLISION_EPSILON_X + buffer
    }

    inHorizontalBounds(other) {
        let dist = Math.abs(this.x - other.x);
        return dist <= this.width / 2 + other.width / 2;
        // other - < this + < other + || 
        let otherLeftEdge = other.x - other.width / 2;
        let otherRightEdge = other.x + other.width / 2;
        let thisLeftEdge = this.x - this.width / 2;
        let thisRightEdge = this.x + this.width / 2;
        return (otherLeftEdge <= thisLeftEdge && thisLeftEdge <= otherRightEdge) || (otherLeftEdge <= thisRightEdge && thisRightEdge <= otherRightEdge);
    }

    inVerticalBounds(other) {
        let dist = Math.abs(this.y - other.y);
        return dist <= this.height / 2 + other.height / 2;
        let otherTopEdge = other.y - other.height / 2;
        let otherBottom = other.y + other.height / 2;
        let thisTopEdge = this.y - this.height / 2;
        let thisBottomEdge = this.y + this.height / 2;
        return (otherTopEdge <= thisTopEdge && thisTopEdge <= otherBottom) || (otherTopEdge <= thisBottomEdge && thisBottomEdge <= otherBottom);
    }

    isBelow(other) {
        // this.y + height/2 = bottom of self
        // other.y - height/2 = top of other
        return this.y + this.height / 2 >= other.y - other.height / 2 - BearcatPlatformer.COLLISION_EPSILON_Y && this.y + this.height / 2 <= other.y - other.height / 2 + BearcatPlatformer.COLLISION_EPSILON_Y;
    }

    isAbove(other) {
        // this.y - this.height/2 = top of self
        // other.y + other.height/2 = bottom of other
        return this.y - this.height / 2 >= other.y + other.height / 2 - BearcatPlatformer.COLLISION_EPSILON_Y && this.y - this.height / 2 <= other.y + other.height / 2 + BearcatPlatformer.COLLISION_EPSILON_Y;
    }

    distanceTo(other) {
        return Math.sqrt((this.x - other.x) * (this.x - other.x) + (this.y - other.y) * (this.y - other.y));
    }
}

class MovingPlatform extends GameObject {

    constructor(x, y, width, height, movementAxis, movementSpeed, maxDistance, frictionCoefficient = 0, renderType = GameObject.RENDER_TYPES.COLOR, renderString = { fillColor: "grey", borderColor: "black" }) {
        super(x, y, width, height, GameObject.COLLIDE_STATES.COLLIDABLE, renderType, renderString)
        this.movementAxis = movementAxis;
        this.anchorX = x;
        this.anchorY = y;
        this.movementDirection = Enemy.MOVEMENT_TYPES.FORWARD;
        this.movementSpeed = movementSpeed;
        this.maxDistance = maxDistance;
        this.theta = 0;
        this.collisionSurfaceInformation = { bounceCoefficient: 0, groundFriction: frictionCoefficient };
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
                if (!game.player) return;
                else if (this.distanceTo(game.player) <= this.maxDistance) {
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

    onCollision(other) {
        if (other.constructor.name === "Player") {
            switch (this.movementAxis) {
                case Enemy.MOVEMENT_AXES.VERTICAL:
                    other.y = this.y - this.height / 2 - other.height / 2;
                    break;
                case Enemy.MOVEMENT_AXES.HORIZONTAL:
                    other.x += this.movementSpeed * this.movementDirection / 2;
                    break;
                case Enemy.MOVEMENT_AXES.INCREASING_DIAGONAL:
                    other.x += this.movementSpeed * this.movementDirection / 2;
                    other.y -= this.movementSpeed * this.movementDirection / 2;
                    break;
                case Enemy.MOVEMENT_AXES.DECREASING_DIAGONAL:
                    other.x += this.movementSpeed * this.movementDirection / 2;
                    other.y += this.movementSpeed * this.movementDirection / 2;
                    break;
                case Enemy.MOVEMENT_AXES.CIRCLE:
                    other.x += this.maxDistance * Math.sin(this.theta) / 2;
                    other.y += this.maxDistance * Math.cos(this.theta) / 2;
                    break;
                case Enemy.MOVEMENT_AXES.FOLLOW:
                    if (!game.player) return;
                    else if (this.distanceTo(game.player) <= this.maxDistance) {
                        let xDir = this.x > game.player.x ? -1 : 1;
                        let yDir = this.y > game.player.y ? -1 : 1;
                        other.x += this.movementSpeed * xDir;
                        other.y += this.movementSpeed * yDir;
                    }
                    break;
                default:
                    console.error(`${this.movementAxis} IS AN INVALID MOVEMENT AXIS; VALID AXES ARE: VERTICAL, HORIZONTAL, INCREASING_DIAGONAL, DECREASING_DIAGONAL, CIRCLE`);
                    break;
            }
        }
    }
}

class Platform extends GameObject {
    constructor(x, y, width = 30, height = 5, frictionCoefficient = 0, renderType = GameObject.RENDER_TYPES.COLOR, renderString = { fillColor: "brown", borderColor: "black" }) {
        super(x, y, width, height, GameObject.COLLIDE_STATES.COLLIDABLE, renderType, renderString);
        this.collisionSurfaceInformation = { bounceCoefficient: 0, groundFriction: frictionCoefficient };
    }
}

class Trampoline extends GameObject {
    constructor(x, y, width = 30, height = 5, bounceCoefficient = 0.8, renderType = GameObject.RENDER_TYPES.COLOR, renderString = { fillColor: "lightgreen", borderColor: "black" }) {
        super(x, y, width, height, GameObject.COLLIDE_STATES.COLLIDABLE, renderType, renderString);
        this.collisionSurfaceInformation = { bounceCoefficient: bounceCoefficient, groundFriction: 0 };
    }
}

class MovingTrampoline extends GameObject {

    constructor(x, y, width, height, movementAxis, movementSpeed, maxDistance, bounceCoefficient = 0.8, renderType = GameObject.RENDER_TYPES.COLOR, renderString = { fillColor: "lightgreen", borderColor: "black" }) {
        super(x, y, width, height, GameObject.COLLIDE_STATES.COLLIDABLE, renderType, renderString)
        this.movementAxis = movementAxis;
        this.anchorX = x;
        this.anchorY = y;
        this.movementDirection = BearcatPlatformer.MOVEMENT_TYPES.FORWARD;
        this.movementSpeed = movementSpeed;
        this.maxDistance = maxDistance;
        this.theta = 0;
        this.collisionSurfaceInformation = { bounceCoefficient: bounceCoefficient, groundFriction: 0 };
    }

    update(game) {
        switch (this.movementAxis) {
            case BearcatPlatformer.MOVEMENT_AXES.VERTICAL:
                this.y += this.movementSpeed * this.movementDirection;
                if (Math.abs(this.anchorY - this.y) >= this.maxDistance)
                    this.movementDirection *= -1;
                break;
            case BearcatPlatformer.MOVEMENT_AXES.HORIZONTAL:
                this.x += this.movementSpeed * this.movementDirection;
                if (Math.abs(this.anchorX - this.x) >= this.maxDistance)
                    this.movementDirection *= -1;
                break;
            case BearcatPlatformer.MOVEMENT_AXES.INCREASING_DIAGONAL:
                this.x += this.movementSpeed * this.movementDirection;
                this.y -= this.movementSpeed * this.movementDirection;
                let dist = Math.sqrt((this.x - this.anchorX) * (this.x - this.anchorX) + (this.y - this.anchorY) * (this.y - this.anchorY));
                if (dist >= this.maxDistance)
                    this.movementDirection *= -1;
                break;
            case BearcatPlatformer.MOVEMENT_AXES.DECREASING_DIAGONAL:
                this.x += this.movementSpeed * this.movementDirection;
                this.y += this.movementSpeed * this.movementDirection;
                if (Math.sqrt((this.x - this.anchorX) * (this.x - this.anchorX) + (this.y - this.anchorY) * (this.y - this.anchorY)) >= this.maxDistance)
                    this.movementDirection *= -1;
                break;
            case BearcatPlatformer.MOVEMENT_AXES.CIRCLE:
                this.x = this.anchorX + this.maxDistance * Math.sin(this.theta);
                this.y = this.anchorY + this.maxDistance * Math.cos(this.theta);
                break;
            case BearcatPlatformer.MOVEMENT_AXES.FOLLOW:
                if (!game.player) return;
                else if (this.distanceTo(game.player) <= this.maxDistance) {
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
}

class Star extends GameObject {
    constructor(x, y, size = 30, worth = 100, renderType = GameObject.RENDER_TYPES.COLOR, renderString = { fillColor: "yellow", borderColor: "black" }) {
        super(x, y, size, size, GameObject.COLLIDE_STATES.TRIGGER, renderType, renderString, (canvas) => canvas.drawStar(this.x, this.y, this.width / 2));
        this.worth = worth;
    }

    onTriggerEnter(other) {
        if (other.constructor.name === "Player") {
            other.game.destroy(this);
            other.game.scoreEarnedThisLevel += this.worth;
        }
    }
}

class InvincibilityStar extends GameObject {
    constructor(x, y, size = 30, duration = 5, renderType = GameObject.RENDER_TYPES.COLOR, renderString = { fillColor: "yellow", borderColor: "black" }) {
        super(x, y, size, size, GameObject.COLLIDE_STATES.TRIGGER, renderType, renderString);
        this.renderFunc = (canvas) => {
            // these gradients can't be static due to their dependence on instance coordinates :(
            let grd = canvas.canvas.createLinearGradient(0, y - size / 10, 0, y + size / 10);
            let grd2 = canvas.canvas.createLinearGradient(0, y + size / 10, 0, y - size / 10);
            grd.addColorStop(0, "yellow");
            grd.addColorStop(1, "red");
            grd2.addColorStop(0, "yellow");
            grd2.addColorStop(1, "red");
            canvas.setFillColor(grd);
            canvas.setBorderColor(grd2);
            canvas.drawStar(this.x, this.y, this.width / 2)
        }
        this.duration = duration;
    }

    onTriggerEnter(other) {
        if (other.constructor.name === "Player") {
            other.game.destroy(this);
            other.startInvulnerability(this.duration);
        }
    }
}



class Enemy extends GameObject {
    // deprecated
    static MOVEMENT_TYPES = {
        FORWARD: 1,
        BACKWARD: -1
    };

    // deprecated
    static MOVEMENT_AXES = {
        VERTICAL: 1,
        HORIZONTAL: 2,
        INCREASING_DIAGONAL: 3,
        DECREASING_DIAGONAL: 4,
        CIRCLE: 5,
        FOLLOW: 6
    };

    constructor(x, y, width, height, movementAxis, movementSpeed, maxDistance, renderType = GameObject.RENDER_TYPES.COLOR, renderString = { fillColor: "red", borderColor: "black" }) {
        super(x, y, width, height, GameObject.COLLIDE_STATES.COLLIDABLE, renderType, renderString)
        this.movementAxis = movementAxis;
        this.anchorX = x;
        this.anchorY = y;
        this.movementDirection = Enemy.MOVEMENT_TYPES.FORWARD;
        this.movementSpeed = movementSpeed;
        this.maxDistance = maxDistance;
        this.theta = 0;
    }

    onCollision(other) {
        if (other.constructor.name === "Player" && !other.isInvulnerable) {
            other.game.destroy(this);
            other.game.handleLevelFail();
        }
    }

    update() {
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
                if (!game.player) return;
                else if (this.distanceTo(game.player) <= this.maxDistance) {
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

    onTrigger(other) {
        if (this.enabled === false) return;
        if (other.constructor.name === "Player") {
            other.game.loadLevel(this.levelName);
        }
    }
}

class SizeChanger extends GameObject {
    static CHANGE_TYPES = {
        GROW: 1,
        SHRINK: -1
    };

    constructor(x, y, width = 30, height = 30, changeAmount = 1.0, changeType = SizeChanger.CHANGE_TYPES.GROW, renderType = GameObject.RENDER_TYPES.COLOR, renderString = { fillColor: "yellow", borderColor: "black" }) {
        super(x, y, width, height, GameObject.COLLIDE_STATES.TRIGGER, renderType, renderString)
        this.changeType = changeType;
        this.changeAmount = changeAmount;
        this.renderFunc = (canvas) => {
            canvas.drawRectangle(this.x, this.y, this.width, this.height);
            canvas.setFillColor(this.renderString.borderColor);
            if (this.changeType === SizeChanger.CHANGE_TYPES.GROW)
                canvas.drawRectangle(this.x, this.y, this.width / 4, this.height / 2);
            canvas.drawRectangle(this.x, this.y, this.width / 2, this.height / 4);
        }
    }

    onTrigger(other) {
        if (other.constructor.name === "Player" && other.width > 0 && other.height > 0) {
            other.width += this.changeType * this.changeAmount * 5 / other.game.canvas.fps;
            other.height += this.changeType * this.changeAmount * 5 / other.game.canvas.fps;
            other.y -= this.changeType * this.changeAmount * 5 / other.game.canvas.fps;
        }
    }
}

class AntiGravityBlock extends GameObject {

    constructor(x, y, width = 30, height = 30, renderType = GameObject.RENDER_TYPES.COLOR, renderString = { fillColor: "black", borderColor: "black", secondaryColor: "white" }) {
        super(x, y, width, height, GameObject.COLLIDE_STATES.TRIGGER, renderType, renderString);
        this.renderFunc = (canvas) => {
            canvas.setFillColor(this.renderString.fillColor);
            canvas.setBorderColor(this.renderString.borderColor);
            canvas.drawRectangle(this.x, this.y, this.width, this.height);
            canvas.setFillColor(this.renderString.secondaryColor);
            canvas.drawRectangle(this.x - this.width / 3, this.y, this.width / 8, this.height / 8);
            canvas.drawRectangle(this.x, this.y, this.width / 8, this.height / 8);
            canvas.drawRectangle(this.x + this.width / 3, this.y, this.width / 8, this.height / 8);
        }
    }

    onTriggerEnter(other) {
        if (other.constructor.name === "Player") {
            other.gravityMultiplier *= -1;
            if (!other.gravityEnabled)
                other.toggleGravity();
            other.game.destroy(this);
        }
    }
}

class ZeroGravityBlock extends GameObject {

    constructor(x, y, width = 30, height = 30, renderType = GameObject.RENDER_TYPES.COLOR, renderString = { fillColor: "black", borderColor: "black", secondaryColor: "white" }) {
        super(x, y, width, height, GameObject.COLLIDE_STATES.TRIGGER, renderType, renderString);
        this.renderFunc = (canvas) => {
            canvas.setFillColor(this.renderString.fillColor);
            canvas.setBorderColor(this.renderString.borderColor);
            canvas.drawRectangle(this.x, this.y, this.width, this.height);
            canvas.setFillColor(this.renderString.secondaryColor);
            canvas.drawOval(this.x, this.y, this.width / 4, this.height / 3);
            canvas.setFillColor(this.renderString.fillColor);
            canvas.drawOval(this.x, this.y, this.width / 12, this.height / 9);
        }
    }

    onTriggerEnter(other) {
        if (other.constructor.name === "Player") {
            other.toggleGravity();
            other.game.destroy(this);
        }
    }
}

class Treadmill extends GameObject {
    constructor(x, y, width = 50, height = 30, direction = LEFT, speed = 1, renderType = GameObject.RENDER_TYPES.COLOR, renderString = { fillColor: "gold", borderColor: "black", secondaryColor: "lightyellow" }) {
        super(x, y, width, height, GameObject.COLLIDE_STATES.TRIGGER, renderType, renderString);
        this.direction = direction;
        this.speed = speed;
        this.collisionSurfaceInformation = { bounceCoefficient: 0, groundFriction: 1 };
        this.renderFunc = (canvas) => {
            canvas.setFillColor(this.renderString.fillColor);
            canvas.setBorderColor(this.renderString.borderColor);
            canvas.drawRectangle(this.x, this.y, this.width, this.height);
            canvas.setFillColor(this.renderString.secondaryColor);
            canvas.drawRectangle(this.x, this.y, this.width / 2, this.height / 4);
            let smaller = this.width > this.height ? this.height / 2 : this.width / 2;
            if (this.direction === LEFT)
                canvas.drawTriangle(this.x - this.width / 4, this.y, smaller, FILLFRAME, -90)
            else
                canvas.drawTriangle(this.x + this.width / 4, this.y, smaller, FILLFRAME, 90)
            canvas.drawRectangle(this.x, this.y, this.width / 2, this.height / 4, FILL);
        }
    }

    onTrigger(other) {
        if (other.constructor.name === "Player") {
            other.x += this.speed * this.direction;
        }
    }
}

class Door extends GameObject {
    constructor(x, y, width = 30, height = 50, levelName, enabled = true, renderType = GameObject.RENDER_TYPES.COLOR, renderString = { fillColor: "BROWN", borderColor: "BLACK", knobColor: "YELLOW" }) {
        super(x, y, width, height, GameObject.COLLIDE_STATES.TRIGGER, renderType, renderString);
        this.levelName = levelName;
        this.enabled = enabled;
        this.renderFunc = (canvas) => {
            if (this.enabled === false) {
                canvas.setFillColor("#00000000");
                canvas.setLineDash([5, 5])
                canvas.drawRectangle(this.x, this.y, this.width * 1.2, this.height * 1.2);
                canvas.setLineDash([])
                canvas.drawCircle(this.x + this.width / 3, this.y, this.width / 8);
            }
            else if (this.renderType === GameObject.RENDER_TYPES.COLOR) {
                canvas.setFillColor(this.renderString.doorColor ? this.renderString.doorColor : "BROWN");
                canvas.drawRectangle(this.x, this.y, this.width * 1.2, this.height * 1.2);
                canvas.setFillColor(this.renderString.knobColor ? this.renderString.knobColor : "YELLOW");
                canvas.drawCircle(this.x + this.width / 3, this.y, this.width / 8);
            }
        }
    }

    render(canvas) {
        canvas.setBorderColor(this.renderString.borderColor);
        if (this.enabled === false) {
            canvas.setFillColor("#00000000");
            canvas.setLineDash([5, 5])
            canvas.drawRectangle(this.x, this.y, this.width * 1.2, this.height * 1.2);
            canvas.setLineDash([])
            canvas.drawCircle(this.x + this.width / 3, this.y, this.width / 8);
        }
        else {
            canvas.setFillColor(this.renderString.fillColor);
            canvas.drawRectangle(this.x, this.y, this.width * 1.2, this.height * 1.2);
            canvas.setFillColor(this.renderString.knobColor);
            canvas.drawCircle(this.x + this.width / 3, this.y, this.width / 8);
        }
    }

    onTrigger(other) {
        if (this.enabled === false) return;
        if (other.constructor.name === "Player") {
            other.game.handleLevelComplete();
            other.game.loadLevel(this.levelName);
        }
    }
}

class Player extends GameObject {
    constructor(
        game, x = 25, y = 750, width = 30, height = 30, moveSpeed = 5, jumpHeight = 6, gravityMultiplier = 1, xVelocity = 0, yVelocity = 0, canMove = true, renderType = GameObject.RENDER_TYPES.COLOR, renderString = { fillColor: "green", borderColor: "black" }
    ) {
        super(x, y, width, height, GameObject.COLLIDE_STATES.TRIGGER, renderType, renderString);
        this.game = game;
        this.moveSpeed = moveSpeed;
        this.jumpHeight = jumpHeight;
        this.gravityMultiplier = gravityMultiplier;
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
        this.wallJumpEnabled = true;
        this.wallJumped = false;
        this.doubleJumpEnabled = true;
        this.jumpKeyCount = 0;
        this.collisionCoefficient = 0;
        this.gravityEnabled = true;
        this.airStrafeEnabled = true;
        this.collisionSurfaceInformation = { bounceCoefficient: 0, groundFriction: 0 };
        this.isInvulnerable = false;
        let oldFunc = this.renderFunc;
        this.renderFunc = (canvas) => {
            if (this.isInvulnerable)
                canvas.setFillColor(canvas.getRandomColor());
            oldFunc(canvas);
        }
    }

    startInvulnerability(duration) {
        this.isInvulnerable = true;
        // very nifty piece of js scoping
        setTimeout(this.endInvulnerability.bind(this), duration * 1000);
    }

    endInvulnerability() {
        this.isInvulnerable = false;
    }

    toggleGravity() {
        this.gravityEnabled = !this.gravityEnabled;
    }

    toggleAirStrafing() {
        this.airStrafeEnabled = !this.airStrafeEnabled;
    }

    toggleWallJump() {
        this.wallJumpEnabled = !this.wallJumpEnabled;
    }

    toggleDoubleJump() {
        this.doubleJumpEnabled = !this.doubleJumpEnabled;
    }

    update() {
        this.#handleMovement();
    }

    #handleMovement() {

        // check for collisions
        for (let obj of this.game.objects) {
            if (obj === this)
                continue;
            if (this.inHorizontalBounds(obj) && this.inVerticalBounds(obj)) {
                if (obj.constructor.name === "Platform" || obj.constructor.name === "MovingPlatform" || obj.constructor.name === "Trampoline" || obj.constructor.name === "MovingTrampoline" || obj.constructor.name === "Treadmill") {
                    if (this.isAbove(obj)) this.collidingAbove = true;
                    else if (this.isBelow(obj)) {
                        if (!this.moveDownKeyDown)
                            this.collisionSurfaceInformation = obj.collisionSurfaceInformation;
                        this.collidingBelow = true;
                    }
                    else if (this.isRightOf(obj)) this.collidingLeft = true;
                    else if (this.isLeftOf(obj)) this.collidingRight = true;
                }
                obj.handleCollision(this);
            }
        }

        // orientation calculation for gravity / antigravity
        let collidingWithFloor = false;
        let collidingWithCeiling = false;
        let jumpDirection = 1;

        if (this.gravityMultiplier > 0) {
            collidingWithFloor = this.collidingBelow;
            collidingWithCeiling = this.collidingAbove;
            jumpDirection = 1;
        }
        else {
            collidingWithFloor = this.collidingAbove;
            collidingWithCeiling = this.collidingBelow;
            jumpDirection = -1;
        }

        // y movement calculations

        if (collidingWithCeiling && this.yVelocity * jumpDirection > 0)
            this.yVelocity = -this.yVelocity * 0.5;
        if (collidingWithFloor && this.yVelocity * jumpDirection <= 0) {
            this.yVelocity = this.collisionSurfaceInformation.bounceCoefficient * -this.yVelocity;
            this.jumpKeyCount = 0;
            if (this.wallJumpEnabled)
                this.wallJumped = false;
            if (this.doubleJumpEnabled)
                this.doubleJumped = false;
        }
        else if (this.gravityEnabled)
            this.yVelocity -= BearcatPlatformer.GRAVITY * this.gravityMultiplier / canvas.fps;

        // x movement calculations

        if (this.gravityEnabled)
            if (this.game.airResistanceEnabled && !collidingWithFloor) {
                this.xVelocity *= this.game.airResistanceCoefficient;
            }
            else
                this.xVelocity *= this.collisionSurfaceInformation.groundFriction;
        if (!this.canMove) return;
        else if (this.moveLeftKeyDown && this.moveRightKeyDown) this.xVelocity = 0;
        else if (this.moveLeftKeyDown && !this.collidingLeft && ((!this.airStrafeEnabled && this.collidingBelow) || this.airStrafeEnabled)) this.xVelocity = -this.moveSpeed;
        else if (this.moveRightKeyDown && !this.collidingRight && ((!this.airStrafeEnabled && this.collidingBelow) || this.airStrafeEnabled)) this.xVelocity = this.moveSpeed;
        else this.xVelocity = 0;
        this.x += this.xVelocity;

        if (this.jumpKeyDown) {
            console.log(); // TODO
            let canJump = false;
            if (!collidingWithCeiling) {
                if (collidingWithFloor)
                    canJump = true;
                else if (this.wallJumpEnabled && !this.wallJumped && (this.collidingRight || this.collidingLeft)) {
                    canJump = true;
                    this.wallJumped = true;
                    this.jumpKeyDown = false;
                }
                else if (this.doubleJumpEnabled && !this.doubleJumped && this.jumpKeyCount >= 1 && !(this.wallJumpEnabled && this.jumpKeyCount >= 2 && (this.collidingRight || this.collidingLeft && this.yVelocity > 9 * this.jumpHeight * jumpDirection / 10))) {
                    canJump = true;
                    this.doubleJumped = true;
                    this.jumpKeyDown = false;
                }
            }
            if (canJump)
                this.yVelocity = this.jumpHeight * jumpDirection;
        }


        this.y -= this.yVelocity;



        if ((this.y >= this.game.canvas.height + this.game.canvas.height / 10 && (this.gravityMultiplier > 0 || !this.gravityEnabled)) || (this.y <= -this.game.canvas.height / 10 && (this.gravityMultiplier < 0 || !this.gravityEnabled)))
            this.game.handleLevelFail();

        this.collidingLeft = false;
        this.collidingRight = false;
        this.collidingAbove = false;
        this.collidingBelow = false;
        this.collisionSurfaceInformation = { bounceCoefficient: 0, groundFriction: 0 };
    }
}

class CollisionMap {
    constructor() {
        this.collisions = {};
    }
    add(obj1, obj2) {
        if (!this.collisions[obj1])
            this.collisions[obj1] = {};
        this.collisions[obj1][obj2] = 1;
    }

    removeAll(obj) {
        for (let collision in this.collisions[obj])
            delete this.collisions[obj][collision];
        delete this.collisions[obj];
    }

    remove(obj1, obj2) {
        if (!this.contains(obj1, obj2)) return;
        delete this.collisions[obj1][obj2];
        delete this.collisions[obj2][obj1];
    }

    contains = (obj1, obj2) => (this.collisions[obj1] && this.collisions[obj1][obj2]) || (this.collisions[obj2] && this.collisions[obj2][obj1]);
}

function createGameOverScreenLevel() {
    game.setBackgroundFunction(createGameOverScreenBackground);
}

function createVictoryScreenLevel() {
    game.setBackgroundFunction(createVictoryScreenBackground);
}

function createGameOverScreenBackground() {
    canvas.setFillColor("black");
    canvas.drawRectangle(canvas.width / 2, canvas.height / 2, canvas.width, canvas.height);
    canvas.setFontSize(40);
    canvas.setFillColor("red");
    canvas.drawText("GAME OVER", canvas.width / 2, canvas.height / 2);
}

function createVictoryScreenBackground() {
    canvas.setFillColor("black");
    canvas.drawRectangle(canvas.width / 2, canvas.height / 2, canvas.width, canvas.height);
    canvas.setFontSize(40);
    canvas.setFillColor("green");
    canvas.drawText("VICTORY", canvas.width / 2, canvas.height / 2);
}

class Pair {
    constructor(a, b) {
        this.a = a;
        this.b = b;
    }

    contains = (x) => (this.a === x || this.b === x);
}

class Complex {
    constructor(real, imag) {
        this.real = real;
        this.imag = imag;
    }

    add(other) {
        return new Complex(this.real + other.real, this.imag + other.imag);
    }

    multiply(other) {
        return new Complex((this.real * other.real) - (this.imag * other.imag), (this.real * other.imag) + (this.imag * other.real));
    }

    magnitude() {
        return Math.sqrt(this.real * this.real + this.imag * this.imag);
    }
}

let VERTICAL = 1;
let HORIZONTAL = 2;
let INCREASING_DIAGONAL = 3;
let DECREASING_DIAGONAL = 4;
let CIRCLE = 5;
let FOLLOW = 6;
let FORWARD = 1;
let BACKWARD = -1;
let FILL = -123456789;
let FRAME = 123456789;
let FILLFRAME = 0;
let RIGHT = 1;
let LEFT = -1;
let GROW = 1;
let SHRINK = -1;

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

class BearcatTowerDefense {
    waves = [];
    towerDefs = [];
    enemiesInWave = [];
    waveIndex = -1;
    activeEnemies = [];
    towers = [];
    objects = [];
    static COLLISION_TYPES = {
        ENEMY: 0,
        TOWER: 1
    }
    ENEMY_TYPES = {
        basic: "BasicEnemyTD",
        scout: "ScoutEnemyTD",
        ghost: "GhostEnemyTD",
        crazy: "CrazyEnemyTD",
        regen: "RegenSlimeEnemyTD",
        spy: "SpyEnemyTD",
        tank: "TankEnemyTD",                // TODO all these 
        demon: "DemonEnemyTD",
        boss: "BossEnemyTD"
    };
    TOWER_TYPES = {
        basic: "Tower",
        cannon: "CannonTower",              // TODO all these
        flamethrower: "FlamethrowerTower",
        acid: "AcidTower",
        ice: "IceTower",
        water: "WaterTower",
        farm: "FarmTower",
        beacon: "BeaconTower",
        chapel: "ChapelTower"
    };
    pivotPoints = [];
    GAME_STATES = { PLAYING: 0, PAUSED: 1, GAME_OVER: 2, VICTORY: 3 };
    currentGameState = this.GAME_STATES.PAUSED;
    timeSinceGameStarted = 0;
    timeSinceWaveStarted = 0;
    deltaTime = 0;
    lives = 5;
    money = 10;
    roadFunction = null;
    towerFunction = null;
    waveText = null;
    enemiesText = null;
    livesText = null;
    moneyText = null;
    waveTransitioning = false;
    lastTimeStamp = Date.now();

    constructor(width = 300, height = 300) {
        this.width = width;
        this.height = height;
        this.canvas = new BearcatGraphics(() => this.#loop(), width, height);
        this.canvas.setFPS(30);
        // this.canvas.addEventListener(BearcatGraphics.EVENT_TYPES.KEYDOWN, (e) => { this.handleKeyDown(e, this) });
        // this.canvas.addEventListener(BearcatGraphics.EVENT_TYPES.KEYUP, (e) => (this.handleKeyUp(e, this)));
    }

    start = () => this.setup();
    setLives = (lives) => this.lives = lives;
    addPivotPoint = (x, y) => this.pivotPoints.push({ x: x, y: y });
    addEnemy = (type, time) => this.addEnemyToCurrentWave(type, time * 1000);
    addWave = (waveFunction) => this.waves.push(waveFunction);
    addRoadFunction = (func) => this.roadFunction = func;
    // TODO this should be deprecated in favor of adding towers at the start of a wave function
    addTowerFunction = (func) => this.towerFunction = func; 
    handleVictory = () => this.currentGameState = this.GAME_STATES.VICTORY;
    handleGameOver = () => this.currentGameState = this.GAME_STATES.GAME_OVER;
    addMoney = (amount) => this.money += amount;

    addEnemySwarm(type, number, startTime, timeBetweenSpawns){
        for(let i = 0 ; i < number ; i++)
            this.addEnemy(type, startTime + i * timeBetweenSpawns);
    }

    addEnemyToCurrentWave(type, time) {
        if (this.ENEMY_TYPES[type])
            this.enemiesInWave.push(eval(`new ${this.ENEMY_TYPES[type]}(${time}, this)`));
        else
            console.error("TRYING TO ADD UNKNOWN ENEMY TYPE: " + type);
    }

    addTower(type, x, y) {
        if (!this.TOWER_TYPES[type]) {
            console.error("TRYING TO ADD UNKNOWN TOWER TYPE: " + type);
            return;
        }
        let tower = eval(`new ${this.TOWER_TYPES[type]}(${x}, ${y}, this)`);
        if (this.money >= tower.cost) {
            this.addMoney(-tower.cost);
            this.towers.push(tower);
        } else {
            console.log(
                "ERROR: Attempted to add tower that costs " + tower.cost + " but only have " + this.money + " money."
            );
        }
    }

    buildRoad() {
        this.canvas.setColors("lightblue");
        this.canvas.drawRectangle(this.width / 2, this.height / 2, this.width, this.height);
        this.drawPivotPoints();
    }

    drawPivotPoints() {
        this.canvas.setColors("tan");
        this.canvas.drawCircle(this.pivotPoints[0].x, this.pivotPoints[0].y, 10, FILL);

        for (let i = 0; i < this.pivotPoints.length - 1; i++) {
            let start = this.pivotPoints[i];
            let end = this.pivotPoints[i + 1];
            this.canvas.setLineThickness(20);
            this.canvas.drawLine(start, end);
            this.canvas.setLineThickness(5);
            this.canvas.drawCircle(end.x, end.y, 10, FILL);
        }
    }

    setup() {
        this.roadFunction();
        this.buildRoad();
        this.towerFunction();
        this.currentGameState = this.GAME_STATES.PLAYING;
        this.#loop();
    }

    // TODO fit text on screen
    drawGUI() {
        this.canvas.setFontTotally("black", 20, "Impact");
        this.canvas.drawText("Wave: " + (this.waveIndex + 1) + "/" + this.waves.length, 0, 25, FILL);
        this.canvas.drawText("Lives: " + this.lives, this.width - 25, 25, FILL);
        this.canvas.drawText("Money: " + this.money, this.width / 2 - 25, 25, FILL);
        this.canvas.drawText("Enemies: " + this.activeEnemies.length + "/" + (this.activeEnemies.length + this.enemiesInWave.length), 0, 50, FILL);
    }

    handleWaveChange() {
        if (this.waveTransitioning || this.currentGameState != this.GAME_STATES.PLAYING)
            return;
        if (this.waveIndex === this.waves.length)
            this.handleVictory();
        else if (this.enemiesInWave.length === 0 && this.activeEnemies.length === 0)
            this.goToNextWave();
    }

    goToNextWave() {
        this.waveTransitioning = true;
        this.waveIndex++;
        if (this.waveIndex !== this.waves.length)
            setTimeout(this.startWave.bind(this), 1000);
        else
            this.handleVictory();
    }

    startWave() {
        this.waveTransitioning = false;
        this.waves[this.waveIndex]();
        this.timeSinceWaveStarted = 0;
    }

    #loop() {
        this.handleWaveChange();
        this.handleTime();
        this.handleEnemies(this.deltaTime);
        this.handleTowers(this.deltaTime);
        this.handleObjects(this.deltaTime);
        this.drawFrame();
    }

    drawFrame() {
        switch (this.currentGameState) {
            case this.GAME_STATES.PLAYING:
                this.buildRoad();
                this.drawTowers();
                this.drawObjects();
                this.drawEnemies();
                this.drawGUI();
                break;
            case this.GAME_STATES.PAUSED:
                this.drawPaused();
                break;
            case this.GAME_STATES.VICTORY:
                this.drawVictory();
                break;
            case this.GAME_STATES.GAME_OVER:
                this.drawGameOver();
                break;
        }
    }

    drawTowers() {
        for (let tower of this.towers)
            tower.draw();
    }

    drawObjects(){
        for(let object of this.objects){
            object.draw();
        }
    }

    drawPaused() {
        // TODO
    }


    drawVictory() {
        this.canvas.setFillColor("lightgreen");
        this.canvas.drawRectangle(this.width / 2, this.height / 2, this.width, this.height);
        this.canvas.setFontTotally("darkgreen", 30, "Impact");
        this.canvas.drawText("Victory!", this.width / 2 - 50, this.height / 2, FILL);
        // TODO stats?
    }

    drawGameOver() {
        this.canvas.setFillColor("red");
        this.canvas.drawRectangle(this.width / 2, this.height / 2, this.width, this.height);
        // TODO
        this.canvas.setFontTotally("BLACK", 30, "Impact");
        this.canvas.drawText("Game Over", this.width / 2 - 20, this.getHeight / 2, FILL);
    }

    handleTime() {
        let newTime = Date.now();
        this.deltaTime = newTime - this.lastTimeStamp;
        this.lastTimeStamp = newTime;
        this.timeSinceGameStarted += this.deltaTime;
        this.timeSinceWaveStarted += this.deltaTime;
    }

    handleEnemies(deltaTime) {
        this.handleEnemySpawning();
        this.handleEnemyMoving();
    }

    handleEnemyDeath(enemy) {
        this.addMoney(enemy.worth);
        this.activeEnemies.splice(this.activeEnemies.indexOf(enemy), 1);
        this.removeTargetFromTowers(enemy);
    }

    removeTargetFromTowers(enemy) {
        for (let tower of this.towers)
            if (tower.target === enemy)
                tower.loseTarget();
    }

    drawEnemies() {
        for (let enemy of this.activeEnemies)
            enemy.draw();
    }

    handleEnemySpawning() {
        for (let enemy of this.enemiesInWave) {
            if (enemy.time <= this.timeSinceWaveStarted) {
                enemy.initializeMovement();
                this.activeEnemies.push(enemy);
                this.enemiesInWave.splice(this.enemiesInWave.indexOf(enemy), 1);
            }
        }
    }

    handleEnemyMoving() {
        for (let enemy of this.activeEnemies)
            enemy.move();
    }

    handleEnemyAtEndOfMap(enemy) {
        this.activeEnemies.splice(this.activeEnemies.indexOf(enemy), 1);
        this.lives -= enemy.damage;
        if (this.lives <= 0)
            this.handleGameOver();
    }

    handleTowers(deltaTime) {
        for (let tower of this.towers)
            tower.process(deltaTime);
    }

    handleObjects(deltaTime){
        for(let object of this.objects){
            object.process(deltaTime);
            this.checkForCollisions(object);
        }
    }

    checkForCollisions(object){
        if(object.canCollideWith(BearcatTowerDefense.COLLISION_TYPES.ENEMY))
            this.#checkEnemyCollisions(object);
        else if(object.canCollideWith(BearcatTowerDefense.COLLISION_TYPES.TOWER))
            this.#checkTowerCollisions(object);
        else if(object.canCollideWith(BearcatTowerDefense.COLLISION_TYPES.OBJECTS))
            this.#checkObjectCollision(object);
    }

    #checkEnemyCollisions = (object) => this.#checkListCollisions(object, this.activeEnemies);
    #checkTowerCollisions = (object) => this.#checkListCollisions(object, this.towers);
    #checkObjectCollision = (object) => this.#checkListCollisions(object, this.objects);

    #checkListCollisions(object, list){
        for(let otherObject of list){
            if(otherObject === object) continue;
            if(this.#isColliding(object, otherObject)){
                object.handleCollision(otherObject);
            }
        }
    }

    #isColliding(obj1, obj2){
        let dist = Math.sqrt((obj1.x-obj2.x)**2 + (obj1.y-obj2.y)**2);
        let radii = obj1.size + obj2.size;
        return radii >= dist;
    }



    addObject(object){
        this.objects.push(object);
    }

    removeObject(object){
        this.objects.splice(this.objects.indexOf(object), 1);
    }
}

class GameObjectTD {
    constructor(x, y, size){
        this.x = x;
        this.y = y;
        this.size = size;
    }
}

class BasicEnemyTD extends GameObjectTD {
    time;
    targetPivotPoint;
    health = 1;
    damage = 1;
    game;
    worth = 1;
    isAlive = true;

    constructor(time, game) {
        super(-100, -100, -1);
        this.time = time;
        this.game = game;
        this.movementSpeed = 2;
        this.calculateSize();
    }

    setTargetPivotPoint(point) {
        this.targetPivotPoint = point;
    }

    jumpToTarget() {
        this.x = this.targetPivotPoint.x;
        this.y = this.targetPivotPoint.y;
    }

    draw() {
        this.game.canvas.setColors("black");
        this.game.canvas.drawCircle(this.x, this.y, this.size);
    }

    handleDamageEffects(damageDealer) {

        this.health -= damageDealer.damage;
        this.calculateSize();
        // effects

        if (this.isDead()) 
            this.game.handleEnemyDeath(this);
        else 
            this.drawDamage();
    }

    // size of sprite and damage done is based off of remaining health
    calculateSize() {
        this.size = 5 + this.health*5;
        this.damage = this.health;
    }

    drawDamage() {
        // TODO
        setTimeout(this.revertColoring.bind(this), 100);
    }

    revertColoring() {
        // TODO
    }

    isDead() {
        return this.health <= 0;
    }

    move() {
        let tp = this.targetPivotPoint;
        if(!tp){
            this.targetNextPoint();
            return;
        }
        let xDist = tp.x - this.x;
        let yDist = tp.y - this.y;
        let dist = Math.sqrt(xDist ** 2 + yDist ** 2);
        if (dist < this.movementSpeed) {
            this.jumpToTarget();
            this.targetNextPoint();
        } else{
            let xStep = this.movementSpeed * xDist / dist;
            let yStep = this.movementSpeed * yDist / dist;
            this.x += xStep;
            this.y += yStep;
            return {xStep: xStep, yStep: yStep, dist: dist};
        }
    }

    targetNextPoint(){
        let currentPivotIndex = this.game.pivotPoints.indexOf(this.targetPivotPoint);
        if (currentPivotIndex == this.game.pivotPoints.length - 1) {
            this.game.handleEnemyAtEndOfMap(this);
        } else {
            // ghost enemy.setTargetPivotPoint(this.pivotPoints[this.pivotPoints.length - 1]);
            this.setTargetPivotPoint(this.game.pivotPoints[currentPivotIndex + 1]);
        }
    }

    initializeMovement() {
        this.setTargetPivotPoint(this.game.pivotPoints[0]);
        this.jumpToTarget();
    }
}

class ScoutEnemyTD extends BasicEnemyTD{
    size = 10;
    health = 1;
    damage = 1;
    movementSpeed = 5;

    constructor(time, game) {
       super(time, game);
    }

    draw() {
        this.game.canvas.setColors("#F8F8FF");
        this.game.canvas.drawCircle(this.x, this.y, this.size, FILL);

        this.game.canvas.setColors("black");
        this.game.canvas.drawCircle(this.x - 5, this.y, this.size / 3, FILL);
        this.game.canvas.drawCircle(this.x + 5, this.y, this.size / 3, FILL);

        this.game.canvas.setColors("#ADD8E6");
        this.game.canvas.drawCircle(this.x + 5, this.y, this.size / 6, FILL);
        this.game.canvas.drawCircle(this.x - 5, this.y, this.size / 6, FILL);

        this.game.canvas.setColors("black");
        this.game.canvas.drawOval(this.x + 1, this.y + 8, this.size / 2.9, this.size / 6.1, FILL, 30);
        this.game.canvas.drawOval(this.x - 1, this.y + 8, this.size / 2.9, this.size / 6.1, FILL, 160);

        this.game.canvas.setColors("#F8F8FF");
        this.game.canvas.drawCircle(this.x, this.y + 4, this.size / 3, FILL);

        this.game.canvas.setColors("black");
        this.game.canvas.drawRectangle(this.x - 4 + this.size / 2, this.y - 20 + this.size * 1.3 / 2, this.size, this.size * 1.3, FILL);
        this.game.canvas.drawRectangle(this.x - 6 + this.size * 1.4 / 2, this.y - 10 + this.size / 4, this.size * 1.4, this.size / 2, FILL);

        this.game.canvas.setColors("red");
        this.game.canvas.drawRectangle(this.x - 4 + this.size / 2, this.y - 15 + this.size / 3.1 / 2, this.size, this.size / 3.1, FILL);
    }
}

class CrazyEnemyTD extends BasicEnemyTD {
    size = 15;
    health = 2;
    damage = 2;
    movementSpeed = 1.4;

    constructor(time, game) {
        super(time, game);
    }

    targetNextPoint(){
        let currentPivotIndex = this.game.pivotPoints.indexOf(this.targetPivotPoint);
        if (currentPivotIndex == this.game.pivotPoints.length - 1)
            this.game.handleEnemyAtEndOfMap(this);
        else if(currentPivotIndex == 0){
            this.setTargetPivotPoint(this.game.pivotPoints[1]);
        } else{
            let newIndex = Math.random() < 0.45 ? currentPivotIndex-1 : currentPivotIndex+1;
            this.setTargetPivotPoint(this.game.pivotPoints[newIndex]);
        }
    }

    draw() {
        this.game.canvas.setFillColor("blue");
        this.game.canvas.drawCircle(this.x, this.y, this.size, FILL);

        this.game.canvas.setFillColor("red");
        this.game.canvas.drawCircle(this.x, this.y, this.size*0.9, FILL);

        this.game.canvas.setFillColor("black");
        this.game.canvas.drawCircle(this.x-this.size/2, this.y, this.size/3, FILL);
        this.game.canvas.drawCircle(this.x+this.size/2, this.y, this.size/3, FILL);
        
        this.game.canvas.setFillColor("red");
        this.game.canvas.drawCircle(this.x+this.size/2, this.y, this.size/4, FILL);

        this.game.canvas.setFillColor("blue");
        this.game.canvas.drawCircle(this.x-this.size/2, this.y, this.size/6, FILL);
        this.game.canvas.drawRectangle(this.x, this.y+this.size/2, this.size*0.9, this.size*0.15, FILL);
    }
}

class SpyEnemyTD extends BasicEnemyTD {
    size = 10;
    health = 1;
    damage = 2;
    movementSpeed = 0.1;
    sneakXLength = 0;
    sneakYLength = 0;
    sneakSpeedMultiplier = 15;

    constructor(time, game) {
        super(time, game);
        this.sneakXLength = 0;
        this.sneakYLength = 0;
    }

    draw() {
        this.game.canvas.setFillColor("black");
        this.game.canvas.drawCircle(this.x, this.y, this.size, FILL);

        this.game.canvas.setColors("red");
        this.game.canvas.drawCircle(this.x, this.y, this.size/3, FILL);
        this.game.canvas.setColors("#FF000088");
        this.game.canvas.drawLine({x: this.x, y: this.y}, {x: this.x+this.sneakXLength, y: this.y+this.sneakYLength});
    }

    move(){
        let step = super.move();
        if(!step) return;

        let tp = this.targetPivotPoint;

        if(step.xStep != NaN) this.sneakXLength += step.xStep*this.sneakSpeedMultiplier;
        if(step.yStep != NaN) this.sneakYLength += step.yStep*this.sneakSpeedMultiplier;

        let xDist = tp.x - (this.x + this.sneakXLength);
        let yDist = tp.y - (this.y + this.sneakYLength);
        let dist = Math.sqrt(xDist ** 2 + yDist ** 2);
        if(dist < this.movementSpeed * this.sneakSpeedMultiplier){
            this.jumpToTarget();
            this.targetNextPoint();
            this.sneakXLength = 0;
            this.sneakYLength = 0;
        }
    }
}

class RegenSlimeEnemyTD extends BasicEnemyTD {
    size = 10;
    health = 1;
    damage = 1;
    movementSpeed = 0.4;
    healCycleCounter = 0;
    healCycleLength = 60; // initial value of 2 * game fps

    constructor(time, game) {
        super(time, game);
        this.initializeHealCycleLength();
    }

    draw() {
        // x = 100 y = 100 size = 100
        this.game.canvas.setFillColor("black");
        this.game.canvas.drawCircle(this.x, this.y, this.size, FILL);

        this.game.canvas.setFillColor("red");
        this.game.canvas.drawCircle(this.x - this.size/3, this.y - this.size/3, this.size/5, FILL);
        this.game.canvas.drawCircle(this.x + this.size/3, this.y - this.size/3, this.size/5, FILL);
        this.game.canvas.drawRectangle(this.x, this.y + this.size/3, this.size, this.size/3, FILL);    
        
        this.game.canvas.setFillColor("orange");
        this.game.canvas.drawRectangle(this.x - this.size/2, this.y + this.size/3, this.size/10, this.size*0.3, FILL);
        this.game.canvas.drawRectangle(this.x, this.y + this.size/3, this.size/10, this.size*0.3, FILL);
        this.game.canvas.drawRectangle(this.x + this.size/2, this.y + this.size/3, this.size/10, this.size*0.3, FILL);
    }

    initializeHealCycleLength = () => this.healCycleLength = this.game.canvas.fps * 3.5;

    handleDamageEffects(tower) {
        super.handleDamageEffects(tower);
        this.healCycleCounter = 0;
        this.initializeHealCycleLength();
        this.calculateSize();
    }

    move(){
        super.move();
        this.healCycleCounter++;
        if(this.healCycleCounter >= this.healCycleLength){
            this.healCycleCounter = 0;
            this.health += 1;
            this.calculateSize();
        }
    }

}

class GhostEnemyTD extends BasicEnemyTD {
    size = 10;
    health = 1;
    damage = 1;
    movementSpeed = 1;

    constructor(time, game) {
        super(time, game);
    }

    targetNextPoint(){
        let currentPivotIndex = this.game.pivotPoints.indexOf(this.targetPivotPoint);
        if (currentPivotIndex == this.game.pivotPoints.length - 1)
            this.game.handleEnemyAtEndOfMap(this);
        else
            this.setTargetPivotPoint(this.game.pivotPoints[this.game.pivotPoints.length - 1]);
    }

    draw() {
        this.game.canvas.setFillColor("black");
        this.game.canvas.drawCircle(this.x, this.y, this.size, FILL);

        this.game.canvas.setFillColor("white");
        this.game.canvas.drawCircle(this.x, this.y, this.size * 0.9, FILL);

        this.game.canvas.setFillColor("black");
        this.game.canvas.drawCircle(this.x, this.y + 5, this.size / 2, FILL);

        this.game.canvas.setFillColor("pink");
        this.game.canvas.drawCircle(this.x, this.y + 5, this.size / 2.5, FILL);

        this.game.canvas.setFillColor("black");
        this.game.canvas.drawRectangle(this.x - this.size / 2.5, this.y - this.size / 3, this.size / 2, this.size / 2, FILL);
        this.game.canvas.drawRectangle(this.x + this.size / 2.5, this.y - this.size / 3, this.size / 2, this.size / 2, FILL);

        this.game.canvas.setFillColor("red");
        this.game.canvas.drawCircle(this.x - 4, this.y - 3, this.size / 6, FILL);
        this.game.canvas.drawCircle(this.x + 4, this.y - 3, this.size / 6, FILL);
    }
}

class Tower extends GameObjectTD {
    cooldownTimer = 3;
    damage = 1;
    cooldown = this.cooldownTimer * 1000;
    target;
    cost = 3;
    range = 60;

    constructor(x = -100, y = -100, game, size=20) {
        super(x, y, size);
        this.game = game;
        this.cooldownTimer = 3;
        this.drawTowerFunc = this.#drawTower;
        this.shootFunc = this.shoot;
    }

    canShoot = () => this.target && this.cooldown <= 0;
    loseTarget = () => this.target = null;
    setTarget = (enemy) => this.target = enemy;

    draw() {
        this.drawTowerFunc();
        this.#drawRangeRing();
        this.#drawSightLine();
    }

    #drawTower() {
        this.game.canvas.setColors("blue");
        this.game.canvas.drawRectangle(this.x, this.y, this.size, this.size, FILL);
    }

    #drawRangeRing() {
        this.game.canvas.setFillColor("#00FF0022");
        this.game.canvas.setBorderColor("#00000077");
        this.game.canvas.drawCircle(this.x, this.y, this.range);
    }

    #drawSightLine() {
        if (this.target) {
            let cooldownPercentage = Math.round(255 * this.cooldown / 1000 / this.cooldownTimer);
            this.game.canvas.setColors(colorRGB(cooldownPercentage, 255 - cooldownPercentage, 0));
            this.game.canvas.drawLine({ x: this.x, y: this.y }, { x: this.target.x, y: this.target.y }, FRAME);
        }
    }

    process(deltaTime){
        this.decreaseCooldown(deltaTime);
        if (this.target && this.isInRange(this.target)) {
            if (this.canShoot())
                this.shootFunc();
        } else {
            this.loseTarget();
            for (let enemy of this.game.activeEnemies) {
                if (this.isInRange(enemy)) {
                    this.setTarget(enemy);
                }
            }
        }
    }

    decreaseCooldown(deltaTime) {
        if (this.cooldown > 0) this.cooldown -= deltaTime;
    }

    isInRange(enemy) {
        let dist = Math.sqrt((this.x - enemy.x) ** 2 + (this.y - enemy.y) ** 2);
        let radiiSum = this.range + enemy.size;
        return radiiSum > dist;
    }

    shoot() {
        this.cooldown = this.cooldownTimer * 1000;
        if (this.target)
            this.target.handleDamageEffects(this);
    }
}

class CannonTower extends Tower{
    damage = 1;
    size = 25;
    cost = 5;
    range = 50;

    constructor(x = -100, y = -100, game) {
        super(x, y, game, 25);
        this.cooldownTimer = 5;
        this.cooldown = this.cooldownTimer * 1000;
        super.drawTowerFunc = this.#drawTower;
        super.shootFunc = this.#shoot;
    }

    #drawTower() {
        this.game.canvas.setColors("black");
        this.game.canvas.drawRectangle(this.x, this.y, this.size, this.size, FILL);
    }

    #shoot() {
        this.cooldown = this.cooldownTimer * 1000;
        if (this.target){
            this.game.addObject(new Cannonball(this.x, this.y, this.target.x, this.target.y, this.damage, this.game));
        }
    }
}

class TowerProjectileTD extends GameObjectTD{
    constructor(x, y, size){
        super(x, y, size);
    }

    canCollideWith = (type) => type === BearcatTowerDefense.COLLISION_TYPES.ENEMY;
}

class Cannonball extends TowerProjectileTD{
    movementSpeed = 5;
    constructor(x, y, targetX, targetY, damage, game){
        super(x, y, 5);
        this.vector = this.#createVector(this.x, this.y, targetX, targetY);
        this.damage = damage;
        this.game = game;
        setTimeout(this.destroy.bind(this), 500);
    }

    process(deltaTime){
        this.#handleMovement();
    }

    draw(){
        this.game.canvas.setFillColor("gray");
        this.game.canvas.setBorderColor("black");
        this.game.canvas.drawCircle(this.x, this.y, this.size);
    }

    destroy(){
        this.game.removeObject(this);
    }

    #handleMovement(){
        this.x += this.vector.x*this.movementSpeed;
        this.y += this.vector.y*this.movementSpeed;
    }

    handleCollision(enemy){
        enemy.handleDamageEffects(this);
    }

    #createVector(x1, y1, x2, y2){
        let xDist = (x2-x1);
        let yDist = (y2-y1);
        let dist = Math.sqrt(xDist**2 + yDist**2);
        return {x: xDist/dist, y: yDist/dist};
    }
}