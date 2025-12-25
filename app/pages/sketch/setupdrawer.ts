import GUI from 'lil-gui';

import './main.css';
import { Saves } from './Saves';

export class DrawingPage {
    public canvas: HTMLCanvasElement;
    public context: CanvasRenderingContext2D;
    public paint: boolean;

    public clickPos: [number, number][] = [];
    public clickDrag: boolean[] = [];

    public clickColors: string[] = [];
    public currentColor: string = '#ffff';

    public clickStrokeSizes: number[] = [];
    public currentStrokeSize: number = 4;
    
    public background = { 	
        string: '#000000',
        alpha: 1
    };

    public baseImage = new Image();

    private saves: Saves;

    constructor(/*imageSrc: string*/) {
        let canvas = document.getElementById('awesome') as HTMLCanvasElement;
        canvas.width = 1024*4;
        canvas.height = 1024*4;
        
        let context = canvas.getContext("2d");

        if (!context) {
            throw new Error("Failed to get 2D context");
        } else {
            context.lineCap = 'round';
            context.lineJoin = 'round';
            context.strokeStyle = 'red';
            context.lineWidth = 1;
        }
        this.paint = false;

        this.canvas = canvas;
        this.context = context;

        this.redraw();
        this.createUserEvents();
        this.addColorButtons();
        this.addFunctionButtons();        
        this.saves = new Saves(this);
        window.addEventListener('keydown', this.keypressHandler);
    }

    private createUserEvents() {
        let canvas = this.canvas;
    
        canvas.addEventListener("mousedown", this.pressEventHandler);
        canvas.addEventListener("mousemove", this.dragEventHandler);
        canvas.addEventListener("mouseup", this.releaseEventHandler);
        canvas.addEventListener("mouseout", this.cancelEventHandler);
    
        canvas.addEventListener("touchstart", this.pressEventHandler);
        canvas.addEventListener("touchmove", this.dragEventHandler);
        canvas.addEventListener("touchend", this.releaseEventHandler);
        canvas.addEventListener("touchcancel", this.cancelEventHandler);
    }

    private addColorButtons() {
        let colorsDiv = document.getElementById('side-left');
        let colors = ["white", "black", "red", "green", "yellow", "blue", "brown", "orange", "pink", "purple", "gray"]

        for (let color of colors){
            let btn = document.createElement('BUTTON');
            btn.textContent = color;
            btn.onclick = () => {
                this.currentColor = color;
            }
        
            colorsDiv?.appendChild(btn);    
        }
    }

    private addFunctionButtons() {
        let controlRight = document.getElementById('controls') as Node;
        let controlLeft = document.getElementById('side-left') as Node;
        const guiRight = new GUI( {container: controlRight} );
        const guiLeft = new GUI( {container: controlLeft} );
        
        const controls = {
            saveJson: () => this.saves.saveEditableFile(),
            savePng: () => this.saves.savePng(),
            clear: () => this.clearCanvas(),
            loadFile : () => { document.getElementById('fileInput')!.click() },
            strokeSize: this.currentStrokeSize ?? 4
        };

        const saveFolder = guiRight.addFolder('saves');
        saveFolder.add(controls, 'saveJson').name('Save current as .json');
        saveFolder.add(controls, 'savePng').name('Save current as .png');
        saveFolder.add(controls, 'loadFile').name('Load save file');
        
        const controlFolder = guiLeft.addFolder('Controls')
        
        controlFolder.add(controls, 'clear').name('Clear canvas').onChange(this.redraw);
        controlFolder.add(controls, 'strokeSize', 1, 40, 1)
        .name('Stroke size')
        .onChange((value: number) => {
            this.currentStrokeSize = value;
        });
                
        guiLeft.addColor(this, 'currentColor').name('Stroke color');
        guiLeft.addColor(this.background, 'string').name('Background color');
        
        guiLeft.onChange(() => {
            this.redraw();
        });
        // controlFolder.add(this.canvas, 'width').onChange(this.redraw);
        // controlFolder.add(this.canvas, 'height').onChange(this.redraw);
    }
    
