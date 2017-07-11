"use strict";

var _JavaPoly = require('./core/JavaPoly');

var _JavaPoly2 = _interopRequireDefault(_JavaPoly);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Create main object that will be accessed via global objects J and Java
global.window.javapoly = new _JavaPoly2.default({
  doppioLibUrl: '../doppio/',
  browserfsLibUrl: './Customizing/global/plugins/Modules/TestQuestionPool/Questions/assCodeQuestion/js/browserfs/'
});

module.exports = _JavaPoly2.default;
