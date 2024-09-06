"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _react = _interopRequireWildcard(require("react"));
var _propTypes = _interopRequireDefault(require("prop-types"));
var _service = require("./service");
require("./ChartNode.css");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
const propTypes = {
  datasource: _propTypes.default.object,
  NodeTemplate: _propTypes.default.elementType,
  draggable: _propTypes.default.bool,
  collapsible: _propTypes.default.bool,
  multipleSelect: _propTypes.default.bool,
  changeHierarchy: _propTypes.default.func,
  onClickNode: _propTypes.default.func
};
const defaultProps = {
  draggable: false,
  collapsible: true,
  multipleSelect: false
};
const ChartNode = _ref => {
  let {
    datasource,
    NodeTemplate,
    draggable,
    collapsible,
    multipleSelect,
    changeHierarchy,
    onClickNode
  } = _ref;
  const node = (0, _react.useRef)();
  const setExpandedLocalStorage = (name, value) => {
    localStorage.setItem(window.location.pathname + ' ' + datasource.id + '_' + name, value);
  };
  const getExpandedLocalStorage = (name, returnFalse) => {
    const value = localStorage.getItem(window.location.pathname + ' ' + datasource.id + '_' + name);
    if (value) {
      return 'true' === value;
    }
    return returnFalse ? false : undefined;
  };
  const [isChildrenCollapsed, setIsChildrenCollapsed] = (0, _react.useState)(getExpandedLocalStorage('childrenExpanded', true));
  const [topEdgeExpanded, setTopEdgeExpanded] = (0, _react.useState)(getExpandedLocalStorage('topEdgeExpanded'));
  const [rightEdgeExpanded, setRightEdgeExpanded] = (0, _react.useState)(getExpandedLocalStorage('rightEdgeExpanded'));
  const [bottomEdgeExpanded, setBottomEdgeExpanded] = (0, _react.useState)(getExpandedLocalStorage('bottomEdgeExpanded'));
  const [leftEdgeExpanded, setLeftEdgeExpanded] = (0, _react.useState)(getExpandedLocalStorage('leftEdgeExpanded'));
  const [allowedDrop, setAllowedDrop] = (0, _react.useState)(false);
  const [selected, setSelected] = (0, _react.useState)(false);
  const nodeClass = ["oc-node", isChildrenCollapsed ? "isChildrenCollapsed" : "", allowedDrop ? "allowedDrop" : "", selected ? "selected" : ""].filter(item => item).join(" ");
  (0, _react.useEffect)(() => {
    const subs1 = _service.dragNodeService.getDragInfo().subscribe(draggedInfo => {
      if (draggedInfo) {
        setAllowedDrop(!document.querySelector("#" + draggedInfo.draggedNodeId).closest("li").querySelector("#" + node.current.id) ? true : false);
      } else {
        setAllowedDrop(false);
      }
    });
    const subs2 = _service.selectNodeService.getSelectedNodeInfo().subscribe(selectedNodeInfo => {
      if (selectedNodeInfo) {
        if (multipleSelect) {
          if (selectedNodeInfo.selectedNodeId === datasource.id) {
            setSelected(true);
          }
        } else {
          setSelected(selectedNodeInfo.selectedNodeId === datasource.id);
        }
      } else {
        setSelected(false);
      }
    });
    return () => {
      subs1.unsubscribe();
      subs2.unsubscribe();
    };
  }, [multipleSelect, datasource]);
  const addArrows = e => {
    const node = e.target.closest("li");
    const parent = node.parentNode.closest("li");
    const isAncestorsCollapsed = node && parent ? parent.firstChild.classList.contains("hidden") : undefined;
    const isSiblingsCollapsed = Array.from(node.parentNode.children).some(item => item.classList.contains("hidden"));
    setTopEdgeExpanded(!isAncestorsCollapsed);
    setRightEdgeExpanded(!isSiblingsCollapsed);
    setLeftEdgeExpanded(!isSiblingsCollapsed);
    setBottomEdgeExpanded(!isChildrenCollapsed);
    setExpandedLocalStorage('topEdgeExpanded', !isAncestorsCollapsed);
    setExpandedLocalStorage('rightEdgeExpanded', !isSiblingsCollapsed);
    setExpandedLocalStorage('leftEdgeExpanded', !isSiblingsCollapsed);
    setExpandedLocalStorage('bottomEdgeExpanded', !isChildrenCollapsed);
  };
  const removeArrows = () => {
    setTopEdgeExpanded(undefined);
    setRightEdgeExpanded(undefined);
    setBottomEdgeExpanded(undefined);
    setLeftEdgeExpanded(undefined);
    setExpandedLocalStorage('topEdgeExpanded', undefined);
    setExpandedLocalStorage('rightEdgeExpanded', undefined);
    ;
    setExpandedLocalStorage('leftEdgeExpanded', undefined);
    setExpandedLocalStorage('bottomEdgeExpanded', undefined);
  };
  const toggleAncestors = actionNode => {
    let node = actionNode.parentNode.closest("li");
    if (!node) return;
    const isAncestorsCollapsed = node.firstChild.classList.contains("hidden");
    if (isAncestorsCollapsed) {
      // 向上展开，只展开一级
      actionNode.classList.remove("isAncestorsCollapsed");
      node.firstChild.classList.remove("hidden");
    } else {
      // 向下折叠，则折叠所有祖先节点以及祖先节点的兄弟节点
      const isSiblingsCollapsed = Array.from(actionNode.parentNode.children).some(item => item.classList.contains("hidden"));
      if (!isSiblingsCollapsed) {
        toggleSiblings(actionNode);
      }
      actionNode.classList.add(...("isAncestorsCollapsed" + (isSiblingsCollapsed ? "" : " isSiblingsCollapsed")).split(" "));
      node.firstChild.classList.add("hidden");
      // 如果还有展开的祖先节点，那继续折叠关闭之
      if (node.parentNode.closest("li") && !node.parentNode.closest("li").firstChild.classList.contains("hidden")) {
        toggleAncestors(node);
      }
    }
  };
  const topEdgeClickHandler = e => {
    e.stopPropagation();
    setTopEdgeExpanded(!topEdgeExpanded);
    setExpandedLocalStorage('topEdgeExpanded', !topEdgeExpanded);
    toggleAncestors(e.target.closest("li"));
  };
  const bottomEdgeClickHandler = e => {
    e.stopPropagation();
    setIsChildrenCollapsed(!isChildrenCollapsed);
    setExpandedLocalStorage('childrenExpanded', !isChildrenCollapsed);
    setBottomEdgeExpanded(!bottomEdgeExpanded);
    setExpandedLocalStorage('bottomEdgeExpanded', !bottomEdgeExpanded);
  };
  const toggleSiblings = actionNode => {
    let node = actionNode.previousSibling;
    const isSiblingsCollapsed = Array.from(actionNode.parentNode.children).some(item => item.classList.contains("hidden"));
    actionNode.classList.toggle("isSiblingsCollapsed", !isSiblingsCollapsed);
    // 先处理同级的兄弟节点
    while (node) {
      if (isSiblingsCollapsed) {
        node.classList.remove("hidden");
      } else {
        node.classList.add("hidden");
      }
      node = node.previousSibling;
    }
    node = actionNode.nextSibling;
    while (node) {
      if (isSiblingsCollapsed) {
        node.classList.remove("hidden");
      } else {
        node.classList.add("hidden");
      }
      node = node.nextSibling;
    }
    // 在展开兄弟节点的同时，还要展开父节点
    const isAncestorsCollapsed = actionNode.parentNode.closest("li").firstChild.classList.contains("hidden");
    if (isAncestorsCollapsed) {
      toggleAncestors(actionNode);
    }
  };
  const hEdgeClickHandler = e => {
    e.stopPropagation();
    setLeftEdgeExpanded(!leftEdgeExpanded);
    setRightEdgeExpanded(!rightEdgeExpanded);
    setExpandedLocalStorage('leftEdgeExpanded', !leftEdgeExpanded);
    setExpandedLocalStorage('rightEdgeExpanded', !rightEdgeExpanded);
    toggleSiblings(e.target.closest("li"));
  };
  const filterAllowedDropNodes = id => {
    _service.dragNodeService.sendDragInfo(id);
  };
  const clickNodeHandler = event => {
    if (onClickNode) {
      onClickNode(datasource);
    }
    _service.selectNodeService.sendSelectedNodeInfo(datasource.id);
  };
  const dragstartHandler = event => {
    const copyDS = {
      ...datasource
    };
    delete copyDS.relationship;
    event.dataTransfer.setData("text/plain", JSON.stringify(copyDS));
    // highlight all potential drop targets
    filterAllowedDropNodes(node.current.id);
  };
  const dragoverHandler = event => {
    // prevent default to allow drop
    event.preventDefault();
  };
  const dragendHandler = () => {
    // reset background of all potential drop targets
    _service.dragNodeService.clearDragInfo();
  };
  const dropHandler = event => {
    if (!event.currentTarget.classList.contains("allowedDrop")) {
      return;
    }
    _service.dragNodeService.clearDragInfo();
    changeHierarchy(JSON.parse(event.dataTransfer.getData("text/plain")), event.currentTarget.id);
  };
  return /*#__PURE__*/_react.default.createElement("li", {
    className: "oc-hierarchy"
  }, /*#__PURE__*/_react.default.createElement("div", {
    ref: node,
    id: datasource.id,
    className: nodeClass,
    draggable: draggable ? "true" : undefined,
    onClick: clickNodeHandler,
    onDragStart: dragstartHandler,
    onDragOver: dragoverHandler,
    onDragEnd: dragendHandler,
    onDrop: dropHandler,
    onMouseEnter: addArrows,
    onMouseLeave: removeArrows
  }, NodeTemplate ? /*#__PURE__*/_react.default.createElement(NodeTemplate, {
    nodeData: datasource
  }) : /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement("div", {
    className: "oc-heading"
  }, datasource.relationship && datasource.relationship.charAt(2) === "1" && /*#__PURE__*/_react.default.createElement("i", {
    className: "oci oci-leader oc-symbol"
  }), datasource.name), /*#__PURE__*/_react.default.createElement("div", {
    className: "oc-content"
  }, datasource.title)), collapsible && datasource.relationship && datasource.relationship.charAt(0) === "1" && /*#__PURE__*/_react.default.createElement("i", {
    className: `oc-edge verticalEdge topEdge oci ${topEdgeExpanded === undefined ? "" : topEdgeExpanded ? "oci-chevron-down" : "oci-chevron-up"}`,
    onClick: topEdgeClickHandler
  }), collapsible && datasource.relationship && datasource.relationship.charAt(1) === "1" && /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement("i", {
    className: `oc-edge horizontalEdge rightEdge oci ${rightEdgeExpanded === undefined ? "" : rightEdgeExpanded ? "oci-chevron-left" : "oci-chevron-right"}`,
    onClick: hEdgeClickHandler
  }), /*#__PURE__*/_react.default.createElement("i", {
    className: `oc-edge horizontalEdge leftEdge oci ${leftEdgeExpanded === undefined ? "" : leftEdgeExpanded ? "oci-chevron-right" : "oci-chevron-left"}`,
    onClick: hEdgeClickHandler
  })), collapsible && datasource.relationship && datasource.relationship.charAt(2) === "1" && /*#__PURE__*/_react.default.createElement("i", {
    className: `oc-edge verticalEdge bottomEdge oci ${bottomEdgeExpanded === undefined ? "" : bottomEdgeExpanded ? "oci-chevron-up" : "oci-chevron-down"}`,
    onClick: bottomEdgeClickHandler
  })), datasource.children && datasource.children.length > 0 && /*#__PURE__*/_react.default.createElement("ul", {
    className: isChildrenCollapsed ? "hidden" : ""
  }, datasource.children.map(node => /*#__PURE__*/_react.default.createElement(ChartNode, {
    datasource: node,
    NodeTemplate: NodeTemplate,
    id: node.id,
    key: node.id,
    draggable: draggable,
    collapsible: collapsible,
    multipleSelect: multipleSelect,
    changeHierarchy: changeHierarchy,
    onClickNode: onClickNode
  }))));
};
ChartNode.propTypes = propTypes;
ChartNode.defaultProps = defaultProps;
var _default = exports.default = ChartNode;