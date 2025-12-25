import type { DrawingPage } from "./setupdrawer";

type SaveBase = {
    clickDrag: boolean[];
    clickColors: string[];
    clickStrokeSizes: number[];
};

type SaveV1 = SaveBase & {
    saveVer: 0.1;
    clickX: number[];
    clickY: number[];
};

type SaveV2 = SaveBase & {
    saveVer: 0.2;
    clickPos: [number, number][];
};

type SaveV3 = SaveBase & {
    saveVer: 0.3;
    clickPos: [number, number][];
    background: { string: string; alpha: number };
};

type Save = SaveV1 | SaveV2 | SaveV3;

export class Saves {
    private drawingPage: DrawingPage;
    private saveVer = 0.3

    constructor(dp:DrawingPage){
        this.drawingPage = dp;
        this.createSaveLoaderEvent();
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
                        try {
                            this.parseSaveFile(data)
                        } catch (err) {
                            alert('error when loading save file')
                            console.log(err)
                        }
                        console.log('File content loaded:', data);
                    } catch (err) {
                        console.error('Error parsing save:', err);
                    }
                }
            };
    
            reader.readAsText(file);
        });
    }

    public parseSaveFile(data:any){
        const supportedSaveVers = [0.1, 0.2, 0.3];
        if (!supportedSaveVers.includes(data.version)) alert('Save file version isnt supported, unable to load file. if you think this is a mistake open a issue on https://github.com/exonauto/exonauto.me/issues');

        let save:Save = data.this;

        const savesSupportingCondensedClickArray = supportedSaveVers.slice(1);
        const savesSupportingBackgroundColors = supportedSaveVers.slice(2);

        if (save.saveVer == 0.1) {
            let newSaveArr: [number, number][] = []
                        
            for (let i = 0; i < save.clickX.length; i++){
                newSaveArr.push([save.clickX[i], save.clickY[i]])
            }
            
            this.drawingPage.clickPos = newSaveArr;
        }
        else if (savesSupportingCondensedClickArray.includes(save.saveVer)) {
            this.drawingPage.clickPos = save.clickPos
        }

        if (savesSupportingBackgroundColors.includes(save.saveVer)) {
            // i should probably make a more strongly typed save system but this works for now
            // @ts-ignore
            this.drawingPage.background = save.background
        } else {
            this.drawingPage.background = {string:"#000000", alpha:1};
        }

        this.drawingPage.clickDrag = save.clickDrag;
        this.drawingPage.clickColors = save.clickColors;
        this.drawingPage.clickStrokeSizes = save.clickStrokeSizes;
        
        this.drawingPage.redraw();
    }

    private convertToSaveFile(){
        let save = {
            version: this.saveVer,
            dateSaved: new Date().toISOString(),
            
            this: {
                clickPos: this.drawingPage.clickPos,
                clickDrag: this.drawingPage.clickDrag,
                
                clickColors: this.drawingPage.clickColors,
                clickStrokeSizes: this.drawingPage.clickStrokeSizes,
                
                currentStrokeSize: this.drawingPage.currentStrokeSize,
                currentColor: this.drawingPage.currentColor,
                
                width: this.drawingPage.canvas.width,
                height: this.drawingPage.canvas.height,

                background: this.drawingPage.background,
                
                saveVer: this.saveVer
            }
        }

        return save;
    }

    public saveEditableFile(){
        let save = this.convertToSaveFile();
        console.log(save)
        const blob = new Blob([JSON.stringify(save)], {
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

    public savePng(){
        const canvas = this.drawingPage.canvas;
        let image = canvas.toDataURL();

        let link = document.createElement('a');
        let date = new Date();
        link.innerText = "Save png @"+date.toLocaleDateString();
        link.download = `sketch_${date.toLocaleDateString()}.png`;
        link.href = image;

        document.getElementById('controls')!.appendChild(link);
        document.getElementById('controls')!.appendChild(document.createElement('br'))
    }
}