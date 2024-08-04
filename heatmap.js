
        // Constants for image paths and sizes
        const BODY_IMAGES = {
            front: { src: '/mnt/data/image.png', width: 197, height: 430 },
            back: { src: '/mnt/data/image.png', width: 197, height: 430 },
            left: { src: '/mnt/data/image.png', width: 75, height: 407 },
            right: { src: '/mnt/data/image.png', width: 75, height: 407 }
        };

        // Body regions and their corresponding coordinates (adjusted for outline)
        const BODY_REGIONS = {
            frontBackRegions: {
                head: { x: 60, y: 0, width: 77, height: 80 },
                neck: { x: 75, y: 80, width: 47, height: 25 },
                shoulders: { x: 35, y: 105, width: 127, height: 35 },
                chest: { x: 55, y: 140, width: 87, height: 60 },
                abdomen: { x: 65, y: 200, width: 67, height: 70 },
                arms: { x: 10, y: 140, width: 177, height: 170 },
                legs: { x: 45, y: 270, width: 107, height: 160 }
            },
            sideRegions: {
                head: { x: 10, y: 0, width: 55, height: 75 },
                neck: { x: 20, y: 75, width: 35, height: 25 },
                shoulders: { x: 5, y: 100, width: 65, height: 35 },
                back: { x: 5, y: 135, width: 65, height: 110 },
                chest: { x: 5, y: 135, width: 45, height: 60 },
                abdomen: { x: 5, y: 195, width: 45, height: 70 },
                legs: { x: 5, y: 265, width: 65, height: 142 }
            }
        };

        // Function to apply heatmap color based on intensity
        function getHeatmapColor(intensity) {
            const hue = ((1 - intensity) * 120).toString(10);
            return `hsla(${hue}, 100%, 50%, 0.9)`;
        }

        // Function to draw heatmap on canvas
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
                        const color = getHeatmapColor(intensity);
                        const [r, g, b, a] = color.match(/\d+/g).map(Number);

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
                    head: 0.1,
                    neck: 0.2,
                    shoulders: 0.3,
                    chest: 0.4,
                    abdomen: 0.5,
                    arms: 0.7,
                    legs: 0.9
                },
                back: {
                    head: 0.9,
                    neck: 0.9,
                    shoulders: 0.9,
                    back: 0.9,
                    arms: 0.9,
                    legs: 0.9
                },
                left: {
                    head: 0.9,
                    neck: 0.9,
                    shoulders: 0.9,
                    back: 0.9,
                    chest: 0.9,
                    abdomen: 0.9,
                    legs: 0.9
                },
                right: {
                    head: 0.9,
                    neck: 0.9,
                    shoulders: 0.9,
                    back: 0.9,
                    chest: 0.9,
                    abdomen: 0.9,
                    legs: 0.9
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