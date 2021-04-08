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
        sprite: Sprite;
        
        constructor(imgSpriteImage: Image, spriteKind: number, posX?: number, posY?: number) {
            
            this.posX = posX;
            this.posY = posY;
            this.id = CEntity.uid++;
            this.sprite = sprites.create(imgSpriteImage, spriteKind);
            this.setPositionAbsolute(posX, posY);
        }
        setPositionAbsolute(x:number, y:number) {
            this.posX = x;
            this.posY = y;
            this.sprite.setPosition(this.posX * 16 + 8, this.posY * 16 + 8);
        }
        setPosition(x:number, y:number) {
            this.posX = x;
            this.posY = y;
        }
        changePosition(x:number, y:number) {
            this.setPosition(this.posX + x, this.posY + y);
        }
        attack() {

        }
        destroy() {
            this.sprite.destroy(effects.ashes, 50);
            CLevelManager.destroyEntityEnt(this);
        }
        update() {

        }
        move (moveDirection?: MoveDirection) {

        }
        spawn(nPosX: number, nPosY: number) {
        }
        toString() {
            return `CEntity [${this.id}]`;
        }
    }
    export class CMovingEntity extends CEntity {
        imageMoveMap: Image[][];
        protected moveCounter: number;
        protected moveDirection: MoveDirection;
        protected moveDirectionOld: MoveDirection;
        protected moveTimer: number
        protected lastPosX: number;
        protected lastPosY: number;
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
            this.lastPosX = x;
            this.lastPosY = y;
        }
        setPosition(x:number, y:number) {
            this.posX = x;
            this.posY = y;
        }
        update() {
            let pxPosX = this.posX * 16 + 8;
            let pxPosY = this.posY * 16 + 8;

            //this.sprite.setPosition(pxPosX, pxPosY);
            //return;
            let diffSpritePosX = pxPosX - this.sprite.x;
            let diffSpritePosY = pxPosY - this.sprite.y;

            let step = Math.min(3.5, Math.max(1,game.runtime() - this.moveTimer / 1000));

            if (Math.round(diffSpritePosX) != 0 || Math.round(diffSpritePosY) != 0)
            {
                this.sprite.setPosition(this.sprite.x + diffSpritePosX / step, this.sprite.y + diffSpritePosY / step)
            }

            if ( this.posX != this.lastPosX || this.posY != this.lastPosY ) {
                this.lastPosX = this.posX;
                this.lastPosY = this.posY;
            }
        }
        spawn(nPosX: number, nPosY: number) {
            this.setPositionAbsolute(nPosX, nPosY);
        }
        attack() {
            this.destroy();
        }
        toString() {
            return `CMovingEntity [${this.id}]`;
        }
    }
    export class CStaticEntity extends CEntity {

        attack () {
            super.destroy();
        }
        update() {
        }
        toString() {
            return `CStaticEntity [${this.id}; x:${this.posX} y:${this.posY}]`;
        }
    }
    export class CVase extends CStaticEntity {
        static default_images: Image[];
        constructor( posX?: number, posY?: number, imgSpriteImage?: Image) {
            super(imgSpriteImage ? imgSpriteImage : CVase.default_images[randint(0, CVase.default_images.length-1)], SpriteKind.Food, posX, posY);
        }
        attack() {
            super.attack()
            music.knock.play()
        }
        toString() {
            return `CVase [${this.id}; x:${this.posX} y:${this.posY}]`;
        }
    }
    export class CTriggerEntity extends CEntity {
        activated: boolean;
        onActivated: () => void;
        attack () {
        }
        update() {
        }
        setActivated() {
            this.activated = true;
        }
        toString() {
            return `CTriggerEntity [${this.id}; onActivated:${this.onActivated}]`;
        }
    }
    export class CButton extends CTriggerEntity {
        static defaultImages: Image[];
        static defaultImagesPressed: Image[];
        imgtype:number;
        constructor( posX?: number, posY?: number, imgSpriteImage?: Image) {
            super(imgSpriteImage ? imgSpriteImage : CButton.defaultImages[0], SpriteKind.Food, posX, posY);
            this.imgtype = randint(0, CButton.defaultImages.length)
            this.sprite.setImage(CButton.defaultImages[this.imgtype])
            //this.pressedState = false;
        }
        setActivated() {
            this.sprite.setImage(CButton.defaultImagesPressed[this.imgtype]);
            if (this.onActivated && !this.activated)
                this.onActivated();

            super.setActivated();
            music.thump.play()
        }
        toString() {
            return `CButton [${this.id}; x:${this.posX} y:${this.posY}]`;
        }
    }
    export class CLocalPlayer extends CMovingEntity {
        dead: boolean
        static defaultImageMoveMap: Image[][];
        afterMove: () => void;
        constructor(imageMoveMap?: Image[][]) {
            super(sprites.castle.heroWalkFront1, SpriteKind.Player, imageMoveMap ? imageMoveMap : CLocalPlayer.defaultImageMoveMap);
            this.dead = false;
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
            if (this.dead) return false;
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
                if (ent.sprite.kind() == SpriteKind.Enemy || ent.sprite.kind() == SpriteKind.Food) {
                    ent.attack();
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

            animation.runImageAnimation(this.sprite, this.imageMoveMap[moveDirection], 120, true)

            this.moveDirectionOld = moveDirection;
            if (this.afterMove)
                this.afterMove()
            return true;
        }
        update() {
            super.update()
            if (this.dead) {
                
            }
        }
        destroy() {
            if (this.dead) return
            this.dead = true
            pause(100)
            this.sprite.startEffect(effects.disintegrate)
            this.sprite.startEffect(effects.fire)
            super.destroy()
            this.afterMove()
            music.zapped.play()
            pause(750)
            info.setScore(g_Tick*100+g_Score);
            game.over();
        }
        toString() {
            return `CLocalPlayer [${this.id}; x:${this.posX} y:${this.posY}`;
        }
    }

    export class CEnemyBlob extends CMovingEntity {
        static defaultImageMoveMap: Image[][]
        state: StateEnemyBlob;
        target: CEntity;
        pathFinder: CPathFind;
        constructor(posX?:number, posY?:number, imageMoveMap?: Image[][]) {
            super(assets.image`enemyBlobCharged0`, SpriteKind.Enemy, imageMoveMap ? imageMoveMap : CEnemyBlob.defaultImageMoveMap);
            this.state = 0;
            this.pathFinder = new CPathFind();
            if (posX && posY) {
                this.spawn(posX, posY);
            }
        }
        move(moveDirection?: MoveDirection) {
            if (!this.target) return;
            let path = [];       
            if (this.state == StateEnemyBlob.Move) { 
            } else {
                path = this.pathFinder.pathFind(this.posX, this.posY, this.target.posX, this.target.posY, CLevelManager.currentLevel.mapLayout, [this.id]);
                if (path.length > 0)
                {
                    let ent = CLevelManager.entityAtPos(path[1].posX, path[1].posY)
                    if (!ent) { //localplayer is not in entity list
                        if (this.state == StateEnemyBlob.Ready) {
                            if (path.length == 2) { 
                                this.target.destroy();
                                this.setPosition(path[1].posX, path[1].posY);
                            } else {
                                this.setPosition(path[1].posX, path[1].posY);
                            }
                        }

                        let pathDiffX = path[1].posX - path[1].cameFromX;
                        let pathDiffY = path[1].posY - path[1].cameFromY;

                        if (pathDiffX > 0) {
                            this.moveDirection = MoveDirection.Right;
                        } else if (pathDiffX < 0) {
                            this.moveDirection = MoveDirection.Left;
                        } else {
                            if (pathDiffY > 0) {
                                this.moveDirection = MoveDirection.Down;
                            } else if (pathDiffY < 0) {
                                this.moveDirection = MoveDirection.Top;
                            }
                        }
                    } else { //next step blocked by entity - step back so enemys wont be squish together
                        let pathDiffX = path[1].posX - path[1].cameFromX;
                        let pathDiffY = path[1].posY - path[1].cameFromY;

                        let tempNewPosX = 0;
                        let tempNewPosY = 0;

                        let newPosX = 0;
                        let newPosY = 0;

                        tempNewPosX = path[0].posX + pathDiffX;
                        tempNewPosY = path[0].posY + pathDiffY;
                        let ent = CLevelManager.entityAtPos(tempNewPosX, tempNewPosY)
                        if (!ent && (CLevelManager.currentLevel.mapLayout[tempNewPosX][tempNewPosY] != "#" || CLevelManager.entityAtPos(tempNewPosX, tempNewPosY))) {
                            newPosX = tempNewPosX;
                            newPosY = tempNewPosY;
                        } else {
                            tempNewPosX = path[0].posX + pathDiffX;
                            tempNewPosY = path[0].posY - pathDiffY;
                            ent = CLevelManager.entityAtPos(tempNewPosX, tempNewPosY)
                            if (!ent && (CLevelManager.currentLevel.mapLayout[tempNewPosX][tempNewPosY] != "#" || CLevelManager.entityAtPos(tempNewPosX, tempNewPosY))) {
                                newPosX = tempNewPosX;
                                newPosY = tempNewPosY;
                            }else{
                                tempNewPosX = path[0].posX - pathDiffX;
                                tempNewPosY = path[0].posY + pathDiffY;
                                ent = CLevelManager.entityAtPos(tempNewPosX, tempNewPosY)
                                if (!ent && (CLevelManager.currentLevel.mapLayout[tempNewPosX][tempNewPosY] != "#" || CLevelManager.entityAtPos(tempNewPosX, tempNewPosY))) {
                                    newPosX = tempNewPosX;
                                    newPosY = tempNewPosY;
                                }
                            }
                        }

                        this.setPosition(newPosX, newPosY);
                        pathDiffX = newPosX - path[0].posX;
                        pathDiffY = newPosY - path[0].posY;

                        if (pathDiffX > 0) {
                            this.moveDirection = MoveDirection.Right;
                        } else if (pathDiffX < 0) {
                            this.moveDirection = MoveDirection.Left;
                        } else {
                            if (pathDiffY > 0) {
                                this.moveDirection = MoveDirection.Down;
                            } else if (pathDiffY < 0) {
                                this.moveDirection = MoveDirection.Top;
                            }
                        }
                    }
                }
            }

            this.state = ++this.state % StateEnemyBlob.MAX;
            animation.runImageAnimation(this.sprite, this.imageMoveMap[this.state], 120, true)
        }
        attack() {
            this.destroy();
            music.smallCrash.play()
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
        static defaultImageMoveMap: Image[][]
        target: CEntity;
        pathFinder: CPathFind;
        constructor(posX?:number, posY?:number, imageMoveMap?: Image[][]) {
            super(sprites.castle.skellyWalkFront1, SpriteKind.Enemy, imageMoveMap ? imageMoveMap : CEnemySkull.defaultImageMoveMap);
            this.pathFinder = new CPathFind();
            if (posX && posY) {
                this.spawn(posX, posY);
            }
        }
        move(moveDirection?: MoveDirection) {
            if (!this.target) return;
            console.log("x")
            let path = [];       
            path = this.pathFinder.pathFind(this.posX, this.posY, this.target.posX, this.target.posY, CLevelManager.currentLevel.mapLayout, [this.id]);
            if (path.length > 1)
            {
                let ent = CLevelManager.entityAtPos(path[1].posX, path[1].posY)
                if (!ent) { //localplayer is not in entity list
                    if (path.length == 2) { 
                        this.target.destroy();
                    } else {
                        this.setPosition(path[1].posX, path[1].posY);
                    }

                    let pathDiffX = path[1].posX - path[1].cameFromX;
                    let pathDiffY = path[1].posY - path[1].cameFromY;

                    if (pathDiffX > 0) {
                        this.moveDirection = MoveDirection.Right;
                    } else if (pathDiffX < 0) {
                        this.moveDirection = MoveDirection.Left;
                    } else {
                        if (pathDiffY > 0) {
                            this.moveDirection = MoveDirection.Down;
                        } else if (pathDiffY < 0) {
                            this.moveDirection = MoveDirection.Top;
                        }
                    }
                } else { //next step blocked by entity - step back so enemys wont be sqished together
                    let pathDiffX = path[1].posX - path[1].cameFromX;
                    let pathDiffY = path[1].posY - path[1].cameFromY;

                    let newPosX = 0;
                    let newPosY = 0;

                    let ent = CLevelManager.entityAtPos(path[0].posX + pathDiffX, path[0].posY + pathDiffY)
                    if (!ent) {
                        newPosX = path[0].posX + pathDiffX; newPosY = path[0].posY + pathDiffY;
                    } else {
                        ent = CLevelManager.entityAtPos(path[0].posX + pathDiffX, path[0].posY - pathDiffY)
                        if (!ent) {
                            newPosX = path[0].posX + pathDiffX; newPosY = path[0].posY - pathDiffY;
                        }else{
                            ent = CLevelManager.entityAtPos(path[0].posX - pathDiffX, path[0].posY + pathDiffY)
                            if (!ent) {
                                newPosX = path[0].posX - pathDiffX; newPosY = path[0].posY + pathDiffY;
                            }
                        }
                    }

                    this.setPosition(newPosX, newPosY);
                    pathDiffX = newPosX - path[0].posX;
                    pathDiffY = newPosY - path[0].posY;

                    if (pathDiffX > 0) {
                        this.moveDirection = MoveDirection.Right;
                    } else if (pathDiffX < 0) {
                        this.moveDirection = MoveDirection.Left;
                    } else {
                        if (pathDiffY > 0) {
                            this.moveDirection = MoveDirection.Down;
                        } else if (pathDiffY < 0) {
                            this.moveDirection = MoveDirection.Top;
                        }
                    }
                }
            }

            animation.runImageAnimation(this.sprite, this.imageMoveMap[0], 120, true)
            //this.sprite.setImage(this.imageMoveMap[this.moveDirection][0]);
        }
        attack() {
            this.destroy();
            music.smallCrash.play()
        }
        destroy() {
            super.destroy();
            this.pathFinder.destroy();
        }
        toString() {
            return `CEnemySkull [${this.id}]`;
        }
    }


    Entity.CVase.default_images = [
        sprites.builtin.forestScenery3, sprites.builtin.forestScenery2
    ]
    Entity.CButton.defaultImages         = [sprites.dungeon.buttonOrange, sprites.dungeon.buttonPink, sprites.dungeon.buttonTeal];
    Entity.CButton.defaultImagesPressed  = [sprites.dungeon.buttonOrangeDepressed, sprites.dungeon.buttonPinkDepressed, sprites.dungeon.buttonTealDepressed];
    Entity.CEnemyBlob.defaultImageMoveMap = [
        assets.animation`enemyBlobCharged`,
        assets.animation`enemyBlobIdle`,
    ];
    Entity.CEnemySkull.defaultImageMoveMap = [
        assets.animation`skellyWalkFront`
    ];
    Entity.CLocalPlayer.defaultImageMoveMap = [
        [sprites.castle.heroWalkBack1       ,sprites.castle.heroWalkBack2       ,sprites.castle.heroWalkBack3       ,sprites.castle.heroWalkBack4       ],
        [sprites.castle.heroWalkSideRight1  ,sprites.castle.heroWalkSideRight2  ,sprites.castle.heroWalkSideRight3  ,sprites.castle.heroWalkSideRight4  ],
        [sprites.castle.heroWalkFront1      ,sprites.castle.heroWalkFront2      ,sprites.castle.heroWalkFront3      ,sprites.castle.heroWalkFront4      ],
        [sprites.castle.heroWalkSideLeft1   ,sprites.castle.heroWalkSideLeft2   ,sprites.castle.heroWalkSideLeft3   ,sprites.castle.heroWalkSideLeft4   ],
        [sprites.castle.heroWalkBack1       ,sprites.castle.heroWalkBack2       ,sprites.castle.heroWalkBack3       ,sprites.castle.heroWalkBack4       ]
    ];
}