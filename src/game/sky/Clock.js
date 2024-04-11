export default class clock {
    constructor() {
        this.start = Date.now() / 1000;
        this.current = this.start;
        this.elapsed = 0;
        this.delta = 16 / 1000;

        this.autoUpdate = true;
        this.timeProgress = 0;
        this.progress = 0;
        this.duration = 15; // Seconds

        this.theta = Math.PI * 0.8; // All around the sphere
        this.phi = Math.PI * 0.45;// Elevation
        this.position = { x: 0, y: 0, z: 0 };
        this.days = false;
    }
    update() {
        const current = Date.now() / 1000;

        this.delta = current - this.current;
        this.elapsed += this.delta;
        this.current = current;

        if (this.delta > 60 / 1000) {
            this.delta = 60 / 1000
        }

        //progress

        if (this.autoUpdate) {
            this.timeProgress += this.delta / this.duration;
            this.progress = this.timeProgress % 1;
            
            // this.progress = 0.7,-0.3;

            const angle = - (this.progress + 0.25) * Math.PI * 2;
            this.phi = (Math.sin(angle) * 0.3 + 0.5) * Math.PI;
            this.theta = (Math.cos(angle) * 0.3 + 0.5) * Math.PI;

            const sinPhiRadius = Math.sin(this.phi);

            this.position.x = sinPhiRadius * Math.sin(this.theta);
            this.position.y = Math.cos(this.phi);
            this.position.z = sinPhiRadius * Math.cos(this.theta);
        }
    }
}