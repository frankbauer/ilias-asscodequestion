import Vue from 'vue'

const jsErrorParser = function(e){
  console.error(e);
  let line, column;
  if (e.line) line = e.line;
  else if (e.lineNumber) line = e.lineNumber;

  if (e.column) column = e.column;
  else if (e.columnNumber) column = e.columnNumber;

  if (line === undefined){
    let lines = e.stack.split("\n");
    if (lines.length>1) {
      const regex = /<anonymous>:(\d+):(\d+)/gm;
      let m;            
      if ((m = regex.exec(lines[1])) !== null) {
        line = Number(m[1])-1;
        column = Number(m[2])-1;
      }            
    }
  }   
  
  if (line !== undefined){
    line--;
    if (line==1) column -= 24;        
  }
  return {line:line, column:column, msg:e.message};
}
Vue.prototype.$jsErrorParser = jsErrorParser;

class ScriptBlock {
    constructor(script, version){
        this.err = []
        this.src = undefined;
        this.version = version;
        this.obj = undefined;
        this.fkt = undefined;
        this.rebuild(script);
    }

    requestsOriginalVersion(){
      return this.version=='100' || this.version=='' || this.version===undefined;
    }
    
    rebuild(code) {
      if (code!==undefined){
        try {
          this.err = []
          console.log("!!! REBUILDING !!!");
          this.src = code

          //wrap the users code in a helper object, otherwise 
          //evaluating would fail if the code does not start in the first line
          if (this.requestsOriginalVersion())
            this.fkt = new Function('              return {o:' + code + '}.o');    
          else
            this.fkt = new Function('"use strict"; return {o:' + code + '}.o');    
          this.obj = this.fkt();
        } catch (e){
          this.pushError(e);
        }
      } else {
        this.obj = this.fkt();      
      }
    }

    pushError(e){      
      this.err.push(jsErrorParser(e));
    }

    init(canvasElement, outputElement){
      if (this.obj===undefined) return;
      try {
        console.log("!!! INIT !!!");        
        this.obj.init(canvasElement);
      } catch(e) {
         this.pushError(e); 
      }
    }

    reset(canvasElement){
      if (this.obj && this.obj.reset && !this.requestsOriginalVersion()){
        this.obj.reset(canvasElement);
      }
    }

    /**
     * You can force the system to recreate the canvas DOM-Element before each run. This will remove 
     * the object from the DOM and recreate it from scratch. After recreation your init-method
     * is called on the new object.
     * If the version of the playground-block is undefined or 100, or if the passed source-code does 
     * not define a shouldAutoReset method, this call will return false
     * @return true if you want to reset the canvas-DOM BEFOR each run. 
     */
    shouldAutoReset(){
      if (this.obj && this.obj.shouldAutoReset && !this.requestsOriginalVersion()){
        return this.obj.shouldAutoReset();
      } else {
        return false;
      }
    }

    update(outputObject, canvasElement){
      if (this.obj===undefined) return outputObject.output;
      try {        
        if (this.obj.update){  
          //console.log(this.obj.update.length, outputObject, this.obj);
          //this is the old behaviour  
          if (this.obj.update.length == 2 || this.requestsOriginalVersion()){              
            if (outputObject.processedOutput.type=='json') {
              console.log("!!! UPDATE (org, json) !!!");
              return this.obj.update(outputObject.processedOutput.json, canvasElement);
            } else {
              console.log("!!! UPDATE (org, text) !!!");
              return this.obj.update(outputObject.output, canvasElement);
            }
          } else {
            console.log("!!! UPDATE ("+this.version+")!!!");
            return this.obj.update(outputObject.processedOutput.text, outputObject.processedOutput.json, canvasElement, outputObject.outputElement);
          }
        }
      } catch(e) {
         this.pushError(e); 
      }
      return outputObject.initialOutput;
    }

    onParseError(initialOutput, parseError){
      if (this.obj===undefined) return false;
      try {
        if ( this.obj.onParseError){
          this.obj.onParseError(initialOutput, parseError);          
        } else {
          console.error(parseError);
          return false;
        }
      } catch(e) {
         this.pushError(e); 
         return false;
      }
      return true;
    }
    
  };

export default ScriptBlock;