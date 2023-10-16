/**
 * Wrapper class to make canvas drawing easier + provide targeted functionality for educational purposes
 * @author https://github.com/mrjoshgross
 */
class BearcatGraphics{
    static RADTODEG = Math.PI / 180;
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

    constructor(width, height, canvasName){
        if(width == null) width = 600;
        if(height == null) height = 450;
        if(canvasName == null) canvasName = "Test";
        this.canvas = this.#createCanvas(width, height, canvasName);
        this.setFillColor("white");
        this.setBorderColor("black");
        this.width = width;
        this.height = height;
        this.fps = 60;
        this.mouseX = -1;
        this.mouseY = -1;
        this.addEventListener(BearcatGraphics.EVENT_TYPES.MOUSEMOVE, (e)=>{this.mouseX = this.getMouseX(e); this.mouseY = this.getMouseY(e)});
        this.addEventListener(BearcatGraphics.EVENT_TYPES.MOUSELEAVE, ()=>{this.mouseX = -1; this.mouseY = -1});
        setInterval(this.update, 1000/this.fps);
    }

    /**
     * @param {number} width 
     * @param {number} height 
     * @param {string} canvasName 
     * @returns {canvas.getContext}
     */
    #createCanvas(width, height, canvasName){
        if(!document.body) this.#createBody();
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
    #buildCanvas(width, height, canvasName){
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
    #createBody(){
        let body = document.createElement("body");
        document.body = body;
    }

    /**
     * @param {string} color either a supported color name or rgb hex
     */
    setFillColor(color){
        this.canvas.fillStyle = color;
    }

    /**
     * @param {string} color either a supported color name or rgb hex
     */
    setBorderColor(color){
        this.canvas.strokeStyle = color;
    }

    setOpacity(percent){
        this.canvas.globalAlpha = percent;
    }

    /**
     * @param {number} thickness 
     */
    setLineThickness(thickness){
        this.canvas.lineWidth = thickness;
    }

    /**
     * Draws a filled rectangle centered at (x,y).
     * Color is the canvas' fillStyle.
     * @param {number} x 
     * @param {number} y 
     * @param {number} width 
     * @param {number} height
     * @param {number} rotation  
     */
    drawFilledRectangle(x, y, width, height, rotation){
        
        if(rotation){
            this.canvas.translate(x,y);
            this.rotateCanvas(rotation);
            this.canvas.translate(-x,-y);
        }
        this.canvas.fillRect(x-width/2, y-height/2, width, height);
        if(rotation) this.resetCanvasRotation();
    }

    /**
     * Draws a framed rectangle centered at (x,y).
     * Color is the canvas' strokeStyle.
     * @param {number} x 
     * @param {number} y 
     * @param {number} width 
     * @param {number} height 
     */
    drawFramedRectangle(x, y, width, height, rotation){
        if(rotation){
            this.canvas.translate(x,y);
            this.rotateCanvas(rotation);
            this.canvas.translate(-x,-y);
        }
        this.canvas.strokeRect(x-width/2, y-height/2, width, height);
        if(rotation) this.resetCanvasRotation();
    }

    /**
     * Draws a framed and filled rectangle, centered at (x,y).
     * Fill color is the canvas' fillStyle.
     * Frame color is the canvas' strokeStyle.
     * @param {number} x 
     * @param {number} y 
     * @param {number} width 
     * @param {number} height 
     */
    drawFillFramedRectangle(x, y, width, height, rotation){
        if(rotation){
            this.canvas.translate(x,y);
            this.rotateCanvas(rotation);
            this.canvas.translate(-x,-y);
        }
        this.drawFilledRectangle(x, y, width, height);
        this.drawFramedRectangle(x, y, width, height);
        if(rotation) this.resetCanvasRotation();
    }

    drawFilledCircle(x, y, radius){
        this.canvas.beginPath();
        this.canvas.arc(x, y, radius, 0, 2*Math.PI);
        this.canvas.fill();
    }

    drawFramedCircle(x, y, radius){
        this.canvas.beginPath();
        this.canvas.arc(x, y, radius-(this.canvas.lineWidth/2), 0, 2*Math.PI);
        this.canvas.stroke();
    }

    drawFillFramedCircle(x, y, radius){
        this.drawFilledCircle(x, y, radius-(3*this.canvas.lineWidth/4));
        this.drawFramedCircle(x, y, radius);
    }

    drawFilledOval(x, y, xRadius, yRadius, rotation){
        this.canvas.beginPath();
        this.canvas.ellipse(x, y, xRadius, yRadius, rotation*BearcatGraphics.RADTODEG, 0, 2*Math.PI);
        this.canvas.fill();
    }

    drawFramedOval(x, y, xRadius, yRadius, rotation){
        this.canvas.beginPath();
        this.canvas.ellipse(x, y, xRadius, yRadius, rotation*BearcatGraphics.RADTODEG, 0, 2*Math.PI);
        this.canvas.stroke();
    }

    drawFillFramedOval(x, y, xRadius, yRadius, rotation){
        this.drawFilledOval(x, y, xRadius, yRadius, rotation);
        this.drawFramedOval(x, y, xRadius, yRadius, rotation);
    }

    drawFilledEquilateralTriangle(x, y, length, rotation){
        let h = Math.sqrt(3*length*length)/2;
        if(rotation){
            this.canvas.translate(x, y);
            this.rotateCanvas(rotation);
            this.canvas.translate(-x, -y);
        }
        this.canvas.beginPath();
        this.canvas.moveTo(x-(length/2), y+(h/3));
        this.canvas.lineTo(x, y-(2*h/3));
        this.canvas.lineTo(x+(length/2), y+(h/3));
        this.canvas.lineTo(x-(length/2), y+(h/3));
        this.canvas.fill();
        if(rotation) this.resetCanvasRotation();
    }

    drawFramedEquilateralTriangle(x, y, length, rotation){
        let h = Math.sqrt(3*length*length)/2;
        if(rotation){
            this.canvas.translate(x, y);
            this.rotateCanvas(rotation);
            this.canvas.translate(-x, -y);
        }
        this.canvas.beginPath();
        this.canvas.moveTo(x-(length/2), y+(h/3));
        this.canvas.lineTo(x, y-(2*h/3));
        this.canvas.lineTo(x+(length/2), y+(h/3));
        this.canvas.lineTo(x-(length/2), y+(h/3));
        this.canvas.lineTo(x, y-(2*h/3)); // silly
        this.canvas.stroke();
        if(rotation) this.resetCanvasRotation();
    }

    drawFillFramedEquilateralTriangle(x, y, length, rotation){
        if(rotation){
            this.canvas.translate(x, y);
            this.rotateCanvas(rotation);
            this.canvas.translate(-x, -y);
        }
        this.drawFilledEquilateralTriangle(x, y, length);
        this.drawFramedEquilateralTriangle(x, y, length);
        if(rotation) this.resetCanvasRotation();
    }

    drawFilledRightTriangle(x, y, length, rotation){
        if(rotation){
            this.canvas.translate(x, y);
            this.rotateCanvas(rotation);
            this.canvas.translate(-x, -y);
        }
        this.canvas.beginPath();
        this.canvas.moveTo(x-(length/3), y+(length/3));
        this.canvas.lineTo(x-(length/3), y-(2*length/3));
        this.canvas.lineTo(x+(2*length/3), y+(length/3));
        this.canvas.lineTo(x-(length/3), y+(length/3));
        this.canvas.fill();
        if(rotation) this.resetCanvasRotation();
    }

    drawFramedRightTriangle(x, y, length, rotation){
        if(rotation){
            this.canvas.translate(x, y);
            this.rotateCanvas(rotation);
            this.canvas.translate(-x, -y);
        }
        this.canvas.beginPath();
        this.canvas.moveTo(x-(length/3), y+(length/3));
        this.canvas.lineTo(x-(length/3), y-(2*length/3));
        this.canvas.lineTo(x+(2*length/3), y+(length/3));
        this.canvas.lineTo(x-(length/3), y+(length/3));
        this.canvas.lineTo(x-(length/3), y-(2*length/3)); // silly
        this.canvas.stroke();
        if(rotation) this.resetCanvasRotation();
    }

    drawFillFramedRightTriangle(x, y, length, rotation){
        if(rotation){
            this.canvas.translate(x, y);
            this.rotateCanvas(rotation);
            this.canvas.translate(-x, -y);
        }
        this.drawFilledRightTriangle(x, y, length);
        this.drawFramedRightTriangle(x, y, length);
        if(rotation) this.resetCanvasRotation();
    }

    rotateCanvas(degrees){
        this.canvas.rotate(degrees*BearcatGraphics.RADTODEG);
    }

    resetCanvasRotation(){
        this.canvas.setTransform(1, 0, 0, 1, 0, 0);
    }

    addEventListener(type, func, params){
        this.canvasElement.addEventListener(type, func);
    }

    getMouseX(e){
        return e.x - this.canvasElement.getBoundingClientRect().left;
    }

    getMouseY(e){
        return e.y - this.canvasElement.getBoundingClientRect().top;
    }

    mouseIsInScreen(){
        return this.mouseX > -1 && this.mouseX <= this.width && this.mouseY > -1 && this.mouseY <= this.height;
    }

    setUpdateFunction(func){
        this.update = func;
        setInterval(func, 1000 / this.fps);
    }

    getRandomColor(){
        let r = Math.floor(Math.random() * 255);
        let g = Math.floor(Math.random() * 255);
        let b = Math.floor(Math.random() * 255);
        return "#"+r.toString(16)+g.toString(16)+b.toString(16);
    }

    getRandomInteger(max){
        return Math.floor(Math.random() * max);
    }
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

function color(colorString){
    return COLORS[colorString];
}

function color(r, g, b){
    return `#${r.toString(16)}${g.toString(16)}${b.toString(16)}`;
}