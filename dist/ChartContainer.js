"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _react = _interopRequireWildcard(require("react"));
var _propTypes = _interopRequireDefault(require("prop-types"));
var _service = require("./service");
var _jsonDigger = _interopRequireDefault(require("json-digger"));
var _html2canvas = _interopRequireDefault(require("html2canvas"));
var _jspdf = _interopRequireDefault(require("jspdf"));
var _ChartNode = _interopRequireDefault(require("./ChartNode"));
require("./ChartContainer.css");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
const propTypes = {
  datasource: _propTypes.default.object.isRequired,
  pan: _propTypes.default.bool,
  zoom: _propTypes.default.bool,
  zoomoutLimit: _propTypes.default.number,
  zoominLimit: _propTypes.default.number,
  containerClass: _propTypes.default.string,
  chartClass: _propTypes.default.string,
  NodeTemplate: _propTypes.default.elementType,
  draggable: _propTypes.default.bool,
  collapsible: _propTypes.default.bool,
  multipleSelect: _propTypes.default.bool,
  onClickNode: _propTypes.default.func,
  onClickChart: _propTypes.default.func,
  onZoomChange: _propTypes.default.func
};
const defaultProps = {
  pan: false,
  zoom: false,
  zoomoutLimit: 0.5,
  zoominLimit: 7,
  containerClass: "",
  chartClass: "",
  draggable: false,
  collapsible: true,
  multipleSelect: false
};
const ChartContainer = /*#__PURE__*/(0, _react.forwardRef)((_ref, ref) => {
  let {
    datasource,
    pan,
    zoom,
    zoomoutLimit,
    zoominLimit,
    containerClass,
    chartClass,
    NodeTemplate,
    draggable,
    collapsible,
    multipleSelect,
    onClickNode,
    onClickChart
  } = _ref;
  const container = (0, _react.useRef)();
  const chart = (0, _react.useRef)();
  const downloadButton = (0, _react.useRef)();
  const [startX, setStartX] = (0, _react.useState)(0);
  const [startY, setStartY] = (0, _react.useState)(0);
  const [transform, setTransform] = (0, _react.useState)("");
  const [panning, setPanning] = (0, _react.useState)(false);
  const [cursor, setCursor] = (0, _react.useState)("default");
  const [exporting, setExporting] = (0, _react.useState)(false);
  const [dataURL, setDataURL] = (0, _react.useState)("");
  const [download, setDownload] = (0, _react.useState)("");
  const attachRel = (data, flags) => {
    data.relationship = flags + (data.children && data.children.length > 0 ? 1 : 0);
    if (data.children) {
      data.children.forEach(function (item) {
        attachRel(item, "1" + (data.children.length > 1 ? 1 : 0));
      });
    }
    return data;
  };
  const [ds, setDS] = (0, _react.useState)(datasource);
  (0, _react.useEffect)(() => {
    setDS(datasource);
  }, [datasource]);
  const dsDigger = new _jsonDigger.default(datasource, "id", "children");
  const clickChartHandler = event => {
    if (!event.target.closest(".oc-node")) {
      if (onClickChart) {
        onClickChart();
      }
      _service.selectNodeService.clearSelectedNodeInfo();
    }
  };
  const panEndHandler = () => {
    setPanning(false);
    setCursor("default");
  };
  const panHandler = e => {
    let newX = 0;
    let newY = 0;
    if (!e.targetTouches) {
      // pand on desktop
      newX = e.pageX - startX;
      newY = e.pageY - startY;
    } else if (e.targetTouches.length === 1) {
      // pan on mobile device
      newX = e.targetTouches[0].pageX - startX;
      newY = e.targetTouches[0].pageY - startY;
    } else if (e.targetTouches.length > 1) {
      return;
    }
    if (transform === "") {
      if (transform.indexOf("3d") === -1) {
        setTransform("matrix(1,0,0,1," + newX + "," + newY + ")");
      } else {
        setTransform("matrix3d(1,0,0,0,0,1,0,0,0,0,1,0," + newX + ", " + newY + ",0,1)");
      }
    } else {
      let matrix = transform.split(",");
      if (transform.indexOf("3d") === -1) {
        matrix[4] = newX;
        matrix[5] = newY + ")";
      } else {
        matrix[12] = newX;
        matrix[13] = newY;
      }
      setTransform(matrix.join(","));
    }
  };
  const panStartHandler = e => {
    if (e.target.closest(".oc-node")) {
      setPanning(false);
      return;
    } else {
      setPanning(true);
      setCursor("move");
    }
    let lastX = 0;
    let lastY = 0;
    if (transform !== "") {
      let matrix = transform.split(",");
      if (transform.indexOf("3d") === -1) {
        lastX = parseInt(matrix[4]);
        lastY = parseInt(matrix[5]);
      } else {
        lastX = parseInt(matrix[12]);
        lastY = parseInt(matrix[13]);
      }
    }
    if (!e.targetTouches) {
      // pand on desktop
      setStartX(e.pageX - lastX);
      setStartY(e.pageY - lastY);
    } else if (e.targetTouches.length === 1) {
      // pan on mobile device
      setStartX(e.targetTouches[0].pageX - lastX);
      setStartY(e.targetTouches[0].pageY - lastY);
    } else if (e.targetTouches.length > 1) {
      return;
    }
  };
  const updateChartScale = newScale => {
    let matrix = [];
    let targetScale = 1;
    if (transform === "") {
      setTransform("matrix(" + newScale + ", 0, 0, " + newScale + ", 0, 0)");
    } else {
      matrix = transform.split(",");
      if (transform.indexOf("3d") === -1) {
        targetScale = Math.abs(window.parseFloat(matrix[3]) * newScale);
        if (targetScale > zoomoutLimit && targetScale < zoominLimit) {
          matrix[0] = "matrix(" + targetScale;
          matrix[3] = targetScale;
          setTransform(matrix.join(","));
        }
      } else {
        targetScale = Math.abs(window.parseFloat(matrix[5]) * newScale);
        if (targetScale > zoomoutLimit && targetScale < zoominLimit) {
          matrix[0] = "matrix3d(" + targetScale;
          matrix[5] = targetScale;
          setTransform(matrix.join(","));
        }
      }
    }
  };
  const zoomHandler = e => {
    let newScale = 1 + (e.deltaY > 0 ? -0.2 : 0.2);
    updateChartScale(newScale);
  };
  const exportPDF = (canvas, exportFilename) => {
    const canvasWidth = Math.floor(canvas.width);
    const canvasHeight = Math.floor(canvas.height);
    const doc = canvasWidth > canvasHeight ? new _jspdf.default({
      orientation: "landscape",
      unit: "px",
      format: [canvasWidth, canvasHeight]
    }) : new _jspdf.default({
      orientation: "portrait",
      unit: "px",
      format: [canvasHeight, canvasWidth]
    });
    doc.addImage(canvas.toDataURL("image/jpeg", 1.0), "JPEG", 0, 0);
    doc.save(exportFilename + ".pdf");
  };
  const exportPNG = (canvas, exportFilename) => {
    const isWebkit = "WebkitAppearance" in document.documentElement.style;
    const isFf = !!window.sidebar;
    const isEdge = navigator.appName === "Microsoft Internet Explorer" || navigator.appName === "Netscape" && navigator.appVersion.indexOf("Edge") > -1;
    if (!isWebkit && !isFf || isEdge) {
      window.navigator.msSaveBlob(canvas.msToBlob(), exportFilename + ".png");
    } else {
      setDataURL(canvas.toDataURL());
      setDownload(exportFilename + ".png");
      downloadButton.current.click();
    }
  };
  const changeHierarchy = async (draggedItemData, dropTargetId) => {
    await dsDigger.removeNode(draggedItemData.id);
    await dsDigger.addChildren(dropTargetId, draggedItemData);
    setDS({
      ...dsDigger.ds
    });
  };
  (0, _react.useImperativeHandle)(ref, () => ({
    exportTo: (exportFilename, exportFileextension) => {
      exportFilename = exportFilename || "OrgChart";
      exportFileextension = exportFileextension || "png";
      setExporting(true);
      const originalScrollLeft = container.current.scrollLeft;
      container.current.scrollLeft = 0;
      const originalScrollTop = container.current.scrollTop;
      container.current.scrollTop = 0;
      (0, _html2canvas.default)(chart.current, {
        width: chart.current.clientWidth,
        height: chart.current.clientHeight,
        onclone: function (clonedDoc) {
          clonedDoc.querySelector(".orgchart").style.background = "none";
          clonedDoc.querySelector(".orgchart").style.transform = "";
        }
      }).then(canvas => {
        if (exportFileextension.toLowerCase() === "pdf") {
          exportPDF(canvas, exportFilename);
        } else {
          exportPNG(canvas, exportFilename);
        }
        setExporting(false);
        container.current.scrollLeft = originalScrollLeft;
        container.current.scrollTop = originalScrollTop;
      }, () => {
        setExporting(false);
        container.current.scrollLeft = originalScrollLeft;
        container.current.scrollTop = originalScrollTop;
      });
    },
    expandAllNodes: () => {
      chart.current.querySelectorAll(".oc-node.hidden, .oc-hierarchy.hidden, .isSiblingsCollapsed, .isAncestorsCollapsed").forEach(el => {
        el.classList.remove("hidden", "isSiblingsCollapsed", "isAncestorsCollapsed");
      });
    },
    setZoom: newScale => {
      if (newScale < zoomoutLimit) {
        newScale = zoomoutLimit;
      }
      if (newScale > zoominLimit) {
        newScale = zoominLimit;
      }
      updateChartScale(newScale);
    }
  }));
  return /*#__PURE__*/_react.default.createElement("div", {
    ref: container,
    className: "orgchart-container " + containerClass,
    onWheel: zoom ? zoomHandler : undefined,
    onMouseUp: pan && panning ? panEndHandler : undefined
  }, /*#__PURE__*/_react.default.createElement("div", {
    ref: chart,
    className: "orgchart " + chartClass,
    style: {
      transform: transform,
      cursor: cursor
    },
    onClick: clickChartHandler,
    onMouseDown: pan ? panStartHandler : undefined,
    onMouseMove: pan && panning ? panHandler : undefined
  }, /*#__PURE__*/_react.default.createElement("ul", null, /*#__PURE__*/_react.default.createElement(_ChartNode.default, {
    datasource: attachRel(ds, "00"),
    NodeTemplate: NodeTemplate,
    draggable: draggable,
    collapsible: collapsible,
    multipleSelect: multipleSelect,
    changeHierarchy: changeHierarchy,
    onClickNode: onClickNode
  }))), /*#__PURE__*/_react.default.createElement("a", {
    className: "oc-download-btn hidden",
    ref: downloadButton,
    href: dataURL,
    download: download
  }, "\xA0"), /*#__PURE__*/_react.default.createElement("div", {
    className: `oc-mask ${exporting ? "" : "hidden"}`
  }, /*#__PURE__*/_react.default.createElement("i", {
    className: "oci oci-spinner spinner"
  })));
});
ChartContainer.propTypes = propTypes;
ChartContainer.defaultProps = defaultProps;
var _default = exports.default = ChartContainer;