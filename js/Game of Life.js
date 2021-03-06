/**
 * Created by James on 07/10/2015.
 * Provides JS implementation of Conway's Game of Life
 */



var objContext; //Canvas 2d Context
var arrState = []; //Current state of play (2d boolean array)
var intGridSizeHeight; //height of grid in cells
var intGridSizeWidth; //width of grid in cells
var intSpacing = 1; //Spacing between cells in pixels
var intCellSize = 5; //width of cell in pixels (square)
var intStepDuration = 50;
var blnPause = false;


function init() {
    setGridSize();
    setupClickHandler();
    setupResizeHandler();
}

function setupClickHandler(){
    $("#grid").click(function(evt){
        var x = Math.round((evt.offsetX - intSpacing) / (intSpacing + intCellSize));
        var y = Math.round((evt.offsetY - intSpacing) / (intSpacing + intCellSize));
        toggleCell(x, y);
        renderState();
    });
}

function setupResizeHandler(){
    $(window).resize(function(){
        setGridSize();
    });
}


/**
 * Draws a square on grid at position
 * @param x
 * @param y
 */
function drawSquare(x, y) {
    objContext.fillStyle = "black";
    objContext.fillRect((y*intSpacing) + ((y * intCellSize)), (x*intSpacing) + (x * intCellSize), intCellSize, intCellSize);
}

/**
 * Returns the number of "live" cells that border the cell at x, y
 * @param x
 * @param y
 * @returns {number}
 */
function getNeighbourCount(x, y){
    var intCount = 0;
    intCount = (getCell(x-1, y-1)? intCount+1 : intCount); //x-1, y-1
    intCount = (getCell(x, y-1)? intCount+1 : intCount);//x, y-1
    intCount = (getCell(x + 1, y-1)? intCount+1 : intCount);//x + 1, y-1
    intCount = (getCell(x-1, y)? intCount+1 : intCount);//x-1, y
    intCount = (getCell(x+1, y)? intCount+1 : intCount);//x+1, y
    intCount = (getCell(x-1, y+1)? intCount+1 : intCount);//x-1, y+1
    intCount = (getCell(x, y+1)? intCount+1 : intCount);//x, y+1
    intCount = (getCell(x+1, y+1)? intCount+1 : intCount);//x-1, y+1

    return intCount;
}

/**
 * Renders all "live" cells in the current state.
 */
function renderState(){
    objContext.clearRect(0, 0, objContext.canvas.width, objContext.canvas.height);
    for(var x = 0; x < arrState.length; x++){
        for(var y = 0; y < arrState[x].length; y++){
            if(arrState[x][y]){
                drawSquare(x, y);
            }
        }
    }
}

/**
 * Returns a 2D array of size x, y. Array has all cells populated with a boolean (false)
 * @param intX
 * @param intY
 * @returns {Array}
 */
function getPopulatedArray(intX, intY){
    var arr = [];
    for(var x = 0; x < intX; x++){
        var arrY = [];
        for(var y = 0; y < intY; y++){
            arrY[y] = false;
        }
        arr.push(arrY);
    }
    return arr;
}

function getRandomPopulatedArray(intX, intY){
    var arr = [];
    for(var x = 0; x < intX; x++){
        var arrY = [];
        for(var y = 0; y < intY; y++){
            arrY[y] = Math.random() < 0.5;
        }
        arr.push(arrY);
    }
    return arr;
}

/**
 * Returns the value of cell at X,Y. If the coords are off the grid, they are wrapped around.
 * @param x
 * @param y
 * @returns {*}
 */
function getCell(x, y){
    //wrap coords
    x = (x < 0 ? (intGridSizeHeight) + x : x);
    x = (x > (intGridSizeHeight - 1) ? x - (intGridSizeHeight) : x);
    y = (y < 0 ? (intGridSizeWidth) + y : y);
    y = (y > (intGridSizeWidth - 1) ? y - (intGridSizeWidth) : y);

    return arrState[x][y];
}

/**
 * Calculates the next generation of cells and updates current state
 */
function step(intCount){

    if(typeof intCount == "undefined"){
        intCount = 1;
    }

    var arrNewState = getPopulatedArray(arrState.length, arrState[0].length);
    for(var x = 0; x < arrState.length; x++){
        for(var y = 0; y < arrState[x].length; y++){
            var intNeighbourCount = getNeighbourCount(x,y);
            arrNewState[x][y] = arrState[x][y];
            if(arrState[x][y]){ //if live
                if(intNeighbourCount < 2){
                    arrNewState[x][y] = false;
                }else if(intNeighbourCount == 2 || intNeighbourCount == 3){
                    arrNewState[x][y] = true;
                }else if(intNeighbourCount > 3){
                    arrNewState[x][y] = false;
                }
            }else{
                if(intNeighbourCount == 3){
                    arrNewState[x][y] = true;
                }
            }
        }
    }
    arrState = arrNewState;
    renderState();

    if(blnPause){
        //save current step count
        $("#pause-button").data("step-count", intCount - 1);
    }else{
        if(intCount > 1){
            setTimeout(function(){
                step(intCount -1);
            }, intStepDuration);
        }
    }
}


/**
 * Toggles the value of a call at position x, y
 * @param x
 * @param y
 */
function toggleCell(x, y){
    //Components reversed because of render origin rotation
    arrState[y][x] = !arrState[y][x];
}

/**
 * Adds a 3 * 1 straight bar to the current state.
 */
function addBlinker(){
    arrState[3][3] = true;
    arrState[4][3] = true;
    arrState[5][3] = true;
}

function addGlider(){
    arrState[1][2] = true;
    arrState[2][2] = true;
    arrState[3][2] = true;
    arrState[3][1] = true;
    arrState[2][0] = true;
}

function randomise(){
    arrState = getRandomPopulatedArray(intGridSizeHeight, intGridSizeWidth);
    renderState();
}

/**
 * Toggles pause state of rendering loop.
 */
function togglePause(){
    var jqButton = $("#pause-button");
    if(blnPause){
        blnPause = !blnPause;
        jqButton.text("Pause");
        step(jqButton.data("step-count"));
    }else{
        blnPause = !blnPause;
        jqButton.text("Un-Pause");
    }
}

function setGridSize(){
    var jqGrid = $("#grid");
    var jqDocument = $(document);
    jqGrid.attr("width",scaleInteger(jqDocument.width(), 0.9));
    jqGrid.attr("height",scaleInteger(jqDocument.height(), 0.9));
    objContext = $("#grid")[0].getContext("2d");
    intGridSizeHeight = Math.round(objContext.canvas.height / (intCellSize + intSpacing));
    intGridSizeWidth = Math.round(objContext.canvas.width / (intCellSize + intSpacing));
    arrState = getPopulatedArray(intGridSizeHeight, intGridSizeWidth);
}

function scaleInteger(numValue, numScaleFactor){
    return parseInt(numValue * numScaleFactor);
}