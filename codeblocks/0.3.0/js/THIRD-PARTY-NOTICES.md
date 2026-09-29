# CodeBlocks - third-party notices

CodeBlocks itself (`codeblocks-js/`, the language workers in `javascript/`,
`python/*/pyWorker.js`, `python/*/codeblocks.js`, `python/*/phaser.js`,
`teavm/*/worker*.js`, `phaser/*/support.js`, `d3/*/helper*.js`,
`three.js/helper.r0.js`) is released under the MIT License, see
`codeblocks-js/LICENSE`.

npm dependencies bundled into `codeblocks-js/codeblocks.umd.*` are listed with
their full license texts in `codeblocks-js/THIRD-PARTY-LICENSES.md` (generated
on every build).

The following runtime libraries are shipped unmodified. Each folder contains
the license text of the library.

| Folder | Library | License |
|---|---|---|
| `brain.js/2.0.0-alpha/` | brain.js | MIT |
| `chart.js/3.6.0/` | Chart.js | MIT |
| `d3/5.3.8/` (contains v5.7.0), `d3/5.16.0/`, `d3/6.2.0/`, `d3/6.7.0/` | D3 | BSD-3-Clause |
| `d3/7.1.1/` | D3 | ISC |
| `doppio/v001/` | DoppioJVM, BrowserFS | MIT |
| `doppio/v001/doppio/vendor/java_home/` | OpenJDK 8 class library | GPL-2.0 WITH Classpath-exception-2.0 |
| `doppio/v001/doppio/vendor/websockify/` | websockify / web-socket-js | MPL-2.0 / BSD-3-Clause / MIT |
| `jquery.min.js` (`jquery.LICENSE.txt`) | jQuery 3.4.1 | MIT |
| `leaflet.js/1.9/` | Leaflet 1.9.3 | BSD-2-Clause |
| `lil-gui/0.16/` | lil-gui 0.16.1 | MIT |
| `modelviewer.js/2.1.1/` | &lt;model-viewer&gt; | Apache-2.0 |
| `phaser/3.54.0/` | Phaser | MIT |
| `python/v100/skulpt/`, `python/v101/skulpt/` | Skulpt | MIT (+ PSF-2.0 for stdlib parts) |
| `python/v102/pyodide-0.17.0/` | Pyodide 0.17.0 + packages | MPL-2.0 (+ per package, see `NOTICE.md`) |
| `python/v103/pyodide-0.29.3/` | Pyodide 0.29.3 + packages | MPL-2.0 (+ per package, see `NOTICE.md`) |
| `teavm/v100/`, `teavm/v101/`, `teavm/v102/` | TeaVM / teavm-javac | Apache-2.0 (see `NOTICE`) |
| `teavm/*/` (compiled `javac`) | OpenJDK javac | GPL-2.0 WITH Classpath-exception-2.0 |
| `tensorflow.js/2.0.0/` | TensorFlow.js, tfjs-vis | Apache-2.0 |
| `three.js/r0/` | three.js r92 + examples | MIT (libs: see `libs/NOTICE.md`) |
| `three.js/r140/` | three.js r140 | MIT |
| `codeblocks-js/fonts/` | Geist font | OFL-1.1 (`codeblocks-js/fonts/LICENSE.md`) |

Outside of `js/` (ILIAS deployment only):

| Folder | Content | License |
|---|---|---|
| `assets/`, `resources/` | CodeBlocks sprites and tiles | CC BY-NC 4.0 |
| `assets/trees/` (tree.autumn/spring/summer/winter, tree.stylized.*) | Tree images | Freepik license |
| `common/scene/maze/img/` | Maze tiles | CC BY-NC 4.0 |
| `common/scene/floatingworld/img/` | Floating World images | Freepik license |
| `common/` (code, `codeblocks.zip`) | CodeBlocks examples | MIT |
