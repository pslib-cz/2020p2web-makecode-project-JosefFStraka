let g_Tick: number = 0;
let g_Level: number = 0;
let g_Score: number = 0;

let localPlayer = new Entity.CLocalPlayer(sprites.castle.heroWalkFront1, SpriteKind.Player);

CLevelManager.loadLevel(lvlLevelArr[g_Level]);
localPlayer.afterMove = function() {
    for (let i = 0; i < CLevelManager.entitys.length; i++) {
        CLevelManager.entitys[i].move();
    }
}

game.onUpdate(function() {
    localPlayer.update();
    localPlayer.sprite.say(`${localPlayer.posX};${localPlayer.posY}`)
    for (let i = 0; i < CLevelManager.entitys.length; i++) {
        CLevelManager.entitys[i].update();
    }
})
localPlayer.sprite.onDestroyed(function() {
    info.setScore(g_Tick*100+g_Score);
    game.over();
})
game.onUpdateInterval(1000, function() {
    g_Score++;
})
game.onUpdateInterval(100, function() {
    info.setScore(g_Tick);
})
controller.A.onEvent(ControllerButtonEvent.Pressed, function() {
    g_Tick++;
    localPlayer.afterMove()
});
controller.up.onEvent(ControllerButtonEvent.Pressed, function() {
    localPlayer.move(MoveDirection.Top);
})
controller.right.onEvent(ControllerButtonEvent.Pressed, function() {
    localPlayer.move(MoveDirection.Right);
})
controller.down.onEvent(ControllerButtonEvent.Pressed, function() {
    localPlayer.move(MoveDirection.Down);
})
controller.left.onEvent(ControllerButtonEvent.Pressed, function() {
    localPlayer.move(MoveDirection.Left);
})

function getLengthTo(startPosX:number, startPosY:number, endPosX:number, endPosY:number) {
    return Math.abs(endPosX-startPosX) + Math.abs(endPosY-startPosY);
}
class CPathSpot {
    posX: number;
    posY: number;
    cameFromX: number;
    cameFromY: number;
    f: number;

    constructor(posX: number, posY: number) {
        this.posX = posX;
        this.posY = posY;
        this.cameFromX = -1;
        this.cameFromY = -1;
        this.f = -1;
    }
    toString() {
        return `CPathSpot (X:${this.posX},Y:${this.posY}) =  f:${this.f} came:[x:${this.cameFromX},y:${this.cameFromY}]`;
    }
}
class CPathFind {
    private visitedCount: number;
    private visited: boolean[][];
    private spots: CPathSpot[][];
    private mapLayout: string[][];
    startPosX: number;
    startPosY: number;
    endPosX: number;
    endPosY: number;
    whitelistIds: number[];
    neighbors = [[0,-1],[0,1],[-1,0],[1,0]];
    //sprites: Sprite[];
    constructor() {
        this.visitedCount = -1;
        this.endPosX = -1;
        this.endPosY = -1;
        //this.sprites = [];
    }
    pathFind(startPosX:number, startPosY:number, endPosX:number, endPosY:number, mapLayout: string[][], whitelistIds?:number[]) {
        this.mapLayout = mapLayout;
        this.startPosX = startPosX;
        this.startPosY = startPosY;
        this.endPosX = endPosX;
        this.endPosY = endPosY;

        this.whitelistIds = whitelistIds;

        this.visited = [];
        for(let i = 0; i<this.mapLayout.length; i++) {
            this.visited[i] = [];
            for(let j = 0; j<this.mapLayout[0].length; j++) {
                this.visited[i][j] = false;
            }
        }

        this.spots = [];
        for(let i = 0; i<this.mapLayout.length; i++) {
            this.spots[i] = [];
            for(let j = 0; j<this.mapLayout[0].length; j++) {
                this.spots[i][j] = new CPathSpot(j, i);
            }
        }

        let tempexposed: CPathSpot[];
        let exposed: CPathSpot[] = [this.spots[startPosY][startPosX]];
        let foundEnd: boolean = false;

        while (exposed.length > 0 && !foundEnd)
        {
            tempexposed = exposed.slice();
            tempexposed.sort((a,b)=>{
                if (a.f > b.f)
                    return  1;
                else if (a.f <= b.f)
                    return -1;
                else
                    return  0;
            })
            exposed = tempexposed.slice();
            tempexposed.forEach(function(value: CPathSpot, index: number) {
                if (this._pathFind(value, exposed) == 1) foundEnd = true;
                let i = exposed.indexOf(value);
                if (i != -1) {
                    exposed.removeAt(i);
                }
            })
        }
        /*this.sprites.forEach(function(value: Sprite, index: number) {
            value.destroy();
        })*/
        let path:CPathSpot[] = [];
        if (foundEnd && this.spots[endPosY][endPosX].cameFromX != -1 && this.spots[endPosY][endPosX].cameFromY != -1) {
            for (let actSpot: CPathSpot = this.spots[endPosY][endPosX]; //path reached end
             actSpot.cameFromX != -1 && actSpot.cameFromY != -1;
             actSpot = this.spots[actSpot.cameFromY][actSpot.cameFromX]) {
                path.push(actSpot);
                
                /*if (this.sprites) {
                    let spr = sprites.create(assets.image`x`)
                    this.sprites.push(spr)
                    spr.setPosition(actSpot.posX * 16 + 8, actSpot.posY * 16 + 8)
                    //spr.say(actSpot.f)
                }*/
            }
            path.push(this.spots[startPosY][startPosX]);
            path.reverse();
        }

        return path;
    }
    private _pathFind(spot: CPathSpot, arr: CPathSpot[]) {
        //console.log(`pathfinding for ${spot}`)
        let posX = spot.posX;
        let posY = spot.posY;

        if (this.visited[posY][posX]) return -1;
        this.visited[posY][posX] = true;
        
        if (this.mapLayout[posY][posX] != " ") return -1;
        if (this.whitelistIds) {
            let ent = CLevelManager.entityAtPos(posX, posY);
            if (ent && this.whitelistIds.indexOf(ent.id) == -1) {
                let thisent = CLevelManager.entityAtPos(this.startPosX, this.startPosY);
                console.log(`[pathFinder] ${thisent} -> ${ent}`)
                return -1;
            }
        }
        if (posX == this.endPosX && posY == this.endPosY) return 1;

        //let neighbors:number[][] = [[0,-1],[0,1],[-1,0],[1,0]];
        let neighborsSpots:CPathSpot[] = [];
        
        for (let i = 0; i < this.neighbors.length; i++)
        {
            let xy: number[] = this.neighbors[i];
            let tempX = posX+xy[0];
            let tempY = posY+xy[1];

            if (tempY >= 0 && tempY < this.spots.length) {
                if (tempX >= 0 && tempX < this.spots[0].length) {
                    if (this.visited[tempY][tempX]) continue;
                    //console.log(`neighbor - x:${tempX},y:${tempY}`)
                    this.spots[tempY][tempX].f = this.spots[posY][posX].f + getLengthTo(tempX, tempY, this.endPosX, this.endPosY);
                    this.spots[tempY][tempX].cameFromX = posX;
                    this.spots[tempY][tempX].cameFromY = posY;
                    //console.log(`  -neighbor[${neighborsSpots.length}] = ${this.spots[tempY][tempX]}`);
                    arr.push(this.spots[tempY][tempX]);
                }
            }
        }

        return 0;
    }
    destroy() {/*
        if (this.sprites) {
            this.sprites.forEach(function(value: Sprite, index: number) {
                value.destroy();
            })
        }*/
    }
}

