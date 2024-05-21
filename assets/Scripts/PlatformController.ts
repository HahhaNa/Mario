const { ccclass, property } = cc._decorator;

@ccclass
export default class Platform extends cc.Component {

    @property({ type: cc.AudioClip })
    soundEffect: cc.AudioClip = null;

    protected isTouched: boolean = false;

    private anim: cc.Animation = null;

    private animState: cc.AnimationState = null;

    private highestPos: number = 118;

    private moveSpeed: number = 100;

    private springVelocity: number = 320;

    start() {
        this.anim = this.getComponent(cc.Animation);

        if (this.node.name == "Conveyor") {
            this.node.scaleX = (Math.random() >= 0.5) ? 1 : -1;
            this.moveSpeed *= this.node.scaleX;
        }
    }

    reset() {
        this.isTouched = false;
    }

    update(dt) {
        if (this.node.y - this.highestPos >= 0 && this.node.y - this.highestPos < 100)
            this.getComponent(cc.PhysicsBoxCollider).enabled = false;
        else
            this.getComponent(cc.PhysicsBoxCollider).enabled = true;
    }

    playAnim() {
        if (this.anim)
            this.animState = this.anim.play();
    }

    getAnimState() {
        if (this.animState)
            return this.animState;
    }

    platformDestroy()
    {
        cc.log(this.node.name + " Platform destory.");
        this.node.destroy();
    }

  onBeginContact(contact, selfCollider, otherCollider) {
    const player = otherCollider.getComponent('Player');
    const normal = contact.getWorldManifold().normal;
    if (normal.y > 0 && player) {
        this.playSoundEffect();

        switch (this.node.name) {
            case 'Normal':
                player.playerRecover();
                break;
            case 'Nails':
                this.scheduleOnce(() => player.playerDamage(), 0);
                break;
            case 'Trampoline':
                this.playAnim();
                player.playerRecover();
                player.getComponent(cc.RigidBody).linearVelocity = cc.v2(player.getComponent(cc.RigidBody).linearVelocity.x, this.springVelocity);
                break;
            case 'Conveyor':
                
                break;
            case 'Fake':
                this.getAnimState();
                this.playAnim();
                this.scheduleOnce(() => contact.disabled = true, 0.2);
                break;
            }
    }
    else {
        contact.disabled = true;
    }
}

onEndContact(contact, selfCollider, otherCollider) {

}

onPreSolve(contact, selfCollider, otherCollider) {
    const player = otherCollider.getComponent('Player');
    if (player && this.node.name === 'Conveyor') {
        otherCollider.getComponent(cc.RigidBody).linearVelocity = cc.v2(this.moveSpeed, 0);
    }
}

onPostSolve(contact, selfCollider, otherCollider) {
    // You can handle logic after physics solve here if needed.
}

playSoundEffect() {
    if (!this.isTouched) {
        cc.audioEngine.playEffect(this.soundEffect, false);
        this.isTouched = true;
    }
}


}
