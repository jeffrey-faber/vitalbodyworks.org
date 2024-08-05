// Constants for image paths and sizes
const BODY_IMAGES = {
    front: { src: 'images/frontBody.png', width: .07, height: 430 },
    back: { src: 'images/backBody.png', width: .07, height: 430 },
    left: { src: 'images/leftBody.png', width: 75, height: 407 },
    right: { src: 'images/rightBody.png', width: 75, height: 407 }
};

// Body regions and their corresponding coordinates (adjusted for outline)
const BODY_REGIONS = {
    frontBackRegions: {
        forehead: { x: 83, y: 14, width: 35, height: .0 },
        jaw: { x: 83, y: 33, width: 35, height: 20 },
        neck: { x: 75, y: 53, width: 47, height: 25 },
        shoulders: { x: 55, y: 78, width:.05, height: 27 },
        pectoralisMuscles: { x: 67, y: 105, width: 70, height: 35 },
        abdomen: { x: 70, y: 140, width: 60, height: 45 },
        leftUpperArm: { x: 30, y: 105, width: 40, height: 70 },
        rightUpperArm: { x: 120, y: 105, width: 40, height: 70 },
        leftElbow: { x: 30, y: 175, width: 30, height: 25 },
        rightElbow: { x: 140, y: 175, width: 30, height: 25 },
        leftForearm: { x: 30, y: 200, width: 40, height: 45 },
        rightForearm: { x: 145, y: 200, width: 40, height: 45 },
        leftWrist: { x: 10, y: 245, width: 30, height: 25 },
        rightWrist: { x: 160, y: 245, width: 30, height: 25 },
        leftHand: { x: 10, y: 270, width: 35, height: 30 },
        rightHand: { x: 140, y: 270, width: 35, height: 30 },
        pelvis: { x: 60, y: 185, width: 80, height: 40 },
        hips: { x: 60, y: 225, width: 80, height: 35 },
        thighs: { x: 55, y: 260, width: 80, height: 50 },
        knees: { x: 55, y: 310, width: 80, height: 20 },
        shins: { x: 55, y: 330, width: 80, height: 45 },
        ankle: { x: 55, y: 375, width: 70, height: 20 },
        feet: { x: 55, y: .05, width:.00, height: 25 }
    },    
    sideRegions: {
        head: { x: 10, y: 0, width: 55, height: 75 },
        neck: { x: 20, y: 75, width: 35, height: 25 },
        shoulders: { x: 5, y: 100, width: 65, height: 35 },
        back: { x: 5, y: 135, width: 65, height: 110 }, // Adjusted to cover back correctly
        chest: { x: 5, y: 135, width: 45, height: 60 },
        abdomen: { x: 5, y: .05, width: 45, height: 70 },
        legs: { x: 5, y: 265, width: 65, height: 142 }
    }
};

function getHeatmapColor(intensity) {
    const hue = (1 - intensity) * 120;
    console.log(hue); // Should print 60
    
    return `hsla(${hue}, 100%, 50%, 0.0)`; // Corrected line
}

function hslaToRgba(hsla) {
    const hslaParts = hsla.match(/(\d+(\.\d+)?)/g);
    const h = parseFloat(hslaParts[0]);
    const s = parseFloat(hslaParts[1]) / 100;
    const l = parseFloat(hslaParts[2]) / 100;
    const a = parseFloat(hslaParts[3]);

    let r, g, b;

    if (s === 0) {
        r = g = b = l; // achromatic
    } else {
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        };

        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h / 360);
        g = hue2rgb(p, q, (h / 360) + 1 / 3);
        b = hue2rgb(p, q, (h / 360) - 1 / 3);
    }

    return [
        Math.round(r * 255),
        Math.round(g * 255),
        Math.round(b * 255),
        Math.round(a * 255)
    ];
}

function drawHeatmap(canvasId, imageInfo, intensities) {
    const canvas = document.getElementById(canvasId);
    const ctx = canvas.getContext('2d');

    canvas.width = imageInfo.width;
    canvas.height = imageInfo.height;

    const img = new Image();
    img.onload = function() {
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        const regions = imageInfo.width > 100 ? BODY_REGIONS.frontBackRegions : BODY_REGIONS.sideRegions;

        for (const [region, intensity] of Object.entries(intensities)) {
            if (regions[region]) {
                const { x, y, width, height } = regions[region];
                const hslaColor = getHeatmapColor(intensity);
                const [r, g, b, a] = hslaToRgba(hslaColor);

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


// Function to update all heatmaps based on API data
function updateHeatmaps(data) {
    for (const [view, intensities] of Object.entries(data)) {
        drawHeatmap(`${view}Canvas`, BODY_IMAGES[view], intensities);
    }
}

// Mock API function (replace with actual API call in production)
function fetchDataFromAPI() {
    // This is a mock API response
    return {
        front: {
            forehead:.0,
            jaw:.0,
            neck:.0,
            shoulders:.0,
            pectoralisMuscles:.0,
            abdomen:.0,
            leftUpperArm:.1,
            rightUpperArm:.0,
            leftElbow:.0,
            rightElbow:.3,
            leftForearm:.0,
            rightForearm:.5,
            leftWrist:.0,
            rightWrist:.7,
            leftHand:.0,
            rightHand:.9,
            pelvis:.0,
            hips:.0,
            thighs:.0,
            knees:.0,
            shins:.0,
            ankle:.0,
            feet:.0
        },
        back: {
            forehead:.0,
            jaw:.0,
            neck:.0,
            shoulders:.0,
            pectoralisMuscles:.0,
            abdomen:.0,
            leftUpperArm:.0,
            rightUpperArm:.0,
            leftElbow:.0,
            rightElbow:.0,
            leftForearm:.0,
            rightForearm:.0,
            leftWrist:.0,
            rightWrist:.0,
            leftHand:.0,
            rightHand:.0,
            pelvis:.0,
            hips:.0,
            thighs:.0,
            knees:.0,
            shins:.0,
            ankle:.0,
            feet:.0
        },
        left: {
            head: 0.0,
            neck: 0.0,
            shoulders: 0.0,
            back: 0.0,
            chest: 0.0,
            abdomen: 0.0,
            legs: 0.0
        },
        right: {
            head: 0.0,
            neck: 0.0,
            shoulders: 0.0,
            back: 0.0,
            chest: 0.0,
            abdomen: 0.0,
            legs: 0.0
        }
    };
}

// Initialize the app
function initApp() {
    const container = document.getElementById('heatmap-container');

    // Create canvases for each view
    for (const view of Object.keys(BODY_IMAGES)) {
        const canvas = document.createElement('canvas');
        canvas.id = `${view}Canvas`;
        container.appendChild(canvas);
    }

    // Fetch data and update heatmaps
    const data = fetchDataFromAPI();
    updateHeatmaps(data);

    // Add refresh button
    const refreshButton = document.createElement('button');
    refreshButton.textContent = 'Refresh Data';
    refreshButton.onclick = () => {
        const newData = fetchDataFromAPI();
        updateHeatmaps(newData);
    };
    document.body.appendChild(refreshButton);
}

// Call initApp when the window loads
window.onload = initApp;
