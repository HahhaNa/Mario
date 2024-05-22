import { Player } from "./PlayerController";

const { ccclass, property } = cc._decorator;

@ccclass
export class GameMgr extends cc.Component {
    @property(cc.Node)
    upperBound: cc.Node = null;

    @property(cc.Node)
    lowerBound: cc.Node = null;

    @property(cc.Node)
    startIcon: cc.Node = null;

    @property(cc.Node)
    pauseIcon: cc.Node = null;

    @property(cc.Node)
    scoreNode: cc.Node = null;

    @property(cc.Node)
    highestScoreNode: cc.Node = null;

    @property(cc.Label)
    private lifeCnt: cc.Label = null;

    @property(cc.Node)
    playerNode: cc.Node = null;

    @property({ type: cc.AudioClip })
    bgm: cc.AudioClip = null;

    @property({ type: cc.AudioClip })
    lifeDecreaseSound: cc.AudioClip = null; // Add this line

    private physicManager: cc.PhysicsManager = null;

    private score: number = 0;

    private highestScore: number = 0;

    private scoreCount;

    private pause: boolean = false;

    private playerLife: number = 5;

    public getPlayerNode(): cc.Node {
        return this.playerNode;
    }

    onLoad() {
        cc.audioEngine.playMusic(this.bgm, true);
        this.physicManager = cc.director.getPhysicsManager();
        this.physicManager.enabled = true;

        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
    }

    start() {
        this.updateHighestScore(0);
        this.scoreCount = () => { this.updateScore(this.score + 1); };
    }

    onKeyDown(event) {
        switch (event.keyCode) {
            case cc.macro.KEY.a:
                this.gameStart();
                break;
            case cc.macro.KEY.d:
                this.gameOver();
                break;
        }
    }

    updateHighestScore(score: number) {
        this.highestScore = score;
        this.highestScoreNode.getComponent(cc.Label).string = (Array(8).join("0") + this.highestScore.toString()).slice(-8);
    }

    updateScore(additionalPoints: number) {
        this.score += additionalPoints;
        this.scoreNode.getComponent(cc.Label).string = (Array(8).join("0") + this.score.toString()).slice(-8);
    }

    updateLife(num: number) {
        console.log("Update Life");
        this.playerLife += num;

        // Play life decrease sound if num is -1
        cc.audioEngine.playEffect(this.lifeDecreaseSound, false);
        

        this.playerLife = Math.min(Math.max(this.playerLife, 0), 5);
        this.lifeCnt.string = String(this.playerLife);

        if (this.playerLife > 0) {
            // this.playerNode.getComponent(Player).respawn();
        } else {
            // Player has no more lives, game over
            this.gameOver();
        }
    }

    gameStart() {
        this.startIcon.active = false;

        if (this.score > this.highestScore)
            this.updateHighestScore(this.score);
        this.updateScore(0);
        this.updateLife(5);

        this.schedule(this.scoreCount, 2);

        cc.audioEngine.playMusic(this.bgm, true);
    }

    gamePause() {
        if (this.pause)
            this.pause = false;
        else
            this.pause = true;
        if (this.pause) {
            this.pauseIcon.active = true;
            this.scheduleOnce(() => {
                cc.game.pause();
            }, 0.1);
        } else {
            this.pauseIcon.active = false;
            cc.game.resume();
        }
    }

    gameOver() {
        this.unschedule(this.scoreCount);

        cc.audioEngine.stopMusic();
    }

    gameEnd() {
        cc.game.end();
    }
}
