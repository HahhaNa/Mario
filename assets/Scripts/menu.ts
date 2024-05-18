const {ccclass, property} = cc._decorator;

@ccclass
export default class menu extends cc.Component {

    start () {
        let StartButton = new cc.Component.EventHandler();
        StartButton.target = this.node;
        StartButton.component = "menu";
        StartButton.handler = "loadGameScene";
        
        cc.find("Canvas/StartButton").getComponent(cc.Button).clickEvents.push(StartButton);
    }

    loadGameScene() {
        cc.director.loadScene("main"); 
    }
    
}
