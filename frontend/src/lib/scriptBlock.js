
class ScriptBlock {
    constructor(script){
        this.err = []
        this.src = script;
        this.obj = undefined;
        this.fkt = undefined;
        try {
          this.fkt = new Function('"use strict"; return ' + script);    
          this.obj = this.fkt();
        } catch (e){
          this.pushError(e);
        }
    }
    
    rebuild() {
      this.obj = this.fkt();
    }

    pushError(e){
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
            column = Number(m[2]);
          }            
        }
      }   
      
      if (line !== undefined){
        line--;
        if (line==1) column -= 21;        
      }
      this.err.push({line:line, column:column, msg:e.message});
    }

    init(canvasElement){
      if (this.obj===undefined) return;
      try {
        this.obj.init(canvasElement);
      } catch(e) {
         this.pushError(e); 
      }
    }

    update(outputObject, canvasElement){
      if (this.obj===undefined) return;
      try {
        this.obj.update(outputObject, canvasElement);
      } catch(e) {
         this.pushError(e); 
      }
    }
    
  };

export default ScriptBlock;