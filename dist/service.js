"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.selectNodeService = exports.dragNodeService = void 0;
var _rxjs = require("rxjs");
const subject1 = new _rxjs.Subject();
const subject2 = new _rxjs.Subject();
const dragNodeService = exports.dragNodeService = {
  sendDragInfo: id => subject1.next({
    draggedNodeId: id
  }),
  clearDragInfo: () => subject1.next(),
  getDragInfo: () => subject1.asObservable()
};
const selectNodeService = exports.selectNodeService = {
  sendSelectedNodeInfo: id => subject2.next({
    selectedNodeId: id
  }),
  clearSelectedNodeInfo: () => subject2.next(),
  getSelectedNodeInfo: () => subject2.asObservable()
};