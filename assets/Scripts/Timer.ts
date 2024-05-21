const {ccclass, property} = cc._decorator;

@ccclass
class CountdownTimer extends cc.Component {
    @property(cc.Label)
    timerLabel: cc.Label = null; // Assuming the label is linked through the editor

    @property
    timeRemaining: number = 300; // Countdown time in seconds

    onLoad() {
        this.schedule(this.updateTimer, 1); // Update the timer every second
    }

    updateTimer() {
        this.timeRemaining--;
        this.timerLabel.string = String(this.timeRemaining);
        // this.timerLabel.string = this.formatTime(this.timeRemaining);

        if (this.timeRemaining <= 0) {
            this.unschedule(this.updateTimer); // Stop the timer
            this.endGame(); // Function to handle game end
        }
    }

    // formatTime(seconds: number): string {
    //     let minutes = Math.floor(seconds / 60);
    //     let sec = seconds % 60;
    //     return `${minutes}:${sec < 10 ? '0' + sec : sec}`;
    // }

    endGame() {
        cc.director.loadScene("EndScene"); // Assume "EndScene" is the name of your end game scene
    }
}
