// CONSTANTS
// Canvas and Context
const canvas = document.querySelector("#drawing-canvas");
const ctx = canvas.getContext("2d");
const brushSize = document.querySelector("#brush-size");
const brushSizeValue = document.querySelector("#brush-size-value");
const brushColor = document.querySelector("#brush-color");
const brushOpacity = document.querySelector("#brush-opacity");
const brushOpacityValue = document.querySelector("#brush-opacity-value");

// Tool Constants

const penTool = document.querySelector("#pen-tool");
const eraserTool = document.querySelector("#eraser-tool");
const undoButton = document.querySelector("#undo-button");
const redoButton = document.querySelector("#redo-button");
const clearCanvasButton = document.querySelector("#clear-canvas");
const penProperties = document.querySelector("#pen-properties");

// Eraser Tool

const eraserProperties = document.querySelector("#eraser-properties");
const eraserSize = document.querySelector("#eraser-size");
const eraserSizeValue = document.querySelector("#eraser-size-value");

// Text Tool

const textTool = document.querySelector("#text-tool");
const textProperties = document.querySelector("#text-properties");
const textSize = document.querySelector("#text-size");
const textSizeValue = document.querySelector("#text-size-value");
const textColor = document.querySelector("#text-color");
const textContent = document.querySelector("#text-content");

// Reference Tool

const referenceTool = document.querySelector("#reference-tool");
const referenceProperties = document.querySelector("#reference-properties");
const referenceUpload = document.querySelector("#reference-upload");
const referenceImage = document.querySelector("#reference-image");
const referenceOpacity = document.querySelector("#reference-opacity");
const referenceOpacityValue = document.querySelector(
  "#reference-opacity-value",
);
const toggleReference = document.querySelector("#toggle-reference");
const removeReference = document.querySelector("#remove-reference");

// Panel/Page Constants

const addPanelButton = document.querySelector("#add-panel");
const panelList = document.querySelector("#panel-list");
const deletePanelButton = document.querySelector("#delete-panel");
const movePanelLeftButton = document.querySelector("#move-panel-left");
const movePanelRightButton = document.querySelector("#move-panel-right");
const addPageButton = document.querySelector("#add-page");
const pageList = document.querySelector("#page-list");
const deletePageButton = document.querySelector("#delete-page");
const movePageLeftButton = document.querySelector("#move-page-left");
const movePageRightButton = document.querySelector("#move-page-right");

// Saving and Loading

const saveProjectButton = document.querySelector("#save-project");
const loadProjectButton = document.querySelector("#load-project");
const loadProjectFile = document.querySelector("#load-project-file");

// Drawing Properties

ctx.lineWidth = 5;
ctx.lineCap = "round";
ctx.lineJoin = "round";
ctx.strokeStyle = "black";

eraserProperties.style.display = "none";
textProperties.style.display = "none";
referenceProperties.style.display = "none";

// Undo/Redo Stack

const undoStack = [];
const redoStack = [];

// Canvas Drawing/State Variables

let isDrawing = false;
let lastX = 0;
let lastY = 0;
let currentTool = "pen";
let referenceVisible = true;
let referenceExists = false;
let panelCount = 1;
let activePanelId = 1;

let panels = [
  {
    id: 1,
    name: "Panel 1",
    canvasState: null,
  },
];

let pageCount = 1;
let activePageId = 1;

let pages = [
  {
    id: 1,
    name: "Page 1",
    panels: panels,
    activePanelId: 1,
    panelCount: 1,
  },
];

// Drawing

canvas.addEventListener("pointerdown", (event) => {
  if (currentTool === "text") {
    saveState();
    redoStack.length = 0;
    ctx.font = `${textSize.value}px Arial`;
    ctx.fillStyle = textColor.value;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(textContent.value, event.offsetX, event.offsetY);

    return;
  }

  if (currentTool === "reference") {
    return;
  }

  saveState();
  redoStack.length = 0;

  isDrawing = true;

  lastX = event.offsetX;
  lastY = event.offsetY;
});

window.addEventListener("pointerup", () => {
  isDrawing = false;
});

