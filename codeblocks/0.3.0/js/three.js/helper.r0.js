/**
 * Call this Object from a "Canvas Area" to create an WebGL rendering context. The 'threejs' data-block of the canvasElement will contain an object that provides references to the created scene, renderer and camera.
 * @param {*} canvasElement The dom-element that should contain the canvas
 * @param {function(scene, camera, renderer):void} createSceneCallback  Called when everything is set up, you may use this to set up the actual scene. 
 * @param {function(scene, camera, renderer):void} renderLoopCallback  When defined, a render loop is set up that wil periodically call this function. Otherwise the scene is rendered exactly once. 
 */
function setupThreeJSScene(canvasElement, createSceneCallback, renderLoopCallback=undefined){
    canvasElement = $(canvasElement)

    //cleanup?
    const tjs = canvasElement.data('threejs')
    if (tjs){
        tjs.renderer.dispose()
        tjs.scene.dispose()
        tjs.camera.dispose()
        canvasElement.data('threejs') = undefined
    }

    //get dimension of the container
    const w = canvasElement.width()
    const h = canvasElement.height()

    // Create an empty scene
    var scene = new THREE.Scene();        

    // Create a basic perspective camera
    var camera = new THREE.PerspectiveCamera( 75, w/h, 0.1, 1000 );
    camera.position.z = 4;

    // Create a renderer with Antialiasing
    var renderer = new THREE.WebGLRenderer({antialias:true});

    // Configure renderer clear color
    renderer.setClearColor("#000000");

    // Configure renderer size
    renderer.setSize( w, h );

    // Append Renderer to DOM
    canvasElement.append( renderer.domElement );

    // Create a Cube Mesh with basic material
    createSceneCallback(scene, camera, renderer)

    //Store the Material
    canvasElement.data('threejs', {
        scene:scene,
        renderer:renderer,
        camera:camera
    })
    
    if (renderLoopCallback!==undefined){
        // Render Loop
        var render = function () {
            requestAnimationFrame( render );

            renderLoopCallback(scene, camera, renderer)

            // Render the scene
            renderer.render(scene, camera);
        }   
        render();     
    } else {
        renderer.render(scene, camera);
    }
}