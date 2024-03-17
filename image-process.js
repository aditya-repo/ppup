// imageResize.js
const fs = require('fs').promises;

async function increaseImageSize(inputFilePath) {
    console.log(inputFilePath);
    try {
        let imageData = await fs.readFile(inputFilePath);
        
        // Check if image size is less than 100 bytes
        if (imageData.length < 100) {
            const padding = Buffer.alloc(100 - imageData.length);
            imageData = Buffer.concat([imageData, padding]);
            await fs.writeFile(inputFilePath, imageData);
            console.log('Image file size increased successfully');
        } else {
            console.log('Image file size is already greater than or equal to 100 bytes');
        }
    } catch (error) {
        console.error('Error increasing image file size:', error);
    }
}

module.exports = increaseImageSize;
