// Constants for image paths and sizes
const BODY_IMAGES = {
    front: { src: 'images/frontBody.png', width: 197, height: 430 },
    back: { src: 'images/backBody.png', width: 197, height: 430 },
    left: { src: 'images/leftBody.png', width: 75, height: 407 },
    right: { src: 'images/rightBody.png', width: 75, height: 407 }
};

// Body regions and their corresponding coordinates (adjusted for outline)
const BODY_REGIONS = {
    frontBackRegions: {
        forehead: { x: 75, y: 10, width: 50, height: 25 },
        jaw: { x: 75, y: 35, width: 50, height: 30 },
        neck: { x: 80, y: 65, width: 40, height: 20 },
        shoulders: { x: 50, y: 85, width: 100, height: 30 },
        pectoralisMuscles: { x: 65, y: 115, width: 70, height: 40 },
        abdomen: { x:61, y: 155, width: 80, height: 40 },
        leftUpperArm: { x: 35, y: 115, width: 30, height: 40 },
        rightUpperArm: { x: 135, y: 115, width: 30, height: 40 },
        leftElbow: { x: 30, y: 145, width: 35, height: 20 },  // Moved slightly outward
        rightElbow: { x: 140, y: 145, width: 35, height: 20 },  // Moved slightly outward
        leftForearm: { x: 20, y: 165, width: 40, height: 35 },  // Moved further outward
        rightForearm: { x: 145, y: 165, width: 40, height: 35 },  // Moved further outward
        leftWrist: { x: 10, y: 200, width: 40, height: 15 },  // Moved further outward
        rightWrist: { x: 160, y: 200, width: 40, height: 15 },  // Moved further outward
        leftHand: { x: 7, y: 215, width: 45, height: 35 },  // Moved further outward
        rightHand: { x: 162, y: 215, width: 45, height: 35 },  // Moved further outward
        hips: { x: 55, y: 195, width: 90, height: 30 },
        pelvis: { x: 81, y: 195, width: 40, height: 30 },
        thighs: { x: 60, y: 225, width: 80, height: 50 },
        knees: { x: 60, y: 275, width: 80, height: 20 },
        shins: { x: 60, y: 295, width: 80, height: 30 },
        ankle: { x: 60, y: 325, width: 80, height: 10 },
        feet: { x: 60, y: 335, width: 80, height: 35 }
    }    ,    
    sideRegions: {
        head: { x: 10, y: 0, width: 55, height: 75 },
        neck: { x: 20, y: 75, width: 35, height: 25 },
        shoulders: { x: 5, y: 100, width: 65, height: 35 },
        back: { x: 5, y: 135, width: 65, height: 110 }, // Adjusted to cover back correctly
        chest: { x: 5, y: 135, width: 45, height: 60 },
        abdomen: { x: 5, y: 195, width: 45, height: 70 },
        legs: { x: 5, y: 265, width: 65, height: 142 }
    }
};

function getHeatmapColor(intensity) {
    const hue = (1 - intensity) * 120;

    
    return `hsla(${hue}, 100%, 50%, 0.9)`; // Corrected line
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
            forehead: 0.1,
            jaw: 0.1,
            neck: 0.1,
            shoulders: 0.1,
            pectoralisMuscles: 0.1,
            abdomen: 0.1,
            leftUpperArm: 0.1,
            rightUpperArm: 0.1,
            leftElbow: 0.1,
            rightElbow: 0.1,
            leftForearm: 0.1,
            rightForearm: 0.1,
            leftWrist: 0.1,
            rightWrist: 0.1,
            leftHand: 0.1,
            rightHand: 0.1,
            pelvis: 0.1,
            hips: 0.1,
            thighs: 0.3,
            knees: 0.5,
            shins: 0.7,
            ankle: 0.9,
            feet: 0.1
        }
         ,
        back: {
            forehead: 0.1,
            jaw: 0.1,
            neck: 0.1,
            shoulders: 0.1,
            pectoralisMuscles: 0.1,
            abdomen: 0.1,
            leftUpperArm: 0.1,
            rightUpperArm: 0.1,
            leftElbow: 0.1,
            rightElbow: 0.1,
            leftForearm: 0.1,
            rightForearm: 0.1,
            leftWrist: 0.1,
            rightWrist: 0.1,
            leftHand: 0.1,
            rightHand: 0.1,
            pelvis: 0.1,
            hips: 0.1,
            thighs: 0.1,
            knees: 0.3,
            shins: 0.5,
            ankle: 0.7,
            feet: 0.9
        },
        left: {
            head: 0.1,
            neck: 0.1,
            shoulders: 0.1,
            back: 0.1,
            chest: 0.1,
            abdomen: 0.1,
            legs: 0.1
        },
        right: {
            head: 0.1,
            neck: 0.1,
            shoulders: 0.1,
            back: 0.1,
            chest: 0.1,
            abdomen: 0.1,
            legs: 0.1
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
