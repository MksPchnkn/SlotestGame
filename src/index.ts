import {SlotMain} from "./slotMain";

var slotConfig:any = {
    iconsConfig: {
        bar3: "assets/3xBAR.png",
        bar: "assets/BAR.png",
        bar2: "assets/2xBAR.png",
        seven: "assets/7.png",
        cherry: "assets/Cherry.png"
    },
    reelAmount: 3,
    iconsAmount: 3,
    initialCoins: 1000,
    spinBetCoins: 1,
    reelBgFile: "reelBg.png",
    machineBodyFile: "machineBody.png",
    spinButtonFile: "spinButton.png",
    paytable: {
        full: {
            cherry: {
                top: 2000,
                center: 4000,
                bottom: 1000
            },
            seven: {
                any: 150
            },
            bar3: {
                any: 50
            },
            bar2: {
                any: 20
            },
            bar: {
                any: 10
            }
        },
        comb: [{
            icons: ["cherry", "seven"],
            lines: {
                any: 75
            }
        },
            {
                icons: ["bar", "bar2", "bar3"],
                lines: {
                    any: 5
                }
            }]
    }
};

var slotMainScene:SlotMain = new SlotMain(slotConfig);
var coinsInput:any = document.getElementById("userCoinsInput");
var errorMessage:any = document.getElementById("errorMessage");
var fixedSpinCombination:any = document.getElementById("debugCombination");

new Phaser.Game({
        type: Phaser.AUTO,
        title: "Slotest Slot",
        width: 800,
        height: 600,
        parent: "phaser-holder",
        backgroundColor: "#18216D",
        scene: slotMainScene
});

function debugSetUserCoins(){
    var coinsAmount:integer = parseInt(coinsInput.value);
    if (coinsAmount >= 0){
        slotMainScene.setDebugUserCoins(coinsAmount);
    } else {
        coinsInput.value = 0;
    }
}

function makeDebugSpin() {
    errorMessage.innerText = "";
    var combinationIsValid = true;
    var spinCombination:Array<Array<string>> = [];
    try {
        let combination = JSON.parse(fixedSpinCombination.value);
        for (let i = 0; i<combination.length; i++){
            for (var iconName in combination[i]){
                if (slotConfig.iconsConfig.hasOwnProperty(iconName)){
                    if (validPositions.indexOf(combination[i][iconName]) > -1){
                        //valid icon and position
                        spinCombination.push([]);
                        spinCombination[i].push(iconName);
                        if (combination[i][iconName] === "top"){
                            spinCombination[i].push(slotMainScene.getNextReelIconName(iconName));
                        } else if (combination[i][iconName] === "bottom"){
                            spinCombination[i].splice(0, 0, slotMainScene.getPrevReelIconName(iconName));
                        }
                        break;
                    } else {
                        throw new Error("invalid position specified: '"+combination[i][iconName]+"'");
                    }
                } else {
                    throw new Error("invalid icon name '"+iconName+"'");
                }
            }
        }
    } catch (error) {
        errorMessage.innerText = error;
        combinationIsValid = false;
    }

    if (combinationIsValid) {
        slotMainScene.doFixedSpin(spinCombination);
    }
}

//debug panel utilities

var iconNamesArr = []; //valid icon names
for (var iconName in slotConfig.iconsConfig) {
    iconNamesArr.push("&laquo;" + iconName + "&raquo;");
}
var iconsLegend = document.getElementById("iconNames");
iconsLegend.innerHTML = iconNamesArr.join(", ");

var validPositions = ["top", "center", "bottom"]; //valid icon positions
var quotedValidPositions = validPositions.map(function(element) {return "&laquo;"+element+"&raquo;"});
var iconsPositions = document.getElementById("iconPositions");
iconsPositions.innerHTML = quotedValidPositions.join(", ");

var doFixedSpinButton:any = document.getElementById("doFixedSpinButton");
doFixedSpinButton.onclick = makeDebugSpin;

var setUserCointButton:any = document.getElementById("setUserCoinsButton");
setUserCointButton.onclick = debugSetUserCoins;