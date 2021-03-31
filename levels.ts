// Add your code here
class CLevel {
    private startPosX: number;
    private startPosY: number;
    mapData: tiles.TileMapData;
    mapLayout: string[][];
    constructor(tmdMapData: tiles.TileMapData, nStartPosX: number, nStartPosY: number, strMapLayout?:string[][]) {
        this.mapData = tmdMapData;
        this.startPosX = nStartPosX;
        this.startPosY = nStartPosY;

        if (!strMapLayout) {
            //console.log("[Warning] Generating strMapLayout!")
            this.mapLayout = []
            for (let i = 0; i < tmdMapData.height; i++) {
                 this.mapLayout[i] = [];
                for (let j = 0; j < tmdMapData.width; j++) {
                    this.mapLayout[i][j] = tmdMapData.isWall(j, i) ? "#" : " ";
                }
            }
        } else {
            this.mapLayout = strMapLayout;
        }
    }
    init(pPlayer: Entity.CLocalPlayer) {
        pPlayer.spawn(this.startPosX, this.startPosY);
        scene.cameraFollowSprite(pPlayer.sprite);
    }
}
class CLevelManager {
    private static _levelIndex:number = 0;
    static get levelIndex() {
        return CLevelManager._levelIndex;
    }

    private static _actualLevel: CLevel;
    static get currentLevel() {
        return CLevelManager._actualLevel;
    }

    static entitys: Entity.CMovingEntity[];
    static entityAtPos(posX: number, posY: number) {
        for (let i = 0; i < CLevelManager.entitys.length; i++) {
           if (CLevelManager.entitys[i].posX == posX && CLevelManager.entitys[i].posY == posY) {
               return CLevelManager.entitys[i];
           }
        }
        return null;
    }
    static entityIndexAtPos(posX: number, posY: number) {
        for (let i = 0; i < CLevelManager.entitys.length; i++) {
           if (CLevelManager.entitys[i].posX == posX && CLevelManager.entitys[i].posY == posY) {
               return i;
           }
        }
        return -1;
    }
    static destroyEntity(i:number) {
        CLevelManager.entitys[i].destroy();
        CLevelManager.entitys.removeAt(i);
    }
    static destroyEntityEnt(ent: Entity.CEntity) {
        let enti = -1;
        for (let i = 0; i < CLevelManager.entitys.length; i++) {
           if (CLevelManager.entitys[i].id == ent.id) {
               enti = i;
               break;
           }
        }

        if (enti != -1) {
            CLevelManager.entitys[enti].destroy();
            CLevelManager.entitys.removeAt(enti);
        }
    }
    static unloadLevel() {
        if (!CLevelManager._actualLevel) return;

        for (let i = 0; i < CLevelManager.entitys.length; i++) {
            CLevelManager.entitys[i].destroy();
        }
    }
    static loadLevel(level: CLevel) {
        CLevelManager.unloadLevel();
        this._actualLevel = level;
        this.entitys = [];
        for (let i = 0; i < level.mapLayout.length; i++) {
            for (let j = 0; j < level.mapLayout[0].length; j++) {
                if (level.mapLayout[i][j] == "x") {
                    let en = new Entity.CEnemyBlob(sprites.castle.skellyWalkFront1, SpriteKind.Enemy);
                    this.entitys.push(en);
                    en.spawn(j, i);
                    en.target = localPlayer;
                    level.mapLayout[i][j] = " ";
                }
            }
        }
        tiles.setTilemap(level.mapData);
        level.init(localPlayer); 
    }
    static nextLevel() {
        g_Level++;
        if (g_Level < lvlLevelArr.length) {
            CLevelManager.loadLevel(lvlLevelArr[g_Level]);;
        } else {
            info.setScore(g_Tick*100+g_Score);
            game.over(true);
        }
    }
}


