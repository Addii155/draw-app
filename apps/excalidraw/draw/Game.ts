'use client';

import { getexistingShapesFromDB } from "./https";

type shape ={
    type:"rect";
    starteX:number;
    startY: number;
    rectWidth:number;
    rectHeight : number
} | {
     type:"circle";
     centreX:number;
     centreY:number;
     radius:number
}
| {
    type:"line",
    startX:number,
    startY:number,
    endX:number,
    endY:number
}

type shapeType = "rect" | "circle" | "line"

export class Game {
    private canvas:HTMLCanvasElement;
    private ctx : CanvasRenderingContext2D;
    private existingShape:shape[] = [];
    private roomId : string;
    private clicked : boolean;
    private startX  = 0;
    private startY = 0;
    private shapeType:shapeType= "rect";
    private socket: WebSocket | null = null;
    


    constructor(canvas:HTMLCanvasElement,roomId:string, socket: WebSocket | null)
    {
        this.clicked=false;
        this.canvas=canvas;
        this.ctx= canvas.getContext("2d")!;
        this.roomId = roomId;
        this.initMouseHandlers();
        this.socket = socket;
        this.init();
        this.initHandlers()
    }
    initHandlers()
    {
        if(!this.socket) return;
        this.socket.onmessage = (event)=>{
            const msg = JSON.parse(event.data);
            console.log('msg onmessage',msg)
            if(msg.type==="chat")
            {
                const shapeObj: shape = JSON.parse(msg.message);
                this.existingShape.push(shapeObj);
                this.draw();
            }
        }
    }
    async init(){
        const exisitingShapeDb = await getexistingShapesFromDB(this.roomId);
        console.log("Existing shapes from DB:", exisitingShapeDb);
        
        // API returns array directly, not { lastMsg: [...] }
        if(Array.isArray(exisitingShapeDb.lastMsg)) {
            for (const msg of exisitingShapeDb.lastMsg) {
                const shapeObj: shape = JSON.parse(msg.message);
                this.existingShape.push(shapeObj);
            }
        }
        this.draw();
    }
    // clearCanvasAndDraw(){
    //     this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
    //     this.draw();
    // }
    destroy()
    {
        this.canvas.removeEventListener('mousedown',this.mouseDownHandler)
        this.canvas.removeEventListener('mouseup',this.mouseUpHandler)
        this.canvas.removeEventListener('mousemove',this.mouseMoveHandler)  
    }
     mouseDownHandler=(e:MouseEvent)=>{
        this.clicked=true;
        this.startX = e.clientX;
        this.startY = e.clientY;
    }
    mouseUpHandler=(e:MouseEvent)=>{
        if(!this.clicked) return; // Prevent duplicate triggers
        this.clicked = false;
        
        let width = e.clientX - this.startX;
        let height = e.clientY - this.startY;
        let Shape: shape | undefined;
        
        if(this.shapeType==="rect"){
            Shape = {
                type:"rect",
                starteX: this.startX,
                startY: this.startY,
                rectWidth: width,
                rectHeight: height
            }
        }
        else if(this.shapeType==="circle")
        {
            const radius = Math.sqrt(width*width + height*height)/2;
            Shape = {
                type : "circle",
                radius: radius,
                centreX : this.startX + radius,
                centreY : this.startY + radius
            }
        }
        else if(this.shapeType==="line")
        {
            Shape = {
                type:"line",
                startX: this.startX,
                startY: this.startY,
                endX: e.clientX,
                endY: e.clientY
            }
        }
        if(!Shape) return;
        console.log("Shape to be sent:", Shape);
        // this.existingShape.push(Shape);
        this.socket?.send(JSON.stringify({
            type:"chat",
            roomId : this.roomId,
            message: JSON.stringify(Shape)
        }))
    }
    setShape(shape: "rect"| "circle" | "line")
    {
        this.shapeType=shape;
    }
    draw()
    {
        this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
        this.ctx.strokeStyle = "rgba(255,255 , 255)";
        // this.ctx.fillRect(0,0,this.canvas.width,this.canvas.height);
        for(const shape of this.existingShape)
        {
            if(shape.type==="rect")
            {
                this.ctx.strokeStyle = "rgba(255, 255, 255, 1)";
                this.ctx.strokeRect(shape.starteX,shape.startY,shape.rectWidth,shape.rectHeight);
            }
            else if(shape.type==="circle")
            {
                this.ctx.beginPath();
                
                this.ctx.arc(shape.centreX,shape.centreY,Math.max(shape.radius),0,Math.PI*2);
                this.ctx.stroke();
            }
            else if(shape.type==="line")
            {
                this.ctx.beginPath();
                this.ctx.moveTo( shape.startX, shape.startY );;
                this.ctx.lineTo( shape.endX, shape.endY );
                this.ctx.stroke();
            }
        }
    }
    mouseMoveHandler=(e:MouseEvent)=>{
        if(this.clicked)
        {
            const width = e.clientX - this.startX;
            const height = e.clientY - this.startY;
           
            this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
            const selectedShape : shapeType = this.shapeType;
            this.draw();
            if(selectedShape==="rect")
            {
                // this.ctx.strokeStyle  = "rgba(255, 255, 255, 1)";
                this.ctx.strokeRect(this.startX,this.startY,width,height);
            }
            else if(selectedShape==="circle")
            {
                this.ctx.beginPath();
                const radius = Math.max(width,height)/2;
                this.ctx.arc(this.startX + radius,this.startY + radius,radius,0,Math.PI*2);
                this.ctx.stroke();
            }
            else if(selectedShape==="line")
            {
                this.ctx.beginPath();
                this.ctx.moveTo( this.startX, this.startY );;
                this.ctx.lineTo( e.clientX, e.clientY );
                this.ctx.stroke();
            }
        }
    }
    initMouseHandlers(){
        this.canvas.addEventListener('mousedown',this.mouseDownHandler)
        this.canvas.addEventListener('mouseup',this.mouseUpHandler)
        this.canvas.addEventListener('mousemove',this.mouseMoveHandler)
    }
}