    public redraw() {
        this.context.strokeStyle = this.background.string;
        this.context.fillStyle = this.background.string;
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        let context = this.context;
        let clickDrag = this.clickDrag;
        
        for (let i = 0; i < this.clickPos.length; ++i) {
            context.beginPath();
            context.strokeStyle = this.clickColors[i];
            context.lineWidth = this.clickStrokeSizes[i];

            if (clickDrag[i] && i) {
                context.moveTo(this.clickPos[i - 1][0], this.clickPos[i - 1][1]);
            } else {
                context.moveTo(this.clickPos[i][0] - 1, this.clickPos[i][1]);
            }
    
            context.lineTo(this.clickPos[i][0], this.clickPos[i][1]);
            context.stroke();
        }
        context.closePath();
    }

    private drawBase(){
        this.context.drawImage(this.baseImage, 0, 0);
    }

    private addClick(x: number, y: number, dragging: boolean) {
        this.clickPos.push([x,y])
        this.clickColors.push(this.currentColor);
        this.clickStrokeSizes.push(this.currentStrokeSize)
        this.clickDrag.push(dragging);
    }
        
    private clearCanvas() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.clickPos = [];
        this.clickDrag = [];
        this.clickColors = [];
        this.clickStrokeSizes = [];
    }

    private clearEventHandler = () => {
        this.clearCanvas();
    }
    
    private releaseEventHandler = () => {
        this.paint = false;
        this.redraw();
    }
    
    private cancelEventHandler = () => {
        this.paint = false;
    }

    private pressEventHandler = (e: MouseEvent | TouchEvent) => {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
    
        let clientX: number;
        let clientY: number;
    
        if (e instanceof TouchEvent && e.changedTouches.length > 0) {
            clientX = e.changedTouches[0].clientX;
            clientY = e.changedTouches[0].clientY;
        } else if (e instanceof MouseEvent) {
            clientX = e.clientX;
            clientY = e.clientY;
        } else {
            return;
        }
    
        const x = (clientX - rect.left) * scaleX;
        const y = (clientY - rect.top) * scaleY;
    
        this.paint = true;
        this.addClick(x, y, false);
        this.redraw();
    }
    
    private dragEventHandler = (e: MouseEvent | TouchEvent) => {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
    
        let clientX: number;
        let clientY: number;
    
        if (e instanceof TouchEvent && e.changedTouches.length > 0) {
            clientX = e.changedTouches[0].clientX;
            clientY = e.changedTouches[0].clientY;
        } else if (e instanceof MouseEvent) {
            clientX = e.clientX;
            clientY = e.clientY;
        } else {
            return;
        }

        const x = (clientX - rect.left) * scaleX;
        const y = (clientY - rect.top) * scaleY;
    
        if (this.paint) {
            this.addClick(x, y, true);
            this.redraw();
        }
    
        e.preventDefault();
    }

    private keypressHandler = (e: KeyboardEvent) => {
        // console.log(e.ctrlKey, e.code)
        if ((e.ctrlKey || e.metaKey )&& e.code == 'KeyZ' ) {
            this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

            for (let i = this.clickDrag.length - 1; i > -1; i--) {
                if (this.clickDrag[i] ) continue;
                this.clickPos.splice(i);
                this.clickColors.splice(i);
                this.clickDrag.splice(i);
                this.clickStrokeSizes.splice(i);
                
                this.redraw();
                return;
            }

            this.redraw();
            e.preventDefault();
        } else if (e.code == 'KeyE'){
            const app = document.getElementById('app');
            if (app) {
                app.style.display = 'flex';
            }
        } else if (e.code == 'KeyZ') {
            const app = document.getElementById('app');
            if (app) {
                app.style.display = 'none';
            }
        }
    }
}

new DrawingPage()