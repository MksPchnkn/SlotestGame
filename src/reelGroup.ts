import Container = Phaser.GameObjects.Container;
import Scene = Phaser.Scene;
import Image = Phaser.GameObjects.Image;
import {Reel} from "./reel";
import {IconsPool} from "./iconsPool";
import {SpinWinData} from "./spinWinData";

export class ReelGroup {

    private fullSpinMsecs:integer = 2000;
    private reelSpinDelay:integer = 0;
    private reelStopDelay:integer = 500;
    private stopTimeoutId:integer = 0;
    private readyToStopByTime:boolean = false;
    private readyToStopByCombination:boolean = false;

    private _isSpinning:boolean = false;
    private isStopping:boolean = false;
    private reelsContainer:Container = null;
    private reelsArray:Array<Reel> = [];

    private paytableDataObject:any = null;
    private spinWinLineKeys:Array<string> = null;
    private spinWin:integer = 0;
    private spinWinLinesOnReel:Array<string> = [];
    private spinEndCallback:Function = null;

    constructor(slotConfig:any, phaserScene:Scene, iconsPool:IconsPool, startX:integer, startY:integer, spinEndCallback:Function) {
        this.spinEndCallback = spinEndCallback;
        this.paytableDataObject = slotConfig.paytable;
        this.reelsContainer = phaserScene.add.container(0, 0);
        for (let i = 0; i < slotConfig.reelAmount; i++) {
            let reelBg:Image = phaserScene.add.image(startX + i * iconsPool.iconWidth, startY, slotConfig.reelBgFile).setOrigin(0, 0);
            let reelContainer:Container = phaserScene.add.container(reelBg.x - 4, reelBg.y);
            this.reelsContainer.add(reelBg);
            this.reelsContainer.add(reelContainer);
            let reel:Reel = new Reel(iconsPool, reelContainer, 335, slotConfig.iconsAmount, this.onReelStopped.bind(this));
            this.reelsArray.push(reel);
        }
    }

    spin():void {
        if (!this._isSpinning) {
            let spinDelay:integer = 0;
            for (let i = 0; i < this.reelsArray.length; i++) {
                this.reelsArray[i].spin(spinDelay);
                spinDelay += this.reelSpinDelay;
            }
            this.spinWin = 0;
            this._isSpinning = true;
            this.readyToStopByTime = false;
            this.readyToStopByCombination = false;
            this.stopTimeoutId = setTimeout(this.setReadyToStopByTime.bind(this), this.fullSpinMsecs);
        }
    }

    get isSpinning():boolean{
        return this._isSpinning;
    }

    stop():void {
        if (!this.isStopping) {
            this.isStopping = true;
            if (this.stopTimeoutId > 0) {
                clearTimeout(this.stopTimeoutId);
                this.stopTimeoutId = 0;
            }
            var stopDelay:integer = 0;
            for (let i = 0; i < this.reelsArray.length; i++) {
                if (!this.reelsArray[i].isStopping) {
                    this.reelsArray[i].stop(stopDelay);
                    stopDelay += this.reelStopDelay;
                }
            }
        }
    }

    onReelStopped():void {
        for (let i = 0; i < this.reelsArray.length; i++) {
            if (this.reelsArray[i].isSpinning) return;
        }
        this.allReelsStopped();
    }

    allReelsStopped():void {
        this._isSpinning = false;
        this.isStopping = false;
        this.readyToStopByTime = false;
        this.readyToStopByCombination = false;
        if (this.spinEndCallback != null){
            this.spinEndCallback(new SpinWinData(this.spinWin, this.spinWinLineKeys));
        }
    }

    blinkWinIcons():void{
        for (let i = 0; i<this.reelsArray.length; i++){
            this.reelsArray[i].blinkWinIcons(this.spinWinLinesOnReel);
        }
    }

    stopBlinkWinIcons():void{
        for (let i = 0; i<this.reelsArray.length; i++){
            this.reelsArray[i].stopBlinkWinIcons(this.spinWinLinesOnReel);
        }
    }

    renderUpdate():void {
        for (let i = 0; i < this.reelsArray.length; i++) {
            if (this.reelsArray[i].isSpinning) {
                this.reelsArray[i].renderUpdate();
            }
        }
        if (this.readyToStopByCombination && this.readyToStopByTime) {
            this.stop();
        }
    }

    setReadyToStopByTime():void {
        this.stopTimeoutId = 0;
        this.readyToStopByTime = true;
    }

    setCombination(combinationObject:Array<Array<string>>):void {
        this.spinWin = 0;
        this.spinWinLineKeys = [];
        this.spinWinLinesOnReel = [];
        let reelCombSize:integer = combinationObject[0].length;
        let allReelsSameSize:boolean = true;
        for (let reelIndex = 0; reelIndex < this.reelsArray.length; reelIndex++) {
            this.reelsArray[reelIndex].setCombination(combinationObject[reelIndex]);
            if (allReelsSameSize && reelCombSize !== combinationObject[reelIndex].length) {
                allReelsSameSize = false;
            }
        }
        if (allReelsSameSize) {
            var lineType:string = (reelCombSize === 1) ? "center" : "top";
            for (let iconLineIndex = 0; iconLineIndex < combinationObject[0].length; iconLineIndex++) {
                var inLineIcons:Array<string> = [];
                var allIconsSame = true;
                if (iconLineIndex === 1) lineType = "bottom";
                for (let iconReelIndex = 0; iconReelIndex < combinationObject.length; iconReelIndex++) {
                    inLineIcons.push(combinationObject[iconReelIndex][iconLineIndex]);
                    if (allIconsSame && inLineIcons.length > 0 && inLineIcons[0] !== combinationObject[iconReelIndex][iconLineIndex]) {
                        allIconsSame = false;
                    }
                }
                if (allIconsSame) {
                    let lineIconName:string = inLineIcons[0];
                    if (this.paytableDataObject.full.hasOwnProperty(lineIconName)) {
                        if (this.spinWinLinesOnReel.indexOf(lineType) === -1) this.spinWinLinesOnReel.push(lineType);
                        if (this.paytableDataObject.full[lineIconName].hasOwnProperty("any")) lineType = "any";
                        console.info("WIN: all [" + inLineIcons[0] + "] on line [" + lineType + "]: " + this.paytableDataObject.full[lineIconName][lineType]);
                        this.spinWin += this.paytableDataObject.full[lineIconName][lineType];
                        this.spinWinLineKeys.push(lineIconName+"-"+lineType);
                    }
                } else {
                    for (let combinationIndex = 0; combinationIndex < this.paytableDataObject.comb.length; combinationIndex++) {
                        let allIconsInSet:boolean = true;
                        let checkCombination:any = this.paytableDataObject.comb[combinationIndex];
                        for (let j = 0; j < inLineIcons.length; j++) {
                            if (checkCombination.icons.indexOf(inLineIcons[j]) === -1) {
                                allIconsInSet = false;
                                break;
                            }
                        }
                        if (allIconsInSet){
                            if (this.spinWinLinesOnReel.indexOf(lineType) === -1) this.spinWinLinesOnReel.push(lineType);
                            if (checkCombination.lines.hasOwnProperty("any")) lineType = "any";
                            console.info("WIN: comb ["+inLineIcons.join(",")+"] on line ["+lineType+"]: "+checkCombination.lines[lineType]);
                            this.spinWin += checkCombination.lines[lineType];
                            this.spinWinLineKeys.push(checkCombination.icons.join(",")+"-"+lineType);
                        }
                    }
                }
            }
        }
        this.readyToStopByCombination = true;
    }
}