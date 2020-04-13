import {ReelGroup} from "./reelGroup";
import {IconsPool} from "./iconsPool";
import {PayTable} from "./payTable";
import Text = Phaser.GameObjects.Text;
import Scene = Phaser.Scene;
import Sprite = Phaser.GameObjects.Sprite;
import {SpinWinData} from "./spinWinData";

export class SlotMachine {

    private reelsGroup: ReelGroup = null;
    private reelsAmount: integer = 0;
    private iconsAmount: integer = 0;
    private iconsPool: IconsPool = null;
    private iconNames: Array<string> = [];
    private payTable: PayTable = null;
    private blinkIntervalId: integer = 0;
    private userCoins: integer = 44;
    private betCoins: integer = 1;
    private winDisplayText: Text = null;
    private coinsDisplayText: Text = null;
    private spinButton: Sprite = null;
    private gameMessageText: Text = null;
    private bigWinMessages: Array<string> = ["Woooooow!", "Big win!", "So cool!", "Oh, God! Lucky!"];
    private successMessages: Array<string> = ["Great!", "Nice!", "Congrats!", "Yee, cool!", "Go on!", "What a day!"];
    private failMessages: Array<string> = ["Let's do it again", "Nice try", "Try again", "Need more spins", "Hope dies last", "Spin more", "Don't give up!", "Not today :(", "Yep, it happens"];
    private noCoinsMessage: string = "Buy more coins ;)";

    constructor(slotConfig: any, iconsPool: IconsPool, phaserScene: Scene) {
        this.iconsPool = iconsPool;
        this.reelsGroup = new ReelGroup(slotConfig, phaserScene, iconsPool, 38, 30, this.processSpinWin.bind(this));
        this.reelsAmount = slotConfig.reelAmount;
        this.iconsAmount = slotConfig.iconsAmount;
        for (var iconName in slotConfig.iconsConfig) {
            this.iconNames.push(iconName);
        }
        phaserScene.add.image(0, 0, slotConfig.machineBodyFile).setOrigin(0, 0);

        this.payTable = new PayTable(slotConfig.paytable, this.reelsAmount, iconsPool, phaserScene);

        this.coinsDisplayText = phaserScene.add.text(170, 440, this.userCoins.toString(), {fontSize: "75px"}).setOrigin(0.5, 0.5);
        this.winDisplayText = phaserScene.add.text(420, 440, "0", {fontSize: "75px"}).setOrigin(0.5, 0.5);
        this.gameMessageText = phaserScene.add.text(275, 535, "GOOD LUCK!", {
            fontSize: "40px",
            color: "#FF0",
            align: "center"
        }).setOrigin(0.5, 0.5);
        this.winDisplayText.visible = false;

        this.spinButton = phaserScene.add.sprite(655, 535, slotConfig.spinButtonFile);
        this.spinButton.setInteractive({cursor: "pointer"});
        this.spinButton.on("pointerdown", this.onSpinButtonDown.bind(this));
        this.spinButton.on("pointerup", this.onSpinButtonUp.bind(this));
    }

    onSpinButtonDown(): void {
        this.spinButton.scale = 0.98;
    }

    onSpinButtonUp(): void {
        this.spinButton.scale = 1;
        this.doSpin();
    }

    doSpin(responseCombination: Array<Array<string>> = null): void {

        if (this.reelsGroup.isSpinning) return;

        if (this.userCoins < this.betCoins) {
            this.gameMessageText.text = this.noCoinsMessage;
            return;
        }

        this.stopBlinkWinElements();
        this.addUserCoins(-this.betCoins);
        this.reelsGroup.spin();
        if (responseCombination == null) {
            responseCombination = this.generateResponseCombination();
        }
        setTimeout(this.emulateResponse.bind(this), 1000, responseCombination);
    }

    renderUpdate(): void {
        this.reelsGroup.renderUpdate();
    }

    get isSpinning(): boolean {
        return this.reelsGroup.isSpinning;
    }

    emulateResponse(responseCombination: Array<Array<string>>): void {
        this.reelsGroup.setCombination(responseCombination);
    }

    generateResponseCombination(): Array<Array<string>> {
        var combination: Array<Array<string>> = [];
        let iconNameIndex: integer = 0;
        let forceEqualReelSize: integer = 0; //0 - means not forced, random
        if (Math.random() > 0.4) {
            forceEqualReelSize = Math.random() > 0.5 ? 2 : 1;
        }
        console.info("Force equal size:" + forceEqualReelSize);
        for (let i = 0; i < this.reelsAmount; i++) {
            combination.push([]);
            iconNameIndex = Math.round(Math.random() * (this.iconNames.length - 1));
            combination[i].push(this.iconNames[iconNameIndex]);
            if (forceEqualReelSize > 1 || (forceEqualReelSize == 0 && Math.random() > 0.8)) //simple condition to make it top-bottom combintation
            {
                combination[i].push(this.iconsPool.getNextIconName(this.iconNames[iconNameIndex]));
            }
        }
        return combination;
    }

    processSpinWin(spinWinData: SpinWinData): void {
        if (spinWinData.coins > 0) {
            this.winDisplayText.text = spinWinData.coins.toString();
            this.winDisplayText.visible = true;
            this.addUserCoins(spinWinData.coins);
            this.payTable.setBlinkElements(spinWinData.lineKeys);
            this.blinkIntervalId = setInterval(this.blinkWinElements.bind(this), 200);
            this.gameMessageText.text = this.getRandomMessage(spinWinData.coins > 1000 ? this.bigWinMessages : this.successMessages);
        } else {
            this.gameMessageText.text = this.getRandomMessage(this.failMessages);
        }
        this.gameMessageText.visible = true;
    }

    blinkWinElements(): void {
        this.payTable.blinkWinElements();
        this.winDisplayText.visible = !this.winDisplayText.visible;
        this.reelsGroup.blinkWinIcons();
    }

    stopBlinkWinElements(): void {
        clearInterval(this.blinkIntervalId);
        this.payTable.stopBlinkElements();
        this.reelsGroup.stopBlinkWinIcons();
        this.winDisplayText.visible = false;
        this.gameMessageText.visible = false;
        this.blinkIntervalId = 0;
    }

    addUserCoins(modifyValue): void {
        this.setUserCoins(this.userCoins + modifyValue);
    }

    getRandomMessage(messageArray: Array<string>): string {
        return messageArray[Math.round(Math.random() * (messageArray.length - 1))];
    }

    setUserCoins(coinsAmount): void {
        this.userCoins = coinsAmount;
        this.coinsDisplayText.text = this.userCoins.toString();
    }
}