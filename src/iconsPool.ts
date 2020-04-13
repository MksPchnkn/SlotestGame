import "phaser";
import Image = Phaser.GameObjects.Image;
import Scene = Phaser.Scene;

export class IconsPool {

    private iconsNames: Array<string> = [];
    private iconsCache: {[id:string]:Array<Image>} = {};
    private workingScene: Scene = null;
    readonly iconHeight: integer = 150;
    readonly iconWidth: integer = 153;

    constructor(iconsConfig: Object, workingScene: Scene) {
        this.workingScene = workingScene;
        for (var iconName in iconsConfig) {
            this.workingScene.load.image(iconName, iconsConfig[iconName]);
            this.iconsCache[iconName] = new Array<Image>();
            this.iconsNames.push(iconName);
        }
    }

    getRandomIcon(): Image {
        let chosenIndex = Math.round(Math.random() * (this.iconsNames.length - 1));
        return this.getSpecifiedIcon(this.iconsNames[chosenIndex]);
    }

    getNextIcon(prevIconInstance:Image): Image {
        return this.getSpecifiedIcon(this.getNextIconName(prevIconInstance.texture.key));
    }

    getPrevIcon(nextIconInstance:Image): Image {
        return this.getSpecifiedIcon(this.getPrevIconName(nextIconInstance.texture.key));
    }

    getNextIconName(iconName:string): string {
        let nextIconIndex = this.iconsNames.indexOf(iconName);
        nextIconIndex--;
        if (nextIconIndex < 0) nextIconIndex = this.iconsNames.length - 1;
        return this.iconsNames[nextIconIndex];
    }

    getPrevIconName(iconName:string): string {
        let prevIconIndex = this.iconsNames.indexOf(iconName);
        prevIconIndex++;
        if (prevIconIndex > this.iconsNames.length - 1) prevIconIndex = 0;
        return this.iconsNames[prevIconIndex];
    }

    getSpecifiedIcon(iconName:string): Image {
        var imageInstance: Image = null;
        if (this.iconsCache[iconName].length > 0) {
            imageInstance = this.iconsCache[iconName].pop();
            imageInstance.setActive(true).setVisible(true);
            return imageInstance;
        }
        imageInstance = this.workingScene.add.image(0, 0, iconName);
        return imageInstance;
    }

    putUnusedIconToCache(iconImage:Image): void {
        iconImage.setActive(false).setVisible(false);
        this.iconsCache[iconImage.texture.key].push(iconImage);
    }
}