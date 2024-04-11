import * as dat from "dat.gui";

class DebugGui{
    constructor() {
        this.gui = new dat.GUI();
        this.folderList = [];
    }

    GuiAddFolder(folderName) {
        const floder =  this.gui.__folders[folderName]
        if(floder) {
            console.log(floder, 'x');
            return floder;
        } else {
            const floder = this.gui.addFolder(folderName);
            this.folderList.push({name: 'folderName', id: floder});
            return floder;
        }
        
    }

    GuiClose() {
        this.gui.close();
    }

    GuiOpen() {
        this.gui.open();
    } 
}

const debugGui = new DebugGui()
export default debugGui;