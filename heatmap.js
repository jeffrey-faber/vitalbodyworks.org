class BodyHeatmapApp {
    constructor(containerId, formId) {
        this.container = document.getElementById(containerId);
        this.form = document.getElementById(formId);
        this.BODY_IMAGES = {
            front: { src: 'images/frontBody.png', width: 197, height: 430 }
            // Only front is currently working, so other views are ignored
        };
        this.BODY_REGIONS = {
            frontBackRegions: {
                forehead: { x: 75, y: 10, width: 50, height: 25 },
                jaw: { x: 75, y: 35, width: 50, height: 30 },
                neck: { x: 80, y: 65, width: 40, height: 20 },
                shoulders: { x: 50, y: 85, width: 100, height: 30 },
                pectoralisMuscles: { x: 65, y: 115, width: 70, height: 40 },
                abdomen: { x: 61, y: 155, width: 80, height: 40 },
                leftUpperArm: { x: 35, y: 115, width: 30, height: 40 },
                rightUpperArm: { x: 135, y: 115, width: 30, height: 40 },
                leftElbow: { x: 30, y: 145, width: 35, height: 20 },
                rightElbow: { x: 140, y: 145, width: 35, height: 20 },
                leftForearm: { x: 20, y: 165, width: 40, height: 35 },
                rightForearm: { x: 145, y: 165, width: 40, height: 35 },
                leftWrist: { x: 10, y: 200, width: 40, height: 15 },
                rightWrist: { x: 160, y: 200, width: 40, height: 15 },
                leftHand: { x: 7, y: 215, width: 45, height: 35 },
                rightHand: { x: 162, y: 215, width: 45, height: 35 },
                hips: { x: 55, y: 195, width: 90, height: 30 },
                pelvis: { x: 81, y: 195, width: 40, height: 30 },
                thighs: { x: 60, y: 225, width: 80, height: 60 },
                knees: { x: 60, y: 285, width: 80, height: 35 },
                shins: { x: 60, y: 320, width: 80, height: 40 },
                ankle: { x: 60, y: 360, width: 80, height: 25 },
                feet: { x: 60, y: 385, width: 80, height: 35 }
            }
        };

        this.heatmapData = null;
        this.professionAdvice = '';
        this.recommendedStretches = '';

        this.init();
    }

    getHeatmapColor(intensity) {
        const r = 255; // Red value for the color red
        const g = Math.round((1 - intensity) * 255); // Green interpolates from 255 to 0
        const b = Math.round((1 - intensity) * 255); // Blue interpolates from 255 to 0
        const a = 255; // Full opacity

        return [r, g, b, a];
    }

    drawHeatmap(canvasId, imageInfo, intensities) {
        const canvas = document.getElementById(canvasId);
        const ctx = canvas.getContext('2d');

        canvas.width = imageInfo.width;
        canvas.height = imageInfo.height;

        const img = new Image();
        img.onload = () => {
            ctx.drawImage(img, 0, 0);

            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;

            const regions = imageInfo.width > 100 ? this.BODY_REGIONS.frontBackRegions : this.BODY_REGIONS.sideRegions;

            for (const [region, intensity] of Object.entries(intensities)) {
                if (regions[region]) {
                    const { x, y, width, height } = regions[region];
                    const [r, g, b, a] = this.getHeatmapColor(intensity);

                    for (let i = y; i < y + height; i++) {
                        for (let j = x; j < x + width; j++) {
                            const index = (i * canvas.width + j) * 4;
                            if (data[index + 3] === 0) { // Check if pixel is transparent
                                data[index] = r;
                                data[index + 1] = g;
                                data[index + 2] = b;
                                data[index + 3] = a;
                            }
                        }
                    }
                }
            }

            ctx.putImageData(imageData, 0, 0);
        };
        img.src = imageInfo.src;
    }

    updateHeatmaps(data) {
        console.log(data);
        this.drawHeatmap('frontCanvas', this.BODY_IMAGES.front, data);
    }

    async fetchDataFromAPI(message) {
        try {
            const response = await fetch('getAssessment.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams({
                    'message': message
                })
            });
            const data = await response.json();
            console.log(data);
            return data;
        } catch (error) {
            console.error('Error fetching data from API:', error);
            return null;
        }
    }

    init() {
        // Create canvas for the front view
        const canvas = document.createElement('canvas');
        canvas.id = 'frontCanvas';
        this.container.appendChild(canvas);

        // Add form submission handler
        this.form.addEventListener('submit', async (event) => {
            event.preventDefault();
            const message = document.getElementById('message').value;
            const data = await this.fetchDataFromAPI(message);
            if (data) {
                this.heatmapData = data.heatmap;
                this.professionAdvice = data.professionAdvice;
                this.recommendedStretches = data.recommendedStretches;
                this.updateHeatmaps(this.heatmapData);
                // You can add methods to display professionAdvice and recommendedStretches if needed
            }
        });
    }
}

// Initialize the app when the window loads
window.onload = () => {
    const app = new BodyHeatmapApp('heatmap-container', 'assessmentForm');
};
