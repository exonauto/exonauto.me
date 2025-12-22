import GUI from 'lil-gui';

import './main.css';

class DrawingPage {
    private canvas: HTMLCanvasElement;
    private context: CanvasRenderingContext2D;
    private paint: boolean;

    private clickX: number[] = [];
    private clickY: number[] = [];
    private clickDrag: boolean[] = [];

    private clickColors: string[] = [];
    private currentColor: string = 'white';

    private clickStrokeSizes: number[] = [];
    private currentStrokeSize: number = 4;
    
    private baseImage = new Image();

    private saveVer = 0.1

    constructor(/*imageSrc: string*/) {
        let canvas = document.getElementById('awesome') as
                 HTMLCanvasElement;

        canvas.width = 1024*4; 
        canvas.height = 1024*4;
        // this.baseImage.src = imageSrc;
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
        this.createSaveLoaderEvent();
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

    private createSaveLoaderEvent() {
        const fileInput = document.getElementById('fileInput') as HTMLInputElement;
        if (!fileInput) return;
    
        fileInput.addEventListener('change', (event: Event) => {
            const target = event.target as HTMLInputElement;
            const file = target.files?.[0];
            if (!file) return;
    
            console.log('File selected:', file.name);
    
            const reader = new FileReader();
            reader.onload = (e: ProgressEvent<FileReader>) => {
                const text = e.target?.result;
                if (typeof text === 'string') {
                    try {
                        let data = JSON.parse(text);
                        this.parseSaveFile(data)
                        console.log('File content loaded:', data);
                    } catch (err) {
                        console.error('Error parsing save:', err);
                    }
                }
            };
    
            reader.readAsText(file); // Use readAsText for JSON or custom text files
        });
    }

    private addColorButtons() {
        let colorsDiv = document.getElementById('colors');
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
        let controlDiv = document.getElementById('controls') as Node;
        const gui = new GUI( {container: controlDiv} );
        const controls = {
            saveJson: () => this.saveJson(),
            savePng: () => this.savePng(),
            clear: () => this.clearEventHandler(),
            loadFile : () => { document.getElementById('fileInput')!.click() },
            strokeSize: this.currentStrokeSize ?? 4
        };

        const saveFolder = gui.addFolder('saves');
        saveFolder.add(controls, 'saveJson').name('Save current as .json');
        saveFolder.add(controls, 'savePng').name('Save current as .png');
        saveFolder.add(controls, 'loadFile').name('load save file');

        gui.add(controls, 'clear').name('Clear');

        gui.add(controls, 'strokeSize', 1, 40, 1)
        .name('Stroke size')
        .onChange((value: number) => {
            this.currentStrokeSize = value;
        });
    }

    private convertToSaveFile(){
        let save = {
            version: this.saveVer,
            dateSaved: new Date().toISOString(),
            this: this
        }

        return save;
    }    

    private parseSaveFile(data:any){
        if (data.version !== this.saveVer) alert('Save file version isnt same as current, may cause issues')

        let save:this = data.this;

        this.clickX = save.clickX;
        this.clickY = save.clickY;
        this.clickDrag = save.clickDrag;
        this.clickColors = save.clickColors;
        this.clickStrokeSizes = save.clickStrokeSizes;
        
        this.redraw();
    }

    private saveJson(){
        let save = this.convertToSaveFile();
        const blob = new Blob([JSON.stringify(save, null, 2)], {
            type: "application/json",
        });

        var blobUrl = URL.createObjectURL(blob);
        
        var link = document.createElement("a");
        link.href = blobUrl;
        let date = new Date();
        link.download = `${date.toISOString()}.sketch`;
        link.innerText = "Save file @"+date.toLocaleDateString();
                
        let controlDiv = document.getElementById('controls');
        if (!controlDiv) return alert('Unable to generate a save file link. \n While the json file creation failed, your file is not lost. \n Put this into a .json file, and it should load fine. \n '+JSON.stringify(save))
        controlDiv.appendChild(link);
        controlDiv.appendChild(document.createElement('br'))
    }

    private savePng(){
        const canvas = this.canvas;
        let image = canvas.toDataURL();
        
        let link = document.createElement('a');
        let date = new Date();
        link.innerText = "Save png @"+date.toLocaleDateString();
        link.download = `sketch_${date.toLocaleDateString()}.png`;
        link.href = image;

        document.getElementById('controls')!.appendChild(link);
        document.getElementById('controls')!.appendChild(document.createElement('br'))
    }
    
    private redraw() {
        this.context.strokeStyle = 'white';
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawBase()

        let clickX = this.clickX;
        let context = this.context;
        let clickDrag = this.clickDrag;
        let clickY = this.clickY;
        for (let i = 0; i < clickX.length; ++i) {
            context.beginPath();
            context.strokeStyle = this.clickColors[i];
            context.lineWidth = this.clickStrokeSizes[i];
            if (clickDrag[i] && i) {
                context.moveTo(clickX[i - 1], clickY[i - 1]);
            } else {
                context.moveTo(clickX[i] - 1, clickY[i]);
            }
    
            context.lineTo(clickX[i], clickY[i]);
            context.stroke();
        }
        context.closePath();
    }

    private drawBase(){
        this.context.drawImage(this.baseImage, 0, 0);
    }

    private addClick(x: number, y: number, dragging: boolean) {
        this.clickX.push(x);
        this.clickY.push(y);
        this.clickColors.push(this.currentColor);
        this.clickStrokeSizes.push(this.currentStrokeSize)
        this.clickDrag.push(dragging);
    }
        
    private clearCanvas() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.clickX = [];
        this.clickY = [];
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
                
                this.clickY.splice(i);
                this.clickX.splice(i);
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