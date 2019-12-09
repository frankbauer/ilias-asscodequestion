# CodeBlocks.js
CodeBlocks is a vue app framework designed to enable in-Browser source-code editing. The System allwos you to compile and run certain languages (currently **python**, **java** and **javascript**) clientside in the browser.

The app provides both an easy to use edit mode for questions as well as questionair mode.


## Project setup
You need to install npm in order to compile the app/framework. 

After that you can install all debendencies by running
```
npm install
```
in the folder where this README is located.


### Compiles and hot-reloads for development
During development you can the run a simple dev-server that recompiles and servers the app on demand.
```
npm run serve
```

### Compiles and minifies for production
You can build all required files for distribution using
```
npm run build
```
The build command will (by default) deploy the app to the `./dist`-Folder.

### Customize base-configuration
See [Configuration Reference](https://cli.vuejs.org/config/).

### Building for ilias
This app is used in the **Code Question**-Plugin for Ilias (https://github.com/frankbauer/ilias-asscodequestion). When production-building for the plugin you need to run another build script that will take care of some special settings.

```
npm run build-ilias
```

This will deploy the app to `../codeblocks/<version>/`
