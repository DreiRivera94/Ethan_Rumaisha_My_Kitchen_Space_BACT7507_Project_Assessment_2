
// Get the HTML elements needed for the canvas
const stageContainer = document.getElementById("stage-container");
const deleteButton = document.getElementById("delete-button");
const statusText = document.getElementById("status");
const products = document.querySelectorAll(".product");

// Create the Konva stage
const stage = new Konva.Stage({
    container: "stage-container",
    width: Math.min(stageContainer.clientWidth, 800),
    height: 500
});

// Create a layer to hold the kitchen products
const layer = new Konva.Layer();
stage.add(layer);

// Store the currently selected product
let selectedItem = null;

// Create resize handles for selected products
const transformer = new Konva.Transformer({
    rotateEnabled: false,
    keepRatio: true,
    enabledAnchors: [
        "top-left",
        "top-right",
        "bottom-left",
        "bottom-right"
    ],

    // Prevent products from becoming too small
    boundBoxFunc: function (oldBox, newBox) {
        if (newBox.width < 30 || newBox.height < 30) {
            return oldBox;
        }

        return newBox;
    }
});

// Add the transformer to the canvas layer
layer.add(transformer);

// Define the colours of the kitchen products
function getItemColour(itemName) {
    const colours = {
        Cabinet: "#d7c4a8",
        Sink: "#b9d6dc",
        Oven: "#777777",
        Fridge: "#e4e4e4"
    };

    return colours[itemName] || "#cccccc";
}

// Create a new kitchen product on the canvas
function createItem(itemName, x, y) {

    // Group the shape and text into one draggable item
    const item = new Konva.Group({
        x: x,
        y: y,
        draggable: true,
        name: itemName
    });

    // Create the product shape without a stroke border
    const shape = new Konva.Rect({
        width: 110,
        height: 70,
        fill: getItemColour(itemName),
        cornerRadius: 4
    });

    // Create the product name inside the shape
    const label = new Konva.Text({
        x: 0,
        y: 25,
        width: 110,
        text: itemName,
        fontSize: 16,
        fontFamily: "Arial",
        fill: "#333333",
        align: "center"
    });

    // Add the shape and text to the group
    item.add(shape);
    item.add(label);

    // Add the product to the canvas
    layer.add(item);

    // Select the product when clicked
    item.on("click tap", function () {
        selectItem(item);
    });

    // Select the product when moved
    item.on("dragstart", function () {
        selectItem(item);
    });

    // Update the canvas
    layer.draw();

    return item;
}

// Select a kitchen product
function selectItem(item) {

    // Remember which product is selected
    selectedItem = item;

    // Attach resize handles to the selected product
    transformer.nodes([item]);

    // Enable the delete button
    deleteButton.disabled = false;

    // Display the selected product's name
    statusText.textContent = "Selected: " + item.name();

    // Update the canvas
    layer.draw();
}

// Deselect the current product
function deselectItem() {

    // Clear the selected product
    selectedItem = null;

    // Remove the resize handles
    transformer.nodes([]);

    // Disable the delete button
    deleteButton.disabled = true;

    // Reset the status message
    statusText.textContent = "Drag a product onto the canvas.";

    layer.draw();
}

// Set up dragging for the sidebar products
products.forEach(function (product) {

    product.addEventListener("dragstart", function (event) {

        // Read the product name from the HTML data attribute
        const itemName = product.dataset.item;

        // Store the product name during dragging
        event.dataTransfer.setData("text/plain", itemName);
    });
});

// Allow products to be dropped onto the canvas
stageContainer.addEventListener("dragover", function (event) {

    // Allow the browser to accept the drop
    event.preventDefault();
});

// Add a product when dropped onto the canvas
stageContainer.addEventListener("drop", function (event) {

    // Prevent the browser's default drop behaviour
    event.preventDefault();

    // Get the product name
    const itemName = event.dataTransfer.getData("text/plain");

    // Only accept products from our sidebar
    const validProducts = ["Cabinet", "Sink", "Oven", "Fridge"];

    if (!validProducts.includes(itemName)) {
        return;
    }

    // Find the canvas position
    const bounds = stage.container().getBoundingClientRect();

    const x = event.clientX - bounds.left;
    const y = event.clientY - bounds.top;

    // Create the product at the drop position
    const newItem = createItem(itemName, x, y);

    // Automatically select the new product
    selectItem(newItem);
});

// Delete the selected product
deleteButton.addEventListener("click", function () {

    // Stop if no product is selected
    if (!selectedItem) {
        return;
    }

    // Remove the selected product from the canvas
    selectedItem.destroy();

    // Clear the selection and resize handles
    deselectItem();
});

// Deselect when clicking an empty part of the canvas
stage.on("click tap", function (event) {

    if (event.target === stage) {
        deselectItem();
    }
});