const {ccclass, property} = cc._decorator;
import {GameMgr} from "./GameMgr";


@ccclass
export default class QuestionBox extends cc.Component {
    @property(cc.Prefab)
    coinPrefab: cc.Prefab = null; // Assign a coin prefab in the editor

    @property(cc.AudioClip)
    coinSound: cc.AudioClip = null; // Assign a sound effect for the coin

    @property(cc.SpriteFrame)
    normalBoxSpriteFrame: cc.SpriteFrame = null; // Assign a normal box sprite frame in the editor

    @property(GameMgr)
    gameMgr: GameMgr = null;

    private hasSpawnedCoin: boolean = false;

    onBeginContact(contact, selfCollider, otherCollider) {
        console.log("In Contact");
        if (otherCollider.node.name === "Player" && contact.getWorldManifold().normal.y < 0) {
            if (!this.hasSpawnedCoin) {
                this.spawnCoin();
                this.playSound();
                this.updateScore();
                this.changeToNormalBox();
            }
        } else {
            console.log("otherCollider.node.name: ", otherCollider.node.name);
        }
    }

    spawnCoin() {
        let coin = cc.instantiate(this.coinPrefab);
        coin.setPosition(this.node.position.x, this.node.position.y + this.node.height + 16);
        this.node.parent.addChild(coin);

        let animation = coin.getComponent(cc.Animation);
        if (animation) {
            animation.play('coin');
            animation.on('finished', () => {
                coin.destroy();
            }, this);
        }
    }

    playSound() {
        cc.audioEngine.playEffect(this.coinSound, false);
    }

    updateScore() {
        this.gameMgr.updateScore(100);
    }

    changeToNormalBox() {
        this.hasSpawnedCoin = true;
        let sprite = this.getComponent(cc.Sprite);
        if (sprite && this.normalBoxSpriteFrame) {
            sprite.spriteFrame = this.normalBoxSpriteFrame;
        }
    }
}
