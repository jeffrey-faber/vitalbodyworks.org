// Constants for image paths and sizes
const BODY_IMAGES = {
    front: { src: 'images/frontBody.png', width: 197, height: 430 },
    back: { src: 'images/backBody.png', width: 197, height: 430 },
    left: { src: 'images/leftBody.png', width: 75, height: 407 },
    right: { src: 'images/rightBody.png', width: 75, height: 407 }
  };
  
  // Body regions and their corresponding coordinates (adjusted for these images)
  const BODY_REGIONS = {
    frontBackRegions: {
      head: { x: 98, y: 20, width: 1, height: 1 },
      neck: { x: 98, y: 80, width: 1, height: 1 },
      shoulders: { x: 60, y: 110, width: 1, height: 1 },
      chest: { x: 98, y: 150, width: 1, height: 1 },
      abdomen: { x: 98, y: 220, width: 1, height: 1 },
      arms: { x: 30, y: 200, width: 1, height: 1 },
      legs: { x: 98, y: 300, width: 1, height: 1 }
    },
    sideRegions: {
      head: { x: 37, y: 20, width: 1, height: 1 },
      neck: { x: 37, y: 80, width: 1, height: 1 },
      shoulders: { x: 37, y: 110, width: 1, height: 1 },
      back: { x: 50, y: 200, width: 1, height: 1 },
      chest: { x: 25, y: 150, width: 1, height: 1 },
      abdomen: { x: 25, y: 220, width: 1, height: 1 },
      legs: { x: 37, y: 300, width: 1, height: 1 }
    }
  };
  
  // Function to apply heatmap color based on intensity
  function getHeatmapColor(intensity) {
    const hue = ((1 - intensity) * 120).toString(10);
    return `hsla(${hue}, 100%, 50%, 0.5)`;
  }
  
  // Flood fill algorithm
  function floodFill(imageData, x, y, fillColor) {
    const width = imageData.width;
    const height = imageData.height;
    const stack = [[x, y]];
    const baseColor = getPixelColor(imageData, x, y);
    const fillColorRgb = hexToRgb(fillColor);
  
    while (stack.length > 0) {
      const [x, y] = stack.pop();
      if (x < 0 || x >= width || y < 0 || y >= height) continue;
      if (colorsMatch(getPixelColor(imageData, x, y), baseColor)) {
        setPixelColor(imageData, x, y, fillColorRgb);
        stack.push([x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]);
      }
    }
  }
  
  // Helper functions for flood fill
  function getPixelColor(imageData, x, y) {
    const index = (y * imageData.width + x) * 4;
    return {
      r: imageData.data[index],
      g: imageData.data[index + 1],
      b: imageData.data[index + 2],
      a: imageData.data[index + 3]
    };
  }
  
  function setPixelColor(imageData, x, y, color) {
    const index = (y * imageData.width + x) * 4;
    imageData.data[index] = color.r;
    imageData.data[index + 1] = color.g;
    imageData.data[index + 2] = color.b;
    imageData.data[index + 3] = color.a;
  }
  
  function colorsMatch(color1, color2) {
    return color1.r === color2.r && color1.g === color2.g && color1.b === color2.b && color1.a === color2.a;
  }
  
  function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16),
      a: 128
    } : null;
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
  
      const regions = imageInfo.width > 100 ? BODY_REGIONS.frontBackRegions : BODY_REGIONS.sideRegions;
  
      for (const [region, intensity] of Object.entries(intensities)) {
        if (regions[region]) {
          const { x, y } = regions[region];
          const color = getHeatmapColor(intensity);
  
          // Check for transparency before applying heatmap color
          const originalColor = getPixelColor(imageData, x, y);
          console.log("Region:", region, "Intensity:", intensity, "Base Color:", baseColor);
          if (originalColor.a !== 0) { // Not transparent
            floodFill(imageData, x, y, color);
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
        head: 0.2,
        neck: 0.5,
        shoulders: 0.8,
        chest: 0.3,
        abdomen: 0.1,
        arms: 0.4,
        legs: 0.6
      },
      back: {
        head: 0.1,
        neck: 0.7,
        shoulders: 0.9,
        back: 0.8,
        arms: 0.3,
        legs: 0.5
      },
      left: {
        head: 0.3,
        neck: 0.6,
        shoulders: 0.7,
        back: 0.9,
        chest: 0.2,
        abdomen: 0.1,
        legs: 0.4
      },
      right: {
        head: 0.2,
        neck: 0.5,
        shoulders: 0.8,
        back: 0.7,
        chest: 0.3,
        abdomen: 0.2,
        legs: 0.6
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