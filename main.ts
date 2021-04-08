let g_Tick: number = 0;
let g_Level: number = 0;
let g_Score: number = 0;

let localPlayer = new Entity.CLocalPlayer();
localPlayer.sprite.z = 1;

CLevelManager.loadLevel(lvlLevelArr[g_Level]);
localPlayer.afterMove = function() {
    for (let i = 0; i < CLevelManager.entitys.length; i++) {
        CLevelManager.entitys[i].move();
    }
    for (let i = 0; i < CLevelManager.triggers.length; i++) {
        if (CLevelManager.triggers[i].posX == localPlayer.posX && CLevelManager.triggers[i].posY == localPlayer.posY) {
            CLevelManager.triggers[i].setActivated();
        }
    }
}

game.onUpdate(function() {
    localPlayer.update();
    for (let i = 0; i < CLevelManager.entitys.length; i++) {
        CLevelManager.entitys[i].update();
    }
})
game.onUpdateInterval(1000, function() {
    g_Score++;
})
game.onUpdateInterval(100, function() {
    info.setScore(g_Tick);
})
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
