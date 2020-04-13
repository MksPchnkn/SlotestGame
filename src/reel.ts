import {IconsPool} from "./iconsPool";
import Container = Phaser.GameObjects.Container;
import Image = Phaser.GameObjects.Image;

export class Reel {

    private iconsPool:IconsPool = null;
    private phaserContainer:Container = null;

    private currentIcons:Array<Image> = [];
    private bottomIcon:Image = null;
    private bottomY:integer = 0;
    private bottomBorder:integer = 0;

    private stopIconsNamesArr:Array<string> = [];
    private stoppingIconIndex:integer = 0;
    private stoppingIcon:Image = null;
    private stoppingY:integer = 0;

    private spinSpeed:integer = 0;
    private maxSpeed:integer = 50;
    private speedAcceleration:number = 0.7;

    private _isSpinning:boolean = false;
    private _isStopping:boolean = false;
    private onStopCallback:Function = null;

    constructor(iconsPool:IconsPool, phaserContainer:Container, bottomBorder:integer, iconsAmount:integer, onStopCallback:Function) {
        this.speedAcceleration = this.maxSpeed * 0.02;
        this.onStopCallback = onStopCallback;
        this.iconsPool = iconsPool;
        this.phaserContainer = phaserContainer;
        this.bottomBorder = bottomBorder;
        this.bottomY = bottomBorder + iconsPool.iconHeight * 0.5;
        let firstY:number = this.bottomBorder * 0.5 - (iconsAmount > 2 ? this.iconsPool.iconHeight : this.iconsPool.iconHeight * 0.5);
        let newIcon:Image = null;
        for (let i = 0; i < iconsAmount; i++) {
            newIcon = (newIcon == null) ? iconsPool.getRandomIcon() : iconsPool.getNextIcon(newIcon);
            newIcon.x = iconsPool.iconWidth * 0.5;
            newIcon.y = firstY + i * iconsPool.iconHeight;
            this.phaserContainer.add(newIcon);
            this.currentIcons.push(newIcon);
        }
        this.bottomIcon = this.currentIcons[this.currentIcons.length - 1];
    }

    get isStopping():boolean{
        return this._isStopping;
    }

    get isSpinning():boolean{
        return this._isSpinning;
    }

    spin(spinDelay:integer):void {
        if (this._isSpinning) return;
        if (spinDelay > 0) {
            setTimeout(this.spin.bind(this), spinDelay, 0);
            return;
        }
        this._isSpinning = true;
        this.spinSpeed = 0;
    }

    renderUpdate():void {
        //standard speed processing
        if (this.spinSpeed < this.maxSpeed) {
            this.spinSpeed += this.speedAcceleration;
            if (this.spinSpeed > this.maxSpeed) this.spinSpeed = this.maxSpeed;
        }
        this.moveIconsOn(this.spinSpeed);

        //finalizing stop with Y-correction
        if (this._isStopping) {
            if (this.stoppingIcon.y > this.stoppingY) {
                this.moveIconsOn(this.stoppingY-this.stoppingIcon.y);
                this._isStopping = false;
                this._isSpinning = false;
                this.stopIconsNamesArr = null;
                this.stoppingIconIndex = this.currentIcons.indexOf(this.stoppingIcon);
                this.callOnStopCallback();
                return;
            }
        }

        //standard remove-add bottom icon to top of the reel
        if (this.bottomIcon.y > this.bottomY) {
            this.iconsPool.putUnusedIconToCache(this.currentIcons.pop());
            let newIcon = this.iconsPool.getNextIcon(this.currentIcons[0]);
            newIcon.y = this.currentIcons[0].y - this.iconsPool.iconHeight;
            newIcon.x = this.currentIcons[0].x;
            this.phaserContainer.add(newIcon);
            this.currentIcons.unshift(newIcon);
            this.bottomIcon = this.currentIcons[this.currentIcons.length - 1];
        }
    }

    moveIconsOn(yValue:number):void {
        for (let i = 0; i < this.currentIcons.length; i++) {
            this.currentIcons[i].y += yValue;
        }
    }

    stop(stopDelay:integer):void {
        if (!this._isStopping) {
            if (stopDelay > 0) {
                setTimeout(this.stop.bind(this), stopDelay, 0);
                return;
            }
            if (this.stopIconsNamesArr != null) {
                this.removeInvisibleIcons();
                this.insertStoppingIcons();
                this._isStopping = true;
            }
        }
    }

    setCombination(iconsNamesArr:Array<string>):void {
        this.stopIconsNamesArr = iconsNamesArr;
        console.info("setting combination to Reel: " + iconsNamesArr);
    }

    removeInvisibleIcons():void {
        while (this.currentIcons[0].y + this.iconsPool.iconHeight * 0.5 < 0) {
            this.iconsPool.putUnusedIconToCache(this.currentIcons.shift());
        }
    }

    insertStoppingIcons():void {
        var iconsToInsert:Array<Image> = [];
        for (let i = 0; i < this.stopIconsNamesArr.length; i++) {
            iconsToInsert.push(this.iconsPool.getSpecifiedIcon(this.stopIconsNamesArr[i]));
        }
        if (iconsToInsert.length === 1) { //if stopping on center icon, we'll add previous and next icon to reel
            iconsToInsert.push(this.iconsPool.getNextIcon(iconsToInsert[0]));
            iconsToInsert.unshift(this.iconsPool.getPrevIcon(iconsToInsert[0]));
        }
        let newIcon:Image;
        let newIconX = this.currentIcons[0].x;
        let newIconY = this.currentIcons[0].y - (iconsToInsert.length * this.iconsPool.iconHeight);
        for (let i = 0; i < iconsToInsert.length; i++) {
            newIcon = iconsToInsert[i];
            newIcon.x = newIconX;
            newIcon.y = newIconY + i * this.iconsPool.iconHeight;
            this.phaserContainer.add(newIcon);
            this.currentIcons.splice(i, 0, newIcon);
        }
        this.stoppingIcon = this.currentIcons[iconsToInsert.length - 1];
        this.stoppingY = this.bottomBorder * 0.5 + (iconsToInsert.length > 2 ? this.iconsPool.iconHeight : this.iconsPool.iconHeight * 0.5);
    }

    callOnStopCallback():void {
        if (this.onStopCallback != null) {
            this.onStopCallback();
        }
    }

    blinkWinIcons(lineOnReelArr:Array<string>):void { //little bit stupid but working solution for prototype. In real case cool graphic must be used ;)
        for (let i = 0; i < lineOnReelArr.length; i++) {
            if (lineOnReelArr[i] === "bottom") {
                this.currentIcons[this.stoppingIconIndex].visible = !this.currentIcons[this.stoppingIconIndex].visible;
            } else {
                this.currentIcons[this.stoppingIconIndex - 1].visible = !this.currentIcons[this.stoppingIconIndex - 1].visible;
            }
        }
    }

    stopBlinkWinIcons(lineOnReelArr:Array<string>):void { //same as above, quick working solution to see how it looks
        for (let i = 0; i < lineOnReelArr.length; i++) {
            if (lineOnReelArr[i] === "bottom") {
                this.currentIcons[this.stoppingIconIndex].visible = true;
            } else {
                this.currentIcons[this.stoppingIconIndex - 1].visible = true;
            }
        }
    }
}