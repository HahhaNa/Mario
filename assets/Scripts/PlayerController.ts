const {ccclass, property} = cc._decorator;
import {GameMgr} from "./GameMgr";

@ccclass
export class Player extends cc.Component {
    @property()
    playerSpeed: number = 300;

    @property({ type: cc.AudioClip })
    jumpSound: cc.AudioClip = null;

    private moveDir = 0;
    private leftDown: boolean = false;
    private rightDown: boolean = false;
    private physicManager: cc.PhysicsManager = null;
    private fallDown: boolean = false;
    private isOnGround: boolean = false;  
    private idleFrame: cc.SpriteFrame = null;
    private anim: cc.Animation = null;
    private jumpAnimTriggered: boolean = false;
    private lifeLostCooldown: boolean = false;

    public setLifeLostCooldown() {
        console.log("Set Cool Down");
        this.lifeLostCooldown = true;
        // Reset cooldown after 1 second (or appropriate time)
        setTimeout(() => {
            this.lifeLostCooldown = false;
        }, 1000);
    }

    onLoad() {
        this.physicManager = cc.director.getPhysicsManager();
        this.physicManager.enabled = true;
        this.physicManager.gravity = cc.v2(0, -200);

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
        if (this.node.position.y < -350) {
            const gameMgr = this.node.getComponent(GameMgr);
            if (gameMgr) {
                gameMgr.updateLife(-1);
            }
        }

        const baseScale = 3;
        this.node.scaleX = (this.moveDir == 0) ? this.node.scaleX : baseScale * ((this.moveDir > 0) ? 1 : -1);

        if (!this.isOnGround && !this.fallDown && this.moveDir != 0) {
            this.fallDown = true;
        }
        if (!this.jumpAnimTriggered) this.playerAnimation();
    }

    onKeyDown(event) {
        switch (event.keyCode) {
            case cc.macro.KEY.left:
                this.leftDown = true;
                this.playerMove(-1);
                break;
            case cc.macro.KEY.right:
                this.rightDown = true;
                this.playerMove(1);
                break;
            case cc.macro.KEY.space:
                if ((!this.jumpAnimTriggered)) {
                    this.anim.play("jump");
                    this.playerJump(800);
                    this.jumpAnimTriggered = true; // Set the flag true after playing the animation
                } else {
                    console.log("jumpAnimTriggered: ", this.jumpAnimTriggered, ", isPlaying: ", this.anim.getAnimationState("jump").isPlaying, ", onGround: ", this.isOnGround);
                }
                break;
        }
    }

    onKeyUp(event) {
        switch (event.keyCode) {
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

    public playerMove(moveDir: number) {
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
        if (!this.jumpAnimTriggered) {
            const rb = this.getComponent(cc.RigidBody);
            rb.linearVelocity = cc.v2(rb.linearVelocity.x, velocity);
            // Play the jump sound effect
            cc.audioEngine.playEffect(this.jumpSound, false);
        }
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

    respawn() {
        console.log("RESPAWN - start");
        this.node.position = cc.v3(120, -260, 0);
        console.log("RESPAWN - position set", this.node.position);
        const rb = this.getComponent(cc.RigidBody);
        rb.linearVelocity = cc.v2(0, 0); // Reset velocity
        console.log("RESPAWN - velocity reset");
    }

    onBeginContact(contact, selfCollider, otherCollider) {
        if (otherCollider.tag === 1) {
            this.isOnGround = true;
            this.jumpAnimTriggered = false;
        }
    }

    onEndContact(contact, selfCollider, otherCollider) {
        if (otherCollider.tag === 1) {
            console.log("Player End Contact");
            this.isOnGround = false;
        }
    }
}
