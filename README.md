# ILIAS Code Question Plugin

**Author**:   Frank Bauer <frank.bauer@fau.de>

**Version**:  2.0.3

**Company**:  Friedrich-Alexander-Universität, Visual Computing

**Supports**: ILIAS 7

## Installation
1. Copy the `assCodeQuestion` directory to your ILIAS installation at the following path 
(create subdirectories, if neccessary):
`Customizing/global/plugins/Modules/TestQuestionPool/Questions/assCodeQuestion`
2. When in production you should remove or exclude the `__dev/`-Folder. You will not need to pull the submodules from `__dev/`! 
3. Go to Administration > Plugins
4. Choose **Update** for the `assCodeQuestion` plugin
5. Choose **Activate** for the `assCodeQuestion` plugin
6. Choose **Refresh** for the `assCodeQuestion` plugin languages

There is nothing to configure for this plugin.

## Usage
This plugin enables source code questions. It basically provides a textarea with syntax 
highlighting for various languages (based on Highlight.js and CodeMirror).

Certain languages (at the moment *Java*, *Python* and *JavaScript*) can be compiled and 
executed during an Test/Assesment session. Executable Code can also be used to generate
graphical output.

### GLSL
Selecting GLSL enables you to write shader code you may process using three.js. 
When selecting this type, the first block is a "Canvas Area". All Answer-Blocks contain shader code, 
that is passed to the `outputObject`-variable of the canvas Area.

If you define a GLSL-Question (enable threeJS) where the first answer box represents the Vertex, and the second the fragment 
shader, the following canvas-area-code will allow you to use that shader on the scene:

    {   cube: null,
        material: null,

        createScene: function(scene, camera, renderer){ 
            var geometry = new THREE.BoxGeometry( 1, 1, 1 );
            this.material = new THREE.MeshBasicMaterial( { color: "#FF3F81" } );
            this.cube = new THREE.Mesh( geometry, this.material );
            scene.add(this.cube);                                  
        },

        updateScene: function(scene, camera, renderer){
            this.cube.rotation.x += 0.01;
            this.cube.rotation.y += 0.01;
        },

        init: function(canvasElement, outputElement, scope) {
            setupThreeJSScene(
                canvasElement, 
                this.createScene.bind(this),
                this.updateScene.bind(this)
            )
        }, //init

        update: function(txt, json, canvasElement, outputElement) {
            this.cube.material = new THREE.ShaderMaterial(
            {
                vertexShader:json[0], 
                fragmentShader:json[1]
            }
            )
        }
    }

### D3
If you use an executable Language, and include the D3 Library, you can add a **Canvas Area**-Block to your Question.
Add the following Code, to get a very basic D3 Sample. Your code must return a css-formated color-string 
which is used to display a simple circle.


    {   canvas:null,
        
        init: function(canvasElement, outputElement, scope) {
            //get dimension of the container
            const w = canvasElement.width()
            const h = canvasElement.height()

            //create the canvas once
            var base = d3.select(canvasElement.get(0));
            this.canvas = base.append("svg")
                .attr("width", w)
                .attr("height", h);
            
            //store a reference to the canvas
            canvasElement.data('svg', this.canvas)

            //hide the canvas when the question is first loaded
            canvasElement.addClass('hiddenBlock')
        }, //init

        update: function(txt, json, canvasElement, outputElement) {
            this.canvas.append("circle")
                .style("stroke", "gray")
                .style("fill", txt.trim())
                .attr("r", 40)
                .attr("cx", 50)
                .attr("cy", 50)
                .on("mouseover", function(){d3.select(this).style("fill", "aliceblue");})
                .on("mouseout", function(){d3.select(this).style("fill", txt.trim());});
            
            return ''
        } //update
    }

Alternativley you may use the built-in setup function to prepare a default D3 rendering context:


    {   init: function(canvasElement, outputElement, scope) {
            setupD3Scene(
                canvasElement, 
                function(canvas){ //delegate that creates the actual content
                    canvas.append("circle")
                        .style("stroke", "gray")
                        .style("fill", '#ff00ff')
                        .attr("r", 10)
                        .attr("cx", 150)
                        .attr("cy", 70)
            
                    return {}
                }
            )

            //hide the canvas when the question is first loaded
            canvasElement.addClass('hiddenBlock')
        }, //init

        update: function(txt, json, canvasElement, outputElement) {
            //load the canvas
            const canvas = canvasElement.data('d3').canvas        

            canvas.append("circle")
                .style("stroke", "gray")
                .style("fill", txt.trim())
                .attr("r", 40)
                .attr("cx", 50)
                .attr("cy", 50)
                .on("mouseover", function(){d3.select(this).style("fill", "aliceblue");})
                .on("mouseout", function(){d3.select(this).style("fill", txt.trim());});

            return ''
        } //update
    }  
    
