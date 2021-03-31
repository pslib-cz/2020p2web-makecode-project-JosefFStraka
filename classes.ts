enum MoveDirection {
    None = -1,
    Top,
    Right,
    Down,
    Left,
    MAX
}
enum StateEnemyBlob {
    None = -1,
    Ready,
    Move,
    MAX
}
namespace Entity {
    export class CEntity {
        private static uid: number = 0;
        id: number;
        posX: number;
        posY: number;
        lastPosX: number;
        lastPosY: number;
        sprite: Sprite; 
        
        constructor(imgSpriteImage: Image, spriteKind: number, posX?: number, posY?: number) {
            this.posX = posX;
            this.posY = posY;
            this.lastPosX = posX;
            this.lastPosY = posY;
            this.id = CEntity.uid++;
            this.sprite = sprites.create(imgSpriteImage, spriteKind);
        }
        setPositionAbsolute(x:number, y:number) {
            this.lastPosX = x;
            this.lastPosY = y;
            this.posX = x;
            this.posY = y;
            this.sprite.setPosition(this.posX * 16 + 8, this.posY * 16 + 8);
        }
        setPosition(x:number, y:number) {
            this.lastPosX = this.posX;
            this.lastPosY = this.posY;
            this.posX = x;
            this.posY = y;
            //this.sprite.setPosition(this.posX * 16 + 8, (this.posY * 16 + 8));
        }
        changePosition(x:number, y:number) {
            this.setPosition(this.posX + x, this.posY + y);
        }
        destroy() {
            this.sprite.destroy(effects.ashes, 50);
        }
        toString() {
            return `CEntity [${this.id}]`;
        }
    }
    export class CMovingEntity extends CEntity {
        imageMoveMap: Image[][];
        moveCounter: number;
        moveDirection: MoveDirection;
        moveDirectionOld: MoveDirection;
        moveTimer: number
        constructor(imgSpriteImage: Image, spriteKind: number, imageMoveMap?: Image[][], posX?: number, posY?: number) {
            super(imgSpriteImage, spriteKind, posX, posY);
            this.imageMoveMap = imageMoveMap;
            this.moveCounter = 0;
            this.moveDirection = 0;
            this.moveDirectionOld = -1;
            this.moveTimer = game.runtime();
        }
        setPositionAbsolute(x:number, y:number) {
            super.setPositionAbsolute(x, y);
            this.moveTimer = game.runtime();
        }
        setPosition(x:number, y:number) {
            super.setPosition(x, y);
            this.moveTimer = game.runtime();
            //this.sprite.setPosition(this.posX * 16 + 8, (this.posY * 16 + 8));
        }
        update() {
            let pxPosX = this.posX * 16 + 8;
            let pxPosY = this.posY * 16 + 8;

            let diffSpritePosX = pxPosX - this.sprite.x;
            let diffSpritePosY = pxPosY - this.sprite.y;

            let step = Math.max((game.runtime() - this.moveTimer), 400) / 100;
            step = step < 1 ? 1 : step;

            do { // call an ambulance
                if (Math.round(diffSpritePosX) != 0 || Math.round(diffSpritePosY) != 0)
                {
                    this.sprite.setPosition(this.sprite.x + diffSpritePosX / step, this.sprite.y + diffSpritePosY / step)
                }
            } while ( Math.abs(Math.round(this.sprite.x - pxPosX)) > 16 || Math.abs(Math.round(this.sprite.y - pxPosY)) > 16)
        }
        spawn(nPosX: number, nPosY: number) {
            this.setPositionAbsolute(nPosX, nPosY);
        }
        move (moveDirection?: MoveDirection) {
            
        }
        attack() {

        }
        toString() {
            return `CMovingEntity [${this.id}]`;
        }
    }
    export class CLocalPlayer extends CMovingEntity {
        static defaultImageMoveMap: Image[][];
        afterMove: () => void;
        constructor(imgSpriteImage: Image, spriteKind: number, imageMoveMap?: Image[][]) {
            super(imgSpriteImage, spriteKind, imageMoveMap ? imageMoveMap : CLocalPlayer.defaultImageMoveMap);
        }
        private layoutTileLogic(tilePosX: number, tilePosY: number) {
            let tile: string = CLevelManager.currentLevel.mapLayout[tilePosY][tilePosX];

            if (tile == " ") {
                return 0;
            } else if (tile == "E") {
                return 1;
            }

            return -1;
        }
        move(moveDirection?: MoveDirection) {
            let directionX: number = 0;
            let directionY: number = 0;

            if (moveDirection == MoveDirection.Top) {
                directionX = 0;
                directionY = -1;
            } else if (moveDirection == MoveDirection.Right) {
                directionX = 1;
                directionY = 0;
            } else if (moveDirection == MoveDirection.Down) {
                directionX = 0;
                directionY = 1;
            } else if (moveDirection == MoveDirection.Left) {
                directionX = -1;
                directionY = 0;
            }

            if (this.posY + directionY < 0 || this.posY + directionY >= CLevelManager.currentLevel.mapLayout.length
            || this.posX + directionX < 0 || this.posX + directionX >= CLevelManager.currentLevel.mapLayout.length) {
                return false; 
            }
            let ent = CLevelManager.entityAtPos(this.posX + directionX, this.posY + directionY);
            if (ent) {
                if (ent.sprite.kind() == SpriteKind.Enemy) {
                    CLevelManager.destroyEntityEnt(ent);
                    g_Tick++;
                    if (this.afterMove)
                        this.afterMove();return false
                }
            } else {
                let nextTileLogic: number = this.layoutTileLogic(this.posX + directionX, this.posY + directionY);
                if (nextTileLogic == -1) {
                    return false;
                } else if (nextTileLogic == 1) { 
                    CLevelManager.nextLevel();
                    return false; 
                }
            }

            if (moveDirection != this.moveDirectionOld)
            {
                this.moveCounter = 0;
            }
            if (moveDirection < this.imageMoveMap.length)
            {
                this.moveCounter = this.moveCounter % (this.imageMoveMap[moveDirection].length);
                this.sprite.setImage(this.imageMoveMap[moveDirection][this.moveCounter]);
            }
            this.moveCounter++;

            g_Tick++;
            if (moveDirection == MoveDirection.Top) {
                this.changePosition(0, -1);
            } else if (moveDirection == MoveDirection.Right) {
                this.changePosition(1, 0);
            } else if (moveDirection == MoveDirection.Down) {
                this.changePosition(0, 1);
            } else if (moveDirection == MoveDirection.Left) {
                this.changePosition(-1, 0);
            }

            this.moveDirectionOld = moveDirection;
            if (this.afterMove)
                this.afterMove()
            return true;
        }

    }

