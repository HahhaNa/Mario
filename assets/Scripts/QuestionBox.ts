const { ccclass, property } = cc._decorator;
import { GameMgr } from "./GameMgr";

@ccclass
export default class QuestionBox extends cc.Component {
    @property(cc.Prefab)
    coinPrefab: cc.Prefab = null; // Assign a coin prefab in the editor

    @property(cc.Prefab)
    mushroomPrefab: cc.Prefab = null; // Assign a mushroom prefab in the editor

    @property(cc.AudioClip)
    coinSound: cc.AudioClip = null; // Assign a sound effect for the coin

    @property(cc.AudioClip)
    mushroomSound: cc.AudioClip = null; // Assign a sound effect for the mushroom

    @property(cc.SpriteFrame)
    normalBoxSpriteFrame: cc.SpriteFrame = null; // Assign a normal box sprite frame in the editor

    private hasSpawned: boolean = false;

    onBeginContact(contact, selfCollider, otherCollider) {
        console.log("In Contact");
        if (otherCollider.node.name === "Player" && contact.getWorldManifold().normal.y < 0) {
            if (!this.hasSpawned) {
                if (Math.random() > 0.5) {
                    this.spawnCoin();
                    this.playSound(this.coinSound);
                    this.updateScore();
                } else {
                    this.spawnMushroom();
                    this.playSound(this.mushroomSound);
                }
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

    spawnMushroom() {
        let mushroom = cc.instantiate(this.mushroomPrefab);
        mushroom.setPosition(this.node.position.x, this.node.position.y + this.node.height + 20);
        this.node.parent.addChild(mushroom);
    }

    playSound(sound: cc.AudioClip) {
        cc.audioEngine.playEffect(sound, false);
    }

    updateScore() {
        const gameMgr = this.node.getComponent(GameMgr);
        gameMgr.updateScore(100);
    }

    changeToNormalBox() {
        this.hasSpawned = true;
        let sprite = this.getComponent(cc.Sprite);
        if (sprite && this.normalBoxSpriteFrame) {
            sprite.spriteFrame = this.normalBoxSpriteFrame;
        }
    }
}
