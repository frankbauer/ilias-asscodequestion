console.log("[Loading legacy Helpers]");

function processMixedOutput(outputObject, canvasElement, magicString) {
    const qid = canvasElement.attr('data-question');
    const out = $('#'+qid+'Output');    

    if (magicString===undefined) magicString = '\n\n<JSON>\n';
    const idx = outputObject.indexOf(magicString);    
    if (idx >= 0) {
        const str = outputObject.substr(0, idx);
        const json = JSON.parse(outputObject.substr(idx+magicString.length));
        			
        
        return {
            outputElement:out,
            questionID:qid,
            json:json,
            text:str
        };
    } 

    return {
        outputElement:out,
            questionID:qid,
            json:undefined,
            text:outputObject
    };
}