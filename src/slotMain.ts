import * as Phaser from "phaser";
import {IconsPool} from "./iconsPool";
import {SlotMachine} from "./slotMachine";

export class SlotMain extends Phaser.Scene {

    private slotConfig:any = null;
    private iconsPool:IconsPool = null;
    private slotMachine:SlotMachine = null;

    constructor(slotConfig:Object) {
        super("SlotScene");
        this.slotConfig = slotConfig;
    }

    preload():void {
        this.load.image(this.slotConfig.reelBgFile, 'assets/' + this.slotConfig.reelBgFile);
        this.load.image(this.slotConfig.machineBodyFile, 'assets/' + this.slotConfig.machineBodyFile);
        this.load.image(this.slotConfig.spinButtonFile, 'assets/' + this.slotConfig.spinButtonFile);
        this.iconsPool = new IconsPool(this.slotConfig.iconsConfig, this);
    }

    create():void{
        this.slotMachine = new SlotMachine(this.slotConfig, this.iconsPool, this);
    }

    update():void{
        if (this.slotMachine.isSpinning){
            this.slotMachine.renderUpdate();
        }
    }

    doFixedSpin(spinCombination:Array<Array<string>>):void {
        this.slotMachine.doSpin(spinCombination);
    }

    getNextReelIconName(currIconName:string):string{
        return this.iconsPool.getNextIconName(currIconName);
    }

    getPrevReelIconName(currIconName:string):string{
        return this.iconsPool.getPrevIconName(currIconName);
    }

    public setDebugUserCoins(coinsAmount: integer) {
        this.slotMachine.setUserCoins(coinsAmount);
    }
}