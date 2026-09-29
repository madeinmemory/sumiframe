// Constants 


const canvas = document.querySelector('#drawing-canvas');
const ctx = canvas.getContext('2d');
const brushSize = document.querySelector('#brush-size');
const brushSizeValue = document.querySelector('#brush-size-value')
const brushColor = document.querySelector('#brush-color');
const brushOpacity = document.querySelector('#brush-opacity');
const brushOpacityValue = document.querySelector('#brush-opacity-value');
const penTool = document.querySelector('#pen-tool');
const eraserTool = document.querySelector('#eraser-tool');
const undoButton = document.querySelector('#undo-button');
const redoButton = document.querySelector('#redo-button');
const clearCanvasButton = document.querySelector('#clear-canvas');
const penProperties = document.querySelector('#pen-properties');
const eraserProperties = document.querySelector('#eraser-properties');
const eraserSize = document.querySelector('#eraser-size');
const eraserSizeValue = document.querySelector('#eraser-size-value');
const textTool = document.querySelector('#text-tool');
const textProperties = document.querySelector('#text-properties');
const textSize = document.querySelector('#text-size');
const textSizeValue = document.querySelector('#text-size-value');
const textColor = document.querySelector('#text-color');
const textContent = document.querySelector('#text-content');


// Drawing Properties


ctx.lineWidth = 5;
ctx.lineCap = 'round';
ctx.lineJoin = 'round';
ctx.strokeStyle = 'black';

eraserProperties.style.display = 'none';
textProperties.style.display = 'none';

// Undo/Redo Stack

const undoStack = [];
const redoStack = [];


// Canvas Drawing


let isDrawing = false;
let lastX = 0;
let lastY = 0;
let currentTool = 'pen';

canvas.addEventListener('pointerdown', (event) => {
    if (currentTool === 'text') {
        saveState();
        redoStack.length = 0;
        ctx.font = `${textSize.value}px Arial`;
        ctx.fillStyle = textColor.value;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText (textContent.value, event.offsetX, event.offsetY);

        return;
    }
    
    redoStack.length = 0;

    isDrawing = true;

    lastX = event.offsetX;
    lastY = event.offsetY;
});

window.addEventListener('pointerup', () => {
     isDrawing = false;
});

canvas.addEventListener('pointermove', (event) => {
    console.log('moving', isDrawing);
    if (isDrawing === false) {
        return;
    }

    const x = event.offsetX;
    const y = event.offsetY;
    
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(x, y);
    ctx.stroke();

    lastX = x;
    lastY = y;
});

// Property Listeners/Inputs


brushSize.addEventListener('input', () => {
   ctx.lineWidth = brushSize.value;
   brushSizeValue.textContent = `${brushSize.value}px`;
});



brushColor.addEventListener('input', () => {
   ctx.strokeStyle = brushColor.value;
});



brushOpacity.addEventListener('input', () => {
   ctx.globalAlpha = brushOpacity.value / 100;
   brushOpacityValue.textContent = `${brushOpacity.value}%`;
});


eraserSize.addEventListener('input', () => {
    eraserSizeValue.textContent = `${eraserSize.value}px`;
    ctx.lineWidth = eraserSize.value;
});


textSize.addEventListener('input', () => {
    textSizeValue.textContent = `${textSize.value}px`;
})



// Tool Listeners

penTool.addEventListener('click', () => {
    currentTool = 'pen';
    penProperties.style.display = 'block';
    eraserProperties.style.display = 'none';
    textProperties.style.display = 'none';
    penTool.classList.add('active');
    eraserTool.classList.remove('active');
    textTool.classList.remove('active');
    ctx.globalCompositeOperation = 'source-over';
    ctx.lineWidth = brushSize.value;
    ctx.globalAlpha = brushOpacity.value / 100;
});



eraserTool.addEventListener('click', () => {
    currentTool = 'eraser';
    penProperties.style.display = 'none';
    eraserProperties.style.display = 'block';
    textProperties.style.display = 'none';
    eraserTool.classList.add('active');
    penTool.classList.remove('active');
    textTool.classList.remove('active');
    ctx.globalCompositeOperation = 'destination-out';
    ctx.lineWidth = eraserSize.value;
    ctx.globalAlpha = 1;
});

textTool.addEventListener('click', () => {
    currentTool = 'text';
    penProperties.style.display = 'none';
    eraserProperties.style.display = 'none';
    textProperties.style.display = 'block';

    textTool.classList.add('active');
    penTool.classList.remove('active');
    eraserTool.classList.remove('active');
});


// Footer Listeners



undoButton.addEventListener('click', () => {
    if (undoStack.length === 0) {
        return;
    }

    const currentState = ctx.getImageData(0, 0, canvas.width, canvas.height);
    redoStack.push(currentState);

    const previousState = undoStack.pop();
    ctx.putImageData(previousState, 0, 0);
});

redoButton.addEventListener('click', () => {
    if (redoStack.length === 0) {
        return;
    }

    const currentState = ctx.getImageData(0, 0, canvas.width, canvas.height);
    undoStack.push(currentState);

    const nextState = redoStack.pop();
    ctx.putImageData(nextState, 0, 0);
})

clearCanvasButton.addEventListener('click', () => {
       saveState();
       redoStack.length = 0;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
})


// Functions

function saveState() {
    const canvasState = ctx.getImageData(0, 0, canvas.width, canvas.height);

    undoStack.push(canvasState);

}