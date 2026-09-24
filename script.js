// Constants 

const canvas = document.querySelector('#drawing-canvas');
const ctx = canvas.getContext('2d');



// Canvas Drawing

let isDrawing = false;

canvas.addEventListener('pointerdown', () => {
    isDrawing = true;
});

canvas.addEventListener('pointerup', () => {
     isDrawing = false;
});

canvas.addEventListener('pointermove', (event) => {
    if (isDrawing === false) {
        return;
    }
});