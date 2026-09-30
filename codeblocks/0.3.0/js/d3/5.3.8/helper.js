/**
 * Call this Object from a "Canvas Area" to create an D3 context. The 'd3' data-block of the canvasElement will contain an object that provides references to the created context
 * @param {*} canvasElement The dom-element that should contain the canvas
 * @param {function(canvas):void} createSceneCallback  Called when everything is set up, you may use this to set up the actual scene. 
 * @param {*} type svg or canvas
 */
function setupD3Scene( canvasElement, createSceneCallback, type='svg'){
    const domEl = canvasElement
    canvasElement = $(canvasElement)
    const w = canvasElement.width()
    const h = canvasElement.height()
    
    //create the canvas once
    var base = d3.select(canvasElement.get(0));
    var canvas = base.append(type)
        .attr("width", w)
        .attr("height", h);

    // Create stuff
    createSceneCallback(canvas)

    //Store the Material
    canvasElement.data('d3', {
        canvas:canvas
    })
}