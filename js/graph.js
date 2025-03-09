// Global variables
let chart;
let sensorId;
let sensorData = [];
let updateInterval;
let csvData = [];

// Initialize the page
window.onload = function() {
    // Get sensor ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    sensorId = urlParams.get('id') || 'N';
    
    // Update sensor title
    document.getElementById('sensor-title').textContent = `SENSOR ${sensorId}`;
    
    // Initialize chart with empty data
    initChart([]);
    
    // Generate QR code for the CSV file
    generateQRCode();
    
    // Parse the CSV data
    parseCSVData();
};

// Parse the CSV data from the attached file
function parseCSVData() {
    // This is a simplified representation of the CSV data
    // In a real implementation, you would load this from the actual file
    fetch('data/sensor_data.csv')
        .then(response => response.text())
        .then(data => {
            // Process the CSV data
            const rows = data.trim().split('\n');
            csvData = rows.map(row => {
                const values = row.split(',');
                return {
                    time: parseFloat(values[0]),
                    // Get all sensor values (columns 1 to end)
                    sensorValues: values.slice(1).map(val => parseFloat(val))
                };
            });
            
            // Prepare data for the selected sensor
            prepareSensorData();
        })
        .catch(error => {
            console.error("Error loading CSV data:", error);
            // Generate fallback data
            generateFallbackData();
        });
}

// Prepare data for the selected sensor
function prepareSensorData() {
    // Get the sensor index (0-based)
    const sensorIndex = parseInt(sensorId) - 1;
    
    // Check if it's a valid sensor index
    if (sensorIndex >= 0 && sensorIndex < 17) { // Assuming 17 sensors based on CSV
        // Extract data for the selected sensor
        sensorData = csvData.map(row => ({
            time: row.time,
            value: row.sensorValues[sensorIndex]
        }));
        
        // Load the data into the chart
        loadSampleData();
    } else {
        alert(`Invalid sensor ID: ${sensorId}`);
        generateFallbackData();
    }
}

// Initialize Chart.js
function initChart(data) {
    const ctx = document.getElementById('sensorChart').getContext('2d');
    
    // Destroy existing chart if it exists
    if (chart) {
        chart.destroy();
    }
    
    // Create timestamps for x-axis (using time values from CSV)
    const labels = data.map(item => item.time.toFixed(8));
    
    // Create chart
    chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: `Sensor ${sensorId} Data`,
                data: data.map(item => item.value),
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1,
                fill: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    display: true,
                    beginAtZero: false,
                    title: {
                        display: true,
                        text: 'Sensor Value'
                    },
                    ticks: {
                        display: true,
                        color: '#666'
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Time'
                    }
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: `Sensor ${sensorId} Data Visualization`,
                    font: {
                        size: 16
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false
                }
            }
        },
        plugins: [{
            beforeUpdate: function(chart) {
                const datasets = chart.data.datasets;
                const scales = chart.options.scales;
                
                // Check if all datasets are hidden
                const allHidden = datasets.every(dataset => dataset.hidden);
                
                // Hide y-axis if all datasets are hidden
                if (scales.y) {
                    scales.y.display = !allHidden;
                }
            }
        }]
    });
}

// Generate QR code for CSV download
function generateQRCode() {
    // Create a QR code that points to a sample CSV file
    const qrCodeUrl = `https://example.com/sensor_${sensorId}_data.csv`;
    
    new QRCode(document.getElementById("qrcode"), {
        text: qrCodeUrl,
        width: 128,
        height: 128,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
    });
}

// Load sample data into the chart
function loadSampleData() {
    if (sensorData.length === 0) {
        generateFallbackData();
    }
    
    initChart(sensorData);
    startDynamicUpdate();
}

// Start dynamic updates of the chart
function startDynamicUpdate() {
    // Clear any existing interval
    if (updateInterval) {
        clearInterval(updateInterval);
    }
    
    let currentIndex = 0;
    const displayData = [];
    
    // Update function that adds data points one by one
    updateInterval = setInterval(() => {
        if (currentIndex < sensorData.length) {
            // Add next data point
            displayData.push(sensorData[currentIndex]);
            
            // Keep only the last 20 points for better visualization
            const visibleData = displayData.slice(-20);
            
            // Update chart
            chart.data.labels = visibleData.map(item => item.time.toFixed(8));
            chart.data.datasets[0].data = visibleData.map(item => item.value);
            chart.update('none');
            
            currentIndex++;
        } else {
            // When we reach the end, start over
            currentIndex = 0;
            displayData.length = 0;
        }
    }, 2000); // Update every second
}

// Generate fallback data if CSV loading fails
function generateFallbackData() {
    sensorData = [];
    const dataPoints = 50;
    
    for (let i = 0; i < dataPoints; i++) {
        let value;
        const time = i * 0.005;
        
        // Different patterns for different sensors
        switch(sensorId) {
            case '1':
                value = 0.0001 * Math.sin(i * 0.2);
                break;
            case '2':
                value = 0.0003 + (i * 0.00001) + (Math.random() * 0.0001 - 0.00005);
                break;
            case '3':
                value = 0.0008 - (i * 0.00001) + (Math.random() * 0.00008 - 0.00004);
                break;
            case '4':
                value = 0.00045 + (Math.random() * 0.00005);
                if (i % 10 === 0) value += 0.0002;
                break;
            case '5':
                value = 0.0005 + (Math.random() * 0.0001 - 0.00005);
                break;
            default:
                value = 0.0004 + (Math.random() * 0.0003);
        }
        
        sensorData.push({
            time: time,
            value: value
        });
    }
}

// Handle CSV file upload
function handleFileUpload(event) {
    const file = event.target.files[0];
    
    if (file) {
        // Use PapaParse to parse CSV
        Papa.parse(file, {
            header: false,
            dynamicTyping: true,
            complete: function(results) {
                // Process the CSV data
                csvData = results.data.map(row => {
                    if (row.length > 1) {
                        return {
                            time: row[0],
                            sensorValues: row.slice(1)
                        };
                    }
                    return null;
                }).filter(item => item !== null);
                
                // Prepare data for the selected sensor
                prepareSensorData();
                
                // Start the dynamic update
                startDynamicUpdate();
            },
            error: function(error) {
                console.error("Error parsing CSV:", error);
                alert("Error parsing CSV file. Please check the format.");
            }
        });
    }
}
