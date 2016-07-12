!function e(t,a,r){function s(l,i){if(!a[l]){if(!t[l]){var n="function"==typeof require&&require;if(!i&&n)return n(l,!0);if(o)return o(l,!0);var c=new Error("Cannot find module '"+l+"'");throw c.code="MODULE_NOT_FOUND",c}var d=a[l]={exports:{}};t[l][0].call(d.exports,function(e){var a=t[l][1][e];return s(a?a:e)},d,d.exports,e,t,a,r)}return a[l].exports}for(var o="function"==typeof require&&require,l=0;l<r.length;l++)s(r[l]);return s}({"/Users/thadk/gitrepos/oc-map/app/assets/scripts/components/dropdown.js":[function(e,t,a){"use strict";function r(e){return e&&e.__esModule?e:{"default":e}}var s=e("react"),o=r(s),l=o["default"].createClass({displayName:"Dropdown",propTypes:{className:o["default"].PropTypes.string,triggerTitle:o["default"].PropTypes.string,triggerClassName:o["default"].PropTypes.string,triggerText:o["default"].PropTypes.string,closeDropdown:o["default"].PropTypes.func,children:o["default"].PropTypes.node},_bodyListener:function(e){var t=e.target;if("HTML"===t.tagName||"BODY"===t.tagName||"dropdown:close"===t.getAttribute("data-hook"))return void this.setState({open:!1});do{if(t&&"dropdown"===t.getAttribute("data-hook"))break;t=t.parentNode}while(t&&"BODY"!==t.tagName);t!==this.refs.dropdown&&this.setState({open:!1})},getDefaultProps:function(){return{element:"div",className:"",triggerTitle:"",triggerClassName:"",triggerText:""}},getInitialState:function(){return{open:!1}},componentDidMount:function(){window.addEventListener("click",this._bodyListener)},componentWillUnmount:function(){window.removeEventListener("click",this._bodyListener)},_toggleDropdown:function(e){e.preventDefault(),this.setState({open:!this.state.open})},render:function(){var e=["drop"];return this.state.open&&e.push("drop--open"),this.props.className&&e.push(this.props.className),o["default"].createElement(this.props.element,{className:e.join(" "),"data-hook":"dropdown",ref:"dropdown"},o["default"].createElement("a",{href:"#",title:this.props.triggerTitle,className:this.props.triggerClassName,onClick:this._toggleDropdown},o["default"].createElement("span",null,this.props.triggerText)),o["default"].createElement("div",{className:"drop__content"},this.props.children))}});t.exports=l},{react:"react"}],"/Users/thadk/gitrepos/oc-map/app/assets/scripts/main.js":[function(e,t,a){"use strict";function r(e){return e&&e.__esModule?e:{"default":e}}e("babel-polyfill");var s=e("react"),o=r(s),l=e("react-dom"),i=e("./views/map-widget"),n=r(i),c=e("./views/table-widget"),d=r(c);window.OC_MAP={initMapWidget:function(e){(0,l.render)(o["default"].createElement(n["default"],null),e)},initTableWidget:function(e){(0,l.render)(o["default"].createElement(d["default"],null),e)}}},{"./views/map-widget":"/Users/thadk/gitrepos/oc-map/app/assets/scripts/views/map-widget.js","./views/table-widget":"/Users/thadk/gitrepos/oc-map/app/assets/scripts/views/table-widget.js","babel-polyfill":"babel-polyfill",react:"react","react-dom":"react-dom"}],"/Users/thadk/gitrepos/oc-map/app/assets/scripts/views/map-widget.js":[function(e,t,a){"use strict";function r(e){return e&&e.__esModule?e:{"default":e}}var s=e("isomorphic-fetch"),o=r(s),l=e("bluebird"),i=r(l),n=e("react"),c=r(n),d=e("leaflet"),p=r(d),u=e("classnames"),f=r(u),h=e("lodash"),m=r(h),y=e("leaflet-omnivore"),g=r(y),v=e("../components/dropdown"),w=r(v),S=e("leaflet-search"),b=(r(S),"assets/topojson/owners-wBlighted-target-only.json"),_="assets/topojson/fake-user-edits-NE.json",C="assets/topojson/DC_Boundary_Lines.json",E="assets/topojson/DC_Ward_Boundary_Lines.json",D="http://ggwash-forms.herokuapp.com/geocode",k={all:"See DC-designated Vacants & Blighted Properties",contribute:"Contribute Vacant/Blighted"},N=c["default"].createClass({displayName:"MapWidget",mapCountryLayer:null,layerStyles:{"default":{color:"#959595",weight:1,opacity:1,fillOpacity:1,fillColor:"#B5B5B5"},ggwashGreyGreen:{color:"#95ac9c",weight:3,opacity:1,fillOpacity:1,fillColor:"#0a9230"},ggwashGreenGrey:{color:"#0a9230",weight:2,opacity:1,fillOpacity:1,fillColor:"#95ac9c"},vacant:{color:"#C3670D",weight:1,opacity:1,fillOpacity:1,fillColor:"#C3670D"},blighted:{color:"#A30B53",weight:1,opacity:1,fillOpacity:1,fillColor:"#A30B53"},nodata:{color:"#E3E3E3",weight:1,opacity:1,fillOpacity:1,fillColor:"#F4F4F4"},hover:{color:"#C2DC16",weight:1,opacity:1,fillOpacity:.5,fillColor:"#C2DC16"},active:{color:"#65ff11",weight:1,opacity:1,fillOpacity:1,fillColor:"#65ff11"},lilac:{color:"#6C75E1",weight:1,opacity:1,fillOpacity:1,fillColor:"#6C75E1"},orange:{color:"#FD843D",weight:1,opacity:1,fillOpacity:1,fillColor:"#FD843D"},teal:{color:"#23B2A7",weight:1,opacity:1,fillOpacity:1,fillColor:"#23B2A7"},darkorange:{color:"#FB6045",weight:1,opacity:1,fillOpacity:1,fillColor:"#FB6045"},blue:{color:"#6991F5",weight:1,opacity:1,fillOpacity:1,fillColor:"#6991F5"}},getInitialState:function(){return{fetchedData:!1,fetchingData:!1,mapTopoJSON:null,dcBoundaryTopoJSON:null,userEditsTopoJSON:_,"null":null,mapTopoSW:null,mapTopoSE:null,mapTopoNW:null,mapTopoNE:null,godiScores:null,godiData:null,godiPlaces:null,activeCountryProperties:null,viewFilter:"all"}},fetchData:function(){var e=this;this.setState({fetchingData:!0}),i["default"].all([(0,o["default"])(b).then(function(e){if(e.status>=400)throw new Error("Bad response");return e.json()}),(0,o["default"])(_).then(function(e){if(e.status>=400)throw new Error("Bad response");return e.json()}),(0,o["default"])(C).then(function(e){if(e.status>=400)throw new Error("Bad response");return e.json()}),(0,o["default"])(E).then(function(e){if(e.status>=400)throw new Error("Bad response");return e.json()})]).then(function(t){var a=t[0],r=t[1],s=t[2],o=t[3];e.setState({fetchingData:!1,fetchedData:!0,mapTopoJSON:a,userEditsTopoJSON:r,dcBoundaryTopoJSON:s,wardBoundaryTopoJSON:o}),e.setupMap()})},componentDidMount:function(){this.fetchData()},componentDidUpdate:function(){this.mapCountryLayer&&this.setCountriesStyle()},viewFilterClickHandler:function(e,t){t.preventDefault(),this.setState({viewFilter:e})},closeClickHandler:function(e){e.preventDefault(),this.setState({activeCountryProperties:null})},setCountriesStyle:function(){this.mapCountryLayer.eachLayer(this.setCountryStyle)},setCountryStyle:function(e){if(1===e.feature.properties.TYPE)return void e.setStyle(this.layerStyles.ggwashGreyGreen);if(0===e.feature.properties.TYPE)return void e.setStyle(this.layerStyles.ggwashGreenGrey);if(!e.feature.properties.GGStatus)return void e.setStyle(this.layerStyles.active);if(e.feature.properties.GGStatus%7===0||12===e.feature.properties.GGStatus)return void e.setStyle(this.layerStyles.blighted);if(5===e.feature.properties.GGStatus)return void e.setStyle(this.layerStyles.vacant);e.setStyle(this.layerStyles["default"]);var t=e.feature.properties;switch(this.state.viewFilter){case"ocds":m["default"].find(t.publishers,{ocds_ongoing_data:!0})?e.setStyle(this.layerStyles.lilac):m["default"].find(t.publishers,{ocds_historic_data:!0})?e.setStyle(this.layerStyles.orange):m["default"].find(t.publishers,{ocds_implementation:!0})&&e.setStyle(this.layerStyles.teal);break;case"commitments":t.ogp_commitments&&t.ogp_commitments.length&&e.setStyle(this.layerStyles.darkorange);break;case"contracts":t.innovations&&t.innovations.length&&e.setStyle(this.layerStyles.blue)}},onEachLayer:function(e){var t=this;this.setCountryStyle(e),e.on("click",function(a){e.feature.properties.GGStatus&&t.setState({activeCountryProperties:a.target.feature.properties})}).on("mousemove",function(a){e.feature.properties.GGStatus&&a.target.feature.properties.iso_a2!==m["default"].get(t.state.activeCountryProperties,"iso_a2","")&&a.target.setStyle(t.layerStyles.hover)}).on("mouseout",function(a){e.feature.properties.GGStatus&&a.target.feature.properties.iso_a2!==m["default"].get(t.state.activeCountryProperties,"iso_a2","")&&t.setCountryStyle(a.target)})},setupMap:function(){function e(e,t){return i["default"].all([(0,o["default"])(D,{method:"POST",headers:{Accept:"application/json","Content-Type":"application/json"},body:JSON.stringify({str:e,f:"json"})}).then(function(e){if(e.status>=400)throw new Error("Bad response");return e.json()})]).then(function(e){var a=[];e[0].returnDataset&&e[0].returnDataset.Table1&&(a=e[0].returnDataset.Table1.map(function(e){return{loc:[e.LATITUDE,e.LONGITUDE],title:e.FULLADDRESS,SSL:e.SSL}})),t(a)})}var t=p["default"].map(this.refs.mapHolder).setView([38.9072,-77.0069],13),a=p["default"].tileLayer("http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",{attribution:'<a href="https://www.mapzen.com/rights">Attribution.</a>. Data &copy;<a href="https://openstreetmap.org/copyright">OSM</a> contributors.'});t.addLayer(a);var r=p["default"].control({position:"bottomleft"});r.onAdd=function(e){return this._div=p["default"].DomUtil.create("div","info legend"),this.update(),this._div},r.update=function(e){this._div.innerHTML='<h4>DC Properties</h4><img src="assets/images/vacant.png" style="width: 10px; height: 10px"/> DC Vacant <br/><img src="assets/images/blighted.png" style="width: 10px; height: 10px"/> DC Blighted <br><img src="assets/images/blighted.png" style="width: 10px; height: 10px"/> Users'},r.addTo(t),t.addControl(new p["default"].Control.Search({sourceData:e,text:"Color...",markerLocation:!0,circleLocation:!1,markerIcon:new p["default"].Icon({iconUrl:"assets/images/marker-icon-highlight.png",iconSize:[25,41]})})),this.wardBoundaryLayer=g["default"].topojson.parse(this.state.wardBoundaryTopoJSON).eachLayer(this.onEachLayer).addTo(t),this.dcBoundaryLayer=g["default"].topojson.parse(this.state.dcBoundaryTopoJSON).eachLayer(this.onEachLayer).addTo(t),this.mapCountryLayer=g["default"].topojson.parse(this.state.mapTopoJSON).eachLayer(this.onEachLayer).addTo(t),this.mapUserLayer=g["default"].topojson.parse(this.state.userEditsTopoJSON).eachLayer(this.onEachLayer).addTo(t)},renderGGWash:function(e){var t=[];if(e.GGStatus%5===0||12===e.GGStatus){var a="Was marked as Vacant by DC in late 2015";t.push(c["default"].createElement("li",{key:"vacant"},a))}else if(e.GGStatus%7===0){var r="Was marked as Blighted by DC in late 2015";t.push(c["default"].createElement("li",{key:"blighted"},r))}return t.push(c["default"].createElement("li",{key:"addy"},"Address: ",e.PREMISEADD)),c["default"].createElement("div",null,c["default"].createElement("h3",null,"Vacant/Blighted Property"),c["default"].createElement("ul",null,t))},render:function(){var e=this;if(!this.state.fetchedData&&!this.state.fetchingData)return null;var t=this.state.activeCountryProperties;return c["default"].createElement("section",{className:"ocp-map"},c["default"].createElement("header",{className:"ocp-map__header"},c["default"].createElement("h1",{className:"ocp-map__title"},"GGWash Vacant/Blight Map"),c["default"].createElement("div",{className:"ocp-map__actions"},c["default"].createElement("span",{className:"ocp-map__actions-description"},"View to:"),c["default"].createElement(w["default"],{element:"span",className:"drop drop--down drop--align-left",triggerTitle:"View map by",triggerText:k[this.state.viewFilter],triggerClassName:"drop__toggle"},c["default"].createElement("ul",{className:"drop__menu drop__menu--select"},m["default"].map(k,function(t,a){return c["default"].createElement("li",{key:a},c["default"].createElement("a",{href:"",className:(0,f["default"])("drop__menu-item",{"drop__menu-item--active":e.state.viewFilter===a}),"data-hook":"dropdown:close",onClick:e.viewFilterClickHandler.bind(null,a)},t))}))))),c["default"].createElement("div",{className:"ocp-map__body"},c["default"].createElement("div",{className:"ocp-map__map",ref:"mapHolder"}),c["default"].createElement("div",{className:(0,f["default"])("ocp-map__content-wrapper",{"ocp-revealed":null!==t})},null!==t?c["default"].createElement("div",{className:"ocp-map__content"},c["default"].createElement("a",{href:"#",className:"ocp-map__button-close",onClick:this.closeClickHandler},c["default"].createElement("span",null,"Close map content")),this.renderGGWash(t)):null)))}});t.exports=N},{"../components/dropdown":"/Users/thadk/gitrepos/oc-map/app/assets/scripts/components/dropdown.js",bluebird:"bluebird",classnames:"classnames","isomorphic-fetch":"isomorphic-fetch",leaflet:"leaflet","leaflet-omnivore":"leaflet-omnivore","leaflet-search":"leaflet-search",lodash:"lodash",react:"react"}],"/Users/thadk/gitrepos/oc-map/app/assets/scripts/views/table-widget.js":[function(e,t,a){"use strict";function r(e){return e&&e.__esModule?e:{"default":e}}var s=e("react"),o=r(s),l=e("isomorphic-fetch"),i=r(l),n=e("lodash"),c=r(n),d=e("classnames"),p=r(d),u=o["default"].createClass({displayName:"TableWidget",getInitialState:function(){return{fetchedData:!1,fetchingData:!1,sort:{field:"country",order:"asc"},data:{}}},fetchData:function(){var e=this;this.setState({fetchingData:!0}),(0,i["default"])("https://raw.githubusercontent.com/open-contracting-partnership/ocp-data/publish/oc-status/_table.json").then(function(e){return e.json()}).then(function(t){e.setState({fetchingData:!1,fetchedData:!0,data:t})})},componentDidMount:function(){this.fetchData()},sortLinkClickHandler:function(e,t){t.preventDefault();var a=this.state.sort,r=a.field,s=a.order,o="asc";r===e&&(o="asc"===s?"desc":"asc"),this.setState({sort:{field:e,order:o}})},renderTableHead:function(){var e=this;return o["default"].createElement("thead",null,o["default"].createElement("tr",null,c["default"].map(this.state.data.meta.display,function(t){var a=(0,p["default"])("sort",{"sort--none":e.state.sort.field!==t.key,"sort--asc":e.state.sort.field===t.key&&"asc"===e.state.sort.order,"sort--desc":e.state.sort.field===t.key&&"desc"===e.state.sort.order});return o["default"].createElement("th",{key:t.key},o["default"].createElement("a",{href:"",className:a,onClick:e.sortLinkClickHandler.bind(null,t.key)},t.value))})))},renderTableBody:function(){var e=this,t=(0,c["default"])(this.state.data.data).sortBy(this.state.sort.field);return"desc"===this.state.sort.order&&(t=t.reverse()),t=t.value(),o["default"].createElement("tbody",null,c["default"].map(t,function(t,a){return o["default"].createElement("tr",{key:"tr-"+a+"-"+c["default"].kebabCase(t.country)},c["default"].map(e.state.data.meta.display,function(e){return o["default"].createElement("td",{key:"tr-"+a+"-td-"+c["default"].kebabCase(e.key)},t[e.key])}))}))},render:function(){return this.state.fetchedData||this.state.fetchingData?o["default"].createElement("section",{className:"ocp-table"},o["default"].createElement("header",{className:"ocp-table__header"},o["default"].createElement("h1",{className:"ocp-table__title"},"Open Contracting Table")),o["default"].createElement("div",{className:"ocp-table__body"},this.state.fetchingData?o["default"].createElement("p",null,"Loading data..."):o["default"].createElement("table",{className:"ocp-table__table"},this.renderTableHead(),this.renderTableBody()))):null}});t.exports=u},{classnames:"classnames","isomorphic-fetch":"isomorphic-fetch",lodash:"lodash",react:"react"}]},{},["/Users/thadk/gitrepos/oc-map/app/assets/scripts/main.js"]);