const {ccclass, property} = cc._decorator;
import {GameMgr} from "./GameMgr";
import { Player } from "./PlayerController";

@ccclass
export class Goomba extends cc.Component {
    @property()
    speed: number = null;

    private moveRight: number = 1;
    private isDead: boolean = false;
    private physicManager: cc.PhysicsManager = null;
    private anim: cc.Animation = null;
    private idleTime: number = 0;
    private moveTime: number = 0;
    private isOnGround: boolean = false;  
    private randomMoveDuration: number = 0;

    onLoad() {
        this.setRandomMoveDuration();
    }

    start() {
        this.anim = this.getComponent(cc.Animation);
        // Add the event listener for animation finished
        this.anim.on('finished', this.onAnimFinished, this);
    }

    onPreSolve(contact, selfCollider, otherCollider) {
        selfCollider.getComponent(cc.RigidBody).linearVelocity = cc.v2(this.speed, 0);
    }

    update(dt) {
        if (this.isDead) {
            return;
        }

        if (this.node.position.y < -350) {
            this.isDead = true;
            this.node.destroy();  // Immediate destruction if it falls off the screen
        }

        // Handle movement
        if (this.speed === 0) {
            this.idleTime += dt;
            if (this.idleTime > 2) {
                this.switchDirection();
                this.idleTime = 0;
            }
        } else {
            this.idleTime = 0;
            this.moveTime += dt;
            if (this.moveTime > this.randomMoveDuration) {
                this.switchDirection();
                this.setRandomMoveDuration();
                this.moveTime = 0;
            }
        }
    }

    onBeginContact(contact, selfCollider, otherCollider) {
        if (otherCollider.node.name === 'Player') {
            const normal = contact.getWorldManifold().normal;
            if (normal.y > 0 && otherCollider.node.y > this.node.y) {
                this.isDead = true;
                if (this.anim && this.anim.getAnimationState("GoombaDie").isPlaying === false) {
                    this.anim.play("GoombaDie");
                }
            } else {
                const playerComponent = otherCollider.node.getComponent(Player);
                if (playerComponent && !playerComponent.lifeLostCooldown) {
                    const gameMgr = playerComponent.node.getComponent(GameMgr);
                    playerComponent.setLifeLostCooldown();
                    if (gameMgr) {
                        gameMgr.updateLife(-1);
                    }
                    // playerComponent.anim.play('fall');
                }
            }
        } else if(otherCollider.tag == 1) {
            this.isOnGround = true;
        }
    }

    onEndContact(contact, selfCollider, otherCollider) {
        if (otherCollider.tag === 1) {
            this.isOnGround = false; 
        }
    }

    onAnimFinished() {
        if (this.isDead) {
            this.node.destroy();
        }
    }

    switchDirection() {
        const rb = this.getComponent(cc.RigidBody);
        this.moveRight = (this.moveRight==1)? -1:1;
        rb.linearVelocity = cc.v2(rb.linearVelocity.x*this.moveRight, rb.linearVelocity.y);
        
    }

    setRandomMoveDuration() {
        this.randomMoveDuration = 4 + Math.random() * 10;
    }
}
