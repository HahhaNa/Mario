// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;

@ccclass
export default class PlatformController extends cc.Component {
    @property(cc.Vec2)
    moveDirection: cc.Vec2 = cc.v2(0, 0);

    @property
    moveSpeed: number = 0;

    @property
    isMoving: boolean = false;

    start() {
        if (this.isMoving) {
            this.platformMove();
        }
    }

    update(dt) {
        if (this.isMoving) {
            this.node.x += this.moveDirection.x * this.moveSpeed * dt;
            this.node.y += this.moveDirection.y * this.moveSpeed * dt;
        }
    }

    public platformMove(){
        // Define a moving pattern, e.g., moving back and forth
        let moveOneWay = cc.moveBy(1, this.moveDirection.x * 100, this.moveDirection.y * 100);
        let moveBack = cc.moveBy(1, -this.moveDirection.x * 100, -this.moveDirection.y * 100);
        let sequence = cc.sequence(moveOneWay, moveBack);
        this.node.runAction(cc.repeatForever(sequence));
    }
}
