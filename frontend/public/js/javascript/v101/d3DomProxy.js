/**
 * this code provides a dummy-document
 * with enough functionality to make simple d3 operations work inside a js-worker.
 * It is providing a <div> with id="content" as a root node.
 * The final document-tree as an "unsave"-JSON object can be obtained by 
 * document.__getD3ResultJSON()
 * "unsave" means that, at that point it can not yet be assured that,
 * the object does not contain any harmful tags or code inserted by the code executed in the worker.
 */
const document = {
  documentElement: {},
  isProxy: true,
  createElementNS: (uri, type) => {
    let el = {
      ownerDocument: document,
      namespaceURI: uri,
      nodeName: type,
      localName: type,
      tagName: type,
      attributes: {},
      childNodes: [],
      parentNode: undefined,
      nextSibling: undefined,
      previousSibling: undefined,
      style: {
        setProperty(a, b) {
          this[a] = b;
        },
        getPropertyValue(a) {
          return this[a];
        }
      },
      get firstChild() {
        return this.childNodes[0];
      },
      /*get previousSibling() {
        var idx = this.parentNode.childNodes.findIndex((i) => this == i);
        return this.parentNode.childNodes[idx - 1];
      },
      get nextSibling() {
        var idx = this.parentNode.childNodes.findIndex((i) => this == i);
        return this.parentNode.childNodes[idx + 1];
      },*/
      appendChild(child) {
        const prev = this.childNodes[this.childNodes.length - 1];
        this.childNodes.push(child);
        prev && (prev.nextSibling = child);
        child && (child.previousSibling = prev);
        child && (child.parentNode = this);
        return child;
      },
      removeChild(child) {
        const index = this.childNodes.findIndex((i) => i == child);
        if (index != -1) {
          const prev = this.childNodes[index - 1];
          const next = this.childNodes[index + 1];
          this.childNodes.splice(index, 1);
          prev && (prev.nextSibling = next);
          next && (next.previousSibling = prev);
        }
      },
      set innerHTML(v) {
        this.textContent = v; //text in innerHTML is ok.
        //console.error(".html() manipulation is blocked because of security.");
      },
      get innerHTML() {
        return this.textContent;
      },
      insertBefore(child, refChild) {
        const idx = this.childNodes.findIndex((a) => (a == refChild));
        if (idx == -1) this.appendChild(child);
        else {
          const prev = this.childNodes[idx - 1];
          child && (child.previousSibling = prev);
          child && (child.nextSibling = refChild);
          refChild && (refChild.previousSibling = child);
          prev && (prev.nextSibling = child);
          this.childNodes.splice(idx, 0, child);
        }
        return child;
      },
      setAttribute(att, value) {
        this.attributes[att] = value;
        return this;
      },
      getAttribute(att) {
        return this.attributes[att];
      },
      removeAttribute(att) {
        delete this.attributes[att];
      },
      /*queryMatch(q) {
        switch (q[0]) {
          case "#":
            return this.attributes.id !== undefined && this.attributes.id == q.substring(1);
          case '.':
            return this.attributes.class !== undefined && this.attributes.class == q.substring(1);
          default:
            return this.nodeName === q;
        }
      },*/
      __recursiveQuerySelection(results, query) {
        let matches = true;
        if (query.type && this.nodeName != query.type) matches = false;
        if (query.id && this.attribute.id != query.id) matches = false;
        if (query.classes.length) {
          if (this.attributes.class === undefined) matches = false;
          else
            for (let c of query.classes) {
              if (!(" " + this.attributes.class + " ").match(" " + c + " ")) {
                matches = false;
                break;
              }
            }
        }
        if (matches && !query.subquery) {
          results.push(this);
        } else if (matches && query.subquery) {
          for (let c of this.childNodes) {
            c.__recursiveQuerySelection(results, query.subquery);
          }
        }
        for (let c of this.childNodes) {
          c.__recursiveQuerySelection(results, query);
        }
      },
      querySelector(name) {
        return this.querySelectorAll(name)[0];
      },
      querySelectorAll(name) {
        function parseQuery(q) {
          const query = {
            type: undefined,
            id: undefined,
            classes: [],
            subquery: undefined
          }

          let prefix = "";
          let current = "";

          function applyMatched() {
            if (prefix === ".") query.classes.push(current);
            else if (prefix === "#") query.id = current;
            else query.type = current;
          }
          for (var i = 0; i < q.length; ++i) {
            switch (q[i]) {
              case " ":
                if (current === "") continue;
                applyMatched();
                query.subquery = parseQuery(q.substring(i + 1));
                break;
              case "#":
              case ".":
                if (current === "") continue;
                applyMatched();
                prefix = q[i];
                current = "";
                break;
              default:
                current += q[i];
                break;
            }
          }
          if (current !== "") applyMatched();
          return query;
        }
        const res = [];
        try {
          const query = parseQuery(name);
          //TODO:: test query parsing
          for (let c of this.childNodes) {
            c.__recursiveQuerySelection(res, query);
          }
        } catch (e) {
          console.error("unknown selection query: " + name);
        }
        return res;
      },
      addEventListener(event, handle) {
        console.error("events are blocked because of security. [" + event + "]");
        //this.setAttribute("on" + event, ("(" + handle + ")(this)").replace(/\n/g, ""));
        //console.log(event + " " + handle);
      },
      __visitAllNodes(func) {
        func(this);
        for (let c of this.childNodes) {
          c.__visitAllNodes(func);
        }
      }
    };
    return el;
  },
  querySelectorAll: (arg) => {
    //console.error("selectAll not Implemented globally");
    return document.contentDiv.querySelectorAll(arg);
  },
  querySelector: (arg) => {
    if (arg == "#content") return document.contentDiv;
    else return document.contentDiv.querySelector(arg);
    //console.error("d3.select  does only know the item '#content'");
  },
  __getD3ResultJSON: () => {
    // creating the JSON without circular references destroys the domProxy
    let div = document.contentDiv
    div.__visitAllNodes((n) => { //prevent circular references
      delete n.previousSibling;
      delete n.nextSibling;
      delete n.parentNode;
    });
    delete document.contentDiv;
    return JSON.stringify(div);
  }
}
//content div
// to select use:
// d3.select("#content")
document.contentDiv = document.createElementNS("", "div"); //content div
