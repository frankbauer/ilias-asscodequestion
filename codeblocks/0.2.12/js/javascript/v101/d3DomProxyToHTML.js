
/**
 *  Checking the d3DomProxy Object for any harmful parts and removing them.
 * @param {object} d3DomProxyNode 
 *  the domProxy object returned by the un-save student-code-worker-function
 *  document.__getD3ResultJSON() in the file "d3DomProxy.js" that has already been going through JSON.parse().
 * @returns {string}
 *  resulting HTML-string containing a checked version of the domProxy
 *  that should not do any harm to the exam environment.
 */
function d3DomProxyToSaveInnerHTMLString(d3DomProxyNode) {
  try {
    return innerHTML(d3DomProxyNode);
  } catch (e) {
    err_callback("d3Proxy: html-tree is not formatted correctly");
    err_callback(e);
    return "";
  }

  function innerHTML(node) {
    if ("object" !== typeof node) return "";
    let result = "";
    if ("object" === typeof node.childNodes) {
      for (let c of node.childNodes) {
        result += htmlStringForNode(c);
      }
    }
    //TODO:: is it ok to have text content always at the end of the children nodes?
    return result + checkTextContent(node.textContent);
  }

  function htmlStringForNode(node) {
    if (!checkNodeName(node.nodeName)) return "";
    let attribute_str = "";
    if (!node.attributes) node.attributes = {};
    attribute_str += " " + formatAttribute("style", (node.attributes.style ? node.attributes.style + ";" : "") + formatStyle(node)) + " ";
    delete node.attributes.style;
    for (let key of Object.keys(node.attributes)) attribute_str += " " + formatAttribute(key, node.attributes[key]);
    return '<' + node.nodeName + attribute_str + '>' + innerHTML(node) + '</' + node.nodeName + '>';
  }

  function formatStyle(node) {
    let style = "";
    for (let s of Object.keys(node.style)) {
      if (("" + s).match(/[^\w-]/g)) {
        err_callback("Style is blocked because of security. [" + s + "]")
        continue;
      }
      let value = node.style[s];
      value = ("" + value).replace(/["`\n]/gm, " ");
      style += s + ":" + node.style[s] + ";";
    }
    return style;
  }

  function formatAttribute(key, value) {
    if (!checkAttributeName(key)) return "";
    if (value === "") return "";
    //assuming " as delimiter for value
    value = ("" + value).replace(/["`\n]/gm, " ");
    return "" + key + "=\"" + value + "\"";
  }

  function checkTextContent(text) {
    if (!text) return "";
    return ("" + text).replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function checkNodeName(name) {
    name = "" + name; //string
    // script // doesn't seem to execute when added as innerHTML in Firefox, is this common? then script could be left out.
    //        // on the other hand, there is no reason to keep it either.
    // style  // is executed. but is it harmful tho? can restyling anything lead to security issues?? 
    //        // - confirmed style harmful, considering::  .append("style").text(":hover {visibility:hidden}");
    //        // no real interaction with the site is possible after that.
    //TODO:: consider the following nodes to be blocked::
    // img  //can extern images from any http::resource be opened in the Exam-environment?
    //      //eg.:  .append("img").attr("width", "300px").attr("src", "https://images-na.ssl-images-amazon.com/images/I/8166xCVDGnL._SL1500_.jpg")
    // a    //via "href";  same issue like "img"  .append("a").text("duck").attr("href", "https://images-na.ssl-images-amazon.com/images/I/8166xCVDGnL._SL1500_.jpg")
    // --> not blocked, because during exam there is no internet connection.
    // TODO: is it harmful to access other resources?
    const blockedNodes = new Set(["script", "style", "object", "img", "canvas"]);
    if (name.match(/\W/g) //node names should be well formatted
      || blockedNodes.has(name)) {
      err_callback("Node-type is blocked because of security. [" + name + "]");
      return false;
    }
    return true;
  }

  function checkAttributeName(att) {
    att = "" + att; //string
    const blockedAttributes = new Set(["innerHTML"]);
    if (att.match(/[^\w-]/g)) {
      err_callback("Attribute is blocked because of security. [" + att + "]");
      return false;
    } else if (att.substring(0, 2) === "on") {
      err_callback("on-events are blocked because of security. [" + att + "]");
      return false;
    } else if (blockedAttributes.has(att)) {
      err_callback("Attribute is blocked because of security. [" + att + "]");
      return false;
    }
    return true;
  }
}