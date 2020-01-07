
const __whitelist = new Set([
  "close",
  "postMessage",
  "console",
  "performance",
  "setTimeout",
])

onmessage = function (input) {
  switch (input.data[0]) {
    case 'importD3':
      console.log("[Importing D3-Proxy]")
      importScripts("./d3DomProxy.js"); //to be included before d3
      importScripts("../../d3/5.3.8/d3.v5.min.js");
      __whitelist.add("d3");
      __whitelist.add("document");
      break;
    case 'start':
      //erase all worker functionality from the global scope (except whitelist)
      for (let t in this) if (!__whitelist.has(t)) this[t] = null;
      // custom logging
      this.console = {
        log(s) {
          postMessage(['log', '' + s]);
        },
        error(s) {
          postMessage(['err', '' + s]);
        },
      };
      console.warn = console.log;

      let script = input.data[1];
      let func = new Function('"use strict"; ' + script);
      postMessage(['finished', func()]);
      close();
      break;
  }
}.bind(this);