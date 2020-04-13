import {IconsPool} from "./iconsPool";
import Scene = Phaser.Scene;
import Container = Phaser.GameObjects.Container;
import Image = Phaser.GameObjects.Image;
import Text = Phaser.GameObjects.Text;

export class PayTable {

    reelsAmount: integer = 0;
    payLineElements: { [id: string]: Container } = {};
    payLineBlinkElements: Array<Container> = [];
    iconsPool: IconsPool = null;

    constructor(paytable: any, reelsAmount: integer, iconsPool: IconsPool, phaserGameInstance: Scene) {
        this.iconsPool = iconsPool;
        this.reelsAmount = reelsAmount;
        var payLineObj: any;
        var posX: integer = 540;
        var posY: integer = 30;
        var payTableContainer: Container = phaserGameInstance.add.container(posX, posY);
        payTableContainer.add(phaserGameInstance.add.text(0, 0, "PAYTABLE", {fontSize: "30px"}));
        var payLineIndex: integer = 1;
        for (var iconName in paytable.full) {
            payLineObj = paytable.full[iconName];
            if (payLineObj.hasOwnProperty("any")) {
                this.addPayoutItem(phaserGameInstance, payTableContainer, payLineIndex, iconName, "any", payLineObj.any);
                payLineIndex++;
            } else {
                for (var lineName in payLineObj) {
                    this.addPayoutItem(phaserGameInstance, payTableContainer, payLineIndex, iconName, lineName, payLineObj[lineName]);
                    payLineIndex++;
                }
            }
        }
        for (let i = 0; i < paytable.comb.length; i++) {
            payLineObj = paytable.comb[i];
            if (payLineObj.lines.hasOwnProperty("any")) {
                //add one line
                this.addPayoutItem(phaserGameInstance, payTableContainer, payLineIndex, payLineObj.icons, "any", payLineObj.lines.any);
                payLineIndex++;
            } else {
                for (var lineName in payLineObj) {
                    this.addPayoutItem(phaserGameInstance, payTableContainer, payLineIndex, payLineObj.icons, lineName, payLineObj.lines[lineName]);
                    payLineIndex++;
                }
            }
        }
    }

    setBlinkElements(linesArray: Array<string>): void {
        for (let i = 0; i < linesArray.length; i++) {
            this.payLineBlinkElements.push(this.payLineElements[linesArray[i]]);
        }
    }

    blinkWinElements(): void {
        this.setBlinkElementsVisibility(!this.payLineBlinkElements[0].visible);
    }

    stopBlinkElements(): void {
        this.setBlinkElementsVisibility(true);
        while (this.payLineBlinkElements.length > 0) this.payLineBlinkElements.pop();
    }

    setBlinkElementsVisibility(isVisible:boolean):void {
        for (let i = 0; i < this.payLineBlinkElements.length; i++) {
            this.payLineBlinkElements[i].visible = isVisible;
        }
    }

    addPayoutItem(phaserGameInstance:Scene, payTableContainer:Container, payLineIndex:integer, iconName:any, lineName:string, payoutValue:integer) {
        var iconObj:Image = null;
        var spacing:integer = 5;
        var displaySize:integer = 35;
        var stepY:number = displaySize * 1.2;
        var payLineContainer:Container = phaserGameInstance.add.container(0, payLineIndex * stepY);
        var payLineKey:string;
        if (Array.isArray(iconName)) {
            var currXPos:number = 0;
            var plusText:Text;
            for (let i = 0; i < iconName.length; i++) {
                iconObj = this.iconsPool.getSpecifiedIcon(iconName[i]);
                iconObj.displayWidth = iconObj.displayHeight = displaySize;
                iconObj.x = currXPos;
                iconObj.y = 0;
                payLineContainer.add(iconObj);
                currXPos += iconObj.displayWidth;
                if (i < iconName.length - 1) {
                    plusText = phaserGameInstance.add.text(iconObj.x + displaySize * 0.5 + spacing, 0, "+");
                    plusText.y = -plusText.height * 0.5;
                    payLineContainer.add(plusText);
                    currXPos = plusText.x + plusText.width + 2 * spacing + iconObj.displayWidth * 0.5;
                }
            }
            payLineKey = iconName.join(",");
        } else {
            for (let i = 0; i < this.reelsAmount; i++) {
                iconObj = this.iconsPool.getSpecifiedIcon(iconName);
                iconObj.displayWidth = iconObj.displayHeight = displaySize;
                iconObj.x = i * iconObj.displayWidth;
                iconObj.y = 0;
                payLineContainer.add(iconObj);
            }
            payLineKey = iconName;
        }
        var lineText:Text = phaserGameInstance.add.text(iconObj.x + displaySize * 0.5 + spacing, 0, lineName, {color: "#000"});
        lineText.y = -lineText.height * 0.5;
        payLineContainer.add(lineText);
        var payoutText:Text = phaserGameInstance.add.text(lineText.x + lineText.width + spacing, 0, payoutValue.toString(), {fontSize: "30px"});
        payoutText.y = -payoutText.height * 0.5;
        payLineContainer.add(payoutText);
        this.payLineElements[payLineKey + "-" + lineName] = payLineContainer;
        payTableContainer.add(payLineContainer);
    }
}