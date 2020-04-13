export class SpinWinData {

    readonly coins:integer;
    readonly lineKeys:Array<string>;

    constructor(coins:integer, lineKeys:Array<string>) {
        this.coins = coins;
        this.lineKeys = lineKeys;
    }
}