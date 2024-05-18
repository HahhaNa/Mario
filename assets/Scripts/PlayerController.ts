const {ccclass, property} = cc._decorator;

@ccclass
export class PlayerController extends cc.Component {
    @property()
    playerSpeed: number = 300;

    @property()
    playerStandSpeed: number = 50;

    private moveDir = 0;
    private leftDown: boolean = false;
    private rightDown: boolean = false;
    private jumping: boolean = false;
    private physicManager: cc.PhysicsManager = null;
    private fallDown: boolean = false;
    private isOnGround: boolean = false;  // Declare the isOnGround property
    private idleFrame: cc.SpriteFrame = null;
    private anim: cc.Animation = null;
    private jumpAnimTriggered: boolean = false;

    onLoad() {

        this.physicManager = cc.director.getPhysicsManager();
        this.physicManager.enabled = true;
        this.physicManager.gravity = cc.v2 (0, -200);

        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);

        let rigidBody = this.getComponent(cc.RigidBody);
        if (!rigidBody) {
            rigidBody = this.addComponent(cc.RigidBody);
        }
        rigidBody.type = cc.RigidBodyType.Dynamic;

        let collider = this.getComponent(cc.PhysicsBoxCollider);
        if (!collider) {
            collider = this.addComponent(cc.PhysicsBoxCollider);
        }
        collider.size = cc.size(this.node.width, this.node.height);
        collider.apply();
    }

    start() {
        this.idleFrame = this.getComponent(cc.Sprite).spriteFrame;
        this.anim = this.getComponent(cc.Animation);
    }

    update(dt) {
        if (this.moveDir !== 0) {
            this.node.x += this.playerSpeed * this.moveDir * dt;
        }      
        
        const baseScale = 3;
        this.node.scaleX = (this.moveDir == 0) ? this.node.scaleX  : baseScale * ((this.moveDir > 0) ? 1 : -1);

        if (!this.isOnGround && !this.fallDown && this.moveDir != 0) {
            this.fallDown = true;
        }
        if(!this.jumpAnimTriggered) this.playerAnimation();
    }

    onKeyDown(event) {
        switch(event.keyCode)
        {
            case cc.macro.KEY.left:
                this.leftDown = true;
                this.playerMove(-1);
                break;
            case cc.macro.KEY.right:
                this.rightDown = true;
                this.playerMove(1);
                break;
            case cc.macro.KEY.a:
                this.reborn(cc.v3(-445, -275, 0));
                break;
            case cc.macro.KEY.space:
                this.playerJump(800);
                console.log("IsPlaying? ", this.anim.getAnimationState("jump").isPlaying);
                if (!this.jumpAnimTriggered && this.isOnGround) {
                    this.anim.play("jump");
                    console.log("Play Jump");
                    this.jumpAnimTriggered = true; // Set the flag true after playing the animation
                } 
                break;
        }
    }

    onKeyUp(event) {
        // console.log("Is onGround: ", this.isOnGround, ", Is fallDown: ", this.fallDown, ", MoveDir: ", this.moveDir);
        switch(event.keyCode)
        {
            case cc.macro.KEY.left:
                this.leftDown = false;
                this.updateDirection();
                break;
            case cc.macro.KEY.right:
                this.rightDown = false;
                this.updateDirection();
                break;
        }
    }

    public playerMove(moveDir: number){
        this.moveDir = moveDir;
    }

    public playerAnimation() {
        if (this.isOnGround) {
            if (this.moveDir === 0 && !this.jumpAnimTriggered) {
                this.getComponent(cc.Sprite).spriteFrame = this.idleFrame;
                this.anim.stop();
            } else if (!this.anim.getAnimationState("walk").isPlaying) {
                this.anim.play("walk");
            }
        }
    }
    



    public playerJump(velocity: number) {
        if (this.isOnGround) {
            const rb = this.getComponent(cc.RigidBody);
            rb.linearVelocity = cc.v2(rb.linearVelocity.x, velocity);
        }
    }

    public reborn(rebornPos: cc.Vec3) {
        this.node.position = rebornPos;
        this.getComponent(cc.RigidBody).linearVelocity = cc.v2();
    }

    public updateDirection() {
        if (this.leftDown) {
            this.playerMove(-1);
        } else if (this.rightDown) {
            this.playerMove(1);
        } else {
            this.playerMove(0);
        }
    }

    onBeginContact(contact, selfCollider, otherCollider) {
        if (otherCollider.tag === 1) {
            this.isOnGround = true;
            this.jumpAnimTriggered = false;
        }
    }

    onEndContact(contact, selfCollider, otherCollider) {
        if (otherCollider.tag === 1) {
            this.isOnGround = false; 
        }
    }
    
}
