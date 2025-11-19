const canvas = document.getElementById('hero-canvas');
const ctx = canvas.getContext('2d');

let width = canvas.width = window.innerWidth;
let height = canvas.height = canvas.getBoundingClientRect().height;

const profileImage = document.querySelector('.profile-image');
let center = { x: 0, y: 0 };

function updateCenter() {
    if (!profileImage) return;
    const rect = profileImage.getBoundingClientRect();
    center.x = rect.left + rect.width / 2;
    center.y = rect.top + rect.height / 2 - 90;
}

// Perlin Noise generator
const perlin = {
    rand_vect: function(){
        let theta = Math.random() * 2 * Math.PI;
        return {x: Math.cos(theta), y: Math.sin(theta)};
    },
    dot_prod_grid: function(x, y, vx, vy){
        let g_vect;
        let d_vect = {x: x - vx, y: y - vy};
        if (this.gradients[[vx,vy]]){
            g_vect = this.gradients[[vx,vy]];
        } else {
            g_vect = this.rand_vect();
            this.gradients[[vx,vy]] = g_vect;
        }
        return d_vect.x * g_vect.x + d_vect.y * g_vect.y;
    },
    smootherstep: function(x){
        return 6*x**5 - 15*x**4 + 10*x**3;
    },
    interp: function(x, a, b){
        return a + this.smootherstep(x) * (b-a);
    },
    seed: function(){
        this.gradients = {};
        this.memory = {};
    },
    get: function(x, y) {
        if (this.memory.hasOwnProperty([x,y]))
            return this.memory[[x,y]];
        let xf = Math.floor(x);
        let yf = Math.floor(y);
        //interpolate
        let tl = this.dot_prod_grid(x, y, xf,   yf);
        let tr = this.dot_prod_grid(x, y, xf+1, yf);
        let bl = this.dot_prod_grid(x, y, xf,   yf+1);
        let br = this.dot_prod_grid(x, y, xf+1, yf+1);
        let xt = this.interp(x-xf, tl, tr);
        let xb = this.interp(x-xf, bl, br);
        let v = this.interp(y-yf, xt, xb);
        this.memory[[x,y]] = v;
        return v;
    }
};
perlin.seed();

class Blob {
    constructor(x, y, radius, color1, color2) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color1 = color1;
        this.color2 = color2;
        this.noiseStep = 0;
    }

    update() {
        const dx = center.x - this.x;
        const dy = center.y - this.y;
        this.x += dx * 0.03; // Slower easing for a more fluid feel
        this.y += dy * 0.03;
        this.noiseStep += 0.005;
    }

    draw() {
        const gradient = ctx.createRadialGradient(this.x, this.y, this.radius * 0.8, this.x, this.y, this.radius);
        gradient.addColorStop(0, this.color1);
        gradient.addColorStop(1, this.color2);
        ctx.fillStyle = gradient;

        ctx.beginPath();
        const numPoints = 32; // More points for a smoother shape
        const angleStep = (Math.PI * 2) / numPoints;

        for (let i = 0; i < numPoints; i++) {
            const angle = i * angleStep;

            // Use Perlin noise for organic radius variation
            const noiseX = Math.cos(angle) * 2 + 1;
            const noiseY = Math.sin(angle) * 2 + 1;
            const noiseVal = perlin.get(noiseX + this.noiseStep, noiseY + this.noiseStep);

            const r = this.radius * (1 + noiseVal * 0.2);

            const x = this.x + Math.cos(angle) * r;
            const y = this.y + Math.sin(angle) * r;

            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                // Use curves for a smoother connection
                const prevAngle = (i - 1) * angleStep;
                const prevR = this.radius * (1 + perlin.get(Math.cos(prevAngle)*2+1 + this.noiseStep, Math.sin(prevAngle)*2+1 + this.noiseStep) * 0.2);
                const prevX = this.x + Math.cos(prevAngle) * prevR;
                const prevY = this.y + Math.sin(prevAngle) * prevR;

                const cpX = (prevX + x) / 2;
                const cpY = (prevY + y) / 2;

                ctx.quadraticCurveTo(prevX, prevY, cpX, cpY);
            }
        }
        ctx.closePath();
        ctx.fill();
    }
}

let blob_list = [];

function animate() {
    ctx.clearRect(0, 0, width, height);
    for (const blob of blob_list) {
        blob.update();
        blob.draw();
    }
    requestAnimationFrame(animate);
}

function initBlobs() {
    // Update center position first
    updateCenter();

    // Create blobs at the correct position
    const ring_00 = new Blob(center.x, center.y, 50, 'rgba(5, 215, 243, 0)', 'rgba(123, 16, 230, 0.79)');
    const ring_01 = new Blob(center.x, center.y, 65, 'rgba(5, 215, 243, 0)', 'rgba(123, 16, 230, 0.79)');
    const ring_02 = new Blob(center.x, center.y, 82, 'rgba(5, 215, 243, 0)', 'rgba(123, 16, 230, 0.79)');
    const ring_03 = new Blob(center.x, center.y, 105, 'rgba(5, 215, 243, 0)', 'rgba(123, 16, 230, 0.79)');
    const ring_04 = new Blob(center.x, center.y, 130, 'rgba(5, 215, 243, 0)', 'rgba(123, 16, 230, 0.79)');
    const ring_05 = new Blob(center.x, center.y, 150, 'rgba(5, 215, 243, 0)', 'rgba(123, 16, 230, 0.79)');
    const ring_06 = new Blob(center.x, center.y, 170, 'rgba(5, 215, 243, 0)', 'rgba(16, 187, 230, 0.79)');
    const ring_1 = new Blob(center.x, center.y, 220, 'rgba(5, 215, 243, 0)', 'rgba(91, 16, 230, 0.79)');
    const ring_2 = new Blob(center.x, center.y, 270, 'rgba(5, 215, 243, 0)', 'rgba(123, 16, 230, 0.79)');
    const ring_3 = new Blob(center.x, center.y, 320, 'rgba(5, 215, 243, 0)', 'rgba(16, 187, 230, 0.79)');
    const ring_4 = new Blob(center.x, center.y, 390, 'rgba(5, 215, 243, 0)', 'rgba(91, 16, 230, 0.79)');
    const ring_5 = new Blob(center.x, center.y, 470, 'rgba(5, 215, 243, 0)', 'rgba(123, 16, 230, 0.79)');
    const ring_6 = new Blob(center.x, center.y, 570, 'rgba(5, 215, 243, 0)', 'rgba(16, 187, 230, 0.79)');
    const ring_7 = new Blob(center.x, center.y, 670, 'rgba(5, 215, 243, 0)', 'rgba(91, 16, 230, 0.79)');
    const ring_8 = new Blob(center.x, center.y, 770, 'rgba(5, 215, 243, 0)', 'rgba(123, 16, 230, 0.79)');

    blob_list = [ring_06, ring_1, ring_2, ring_3, ring_4, ring_5, ring_6, ring_7, ring_8];

    // Start animation
    animate();
}

window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = canvas.getBoundingClientRect().height;
    updateCenter();
    perlin.seed(); // Re-seed noise on resize
});

// Initialize blobs after the page has loaded
window.addEventListener('load', initBlobs);