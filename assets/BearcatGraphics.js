/**
 * Wrapper class to make canvas drawing easier + provide targeted functionality for educational purposes
 * @author https://github.com/mrjoshgross
 */
class BearcatGraphics {
    static RADTODEG = Math.PI / 180;
    static STAR_ROTATION_CORRECTION = -18; // determine the correct formula iot not need this
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

    constructor(width, height, canvasName) {
        if (width == null) width = 600;
        if (height == null) height = 450;
        if (canvasName == null) canvasName = "Test";
        this.canvas = this.#createCanvas(width, height, canvasName);
        this.setFillColor("white");
        this.setBorderColor("black");
        this.width = width;
        this.height = height;
        this.fps = 60;
        this.mouseX = -1;
        this.mouseY = -1;
        this.addEventListener(BearcatGraphics.EVENT_TYPES.MOUSEMOVE, (e) => { this.mouseX = this.getMouseX(e); this.mouseY = this.getMouseY(e) });
        this.addEventListener(BearcatGraphics.EVENT_TYPES.MOUSELEAVE, () => { this.mouseX = -1; this.mouseY = -1 });
        setInterval(this.update, 1000 / this.fps);
    }

    /**
     * @param {number} width 
     * @param {number} height 
     * @param {string} canvasName 
     * @returns {canvas.getContext}
     */
    #createCanvas(width, height, canvasName) {
        if (!document.body) this.#createBody();
        let canvas = this.#buildCanvas(width, height, canvasName);
        document.body.appendChild(canvas);
        console.log("Created canvas sucessfully!");
        this.canvasElement = document.getElementById(canvasName);
        return this.canvasElement.getContext("2d");
    }

    /**
     * @param {*} width 
     * @param {*} height 
     * @param {*} canvasName 
     * @returns {canvas}
     */
    #buildCanvas(width, height, canvasName) {
        let canvas = document.createElement("canvas");
        canvas.id = canvasName;
        canvas.width = width;
        canvas.height = height;
        canvas.style.border = "4px solid black";
        canvas.lineWidth = 10;
        canvas.innerHTML = "<p> Use a browser that supports canvases! </p>";
        return canvas;
    }

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

    setOpacity = (percent) => this.canvas.globalAlpha = percent;

    /**
     * @param {number} thickness 
     */
    setLineThickness = (thickness) => this.canvas.lineWidth = thickness;
    

    drawRect(x, y, width, height, style = FILLFRAME, rotation){
        if (rotation) this.#rotateLocal(x, y, rotation);
        if(style === FILL) this.canvas.fillRect(x - width / 2, y - height / 2, width, height)
        else if(style === FRAME) this.canvas.strokeRect(x - width / 2, y - height / 2, width, height)
        else if(style === FILLFRAME){
            this.canvas.strokeRect(x - width / 2, y - height / 2, width, height);
            this.canvas.fillRect(x - width / 2, y - height / 2, width, height);
        }else console.error("Invalid style type: " + style + "; valid style types are FILL, FRAME, and FILLFRAME");
        if (rotation) this.resetCanvasRotation();
    }
    
    drawSquare = (x, y, length, style = FILLFRAME, rotation) => this.drawRect(x, y, length, length, style, rotation);

    drawOval(x, y, xRadius, yRadius, style = FILLFRAME, rotation = 0){
        if(rotation) this.#rotateLocal(x, y, rotation);
        this.canvas.beginPath();
        this.canvas.ellipse(x, y, xRadius, yRadius, rotation * BearcatGraphics.RADTODEG, 0, 2 * Math.PI);
        this.canvas.fill();
        if(style === FILL) this.canvas.fill();
        else if(style === FRAME) this.canvas.stroke();
        else if(style === FILLFRAME){
            this.canvas.stroke();
            this.canvas.fill();
        }
        else console.error("Invalid style type: " + style + "; valid style types are FILL, FRAME, and FILLFRAME");
        if(rotation) this.resetCanvasRotation();
    }
    
    drawCircle = (x, y, radius, style = FILLFRAME) => this.drawOval(x, y, radius, radius, style);

    drawEquilateralTriangle(x, y, length, style = FILLFRAME, rotation) {
        let h = Math.sqrt(3 * length * length) / 2;
        let p1 = new Point(x - (length / 2), y + (h / 3));
        let p2 = new Point(x, y - (2 * h / 3));
        let p3 = new Point(x + (length / 2), y + (h / 3));
        this.#drawTriangle(x, y, p1, p2, p3, style, rotation);
    }

    drawIsoscelesTriangle(x, y, base, height, style, rotation){
        let p1 = new Point(x - (base / 2), y + (height / 3));
        let p2 = new Point(x, y - (2 * height / 3));
        let p3 = new Point(x + (base / 2), y + (height / 3));
        this.#drawTriangle(x, y, p1, p2, p3, style, rotation);
    }

    drawRightTriangle(x, y, length, style, rotation){
        let p1 = new Point(x - (length / 3), y + (length / 3));
        let p2 = new Point(x - (length / 3), y - (2 * length / 3));
        let p3 = new Point(x + (2 * length / 3), y + (length / 3));
        this.#drawTriangle(x, y, p1, p2, p3, style, rotation);
    }

    drawStar(x, y, length, style = FILLFRAME, rotation, rotateAroundPoint){
        if(!rotation) rotation = BearcatGraphics.STAR_ROTATION_CORRECTION; // determine the correct formula iot not need this
        let points = [];
        for(let i = 0; i < 5; i++){
            // outer
            points.push(new Point(x + length*Math.cos(((2*Math.PI*i)/5)), y + length*Math.sin(((2*Math.PI*i)/5))));

            // inner
            points.push(new Point(x + 2*length/5*Math.cos((2*Math.PI*i/5 + Math.PI/5)), y + 2*length/5*Math.sin((2*Math.PI*i/5 + Math.PI/5))));
        }
        this.drawPolygon(points, style, rotation, rotateAroundPoint);
    }

    drawPolygon(points, style, rotation, rotateAroundPoint){
        if(rotation) {
            let p = rotateAroundPoint === undefined ? this.findCenter(points) : rotateAroundPoint;
            this.#rotateLocal(p.x, p.y, rotation);
        }
        this.canvas.beginPath();
        this.canvas.moveTo(points[0].x, points[0].y);
        for(let i = 1; i < points.length; i++)
            this.canvas.lineTo(points[i].x, points[i].y);
        this.canvas.lineTo(points[0].x, points[0].y);
        if (style === FRAME || style === FILLFRAME) this.canvas.lineTo(points[1].x, points[1].y); // prevents jagged p1 corner on stroke
        if(style === FILL) this.canvas.fill();
        else if(style === FRAME) this.canvas.stroke();
        else if(style === FILLFRAME){
            this.canvas.stroke();
            this.canvas.fill();
        }
        else console.error("Invalid style type: " + style + "; valid style types are FILL, FRAME, and FILLFRAME");
        if(rotation) this.resetCanvasRotation();
    }

    findCenter(points){
        let xAverage = 0;
        let yAverage = 0;
        for(let p of points){
            xAverage += p.x;
            yAverage += p.y;
        }
        return new Point(xAverage/points.length, yAverage/points.length);
    }

    #drawTriangle(x, y, p1, p2, p3, style, rotation) {
        if (rotation) this.#rotateLocal(x, y, rotation);
        this.canvas.beginPath();
        this.canvas.moveTo(p1.x, p1.y);
        this.canvas.lineTo(p2.x, p2.y);
        this.canvas.lineTo(p3.x, p3.y);
        this.canvas.lineTo(p1.x, p1.y);
        if (style === FRAME || style === FILLFRAME) this.canvas.lineTo(p2.x, p2.y); // prevents jagged p1 corner on stroke
        if(style === FILL) this.canvas.fill();
        else if(style === FRAME) this.canvas.stroke();
        else if(style === FILLFRAME){
            this.canvas.stroke();
            this.canvas.fill();
        }
        else console.error("Invalid style type: " + style + "; valid style types are FILL, FRAME, and FILLFRAME");
        if (rotation) this.resetCanvasRotation();
    }

    drawImage(path, x, y, width, height, rotation){
        if (rotation) this.#rotateLocal(x, y, rotation);
        this.canvas.drawImage(path, x+width/2, y+height/2);
        if (rotation) this.resetCanvasRotation();
    }
    #rotateLocal(x, y, rotation) {
        this.canvas.translate(x, y);
        this.canvas.rotate(rotation * BearcatGraphics.RADTODEG);
        this.canvas.translate(-x, -y);
    }

    resetCanvasRotation = () => this.canvas.setTransform(1, 0, 0, 1, 0, 0);

    addEventListener = (type, func) => {
        if(type == BearcatGraphics.EVENT_TYPES.KEYDOWN || type == BearcatGraphics.EVENT_TYPES.KEYPRESS || type == BearcatGraphics.EVENT_TYPES.KEYUP) window.addEventListener(type, func);
        this.canvasElement.addEventListener(type, func);
    }

    getMouseX = (e) => e.x - this.canvasElement.getBoundingClientRect().left;

    getMouseY = (e) => e.y - this.canvasElement.getBoundingClientRect().top;

    mouseIsInScreen = () => this.mouseX > -1 && this.mouseX <= this.width && this.mouseY > -1 && this.mouseY <= this.height;

    setUpdateFunction(func) {
        this.update = func;
        setInterval(func, 1000 / this.fps);
    }

    getRandomColor() {
        let r = Math.floor(Math.random() * 255);
        let g = Math.floor(Math.random() * 255);
        let b = Math.floor(Math.random() * 255);
        return "#" + r.toString(16) + g.toString(16) + b.toString(16);
    }

    getRandomInteger = (max) => Math.floor(Math.random() * max);
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

function color(colorString){return COLORS[colorString];}

function color(r, g, b){`#${r.toString(16)}${g.toString(16)}${b.toString(16)}`;}

class Point{
    constructor(x, y){
        this.x = x;
        this.y = y;
    }

    distanceTo = (other) => Math.sqrt(((other.y-this.y)*(other.y-this.y))/((other.x-this.x)*(other.x-this.x)));
}