### ThreeJS
If you use an executable Language, and include the ThreeJS Library, you can add a **Canvas Area**-Block to your Question.
Add the following Code, to get a very basic ThreeJS Sample. Your code must return a css-formated color-string 
which is used to change the color of a spinning cube.


    {   
        material: null,
        
        init: function(canvasElement, outputElement, scope) {
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
            var geometry = new THREE.BoxGeometry( 1, 1, 1 );
            this.material = new THREE.MeshBasicMaterial( { color: "#FF3F81" } );
            var cube = new THREE.Mesh( geometry, this.material );            

            // Add cube to Scene
            scene.add( cube );

            // Render Loop
            var render = function () {
                requestAnimationFrame( render );

                cube.rotation.x += 0.01;
                cube.rotation.y += 0.01;

                // Render the scene
                renderer.render(scene, camera);
            };

            render();
        }, //init

        update: function(txt, json, canvasElement, outputElement) {
            //change color to the css-string generated by the program
            this.material.color.set(txt.trim())
        } // update
    }

Alternativley you may use the built-in setup function to prepare a default ThreeJS rendering context:


    {   
        cube: null,
        material: null,

        createScene: function(scene, camera, renderer){ 
            var geometry = new THREE.BoxGeometry( 1, 1, 1 );
            this.material = new THREE.MeshBasicMaterial( { color: "#FF3F81" } );
            this.cube = new THREE.Mesh( geometry, this.material );
            scene.add(this.cube);                                  
        },

        updateScene: function(scene, camera, renderer){
            this.cube.rotation.x += 0.01;
            this.cube.rotation.y += 0.01;
        },

        init: function(canvasElement, outputElement, scope) {
            setupThreeJSScene(
                canvasElement, 
                this.createScene.bind(this),
                this.updateScene.bind(this)
            )
        }, //init

        update: function(txt, json, canvasElement, outputElement) {
            this.material.color.set(txt.trim())
        } // update
    }

## Included Software
* teaVM-javac (https://github.com/konsoletyper/teavm-javac, [plugin specific fork with some bugfixes at https://github.com/frankbauer/teavm-javac/tree/custom-fielname])
* highlight.js (https://highlightjs.org)
* skulpt (http://www.skulpt.org)
* three.js (https://threejs.org)
* d3 (https://d3js.org)
* browserfs (https://github.com/jvilk/BrowserFS)
* dopioJVM (http://plasma-umass.org/doppio-demo/)


## Version History
### Version 2.0.3
* Support for ILILAS 7
* Fixed issue with css body pollution
### Version 2.0.2
* Added Python REPL
### Version 2.0.1
* Continous Compilation for some langauges (Javascript, Python)
* Added brain.js. dom-side (all languages) and worker-side (JavaScript)
* Pass Runtime Arguments from Canvas Object to worker-code (JavaScript)
* Cancel-Button for Run-Actions. (allows users to terminate the code compilation/execution)
* Initial Support for Blockly 
* Migrated CodeBlocks.js to TypeScript
* API Extensions for pcCodeQuestion (https://github.com/frankbauer/ilias-pccodequestion)

### Version 2.0.0
* Release Version
* Support for Template answer
* Support for randomized Values

### Version 1.2.0
* Move most of the CodeBlocks editor/Display logic to client side javascript App (https://github.com/frankbauer/codeblocks-js/). Should make adaption to learning-modules easier.
* Refactor Code Structure to a MVC-like style
* Add support for Template, and Random-Tags.
  * Template-Tag: Used in Prefabs to simplify code reuse. You can use `{!<name>}` (for example `{!Version}`) to add a TemplateTag to a prefab. The Editor UI will allow the user to click the tags and replace every occurance with a single value.
  * Randomized-Tag: Used in source code and text blocks for elements that can be replaced with randomized values when the code is executed (in EditMode) or displayed (in regular Mode). You can use `{:<name>}` to reference a Randomized Tag with a given name (for example `{:Type}`)
#### ToDo
* Add Support for Prefabs
* Add UI to define random values
* Add support to replace random tags

  
### Version 1.1.10
* Support for Ilias 5.4

### Version 1.1.9
* Full support for themed code boxes
  
### Version 1.1.8
* Downgraded Java Compiler to last stable TeaVM (0.6.0-dev-451) and JDK8 patchlevel

### Version 1.1.7
* Added helper function `processMixedOutput` that will seperate an output string into a string and a json-object based on a seperating magic string.
* Updated Java Compiler to latest TeaVM (0.6.0-dev-661) and JDK8 patchlevel

### Version 1.1.6
* reduced new java log level
* hidden code elements live inside an invisible codemirror component too. This ensures that < and > are handled correct.

### Version 1.1.5
* new, simplified subsystem to add support fpr new runable languages
* added new, much faster java runtime based on TeaVM-javac 
* compile errors from new java runtime are displayed inside the code editor view.

### Version 1.1.4
* fix controller error in question editor when taxomonies are used

### Version 1.1.3
* canvas-element code needs to return an object containing at least the following methods `init(canvasElement)` and `update(outputObject, canvasElement)`. The later can return a string that is presented to the student as the result.

### Version 1.1.2
* combined version for ilias 5.1 AND 5.2

### Version 1.1.1
* Added full support for canvas element drawing using data for the result output as datasource
* GLSL Code Execution (the first block is a forced Canvas Area), Answer blocks are considered fragment shaders that are passed to the Canvas Area for processing

### Version 1.1.0
* New, flexible block-system to add Question Fragments

### Version 1.0.8
* Added support for Client-Side Java-Execution using dopio.js

### Version 1.0.3
* Initial version
 No newline at end of file
