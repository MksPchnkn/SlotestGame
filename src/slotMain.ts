import * as Phaser from "phaser";
import {IconsPool} from "./iconsPool";
import {SlotMachine} from "./slotMachine";
import Text = Phaser.GameObjects.Text;

export class SlotMain extends Phaser.Scene {

    private slotConfig:any = null;
    private iconsPool:IconsPool = null;
    private slotMachine:SlotMachine = null;
    private preloadText:Text = null;

    constructor(slotConfig:Object) {
        super("SlotScene");
        this.slotConfig = slotConfig;
    }

    preload():void {
        this.load.image(this.slotConfig.reelBgFile, 'assets/' + this.slotConfig.reelBgFile);
        this.load.image(this.slotConfig.machineBodyFile, 'assets/' + this.slotConfig.machineBodyFile);
        this.load.image(this.slotConfig.spinButtonFile, 'assets/' + this.slotConfig.spinButtonFile);
        this.iconsPool = new IconsPool(this.slotConfig.iconsConfig, this);
        this.preloadText = this.add.text(400, 300, "The Slotest Slot! Please wait...", {fontSize:"30px"}).setOrigin(0.5, 0.5);
        this.load.on("complete", this.loadingDone.bind(this));
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

    setDebugUserCoins(coinsAmount: integer) {
        this.slotMachine.setUserCoins(coinsAmount);
    }

    private loadingDone():void{
        this.preloadText.setActive(false).setVisible(false).destroy(true);
    }
}