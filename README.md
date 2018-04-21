# ILIAS Code Question Plugin

**Author**:   Frank Bauer <frank.bauer@fau.de>

**Version**:  1.1.1

**Company**:  Computer Graphics Group Erlangen

**Supports**: ILIAS 5.1 - 5.1

## License
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

## Installation
1. Copy the `assCodeQuestion` directory to your ILIAS installation at the following path 
(create subdirectories, if neccessary):
`Customizing/global/plugins/Modules/TestQuestionPool/Questions/assCodeQuestion`

2. Go to Administration > Plugins

3. Choose **Update** for the `assCodeQuestion` plugin
4. Choose **Activate** for the `assCodeQuestion` plugin
5. Choose **Refresh** for the `assCodeQuestion` plugin languages

There is nothing to configure for this plugin.

## Usage
This plugin enables source code questions. It basically provides a textarea with syntax 
highlighting for various languages (based on Highlight.js and CodeMirror).

Certain languages (at the moment *Java*, *Python* and *JavaScript*) can be compiled and 
executed during an Test/Assesment session. Executable Code can also be used to generate
graphical output.

## Included Software
* dopioJVM (http://plasma-umass.org/doppio-demo/)
* browserfs (https://github.com/jvilk/BrowserFS)
* highlight.js (https://highlightjs.org)
* skulpt (http://www.skulpt.org)


## Version History

### Version 1.1.1
* Added full support for canvas element drawing using data for the result output as datasource

### Version 1.1.0
* New, flexible block-system to add Question Fragments

### Version 1.0.8
* Added support for Client-Side Java-Execution using dopio.js

### Version 1.0.3
* Initial version
 No newline at end of file
