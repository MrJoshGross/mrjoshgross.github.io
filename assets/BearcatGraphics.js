/**
 * Wrapper class to make canvas drawing easier + provide targeted functionality for educational purposes
 * @author https://github.com/mrjoshgross
 */
class BearcatGraphics{
    constructor(width, height, canvasName){
        if(width == null) width = 600;
        if(height == null) height = 450;
        if(canvasName == null) canvasName = "Test";
        this.canvas = this.#createCanvas(width, height, canvasName);
        this.setFillColor("white");
        this.setBorderColor("black");
        this.width = width;
        this.height = height;
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
        return document.getElementById(canvasName).getContext("2d");
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

    /**
     * @param {number} thickness 
     */
    setLineThickness(thickness){
        this.canvas.lineWidth = thickness;
    }

    /**
     * Draws a filled rectangle whose topleft corner is at (x,y).
     * Color is the canvas' fillStyle.
     * @param {number} x 
     * @param {number} y 
     * @param {number} width 
     * @param {number} height 
     */
    drawFilledRectangle(x, y, width, height){
        this.canvas.fillRect(x, y, width, height)
    }

    /**
     * Draws a framed rectangle whose topleft corner is at (x,y).
     * Color is the canvas' strokeStyle.
     * @param {number} x 
     * @param {number} y 
     * @param {number} width 
     * @param {number} height 
     */
    drawFramedRectangle(x, y, width, height){
        this.canvas.strokeRect(x, y, width, height);
    }

    /**
     * Draws a framed and filled rectangle, whose topleft corner is at (x,y).
     * Fill color is the canvas' fillStyle.
     * Frame color is the canvas' strokeStyle.
     * @param {number} x 
     * @param {number} y 
     * @param {number} width 
     * @param {number} height 
     */
    drawFillFramedRectangle(x, y, width, height){
        this.drawFilledRectangle(x, y, width, height);
        this.drawFramedRectangle(x, y, width, height);
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

    drawFilledTriangle(x, y, length){
        this.canvas.beginPath();
        this.canvas.moveTo(x-(length/2), y+(length/2));
        this.canvas.lineTo(x, y-(length/2));
        this.canvas.lineTo(x+(length/2), y+(length/2));
        this.canvas.lineTo(x-(length/2), y+(length/2));
        this.canvas.fill();
    }

    drawFramedTriangle(x, y, length){
        this.canvas.beginPath();
        this.canvas.moveTo(x-(length/2), y+(length/2));
        this.canvas.lineTo(x, y-(length/2));
        this.canvas.lineTo(x+(length/2), y+(length/2));
        this.canvas.lineTo(x-(length/2), y+(length/2));
        this.canvas.lineTo(x, y-(length/2)); // silly
        this.canvas.stroke();
    }

    drawFillFramedTriangle(x, y, length){
        this.drawFilledTriangle(x, y, length);
        this.drawFramedTriangle(x, y, length);
        
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