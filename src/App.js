import React, { useState, useRef } from 'react';
import './App.css';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

function App() {
    const [userText, setUserText] = useState('OFFICE OF COMMUNICATIONS');
    const canvasRef = useRef(null);
    const canvasRefVert = useRef(null);
    const imageRef = useRef(null);

    const handleChange = (event) => {
        setUserText(event.target.value);
    };

    const generateLogo = () => {
        // ------- horz
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const img = imageRef.current;

        // Clear the canvas before redrawing
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Calculate the aspect ratio of the image
        const aspectRatio = img.width / img.height;
        const canvasWidth = 800; // Set a fixed width for the canvas
        const canvasHeight = canvasWidth / aspectRatio; // Calculate height to maintain aspect ratio

        // Set the canvas dimensions
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;

        // Draw the resized template image on the canvas
        ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);

        // Set the text style
        ctx.font = '35px Libre Franklin';
        ctx.fontWeight = '200';
        ctx.fillStyle = '#003366'; // Use the same color as the original logo
        ctx.textAlign = 'left';

        const lineHeight = 30;

        wrapText(ctx, userText, 320, 74, 499, lineHeight);

        // ------- vert

        const canvasVert = canvasRefVert.current;
        const ctxVert = canvasVert.getContext('2d');

        // Clear the canvas before redrawing
        ctxVert.clearRect(0, 0, canvasVert.width, canvasVert.height);

        // Calculate the aspect ratio of the image
        const aspectRatioVert = img.width / img.height;
        const canvasHeightVert = 800; // Set a fixed width for the canvas
        const canvasWidthVert = canvasHeightVert / aspectRatioVert; // Calculate height to maintain aspect ratio

        // Set the canvas dimensions
        canvasVert.width = canvasWidthVert;
        canvasVert.height = canvasHeightVert;

        // Draw the resized template image on the canvas
        ctxVert.drawImage(img, 0, 0, canvasWidthVert, canvasHeightVert);

        // Set the text style
        ctxVert.font = '35px Libre Franklin';
        ctxVert.fontWeight = '200';
        ctxVert.fillStyle = '#003366'; // Use the same color as the original logo
        ctxVert.textAlign = 'left';

        wrapText(ctx, userText, 74, 320, 100, lineHeight);
    };

    // Text wrapping function
    const wrapText = (context, text, x, y, maxWidth, lineHeight) => {
        const words = text.split(' ');
        let line = '';
        const lines = [];

        for (let i = 0; i < words.length; i++) {
            const testLine = line + words[i] + ' ';
            const metrics = context.measureText(testLine);
            const testWidth = metrics.width;

            if (testWidth > maxWidth && i > 0) {
                lines.push(line);
                line = words[i] + ' ';
            } else {
                line = testLine;
            }
        }
        lines.push(line);

        for (let j = 0; j < lines.length; j++) {
            context.fillText(lines[j], x, y + j * lineHeight);
        }
    };

    const generateSVG = () => {
        const img = canvasRef.current;

        // Create a base64 version of the image to embed it in the SVG
        const imgBase64 = getBase64Image(img);

        // Create the SVG content
        const svgContent = `
        <svg xmlns="http://www.w3.org/2000/svg" width="800" height="400" viewBox="0 0 800 400">
          <image href="${imgBase64}" x="0" y="0" width="800" height="400" />
        </svg>
      `;

        return svgContent;
    };

    // Function to convert the image into a Base64 string
    const getBase64Image = (img) => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        return canvas.toDataURL('image/png');
    };

    // Function to convert canvas to PNG data URL
    const getPngDataUrl = () => {
        const canvas = canvasRef.current;
        return canvas.toDataURL('image/png');
    };

    // Function to generate PNG and SVG, and download as a ZIP file
    const downloadAsZip = async () => {
        const zip = new JSZip();

        // Get PNG data URL from the canvas
        const pngDataUrl = getPngDataUrl();
        const pngBlob = await (await fetch(pngDataUrl)).blob(); // Convert PNG to Blob
        zip.file('image_horz_blue.png', pngBlob, { binary: true });

        // Create SVG file and add to zip
        const svgString = generateSVG();
        zip.file('image_horz_blue.svg', svgString);

        // Generate the ZIP file and trigger download
        zip.generateAsync({ type: 'blob' }).then((content) => {
            saveAs(content, 'images.zip');
        });
    };

    return (
        <div className="App">
            <h1>Colby Logo Lockup Generator</h1>
            <input
                type="text"
                value={userText}
                onChange={handleChange}
                placeholder="Enter new text"
            />
            <br />
            <button onClick={generateLogo}>Generate Logo</button>
            <button onClick={downloadAsZip}>Download as ZIP</button>
            <br />

            {/* Hidden image element to load the template */}
            <img
                ref={imageRef}
                src={process.env.PUBLIC_URL + '/logo-template.png'}
                alt="Logo Template"
                style={{ display: 'none' }}
                onLoad={generateLogo} // Ensure the logo is generated when the image loads
            />

            {/* Canvas where the logo will be drawn */}
            <canvas
                ref={canvasRef}
                width={1600}
                height={400}
                style={{ border: '1px solid black' }}
            />
            <br />
            <canvas
                ref={canvasRefVert}
                width={400}
                height={1600}
                style={{ border: '1px solid black' }}
            />
        </div>
    );
}

export default App;
