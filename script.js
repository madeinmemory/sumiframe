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

// Drawing Properties


ctx.lineWidth = 5;
ctx.lineCap = 'round';
ctx.lineJoin = 'round';
ctx.strokeStyle = 'black';

// Undo/Redo Stack

const undoStack = [];
const redoStack = [];


// Canvas Drawing


let isDrawing = false;
let lastX = 0;
let lastY = 0;
let currentTool = 'pen';

canvas.addEventListener('pointerdown', (event) => {
    saveState();
    redoStack.length = 0;

    isDrawing = true;

    lastX = event.offsetX;
    lastY = event.offsetY;
});

canvas.addEventListener('pointerup', () => {
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

// Property Listeners


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

// Tool Listeners

penTool.addEventListener('click', () => {
    currentTool = 'pen';
    ctx.globalCompositeOperation = 'source-over';
});



eraserTool.addEventListener('click', () => {
    currentTool = 'eraser';
    ctx.globalCompositeOperation = 'destination-out';
});

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


// Functions

function saveState() {
    const canvasState = ctx.getImageData(0, 0, canvas.width, canvas.height);

    undoStack.push(canvasState);

}