    export class CEnemyBlob extends CMovingEntity {
        static defaultImageMoveMap: Image[][]
        state: StateEnemyBlob;
        target: CEntity;
        pathFinder: CPathFind;
        constructor(imgSpriteImage: Image, spriteKind: number, imageMoveMap?: Image[][]) {
            super(imgSpriteImage, spriteKind, imageMoveMap ? imageMoveMap : CEnemyBlob.defaultImageMoveMap);
            this.state = 0;
            this.pathFinder = new CPathFind();
        }
        move(moveDirection?: MoveDirection) {
            if (!this.target) return;
            let path = [];       
            if (this.state == StateEnemyBlob.Move) { }
            else {
                path = this.pathFinder.pathFind(this.posX, this.posY, this.target.posX, this.target.posY, CLevelManager.currentLevel.mapLayout);
                if (path.length > 1)
                {
                    if (!CLevelManager.entityAtPos(path[1].posX, path[1].posY)) {
                        if (this.state == StateEnemyBlob.Ready) {
                            //console.log("state Ready")
                            if (path.length == 2) {
                                this.target.destroy();
                            } else {
                                this.setPosition(path[1].posX, path[1].posY);
                            }
                        }

                        if (path[1].posX > path[1].cameFromX) {
                            this.moveDirection = MoveDirection.Right;
                        } else if (path[1].posX < path[1].cameFromX) {
                            this.moveDirection = MoveDirection.Left;
                        } else {
                            if (path[1].posY > path[1].cameFromY) {
                                this.moveDirection = MoveDirection.Down;
                            } else if (path[1].posY < path[1].cameFromY) {
                                this.moveDirection = MoveDirection.Top;
                            }
                        }
                    }
                }
            }
            this.state = ++this.state % StateEnemyBlob.MAX;
            this.sprite.setImage(this.imageMoveMap[this.moveDirection][this.state]);
        }
        destroy() {
            super.destroy();
            this.pathFinder.destroy();
        }
        toString() {
            return `CEnemyBlob [${this.id};${this.state}]`;
        }
    }
    export class CEnemySkull extends CMovingEntity { 
        destroy() {
            super.destroy();
        }
        toString() {
            return `CEnemySkull [${this.id}]`;
        }
    }

    Entity.CEnemyBlob.defaultImageMoveMap = [
        [sprites.castle.skellyAttackFront2, sprites.castle.skellyWalkFront1],
        [sprites.castle.skellyAttackFront2, sprites.castle.skellyWalkRight1],
        [sprites.castle.skellyAttackFront2, sprites.castle.skellyWalkFront1],
        [sprites.castle.skellyAttackFront2, sprites.castle.skellyWalkLeft1],
    ];
    Entity.CLocalPlayer.defaultImageMoveMap = [
        [sprites.castle.heroWalkBack1       ,sprites.castle.heroWalkBack2       ,sprites.castle.heroWalkBack3       ,sprites.castle.heroWalkBack4       ],
        [sprites.castle.heroWalkSideRight1  ,sprites.castle.heroWalkSideRight2  ,sprites.castle.heroWalkSideRight3  ,sprites.castle.heroWalkSideRight4  ],
        [sprites.castle.heroWalkFront1      ,sprites.castle.heroWalkFront2      ,sprites.castle.heroWalkFront3      ,sprites.castle.heroWalkFront4      ],
        [sprites.castle.heroWalkSideLeft1   ,sprites.castle.heroWalkSideLeft2   ,sprites.castle.heroWalkSideLeft3   ,sprites.castle.heroWalkSideLeft4   ],
        [sprites.castle.heroWalkBack1       ,sprites.castle.heroWalkBack2       ,sprites.castle.heroWalkBack3       ,sprites.castle.heroWalkBack4       ]
    ];
}