canvas.addEventListener("pointermove", (event) => {
  console.log("moving", isDrawing);
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

brushSize.addEventListener("input", () => {
  ctx.lineWidth = brushSize.value;
  brushSizeValue.textContent = `${brushSize.value}px`;
});

brushColor.addEventListener("input", () => {
  ctx.strokeStyle = brushColor.value;
});

brushOpacity.addEventListener("input", () => {
  ctx.globalAlpha = brushOpacity.value / 100;
  brushOpacityValue.textContent = `${brushOpacity.value}%`;
});

eraserSize.addEventListener("input", () => {
  eraserSizeValue.textContent = `${eraserSize.value}px`;
  ctx.lineWidth = eraserSize.value;
});

textSize.addEventListener("input", () => {
  textSizeValue.textContent = `${textSize.value}px`;
});

referenceUpload.addEventListener("change", () => {
  const file = referenceUpload.files[0];
  if (!file) {
    return;
  }

  const imageURL = URL.createObjectURL(file);
  referenceImage.src = imageURL;
  referenceImage.style.display = "block";

  referenceVisible = true;
  referenceExists = true;
  toggleReference.textContent = "Hide Reference";
});

referenceOpacity.addEventListener("input", () => {
  referenceOpacityValue.textContent = `${referenceOpacity.value}%`;
  referenceImage.style.opacity = referenceOpacity.value / 100;
});

toggleReference.addEventListener("click", () => {
  if (!referenceExists) {
    return;
  }
  if (referenceVisible) {
    referenceImage.style.display = "none";
    toggleReference.textContent = "Show Reference";
    referenceVisible = false;
  } else {
    referenceImage.style.display = "block";
    toggleReference.textContent = "Hide Reference";
    referenceVisible = true;
  }
});

removeReference.addEventListener("click", () => {
  referenceImage.removeAttribute("src");
  referenceImage.style.display = "none";
  referenceVisible = false;
  referenceExists = false;
  toggleReference.textContent = "No Reference";
});

// Tool Listeners

penTool.addEventListener("click", () => {
  currentTool = "pen";
  penProperties.style.display = "block";
  eraserProperties.style.display = "none";
  textProperties.style.display = "none";
  referenceProperties.style.display = "none";

  penTool.classList.add("active");
  eraserTool.classList.remove("active");
  textTool.classList.remove("active");
  referenceTool.classList.remove("active");

  ctx.globalCompositeOperation = "source-over";
  ctx.lineWidth = brushSize.value;
  ctx.globalAlpha = brushOpacity.value / 100;
});

eraserTool.addEventListener("click", () => {
  currentTool = "eraser";
  penProperties.style.display = "none";
  eraserProperties.style.display = "block";
  textProperties.style.display = "none";
  referenceProperties.style.display = "none";

  eraserTool.classList.add("active");
  penTool.classList.remove("active");
  textTool.classList.remove("active");
  referenceTool.classList.remove("active");

  ctx.globalCompositeOperation = "destination-out";
  ctx.lineWidth = eraserSize.value;
  ctx.globalAlpha = 1;
});

textTool.addEventListener("click", () => {
  currentTool = "text";
  penProperties.style.display = "none";
  eraserProperties.style.display = "none";
  textProperties.style.display = "block";
  referenceProperties.style.display = "none";

  textTool.classList.add("active");
  penTool.classList.remove("active");
  eraserTool.classList.remove("active");
  referenceTool.classList.remove("active");
});

referenceTool.addEventListener("click", () => {
  currentTool = "reference";
  penProperties.style.display = "none";
  eraserProperties.style.display = "none";
  textProperties.style.display = "none";
  referenceProperties.style.display = "block";

  referenceTool.classList.add("active");
  penTool.classList.remove("active");
  eraserTool.classList.remove("active");
  textTool.classList.remove("active");
});

// Panel Listeners

addPanelButton.addEventListener("click", () => {
  const currentPanel = panels.find((panel) => {
    return panel.id === activePanelId;
  });

  currentPanel.canvasState = ctx.getImageData(
    0,
    0,
    canvas.width,
    canvas.height,
  );
  panelCount++;

  const panelData = {
    id: panelCount,
    name: `Panel ${panelCount}`,
    canvasState: null,
  };
  panels.push(panelData);

  const newPanel = document.createElement("button");
  newPanel.textContent = `Panel ${panelCount}`;
  newPanel.classList.add("panel-item");
  newPanel.dataset.panelId = panelData.id;
  panelList.appendChild(newPanel);

  const activePanel = document.querySelector(".panel-item.active");
  activePanel.classList.remove("active");
  newPanel.classList.add("active");
  activePanelId = panelData.id;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
});

panelList.addEventListener("click", (event) => {
  if (!event.target.classList.contains("panel-item")) {
    return;
  }
  const currentPanel = panels.find((panel) => {
    return panel.id === activePanelId;
  });

  currentPanel.canvasState = ctx.getImageData(
    0,
    0,
    canvas.width,
    canvas.height,
  );

  const activePanel = document.querySelector(".panel-item.active");
  activePanel.classList.remove("active");
  event.target.classList.add("active");

  activePanelId = Number(event.target.dataset.panelId);

  const newPanel = panels.find((panel) => {
    return panel.id === activePanelId;
  });

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (newPanel.canvasState !== null) {
    ctx.putImageData(newPanel.canvasState, 0, 0);
  }
  undoStack.length = 0;
  redoStack.length = 0;
  console.log(activePanelId);
});

deletePanelButton.addEventListener("click", () => {
  if (panels.length === 1) {
    return;
  }

  const shouldDelete = confirm(
    "Are you sure you want to delete this panel? This action cannot be undone.",
  );
  if (!shouldDelete) {
    return;
  }
  const panelIndex = panels.findIndex((panel) => {
    return panel.id === activePanelId;
  });
  panels.splice(panelIndex, 1);

  const activePanelButton = document.querySelector(".panel-item.active");
  activePanelButton.remove();

  const nextPanel = panels[panelIndex] || panels[panelIndex - 1];
  activePanelId = nextPanel.id;

  const nextPanelButton = document.querySelector(
    `[data-panel-id="${nextPanel.id}"]`,
  );
  nextPanelButton.classList.add("active");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (nextPanel.canvasState !== null) {
    ctx.putImageData(nextPanel.canvasState, 0, 0);
  }

  undoStack.length = 0;
  redoStack.length = 0;
});

movePanelLeftButton.addEventListener("click", () => {
  const panelIndex = panels.findIndex((panel) => {
    return panel.id === activePanelId;
  });

  if (panelIndex === 0) {
    return;
  }
  const previousPanel = panels[panelIndex - 1];
  panels[panelIndex - 1] = panels[panelIndex];
  panels[panelIndex] = previousPanel;

  const activePanelButton = document.querySelector(".panel-item.active");
  const previousPanelButton = activePanelButton.previousElementSibling;
  panelList.insertBefore(activePanelButton, previousPanelButton);
});

movePanelRightButton.addEventListener("click", () => {
  const panelIndex = panels.findIndex((panel) => {
    return panel.id === activePanelId;
  });
  if (panelIndex === panels.length - 1) {
    return;
  }
  const nextPanel = panels[panelIndex + 1];
  panels[panelIndex + 1] = panels[panelIndex];
  panels[panelIndex] = nextPanel;

  const activePanelButton = document.querySelector(".panel-item.active");
  const nextPanelButton = activePanelButton.nextElementSibling;
  panelList.insertBefore(nextPanelButton, activePanelButton);
});

// Page Listeners

addPageButton.addEventListener("click", () => {
  pageCount++;
  const pageData = {
    id: pageCount,
    name: `Page ${pageCount}`,
    panels: [
      {
        id: 1,
        name: "Panel 1",
        canvasState: null,
      },
    ],
    activePanelId: 1,
    panelCount: 1,
  };
  pages.push(pageData);

  const newPage = document.createElement("button");
  newPage.textContent = `Page ${pageCount}`;
  newPage.classList.add("page-item");
  newPage.dataset.pageId = pageData.id;
  pageList.appendChild(newPage);
});

pageList.addEventListener("click", (event) => {
  if (!event.target.classList.contains("page-item")) {
    return;
  }
  const currentPanel = panels.find((panel) => {
    return panel.id === activePanelId;
  });

  currentPanel.canvasState = ctx.getImageData(
    0,
    0,
    canvas.width,
    canvas.height,
  );

  const currentPage = pages.find((page) => {
    return page.id === activePageId;
  });

  currentPage.activePanelId = activePanelId;
  currentPage.panelCount = panelCount;

  const activePage = document.querySelector(".page-item.active");
  activePage.classList.remove("active");
  event.target.classList.add("active");

  activePageId = Number(event.target.dataset.pageId);

  const newPage = pages.find((page) => {
    return page.id === activePageId;
  });

  panels = newPage.panels;
  activePanelId = newPage.activePanelId;
  panelCount = newPage.panelCount;

  panelList.innerHTML = "";

  panels.forEach((panel) => {
    const panelButton = document.createElement("button");
    panelButton.textContent = panel.name;
    panelButton.classList.add("panel-item");
    panelButton.dataset.panelId = panel.id;

    if (panel.id === activePanelId) {
      panelButton.classList.add("active");
    }
    panelList.appendChild(panelButton);
  });
  const newPanel = panels.find((panel) => {
    return panel.id === activePanelId;
  });
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (newPanel.canvasState !== null) {
    ctx.putImageData(newPanel.canvasState, 0, 0);
  }
  undoStack.length = 0;
  redoStack.length = 0;
});

deletePageButton.addEventListener("click", () => {
  if (pages.length === 1) {
    return;
  }
  const shouldDelete = confirm(
    "Are you sure you want to delete this page? This Action cannot be undone.",
  );
  if (!shouldDelete) {
    return;
  }
  const pageIndex = pages.findIndex((page) => {
    return page.id === activePageId;
  });
  pages.splice(pageIndex, 1);

  const activePageButton = document.querySelector(".page-item.active");
  activePageButton.remove();

  const nextPage = pages[pageIndex] || pages[pageIndex - 1];
  activePageId = nextPage.id;

  const nextPageButton = document.querySelector(
    `[data-page-id="${activePageId}"]`,
  );
  nextPageButton.classList.add("active");

  panels = nextPage.panels;
  activePanelId = nextPage.activePanelId;
  panelCount = nextPage.panelCount;

  panelList.innerHTML = "";

  panels.forEach((panel) => {
    const panelButton = document.createElement("button");

    panelButton.textContent = panel.name;
    panelButton.classList.add("panel-item");
    panelButton.dataset.panelId = panel.id;

    if (panel.id === activePanelId) {
      panelButton.classList.add("active");
    }
    panelList.appendChild(panelButton);
  });
  const nextPanel = panels.find((panel) => {
    return panel.id === activePanelId;
  });

  ctx.clearRect(0, 0, canvas.width, canvas.length);

  if (nextPanel.canvasState !== null) {
    ctx.putImageData(nextPanel.canvasState, 0, 0);
  }

  undoStack.length = 0;
  redoStack.length = 0;
});

movePageLeftButton.addEventListener("click", () => {
  const pageIndex = pages.findIndex((page) => {
    return page.id === activePageId;
  });
  if (pageIndex === 0) {
    return;
  }
  const previousPage = pages[pageIndex - 1];

  pages[pageIndex - 1] = pages[pageIndex];
  pages[pageIndex] = previousPage;

  const activePageButton = document.querySelector(".page-item.active");
  const previousPageButton = activePageButton.previousElementSibling;
  pageList.insertBefore(activePageButton, previousPageButton);
});

movePageRightButton.addEventListener("click", () => {
  const pageIndex = pages.findIndex((page) => {
    return page.id === activePageId;
  });
  if (pageIndex === pages.length - 1) {
    return;
  }
  const nextPage = pages[pageIndex + 1];

  pages[pageIndex + 1] = pages[pageIndex];
  pages[pageIndex] = nextPage;

  const activePageButton = document.querySelector(".page-item.active");
  const nextPageButton = activePageButton.nextElementSibling;
  pageList.insertBefore(nextPageButton, activePageButton);
});

// Saving and Loading Listeners

function imageDataToDataURL(imageData) {
  const tempCanvas = document.createElement("canvas");
  const tempCtx = tempCanvas.getContext("2d");

  tempCanvas.width = imageData.width;
  tempCanvas.height = imageData.height;
  tempCtx.putImageData(imageData, 0, 0);

  return tempCanvas.toDataURL("image/png");
}

saveProjectButton.addEventListener("click", () => {
  const currentPanel = panels.find((panel) => {
    return panel.id === activePanelId;
  });
  currentPanel.canvasState = ctx.getImageData(
    0,
    0,
    canvas.width,
    canvas.height,
  );

  const currentPage = pages.find((page) => {
    return page.id === activePageId;
  });

  currentPage.activePanelId = activePanelId;
  currentPage.panelCount = panelCount;

  const projectData = {
    activePageId: activePageId,
    pageCount: pageCount,

    pages: pages.map((page) => {
      return {
        id: page.id,
        name: page.name,
        activePanelId: page.activePanelId,
        panelCount: page.panelCount,

        panels: page.panels.map((panel) => {
          return {
            id: panel.id,
            name: panel.name,
            canvasState:
              panel.canvasState === null
                ? null
                : imageDataToDataURL(panel.canvasState),
          };
        }),
      };
    }),
  };
  const projectJSON = JSON.stringify(projectData);

  const projectBlob = new Blob([projectJSON], {
    type: "application/json",
  });
  const projectURL = URL.createObjectURL(projectBlob);

  const downloadLink = document.createElement("a");
  downloadLink.href = projectURL;
  downloadLink.download = "sumiframe-project.json";
  downloadLink.click();

  URL.revokeObjectURL(projectURL);
});

function dataURLToImageData(dataURL) {
  return new Promise((resolve) => {
    const image = new Image();

    image.addEventListener("load", () => {
      const tempCanvas = document.createElement("canvas");
      const tempCtx = tempCanvas.getContext("2d");
      tempCanvas.width = image.width;
      tempCanvas.height = image.height;
      tempCtx.drawImage(image, 0, 0);

      const imageData = tempCtx.getImageData(
        0,
        0,
        tempCanvas.width,
        tempCanvas.height,
      );
      resolve(imageData);
    });
    image.src = dataURL;
  });
}

loadProjectButton.addEventListener("click", () => {
  loadProjectFile.value = "";
  loadProjectFile.click();
});

loadProjectFile.addEventListener("change", async () => {
  console.log("FILE CHANGE FIRED!!!!!!!");
  const file = loadProjectFile.files[0];

  if (!file) {
    return;
  }

  const projectText = await file.text();
  const loadedProject = JSON.parse(projectText);

  for (const page of loadedProject.pages) {
    for (const panel of page.panels) {
      if (panel.canvasState !== null) {
        panel.canvasState = await dataURLToImageData(panel.canvasState);
      }
    }
  }
  pages = loadedProject.pages;
  pageCount = loadedProject.pageCount;
  activePageId = loadedProject.activePageId;

  const loadedPage = pages.find((page) => {
    return page.id === activePageId;
  });
  panels = loadedPage.panels;
  activePanelId = loadedPage.activePanelId;
  panelCount = loadedPage.panelCount;

  pageList.innerHTML = "";

  pages.forEach((page) => {
    const pageButton = document.createElement("button");

    pageButton.textContent = page.name;
    pageButton.classList.add("page-item");
    pageButton.dataset.pageId = page.id;

    if (page.id === activePageId) {
      pageButton.classList.add("active");
    }
    pageList.appendChild(pageButton);
  });

  panelList.innerHTML = "";

  panels.forEach((panel) => {
    const panelButton = document.createElement("button");

    panelButton.textContent = panel.name;
    panelButton.classList.add("panel-item");
    panelButton.dataset.panelId = panel.id;

    if (panel.id === activePanelId) {
      panelButton.classList.add("active");
    }
    panelList.appendChild(panelButton);
  });
  const loadedPanel = panels.find((panel) => {
    return panel.id === activePanelId;
  });
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (loadedPanel.canvasState !== null) {
    ctx.putImageData(loadedPanel.canvasState, 0, 0);
  }
  undoStack.length = 0;
  redoStack.length = 0;
});
// Footer Listeners

undoButton.addEventListener("click", () => {
  if (undoStack.length === 0) {
    return;
  }

  const currentState = ctx.getImageData(0, 0, canvas.width, canvas.height);
  redoStack.push(currentState);

  const previousState = undoStack.pop();
  ctx.putImageData(previousState, 0, 0);
});

redoButton.addEventListener("click", () => {
  if (redoStack.length === 0) {
    return;
  }

  const currentState = ctx.getImageData(0, 0, canvas.width, canvas.height);
  undoStack.push(currentState);

  const nextState = redoStack.pop();
  ctx.putImageData(nextState, 0, 0);
});

clearCanvasButton.addEventListener("click", () => {
  saveState();
  redoStack.length = 0;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
});

// Functions

function saveState() {
  const canvasState = ctx.getImageData(0, 0, canvas.width, canvas.height);

  undoStack.push(canvasState);
}
