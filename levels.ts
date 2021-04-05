// Add your code here
class CLevel {
    private startPosX: number;
    private startPosY: number;
    mapData: tiles.TileMapData;
    mapLayout: string[][];
    events:  (() => void)[]
    constructor(tmdMapData: tiles.TileMapData, nStartPosX: number, nStartPosY: number, strMapLayout?:string[][] , events?: (() => void)[]) {
        this.mapData = tmdMapData;
        this.events = events
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
    
    static triggers: Entity.CTriggerEntity[];
    static entitys: Entity.CEntity[];
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
        //CLevelManager.entitys[i].destroy();
        CLevelManager.entitys.removeAt(i);
    }
    static spawnEntity(ent: Entity.CEntity, posX?: number, posY?: number){
        this.entitys.push(ent);

        if (posX && posY && ent instanceof Entity.CMovingEntity) {
            ent.spawn(posX, posY)
        }

        if (ent instanceof Entity.CEnemyBlob || ent instanceof Entity.CEnemySkull) {
            ent.target = localPlayer
        }
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
            //CLevelManager.entitys[enti].destroy();
            CLevelManager.entitys.removeAt(enti);
        }
    }
    static unloadLevel() {
        if (!CLevelManager._actualLevel) return;
        while (CLevelManager.triggers.length) {
            console.log(CLevelManager.triggers[0])
            CLevelManager.entitys[0].destroy();
        }
        while (CLevelManager.entitys.length) {
            console.log(CLevelManager.entitys[0])
            CLevelManager.entitys[0].destroy();
        }
    }
    static loadLevel(level: CLevel) {
        CLevelManager.unloadLevel();
        this._actualLevel = level;
        this.entitys = [];
        this.triggers = [];
        for (let i = 0; i < level.mapLayout.length; i++) {
            for (let j = 0; j < level.mapLayout[0].length; j++) {
                if (level.mapLayout[i][j] == "x") {
                    let en = new Entity.CEnemyBlob(sprites.castle.skellyWalkFront1, SpriteKind.Enemy, j, i);
                    this.entitys.push(en);
                    //en.spawn();
                    en.target = localPlayer;
                    level.mapLayout[i][j] = " ";
                } else if (level.mapLayout[i][j] == "V") {
                    let en = new Entity.CVase(j, i);
                    this.entitys.push(en);
                    level.mapLayout[i][j] = " ";
                } else if (level.mapLayout[i][j].includes("T")) {
                    if (this.currentLevel.events)
                    {
                        let en = new Entity.CButton(j, i);
                        let triggerNumber = parseInt(level.mapLayout[i][j][1])
                        en.onActivated = this.currentLevel.events[triggerNumber];
                        this.triggers.push(en);
                        level.mapLayout[i][j] = " ";
                    }
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
        [" ", " ", " ", " ", "#", "V", " ", " ", "#", " ", " "], //6
        [" ", "#", "#", "#", "#", " ", "#", "#", "#", "#", " "], //7
        [" ", "#", " ", " ", " ", " ", " ", " ", " ", "#", " "], //8
        [" ", "#", " ", " ", " ", " ", " ", " ", " ", "#", " "], //9
        [" ", "#", "V", " ", "#", "#", "#", " ", "V", "#", " "], //10
        [" ", "#", " ", " ", " ", "x", " ", " ", " ", "#", " "], //11
        [" ", "#", " ", " ", " ", " ", " ", " ", " ", "#", " "], //12
        [" ", "#", "#", "#", "#", "V", "#", "#", "#", "#", " "], //13
        [" ", "#", " ", " ", " ", " ", " ", " ", " ", "#", " "], //14
        [" ", "#", " ", " ", " ", "#", " ", " ", " ", "#", " "], //15
        [" ", "#", " ", " ", " ", "#", " ", " ", " ", "#", " "], //16
        [" ", "#", " ", " ", " ", "#", " ", " ", " ", "#", " "], //17
        [" ", "#", " ", " ", "x", " ", "x", " ", " ", "#", " "], //18
        [" ", "#", "#", "#", "#", " ", "#", "#", "#", "#", " "], //19
        [" ", " ", " ", " ", "#", "V", " ", "V", "#", " ", " "], //20
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
        ["#", "#", "#", "#", "V", "#", "#", "#", "#", " ", " ", " ", " ", " ", " ", " "], //6
        ["#", "V", " ", "x", " ", "x", " ", "V", "#", " ", " ", " ", " ", " ", " ", " "], //7
        ["#", "V", " ", " ", " ", " ", " ", "V", "#", " ", " ", " ", " ", " ", " ", " "], //8
        ["#", "V", " ", " ", " ", " ", " ", "T0", "#", " ", " ", " ", " ", " ", " ", " "], //9
        ["#", "V", " ", " ", " ", " ", " ", "V", "#", " ", " ", " ", " ", " ", " ", " "], //10
        ["#", "V", " ", " ", "x", " ", " ", "V", "#", " ", " ", " ", " ", " ", " ", " "], //11
        ["#", "#", "#", "#", "#", "#", "#", "#", "#", " ", " ", "#", "#", "#", "#", "#"], //12
        ["#", "T1", " ", " ", " ", " ", " ", " ", "#", "#", " ", "#", " ", " ", " ", "#"], //13
        ["#", " ", " ", " ", " ", " ", " ", " ", " ", "#", "#", "#", " ", " ", " ", "#"], //14
        ["#", " ", " ", " ", " ", " ", " ", " ", " ", "#", " ", "#", " ", "E", " ", "#"], //15
        ["#", " ", "x", " ", " ", " ", "x", " ", " ", "#", "#", "#", " ", " ", " ", "#"], //16
        ["#", " ", " ", " ", "x", " ", " ", "T2", "#", "#", " ", "#", "#", "#", "#", "#"], //17
        ["#", "#", "#", "#", "#", "#", "#", "#", "#", " ", " ", " ", " ", " ", " ", " "], //18
    ], [() => {
        //console.log("T0")
        CLevelManager.currentLevel.mapLayout[11][4] = " ";
        tiles.setTileAt(tiles.getTileLocation(4, 11), sprites.dungeon.darkGroundCenter)
        tiles.setWallAt(tiles.getTileLocation(4, 11), false)
    },() => {
        //console.log("T1")
        CLevelManager.currentLevel.mapLayout[14][9] = " ";
        tiles.setTileAt(tiles.getTileLocation(9, 14), sprites.dungeon.darkGroundCenter)
        tiles.setWallAt(tiles.getTileLocation(9, 14), false)
 
        CLevelManager.spawnEntity(new Entity.CEnemyBlob(sprites.castle.skellyWalkFront1, SpriteKind.Enemy, 2, 14))
        CLevelManager.spawnEntity(new Entity.CEnemyBlob(sprites.castle.skellyWalkFront1, SpriteKind.Enemy, 7, 14))
    },() => {
        //console.log("T2")
        CLevelManager.currentLevel.mapLayout[14][11] = " ";
        tiles.setTileAt(tiles.getTileLocation(11, 14), sprites.dungeon.darkGroundCenter)
        tiles.setWallAt(tiles.getTileLocation(11, 14), false)

        CLevelManager.spawnEntity(new Entity.CEnemyBlob(sprites.castle.skellyWalkFront1, SpriteKind.Enemy, 10, 14))
    }])
];