let lvlLevelArr: CLevel[] = [
    //new CLevel(tilemap`test`, 0, 0),
    new CLevel(tilemap`level1`, 7, 2, [ //11
        [" ", " ", " ", " ", " ", "#", "#", "#", "#", "#", " "], //1
        [" ", " ", " ", " ", " ", "#", " ", " ", " ", "#", " "], //2
        [" ", " ", " ", " ", " ", "#", " ", "S", " ", "#", " "], //3
        [" ", " ", " ", " ", " ", "#", " ", " ", " ", "#", " "], //4
        [" ", " ", " ", " ", "#", "#", "#", " ", "#", "#", " "], //5
        [" ", " ", " ", " ", "#", " ", " ", " ", "#", " ", " "], //6
        [" ", "#", "#", "#", "#", " ", "#", "#", "#", "#", " "], //7
        [" ", "#", " ", " ", " ", " ", " ", " ", " ", "#", " "], //8
        [" ", "#", " ", " ", " ", " ", " ", " ", " ", "#", " "], //9
        [" ", "#", " ", " ", "#", "#", "#", " ", " ", "#", " "], //10
        [" ", "#", " ", " ", " ", "x", " ", " ", " ", "#", " "], //11
        [" ", "#", " ", " ", " ", " ", " ", " ", " ", "#", " "], //12
        [" ", "#", "#", "#", "#", " ", "#", "#", "#", "#", " "], //13
        [" ", "#", " ", " ", " ", " ", " ", " ", " ", "#", " "], //14
        [" ", "#", " ", " ", " ", "#", " ", " ", " ", "#", " "], //15
        [" ", "#", " ", " ", " ", "#", " ", " ", " ", "#", " "], //16
        [" ", "#", " ", " ", " ", "#", " ", " ", " ", "#", " "], //17
        [" ", "#", " ", " ", "x", " ", "x", " ", " ", "#", " "], //18
        [" ", "#", "#", "#", "#", " ", "#", "#", "#", "#", " "], //19
        [" ", " ", " ", " ", "#", " ", " ", " ", "#", " ", " "], //20
        [" ", " ", " ", " ", "#", "#", "#", " ", "#", "#", " "], //21
        [" ", " ", " ", " ", " ", "#", " ", " ", " ", "#", " "], //22
        [" ", " ", " ", " ", " ", "#", " ", "E", " ", "#", " "], //23
        [" ", " ", " ", " ", " ", "#", " ", " ", " ", "#", " "], //24
        [" ", " ", " ", " ", " ", "#", "#", "#", "#", "#", " "], //25
    ]), new CLevel(tilemap`level2`, 4, 1, [ //16
        [" ", "#", "#", "#", "#", "#", "#", "#", " ", " ", " ", " ", " ", " ", " ", " "], //1
        [" ", "#", "#", "#", "S", "#", "#", "#", " ", " ", " ", " ", " ", " ", " ", " "], //2
        [" ", " ", " ", "#", " ", "#", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "], //3
        [" ", " ", " ", "#", " ", "#", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "], //4
        [" ", " ", " ", "#", " ", "#", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "], //5
        ["#", "#", "#", "#", " ", "#", "#", "#", "#", " ", " ", " ", " ", " ", " ", " "], //6
        ["#", " ", " ", " ", " ", " ", " ", " ", "#", " ", " ", " ", " ", " ", " ", " "], //7
        ["#", " ", " ", " ", " ", " ", " ", " ", "#", " ", " ", " ", " ", " ", " ", " "], //8
        ["#", " ", " ", " ", " ", " ", " ", " ", "#", " ", " ", " ", " ", " ", " ", " "], //9
        ["#", " ", " ", " ", " ", " ", " ", " ", "#", " ", " ", " ", " ", " ", " ", " "], //10
        ["#", "x", " ", " ", "x", " ", " ", "x", "#", " ", " ", " ", " ", " ", " ", " "], //11
        ["#", "#", "#", "#", " ", "#", "#", "#", "#", " ", " ", "#", "#", "#", "#", "#"], //12
        ["#", " ", " ", " ", " ", " ", " ", " ", "#", "#", " ", "#", " ", " ", " ", "#"], //13
        ["#", " ", " ", " ", " ", " ", " ", " ", " ", "#", "#", "#", " ", " ", " ", "#"], //14
        ["#", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", "E", " ", "#"], //15
        ["#", " ", " ", " ", " ", " ", " ", " ", " ", "#", "#", "#", " ", " ", " ", "#"], //16
        ["#", " ", "x", " ", "x", " ", "x", " ", "#", "#", " ", "#", "#", "#", "#", "#"], //17
        ["#", "#", "#", "#", "#", "#", "#", "#", "#", " ", " ", " ", " ", " ", " ", " "], //18
    ]),
];