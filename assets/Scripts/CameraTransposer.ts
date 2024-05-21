const {ccclass, property} = cc._decorator;

@ccclass
export default class CameraTransposer extends cc.Component {
    @property(cc.Node)
    followTarget: cc.Node = null;

    @property(cc.Node)
    excludeNode: cc.Node = null;  // Node to exclude from following, including its children

    @property(cc.Boolean)
    followX: boolean = true;

    @property(cc.Boolean)
    followY: boolean = true;

    @property(cc.Float)
    minX: number = -4224;

    @property(cc.Float)
    minY: number = -528;

    @property(cc.Float)
    maxX: number = 4224;

    @property(cc.Float)
    maxY: number = 528;

    @property(cc.Float)
    offsetX: number = -50;

    @property(cc.Float)
    offsetY: number = -100;

    @property(cc.Float)
    lerpSpeed: number = 5;  // Adjust for smoother or faster following

    update(dt) {
        if (this.followTarget && !this.isExcluded(this.followTarget)) {
            let targetPos = this.followTarget.position.add(new cc.Vec3(this.offsetX, this.offsetY, 0));
            let smoothedPosition = new cc.Vec3(
                cc.misc.lerp(this.node.position.x, targetPos.x, dt * this.lerpSpeed),
                cc.misc.lerp(this.node.position.y, targetPos.y, dt * this.lerpSpeed),
                this.node.position.z
            );

            let clampedX = this.followX ? clamp(smoothedPosition.x, this.minX, this.maxX) : this.node.position.x;
            let clampedY = this.followY ? clamp(smoothedPosition.y, this.minY, this.maxY) : this.node.position.y;

            this.node.position = new cc.Vec3(clampedX, clampedY, this.node.position.z);
        }
    }

    // Utility function to determine if a node is the excludeNode or one of its descendants
    isExcluded(node: cc.Node): boolean {
        if (node === this.excludeNode) return true;
        let parent = node.parent;
        while (parent) {
            if (parent === this.excludeNode) return true;
            parent = parent.parent;
        }
        return false;
    }
}

function clamp(x: number, a: number, b: number) {
    if (x < a) return a;
    if (x > b) return b;
    return x;
}
