function t(t,e,i,s){var o,r=arguments.length,n=r<3?e:null===s?s=Object.getOwnPropertyDescriptor(e,i):s;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)n=Reflect.decorate(t,e,i,s);else for(var a=t.length-1;a>=0;a--)(o=t[a])&&(n=(r<3?o(n):r>3?o(e,i,n):o(e,i))||n);return r>3&&n&&Object.defineProperty(e,i,n),n}"function"==typeof SuppressedError&&SuppressedError;const e=globalThis,i=e.ShadowRoot&&(void 0===e.ShadyCSS||e.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,s=Symbol(),o=new WeakMap;let r=class{constructor(t,e,i){if(this._$cssResult$=!0,i!==s)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e}get styleSheet(){let t=this.o;const e=this.t;if(i&&void 0===t){const i=void 0!==e&&1===e.length;i&&(t=o.get(e)),void 0===t&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),i&&o.set(e,t))}return t}toString(){return this.cssText}};const n=t=>new r("string"==typeof t?t:t+"",void 0,s),a=(t,...e)=>{const i=1===t.length?t[0]:e.reduce((e,i,s)=>e+(t=>{if(!0===t._$cssResult$)return t.cssText;if("number"==typeof t)return t;throw Error("Value passed to 'css' function must be a 'css' function result: "+t+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+t[s+1],t[0]);return new r(i,t,s)},l=i?t=>t:t=>t instanceof CSSStyleSheet?(t=>{let e="";for(const i of t.cssRules)e+=i.cssText;return n(e)})(t):t,{is:c,defineProperty:h,getOwnPropertyDescriptor:p,getOwnPropertyNames:d,getOwnPropertySymbols:u,getPrototypeOf:m}=Object,g=globalThis,v=g.trustedTypes,f=v?v.emptyScript:"",_=g.reactiveElementPolyfillSupport,y=(t,e)=>t,b={toAttribute(t,e){switch(e){case Boolean:t=t?f:null;break;case Object:case Array:t=null==t?t:JSON.stringify(t)}return t},fromAttribute(t,e){let i=t;switch(e){case Boolean:i=null!==t;break;case Number:i=null===t?null:Number(t);break;case Object:case Array:try{i=JSON.parse(t)}catch(t){i=null}}return i}},$=(t,e)=>!c(t,e),w={attribute:!0,type:String,converter:b,reflect:!1,useDefault:!1,hasChanged:$};Symbol.metadata??=Symbol("metadata"),g.litPropertyMetadata??=new WeakMap;let x=class extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,e=w){if(e.state&&(e.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(t)&&((e=Object.create(e)).wrapped=!0),this.elementProperties.set(t,e),!e.noAccessor){const i=Symbol(),s=this.getPropertyDescriptor(t,i,e);void 0!==s&&h(this.prototype,t,s)}}static getPropertyDescriptor(t,e,i){const{get:s,set:o}=p(this.prototype,t)??{get(){return this[e]},set(t){this[e]=t}};return{get:s,set(e){const r=s?.call(this);o?.call(this,e),this.requestUpdate(t,r,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??w}static _$Ei(){if(this.hasOwnProperty(y("elementProperties")))return;const t=m(this);t.finalize(),void 0!==t.l&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty(y("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(y("properties"))){const t=this.properties,e=[...d(t),...u(t)];for(const i of e)this.createProperty(i,t[i])}const t=this[Symbol.metadata];if(null!==t){const e=litPropertyMetadata.get(t);if(void 0!==e)for(const[t,i]of e)this.elementProperties.set(t,i)}this._$Eh=new Map;for(const[t,e]of this.elementProperties){const i=this._$Eu(t,e);void 0!==i&&this._$Eh.set(i,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){const e=[];if(Array.isArray(t)){const i=new Set(t.flat(1/0).reverse());for(const t of i)e.unshift(l(t))}else void 0!==t&&e.push(l(t));return e}static _$Eu(t,e){const i=e.attribute;return!1===i?void 0:"string"==typeof i?i:"string"==typeof t?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this))}addController(t){(this._$EO??=new Set).add(t),void 0!==this.renderRoot&&this.isConnected&&t.hostConnected?.()}removeController(t){this._$EO?.delete(t)}_$E_(){const t=new Map,e=this.constructor.elementProperties;for(const i of e.keys())this.hasOwnProperty(i)&&(t.set(i,this[i]),delete this[i]);t.size>0&&(this._$Ep=t)}createRenderRoot(){const t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return((t,s)=>{if(i)t.adoptedStyleSheets=s.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(const i of s){const s=document.createElement("style"),o=e.litNonce;void 0!==o&&s.setAttribute("nonce",o),s.textContent=i.cssText,t.appendChild(s)}})(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(t=>t.hostConnected?.())}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach(t=>t.hostDisconnected?.())}attributeChangedCallback(t,e,i){this._$AK(t,i)}_$ET(t,e){const i=this.constructor.elementProperties.get(t),s=this.constructor._$Eu(t,i);if(void 0!==s&&!0===i.reflect){const o=(void 0!==i.converter?.toAttribute?i.converter:b).toAttribute(e,i.type);this._$Em=t,null==o?this.removeAttribute(s):this.setAttribute(s,o),this._$Em=null}}_$AK(t,e){const i=this.constructor,s=i._$Eh.get(t);if(void 0!==s&&this._$Em!==s){const t=i.getPropertyOptions(s),o="function"==typeof t.converter?{fromAttribute:t.converter}:void 0!==t.converter?.fromAttribute?t.converter:b;this._$Em=s;const r=o.fromAttribute(e,t.type);this[s]=r??this._$Ej?.get(s)??r,this._$Em=null}}requestUpdate(t,e,i,s=!1,o){if(void 0!==t){const r=this.constructor;if(!1===s&&(o=this[t]),i??=r.getPropertyOptions(t),!((i.hasChanged??$)(o,e)||i.useDefault&&i.reflect&&o===this._$Ej?.get(t)&&!this.hasAttribute(r._$Eu(t,i))))return;this.C(t,e,i)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(t,e,{useDefault:i,reflect:s,wrapped:o},r){i&&!(this._$Ej??=new Map).has(t)&&(this._$Ej.set(t,r??e??this[t]),!0!==o||void 0!==r)||(this._$AL.has(t)||(this.hasUpdated||i||(e=void 0),this._$AL.set(t,e)),!0===s&&this._$Em!==t&&(this._$Eq??=new Set).add(t))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(t){Promise.reject(t)}const t=this.scheduleUpdate();return null!=t&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[t,e]of this._$Ep)this[t]=e;this._$Ep=void 0}const t=this.constructor.elementProperties;if(t.size>0)for(const[e,i]of t){const{wrapped:t}=i,s=this[e];!0!==t||this._$AL.has(e)||void 0===s||this.C(e,void 0,i,s)}}let t=!1;const e=this._$AL;try{t=this.shouldUpdate(e),t?(this.willUpdate(e),this._$EO?.forEach(t=>t.hostUpdate?.()),this.update(e)):this._$EM()}catch(e){throw t=!1,this._$EM(),e}t&&this._$AE(e)}willUpdate(t){}_$AE(t){this._$EO?.forEach(t=>t.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return!0}update(t){this._$Eq&&=this._$Eq.forEach(t=>this._$ET(t,this[t])),this._$EM()}updated(t){}firstUpdated(t){}};x.elementStyles=[],x.shadowRootOptions={mode:"open"},x[y("elementProperties")]=new Map,x[y("finalized")]=new Map,_?.({ReactiveElement:x}),(g.reactiveElementVersions??=[]).push("2.1.2");const k=globalThis,S=t=>t,A=k.trustedTypes,T=A?A.createPolicy("lit-html",{createHTML:t=>t}):void 0,E="$lit$",C=`lit$${Math.random().toFixed(9).slice(2)}$`,P="?"+C,M=`<${P}>`,O=document,z=()=>O.createComment(""),H=t=>null===t||"object"!=typeof t&&"function"!=typeof t,U=Array.isArray,N="[ \t\n\f\r]",F=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,R=/-->/g,I=/>/g,L=RegExp(`>|${N}(?:([^\\s"'>=/]+)(${N}*=${N}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),j=/'/g,D=/"/g,q=/^(?:script|style|textarea|title)$/i,B=t=>(e,...i)=>({_$litType$:t,strings:e,values:i}),G=B(1),W=B(2),K=Symbol.for("lit-noChange"),V=Symbol.for("lit-nothing"),J=new WeakMap,Z=O.createTreeWalker(O,129);function X(t,e){if(!U(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==T?T.createHTML(e):e}const Y=(t,e)=>{const i=t.length-1,s=[];let o,r=2===e?"<svg>":3===e?"<math>":"",n=F;for(let e=0;e<i;e++){const i=t[e];let a,l,c=-1,h=0;for(;h<i.length&&(n.lastIndex=h,l=n.exec(i),null!==l);)h=n.lastIndex,n===F?"!--"===l[1]?n=R:void 0!==l[1]?n=I:void 0!==l[2]?(q.test(l[2])&&(o=RegExp("</"+l[2],"g")),n=L):void 0!==l[3]&&(n=L):n===L?">"===l[0]?(n=o??F,c=-1):void 0===l[1]?c=-2:(c=n.lastIndex-l[2].length,a=l[1],n=void 0===l[3]?L:'"'===l[3]?D:j):n===D||n===j?n=L:n===R||n===I?n=F:(n=L,o=void 0);const p=n===L&&t[e+1].startsWith("/>")?" ":"";r+=n===F?i+M:c>=0?(s.push(a),i.slice(0,c)+E+i.slice(c)+C+p):i+C+(-2===c?e:p)}return[X(t,r+(t[i]||"<?>")+(2===e?"</svg>":3===e?"</math>":"")),s]};class Q{constructor({strings:t,_$litType$:e},i){let s;this.parts=[];let o=0,r=0;const n=t.length-1,a=this.parts,[l,c]=Y(t,e);if(this.el=Q.createElement(l,i),Z.currentNode=this.el.content,2===e||3===e){const t=this.el.content.firstChild;t.replaceWith(...t.childNodes)}for(;null!==(s=Z.nextNode())&&a.length<n;){if(1===s.nodeType){if(s.hasAttributes())for(const t of s.getAttributeNames())if(t.endsWith(E)){const e=c[r++],i=s.getAttribute(t).split(C),n=/([.?@])?(.*)/.exec(e);a.push({type:1,index:o,name:n[2],strings:i,ctor:"."===n[1]?ot:"?"===n[1]?rt:"@"===n[1]?nt:st}),s.removeAttribute(t)}else t.startsWith(C)&&(a.push({type:6,index:o}),s.removeAttribute(t));if(q.test(s.tagName)){const t=s.textContent.split(C),e=t.length-1;if(e>0){s.textContent=A?A.emptyScript:"";for(let i=0;i<e;i++)s.append(t[i],z()),Z.nextNode(),a.push({type:2,index:++o});s.append(t[e],z())}}}else if(8===s.nodeType)if(s.data===P)a.push({type:2,index:o});else{let t=-1;for(;-1!==(t=s.data.indexOf(C,t+1));)a.push({type:7,index:o}),t+=C.length-1}o++}}static createElement(t,e){const i=O.createElement("template");return i.innerHTML=t,i}}function tt(t,e,i=t,s){if(e===K)return e;let o=void 0!==s?i._$Co?.[s]:i._$Cl;const r=H(e)?void 0:e._$litDirective$;return o?.constructor!==r&&(o?._$AO?.(!1),void 0===r?o=void 0:(o=new r(t),o._$AT(t,i,s)),void 0!==s?(i._$Co??=[])[s]=o:i._$Cl=o),void 0!==o&&(e=tt(t,o._$AS(t,e.values),o,s)),e}class et{constructor(t,e){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){const{el:{content:e},parts:i}=this._$AD,s=(t?.creationScope??O).importNode(e,!0);Z.currentNode=s;let o=Z.nextNode(),r=0,n=0,a=i[0];for(;void 0!==a;){if(r===a.index){let e;2===a.type?e=new it(o,o.nextSibling,this,t):1===a.type?e=new a.ctor(o,a.name,a.strings,this,t):6===a.type&&(e=new at(o,this,t)),this._$AV.push(e),a=i[++n]}r!==a?.index&&(o=Z.nextNode(),r++)}return Z.currentNode=O,s}p(t){let e=0;for(const i of this._$AV)void 0!==i&&(void 0!==i.strings?(i._$AI(t,i,e),e+=i.strings.length-2):i._$AI(t[e])),e++}}class it{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,e,i,s){this.type=2,this._$AH=V,this._$AN=void 0,this._$AA=t,this._$AB=e,this._$AM=i,this.options=s,this._$Cv=s?.isConnected??!0}get parentNode(){let t=this._$AA.parentNode;const e=this._$AM;return void 0!==e&&11===t?.nodeType&&(t=e.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,e=this){t=tt(this,t,e),H(t)?t===V||null==t||""===t?(this._$AH!==V&&this._$AR(),this._$AH=V):t!==this._$AH&&t!==K&&this._(t):void 0!==t._$litType$?this.$(t):void 0!==t.nodeType?this.T(t):(t=>U(t)||"function"==typeof t?.[Symbol.iterator])(t)?this.k(t):this._(t)}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}_(t){this._$AH!==V&&H(this._$AH)?this._$AA.nextSibling.data=t:this.T(O.createTextNode(t)),this._$AH=t}$(t){const{values:e,_$litType$:i}=t,s="number"==typeof i?this._$AC(t):(void 0===i.el&&(i.el=Q.createElement(X(i.h,i.h[0]),this.options)),i);if(this._$AH?._$AD===s)this._$AH.p(e);else{const t=new et(s,this),i=t.u(this.options);t.p(e),this.T(i),this._$AH=t}}_$AC(t){let e=J.get(t.strings);return void 0===e&&J.set(t.strings,e=new Q(t)),e}k(t){U(this._$AH)||(this._$AH=[],this._$AR());const e=this._$AH;let i,s=0;for(const o of t)s===e.length?e.push(i=new it(this.O(z()),this.O(z()),this,this.options)):i=e[s],i._$AI(o),s++;s<e.length&&(this._$AR(i&&i._$AB.nextSibling,s),e.length=s)}_$AR(t=this._$AA.nextSibling,e){for(this._$AP?.(!1,!0,e);t!==this._$AB;){const e=S(t).nextSibling;S(t).remove(),t=e}}setConnected(t){void 0===this._$AM&&(this._$Cv=t,this._$AP?.(t))}}class st{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,e,i,s,o){this.type=1,this._$AH=V,this._$AN=void 0,this.element=t,this.name=e,this._$AM=s,this.options=o,i.length>2||""!==i[0]||""!==i[1]?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=V}_$AI(t,e=this,i,s){const o=this.strings;let r=!1;if(void 0===o)t=tt(this,t,e,0),r=!H(t)||t!==this._$AH&&t!==K,r&&(this._$AH=t);else{const s=t;let n,a;for(t=o[0],n=0;n<o.length-1;n++)a=tt(this,s[i+n],e,n),a===K&&(a=this._$AH[n]),r||=!H(a)||a!==this._$AH[n],a===V?t=V:t!==V&&(t+=(a??"")+o[n+1]),this._$AH[n]=a}r&&!s&&this.j(t)}j(t){t===V?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}}class ot extends st{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===V?void 0:t}}class rt extends st{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==V)}}class nt extends st{constructor(t,e,i,s,o){super(t,e,i,s,o),this.type=5}_$AI(t,e=this){if((t=tt(this,t,e,0)??V)===K)return;const i=this._$AH,s=t===V&&i!==V||t.capture!==i.capture||t.once!==i.once||t.passive!==i.passive,o=t!==V&&(i===V||s);s&&this.element.removeEventListener(this.name,this,i),o&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t)}}class at{constructor(t,e,i){this.element=t,this.type=6,this._$AN=void 0,this._$AM=e,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(t){tt(this,t)}}const lt=k.litHtmlPolyfillSupport;lt?.(Q,it),(k.litHtmlVersions??=[]).push("3.3.3");const ct=globalThis;class ht extends x{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){const e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=((t,e,i)=>{const s=i?.renderBefore??e;let o=s._$litPart$;if(void 0===o){const t=i?.renderBefore??null;s._$litPart$=o=new it(e.insertBefore(z(),t),t,void 0,i??{})}return o._$AI(t),o})(e,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return K}}ht._$litElement$=!0,ht.finalized=!0,ct.litElementHydrateSupport?.({LitElement:ht});const pt=ct.litElementPolyfillSupport;pt?.({LitElement:ht}),(ct.litElementVersions??=[]).push("4.2.2");const dt={attribute:!0,type:String,converter:b,reflect:!1,hasChanged:$},ut=(t=dt,e,i)=>{const{kind:s,metadata:o}=i;let r=globalThis.litPropertyMetadata.get(o);if(void 0===r&&globalThis.litPropertyMetadata.set(o,r=new Map),"setter"===s&&((t=Object.create(t)).wrapped=!0),r.set(i.name,t),"accessor"===s){const{name:s}=i;return{set(i){const o=e.get.call(this);e.set.call(this,i),this.requestUpdate(s,o,t,!0,i)},init(e){return void 0!==e&&this.C(s,void 0,t,e),e}}}if("setter"===s){const{name:s}=i;return function(i){const o=this[s];e.call(this,i),this.requestUpdate(s,o,t,!0,i)}}throw Error("Unsupported decorator location: "+s)};function mt(t){return(e,i)=>"object"==typeof i?ut(t,e,i):((t,e,i)=>{const s=e.hasOwnProperty(i);return e.constructor.createProperty(i,t),s?Object.getOwnPropertyDescriptor(e,i):void 0})(t,e,i)}function gt(t){return mt({...t,state:!0,attribute:!1})}const vt="material-plant-card",ft="Material Plant Card",_t=["moisture","conductivity","temperature","illuminance","humidity","dli","dli_24h","co2","soil_temperature","vpd"],yt=["moisture","conductivity","temperature","illuminance","humidity","dli"],bt={moisture:"Moisture",conductivity:"Conductivity",temperature:"Temperature",illuminance:"Illuminance",humidity:"Air humidity",dli:"DLI",dli_24h:"DLI (24h)",co2:"CO₂",soil_temperature:"Soil temperature",vpd:"VPD"},$t={moisture:"mdi:water",conductivity:"mdi:spa-outline",temperature:"mdi:thermometer",illuminance:"mdi:brightness-6",humidity:"mdi:water-percent",dli:"mdi:counter",dli_24h:"mdi:counter",co2:"mdi:molecule-co2",soil_temperature:"mdi:thermometer-probe",vpd:"mdi:water-thermometer-outline"};function wt(t){if(Object.prototype.hasOwnProperty.call(bt,t))return bt[t];const e=t.replace(/_/g," ");return e.charAt(0).toUpperCase()+e.slice(1)}function xt(t){if("number"!=typeof t&&"string"!=typeof t)return null;if("string"==typeof t&&""===t.trim())return null;const e=Number(t);return Number.isFinite(e)?e:null}function kt(t,e,i){return null===t||null===e||null===i||e>=i?"unknown":t<e?"low":t>i?"high":"ok"}function St(t,e,i,s){if(null===t||null===e||null===i||e>=i)return null;let o=(t-e)/(i-e);return"lx"===s&&e>0&&(o=t<=0?-1/0:(Math.log(t)-Math.log(e))/(Math.log(i)-Math.log(e))),Math.max(0,Math.min(1,.2+.6*o))}function At(t,e,i){const s=[];for(const o of new Set(e)){if(!t||!Object.prototype.hasOwnProperty.call(t,o))continue;const e=t[o];if(!e)continue;const r=e.sensor||void 0,n=r?i[r]:void 0;if(r&&!n)continue;const a=xt(n?n.state:e.current),l=xt(e.min),c=xt(e.max),h=String(n?.attributes.unit_of_measurement??e.unit_of_measurement??""),p=Object.prototype.hasOwnProperty.call($t,o)?$t[o]:"mdi:help-circle-outline",d="string"==typeof e.icon&&e.icon.length>0?e.icon:p;s.push({key:o,label:wt(o),sensor:r,icon:d,unit:h,value:a,min:l,max:c,status:kt(a,l,c),fraction:St(a,l,c,h)})}return s}function Tt(t,e){const[i,s="0"]=String(Math.abs(t)).split("e"),o=Number(`${i}e${Number(s)+e}`);return Math.sign(t)*Math.round(o)/10**e}function Et(t,e,i=!1){if(null===t)return"—";const s=Math.abs(t);let o;return o=s>=1e4?`${Tt(t/1e3,0)}k`:s>=1e3?`${Tt(t/1e3,1)}k`:String(Tt(t,s>=100?0:s>=10?1:2)),o+(i?"":"%"===e?"%":["°C","°F","°"].includes(e)?"°":"")}function Ct(t){const e=t.unit?` ${t.unit}`:"",i=null===t.value?"—":String(t.value),s=null===t.min||null===t.max?"":` (${String(t.min)}–${String(t.max)}${e})`,o="low"===t.status||"high"===t.status?` · ${t.status}`:"";return`${t.label}: ${i}${e}${s}${o}`.replace(/ {2,}/g," ")}function Pt(t,e){return"unknown"===t.status?"unknown":"ok"===t.status?"ok":e.some(e=>e.key===t.key)?"problem":"advisory"}const Mt=()=>_t.map(t=>({value:t,label:bt[t]})),Ot={entity:"Plant entity",name:"Name",battery_sensor:"Battery sensor",display_type:"Display type",show_bars:"Gauges",hide_units:"Hide units",hide_history:"Hide 24-hour history",problem_source:"Problem source",problem_sensors:"Problem sensors",hide_species:"Hide species",hide_image:"Hide image",image:"Image",battery_warn_level:"Battery low below"},zt={hide_units:"Hides units next to values.",hide_history:"Full mode only: skips the last-24-hours range and average.",show_bars:`Default: ${yt.map(t=>bt[t]).join(", ")}.`,problem_source:"Plant monitor follows the integration's problem triggers; Gauges flags any out-of-range value.",problem_sensors:"Leave empty to allow every sensor.",image:"Overrides the plant picture.",battery_warn_level:"Battery turns red below this level (default 10%)."};const Ht={schema:[{name:"entity",required:!0,selector:{entity:{domain:"plant"}}},{name:"name",selector:{text:{}}},{name:"battery_sensor",selector:{entity:{domain:"sensor",device_class:"battery"}}},{name:"display_type",selector:{select:{mode:"dropdown",options:[{value:"full",label:"Full (metric tiles)"},{value:"compact",label:"Compact (gauges)"}]}}},{type:"expandable",name:"",title:"Metrics",icon:"mdi:gauge",flatten:!0,schema:[{name:"show_bars",selector:{select:{multiple:!0,reorder:!0,mode:"list",options:Mt()}}},{name:"hide_units",selector:{boolean:{}}},{name:"hide_history",selector:{boolean:{}}}]},{type:"expandable",name:"",title:"Problems",icon:"mdi:alert-circle-outline",flatten:!0,schema:[{name:"problem_source",selector:{select:{mode:"dropdown",options:[{value:"plant",label:"Plant monitor (integration problem triggers)"},{value:"gauges",label:"Gauges (any out-of-range value)"}]}}},{name:"problem_sensors",selector:{select:{multiple:!0,mode:"list",options:Mt()}}}]},{type:"expandable",name:"",title:"Appearance",icon:"mdi:palette-outline",flatten:!0,schema:[{name:"hide_species",selector:{boolean:{}}},{name:"hide_image",selector:{boolean:{}}},{name:"image",selector:{text:{}}},{name:"battery_warn_level",selector:{number:{min:0,max:100,step:1,mode:"box",unit_of_measurement:"%"}}}]}],computeLabel:t=>Object.prototype.hasOwnProperty.call(Ot,t.name)?Ot[t.name]:void 0,computeHelper:t=>Object.prototype.hasOwnProperty.call(zt,t.name)?zt[t.name]:void 0,assertConfig:t=>{if(null!=t.entity&&("string"!=typeof t.entity||!t.entity.startsWith("plant.")))throw new Error("Specify a plant entity")}},Ut=a`
  :host {
    --mpl-primary: var(--md-sys-color-primary, var(--primary-color, #6750a4));
    --mpl-on-primary: var(--md-sys-color-on-primary, #ffffff);
    --mpl-primary-container: var(--md-sys-color-primary-container, rgba(103, 80, 164, 0.16));
    --mpl-on-primary-container: var(--md-sys-color-on-primary-container, var(--primary-text-color, #21005d));
    --mpl-secondary-container: var(--md-sys-color-secondary-container, rgba(103, 80, 164, 0.14));
    --mpl-on-secondary-container: var(--md-sys-color-on-secondary-container, var(--primary-text-color, #1d192b));
    --mpl-tertiary: var(--md-sys-color-tertiary, #7d5260);
    --mpl-success: var(--md-sys-color-success, var(--success-color, #4caf50));
    --mpl-error: var(--md-sys-color-error, var(--error-color, #b3261e));
    --mpl-on-error: var(--md-sys-color-on-error, #ffffff);
    --mpl-error-container: var(--md-sys-color-error-container, #f9dedc);
    --mpl-on-error-container: var(--md-sys-color-on-error-container, #410e0b);
    --mpl-surface: var(--md-sys-color-surface, var(--card-background-color, #fef7ff));
    --mpl-surface-bg: var(--ha-card-background, var(--card-background-color, #f3edf7));
    --mpl-surface-container: var(--md-sys-color-surface-container, color-mix(in srgb, var(--mpl-on-surface) 8%, var(--mpl-surface-bg)));
    --mpl-surface-container-high: var(--md-sys-color-surface-container-high, color-mix(in srgb, var(--mpl-on-surface) 11%, var(--mpl-surface-bg)));
    --mpl-surface-container-highest: var(--md-sys-color-surface-container-highest, color-mix(in srgb, var(--mpl-on-surface) 14%, var(--mpl-surface-bg)));
    --mpl-on-surface: var(--md-sys-color-on-surface, var(--primary-text-color, #1c1b1f));
    --mpl-inverse-surface: var(--md-sys-color-inverse-surface, #313033);
    --mpl-inverse-on-surface: var(--md-sys-color-inverse-on-surface, #f4eff4);
    --mpl-on-surface-variant: var(--md-sys-color-on-surface-variant, var(--secondary-text-color, #49454f));
    --mpl-outline: var(--md-sys-color-outline, var(--divider-color, #79747e));
    --mpl-outline-variant: var(--md-sys-color-outline-variant, var(--divider-color, #cac4d0));
    --mpl-shape-card: var(--md-sys-shape-corner-extra-large, 28px);
    --mpl-shape-full: var(--md-sys-shape-corner-full, 9999px);
  }
`,Nt=[{name:"low",start:135,end:185},{name:"ok",start:193,end:347},{name:"high",start:355,end:405}];function Ft(t,e,i,s){const o=s*Math.PI/180;return{x:t+i*Math.cos(o),y:e+i*Math.sin(o)}}function Rt(t,e,i,s,o){const r=Ft(t,e,i,s),n=Ft(t,e,i,o),a=o-s>180?1:0;return`M ${r.x} ${r.y} A ${i} ${i} 0 ${a} 1 ${n.x} ${n.y}`}class It extends ht{constructor(){super(...arguments),this.fraction=null,this.tone="unknown",this.icon="",this.value="",this.label="",this.embedded=!1}render(){const t=this.fraction,e=null!==t&&"unknown"!==this.tone,i=135+270*(t??0),s=Ft(24,24,20,i);return G`
      <div
        class="gauge"
        role=${this.embedded?V:"meter"}
        aria-label=${this.embedded?V:this.label}
        aria-valuemin=${this.embedded?V:"0"}
        aria-valuemax=${this.embedded?V:"100"}
        aria-valuenow=${this.embedded||null===t?V:Math.round(100*t)}
        aria-valuetext=${this.embedded?V:this.label}
      >
        <div class="dial">
          <svg viewBox="0 0 48 48" aria-hidden="true" focusable="false">
            ${W`
              ${Nt.map(t=>W`
                <path class=${`track-${t.name}`} d=${Rt(24,24,20,t.start,t.end)}></path>
              `)}
              ${e?Nt.map(t=>{if(i<=t.start)return V;const e=Rt(24,24,20,t.start,Math.min(t.end,i));return W`
                  <path class=${`active active-${t.name}`} d=${e} style=${`d: path('${e}')`}></path>
                `}):V}
              ${e?W`
                <circle class="dot" cx=${s.x} cy=${s.y} r="3.5"
                  style=${`cx: ${s.x}px; cy: ${s.y}px;`}></circle>
              `:V}
            `}
          </svg>
          <ha-icon icon=${this.icon} aria-hidden="true"></ha-icon>
        </div>
        ${""!==this.value?G`<div class="value">${this.value}</div>`:V}
      </div>
    `}}It.styles=[Ut,a`
      :host {
        --mpl-gauge-size: 44px;
        --mpl-gauge-icon-size: 18px;
        --mpl-gauge-value-size: 12px;
        --mpl-gauge-value-line: 16px;
        --mpl-gauge-track-width: ${4};
        --mpl-gauge-outer-track-width: 2;
        --mpl-gauge-dot-stroke: 2;
        --mpl-gauge-tone: var(--mpl-success);
        --mpl-gauge-motion: var(
          --md-sys-motion-expressive-spatial-default,
          500ms cubic-bezier(0.38, 1.21, 0.22, 1)
        );
        display: inline-grid;
        justify-items: center;
        min-width: 0;
        max-width: 100%;
      }
      :host([tone='advisory']) {
        --mpl-gauge-tone: var(--mpl-on-surface-variant);
      }
      :host([tone='problem']) {
        --mpl-gauge-tone: var(--mpl-error);
      }
      .gauge {
        display: grid;
        justify-items: center;
        min-width: 0;
        max-width: 100%;
      }
      .dial {
        position: relative;
        display: grid;
        place-items: center;
        width: var(--mpl-gauge-size);
        height: var(--mpl-gauge-size);
      }
      svg,
      ha-icon {
        grid-area: 1 / 1;
      }
      svg {
        width: 100%;
        height: 100%;
        overflow: visible;
      }
      path {
        fill: none;
        stroke-width: var(--mpl-gauge-track-width);
        stroke-linecap: round;
      }
      .track-low,
      .track-high,
      .active-low,
      .active-high {
        stroke-width: var(--mpl-gauge-outer-track-width);
      }
      .track-low,
      .track-high {
        stroke: var(--mpl-outline-variant);
      }
      .track-ok {
        stroke: var(--mpl-secondary-container);
      }
      .active {
        stroke: var(--mpl-gauge-tone);
        transition: d var(--mpl-gauge-motion), stroke var(--mpl-gauge-motion);
      }
      .dot {
        fill: var(--mpl-gauge-tone);
        stroke: var(--mpl-surface-bg);
        stroke-width: var(--mpl-gauge-dot-stroke);
        transition: cx var(--mpl-gauge-motion), cy var(--mpl-gauge-motion),
          fill var(--mpl-gauge-motion);
      }
      ha-icon {
        --mdc-icon-size: var(--mpl-gauge-icon-size);
        position: absolute;
        top: ${50}%;
        left: 50%;
        transform: translate(-50%, -50%);
        display: flex;
        align-items: center;
        justify-content: center;
        line-height: 0;
        width: var(--mpl-gauge-icon-size);
        height: var(--mpl-gauge-icon-size);
        color: var(--mpl-on-surface-variant);
      }
      .value {
        font-weight: 400;
        font-size: var(--mpl-gauge-value-size);
        line-height: var(--mpl-gauge-value-line);
        color: var(--mpl-on-surface);
        max-width: 100%;
        overflow-wrap: anywhere;
        text-align: center;
      }
      :host([tone='problem']) ha-icon,
      :host([tone='problem']) .value {
        color: var(--mpl-error);
      }
      :host([tone='problem']) .value {
        font-weight: 700;
      }
      @media (prefers-reduced-motion: reduce) {
        .active,
        .dot {
          transition: none;
        }
      }
    `],t([mt({type:Number})],It.prototype,"fraction",void 0),t([mt({reflect:!0})],It.prototype,"tone",void 0),t([mt()],It.prototype,"icon",void 0),t([mt()],It.prototype,"value",void 0),t([mt()],It.prototype,"label",void 0),t([mt({type:Boolean,attribute:"embedded"})],It.prototype,"embedded",void 0),customElements.get("mpl-gauge")||customElements.define("mpl-gauge",It);let Lt=0;class jt extends ht{constructor(){super(...arguments),this.level=null,this.tone="unknown",this.clipId="mpl-battery-"+ ++Lt}render(){const t=null===this.level||Number.isNaN(this.level)?null:Math.round(Math.min(100,Math.max(0,this.level))),e=26*(t??0)/100,i=`${this.clipId}-body`,s=`${this.clipId}-filled`,o=`${this.clipId}-unfilled`;return G`
      <svg viewBox="0 0 30 15" aria-hidden="true" focusable="false">
        ${W`
          <defs>
            <clipPath id=${i} clipPathUnits="userSpaceOnUse">
              <rect x="0.5" y="0.5" width="26" height="14" rx="4"></rect>
            </clipPath>
            <clipPath id=${s} clipPathUnits="userSpaceOnUse">
              <rect x="0.5" y="0.5" width=${e} height="14"></rect>
            </clipPath>
            <clipPath id=${o} clipPathUnits="userSpaceOnUse">
              <rect x=${.5+e} y="0.5" width=${26-e} height="14"></rect>
            </clipPath>
          </defs>
          <rect class="track" x="0.5" y="0.5" width="26" height="14" rx="4"
            fill="currentColor"></rect>
          <rect class="nub" x="27.5" y="4.5" width="2" height="6" rx="1"
            fill="currentColor" opacity=${100===t?"1":"var(--mpl-battery-track-opacity)"}></rect>
          ${null!==t&&t>0?W`
            <rect class="level-fill" x="0.5" y="0.5" width=${e} height="14"
              fill="currentColor" clip-path=${`url(#${i})`}></rect>
          `:V}
          ${null===t?W`
            <text x="13.5" y="7.5" text-anchor="middle" dominant-baseline="central"
              fill="var(--mpl-on-surface-variant)">?</text>
          `:W`
            <text class="number-filled" x="13.5" y="7.5" text-anchor="middle"
              dominant-baseline="central" clip-path=${`url(#${s})`}>${t}</text>
            <text x="13.5" y="7.5" text-anchor="middle" dominant-baseline="central"
              fill="currentColor" clip-path=${`url(#${o})`}>${t}</text>
          `}
        `}
      </svg>
    `}}function Dt(t){let e=1/0,i=-1/0,s=0,o=0;for(const r of t??[])"number"==typeof r.min&&Number.isFinite(r.min)&&"number"==typeof r.max&&Number.isFinite(r.max)&&"number"==typeof r.mean&&Number.isFinite(r.mean)&&(e=Math.min(e,r.min),i=Math.max(i,r.max),s+=r.mean,o++);return o?{min:e,max:i,mean:s/o}:null}jt.styles=a`
    :host {
      --mpl-battery-width: 30px;
      --mpl-battery-height: 15px;
      --mpl-battery-number-size: 10px;
      --mpl-battery-number-weight: 700;
      --mpl-battery-track-opacity: 0.3;
      display: inline-block;
      width: var(--mpl-battery-width);
      height: var(--mpl-battery-height);
      color: var(--mpl-outline);
    }
    :host([tone='ok']) {
      color: var(--mpl-on-surface-variant);
    }
    :host([tone='low']) {
      color: var(--mpl-error);
    }
    svg {
      display: block;
      width: 100%;
      height: 100%;
    }
    text {
      font-family: inherit;
      font-size: var(--mpl-battery-number-size);
      font-weight: var(--mpl-battery-number-weight);
      font-variant-numeric: tabular-nums;
    }
    .number-filled {
      fill: var(--mpl-surface-bg);
    }
    .track {
      opacity: var(--mpl-battery-track-opacity);
    }
  `,t([mt({type:Number})],jt.prototype,"level",void 0),t([mt({reflect:!0})],jt.prototype,"tone",void 0),customElements.get("mpl-battery")||customElements.define("mpl-battery",jt);class qt extends ht{constructor(){super(...arguments),this.value=null,this.tone="unknown",this.spanFrom=null,this.spanTo=null,this.avg=null,this.avgOk=null,this.showTicks=!1}connectedCallback(){super.connectedCallback(),this.setAttribute("aria-hidden","true")}render(){const t="unknown"!==this.tone,e=this.spanFrom,i=this.spanTo,s=null!==e&&null!==i?100*Math.abs(i-e):0,o=null!==e&&null!==i?(e+i)/2*100:0,r=null===this.avgOk?"var(--mpl-on-surface-variant)":this.avgOk?"var(--mpl-success)":"var(--mpl-error)";return G`
      <div class="track"></div>
      ${this.showTicks?G`
        <div class="tick tick-low"></div>
        <div class="tick tick-high"></div>
      `:V}
      ${t&&null!==e&&null!==i?G`
        <div class="span" style=${`left: calc(${o}% - max(${s}%, 8px) / 2); width: max(${s}%, 8px); background: ${function(t,e){const i="var(--mpl-success)",s="var(--mpl-error)",o=t=>t<.2||t>.8?s:i;if(t===e)return o(t);if(t>=.2&&e<=.8)return i;if(e<=.2||t>=.8)return s;const r=[t,...[.2,.8].filter(i=>i>t&&i<e),e],n=i=>Number(((i-t)/(e-t)*100).toFixed(10));return`linear-gradient(to right, ${r.slice(0,-1).map((t,e)=>{const i=r[e+1];return`${o((t+i)/2)} ${n(t)}% ${n(i)}%`}).join(", ")})`}(Math.min(e,i),Math.max(e,i))};`}></div>
      `:V}
      ${t&&null!==this.avg?G`
        <div class="avg" style=${`left: clamp(0px, calc(${100*this.avg}% - 5px), calc(100% - 10px)); background: ${r};`}></div>
      `:V}
      ${t&&null!==this.value?G`
        <div class="dot" style=${`left: clamp(0px, calc(${100*this.value}% - 7px), calc(100% - 14px));`}></div>
      `:V}
    `}}qt.styles=a`
    :host {
      --mpl-range-bar-tone: var(--mpl-success);
      display: block;
      position: relative;
      height: 28px;
      width: 100%;
    }
    :host([tone='problem']) {
      --mpl-range-bar-tone: var(--mpl-error);
    }
    :host([tone='advisory']) {
      --mpl-range-bar-tone: var(--mpl-on-surface-variant);
    }
    .track,
    .tick,
    .span,
    .avg,
    .dot {
      position: absolute;
    }
    .track {
      left: 0;
      right: 0;
      top: 10px;
      height: 4px;
      border-radius: 2px;
      background: var(--mpl-surface-container-highest);
    }
    .tick {
      top: 5px;
      width: 2px;
      height: 14px;
      border-radius: 1px;
      background: var(--mpl-outline);
    }
    .tick-low {
      left: calc(20% - 1px);
    }
    .tick-high {
      left: calc(80% - 1px);
    }
    .span {
      top: 8px;
      height: 8px;
      border-radius: 4px;
    }
    .avg {
      top: 20px;
      width: 10px;
      height: 6px;
      clip-path: polygon(50% 0, 100% 100%, 0 100%);
    }
    .dot {
      top: 5px;
      width: 14px;
      height: 14px;
      box-sizing: border-box;
      border-radius: 50%;
      background: var(--mpl-range-bar-ring, var(--mpl-surface-container-high));
      border: 3px solid var(--mpl-range-bar-tone);
    }
    .dot,
    .span,
    .avg {
      transition:
        left 500ms var(--md-sys-motion-expressive-spatial-default, cubic-bezier(0.38, 1.21, 0.22, 1)),
        width 500ms var(--md-sys-motion-expressive-spatial-default, cubic-bezier(0.38, 1.21, 0.22, 1));
    }
    @media (prefers-reduced-motion: reduce) {
      .dot,
      .span,
      .avg {
        transition: none;
      }
    }
  `,t([mt({type:Number})],qt.prototype,"value",void 0),t([mt({reflect:!0})],qt.prototype,"tone",void 0),t([mt({type:Number})],qt.prototype,"spanFrom",void 0),t([mt({type:Number})],qt.prototype,"spanTo",void 0),t([mt({type:Number})],qt.prototype,"avg",void 0),t([mt({type:Boolean})],qt.prototype,"avgOk",void 0),t([mt({type:Boolean})],qt.prototype,"showTicks",void 0),customElements.get("mpl-range-bar")||customElements.define("mpl-range-bar",qt);const Bt=t=>Et(t,"",!0),Gt={"mol/d⋅m²":"mol/d","mol/d·m²":"mol/d","mol/(d⋅m²)":"mol/d"};function Wt(t){const e=Math.abs(t);if(e>=1e3)return Et(t,"",!0);const i=e>=10?0:e>=.1?1:2,[s,o="0"]=String(e).split("e"),r=Number(`${s}e${Number(o)+i}`);return String(Math.sign(t)*Math.round(r)/10**i)}class Kt extends ht{constructor(){super(...arguments),this.tone="unknown",this.stats=null,this.hideUnits=!1,this.showHistory=!0}render(){const t=this.measurement;if(!t)return V;const e=this.stats,i=e=>St(e,t.min,t.max,t.unit),s=kt(e?.mean??null,t.min,t.max),o=(e,i)=>{const s=kt(i,t.min,t.max);return G`<span class=${"low"===s||"high"===s?"stat out":"stat"}>
        <span class="stat-label">${e}</span><span class="stat-value">${null===i?"—":Wt(i)}</span>
      </span>`};return G`
      <div class="title">
        <ha-icon icon=${t.icon} aria-hidden="true"></ha-icon>
        <span class="label">${t.label}</span>
        ${this.showHistory?G`<span class="period">Last 24 h</span>`:V}
      </div>
      <div class="value">${Et(t.value,t.unit,!0)}${this.hideUnits||""===t.unit?V:G`<span class="unit">${Gt[t.unit]??t.unit}</span>`}</div>
      <mpl-range-bar
          .value=${i(t.value)}
          .tone=${this.tone}
          .spanFrom=${e?i(e.min):null}
          .spanTo=${e?i(e.max):null}
          .avg=${e?i(e.mean):null}
          .avgOk=${"unknown"===s?null:"ok"===s}
          .showTicks=${null!==t.min&&null!==t.max}
      ></mpl-range-bar>
      ${null!==t.min&&null!==t.max?G`<span class="ideal">Ideal ${Wt(t.min)}–${Wt(t.max)}</span>`:V}
      ${this.showHistory?G`<div class="stats">
        ${o("Min",e?.min??null)}
        ${o("Avg",e?.mean??null)}
        ${o("Max",e?.max??null)}
      </div>`:V}
    `}}Kt.styles=a`
    :host {
      --mpl-metric-glyph-size: 18px;
      --mpl-metric-column-width: 88px;
      --mpl-metric-column-gap: 12px;
      --mpl-metric-title-gap: 6px;
      --mpl-metric-label-size: 14px;
      --mpl-metric-label-line: 20px;
      --mpl-metric-label-weight: 500;
      --mpl-metric-value-size: 22px;
      --mpl-metric-value-line: 28px;
      --mpl-metric-value-weight: 400;
      --mpl-metric-problem-weight: 600;
      --mpl-metric-unit-gap: 3px;
      --mpl-metric-unit-size: 13px;
      --mpl-metric-caption-size: 12px;
      --mpl-metric-caption-line: 20px;
      --mpl-metric-period-line: 16px;
      --mpl-metric-stat-size: 11px;
      --mpl-metric-stat-line: 16px;
      --mpl-metric-stat-gap: 3px;
      --mpl-metric-stats-gap: 4px;
      --mpl-metric-stat-padding: 6px;
      --mpl-metric-stat-radius: 6px;
      --mpl-metric-stat-label-weight: 400;
      --mpl-metric-stat-value-weight: 600;
      display: grid;
      grid-template-columns: var(--mpl-metric-column-width) minmax(0, 1fr);
      grid-template-rows: var(--mpl-metric-label-line) var(--mpl-metric-value-line) var(--mpl-metric-caption-line);
      column-gap: var(--mpl-metric-column-gap);
      row-gap: 0;
      align-items: center;
      min-width: 0;
    }
    .title {
      grid-column: 1 / -1;
      grid-row: 1;
      display: flex;
      gap: var(--mpl-metric-title-gap);
      align-items: center;
      min-width: 0;
    }
    :host([tone='ok']) ha-icon {
      color: var(--mpl-success);
    }
    :host([tone='problem']) ha-icon {
      color: var(--mpl-error);
    }
    ha-icon {
      --mdc-icon-size: var(--mpl-metric-glyph-size);
      display: flex;
      align-items: center;
      justify-content: center;
      width: var(--mpl-metric-glyph-size);
      height: var(--mpl-metric-glyph-size);
      flex-shrink: 0;
      color: var(--mpl-on-surface-variant);
    }
    .label {
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-size: var(--mpl-metric-label-size);
      line-height: var(--mpl-metric-label-line);
      font-weight: var(--mpl-metric-label-weight);
      color: var(--mpl-on-surface);
    }
    .period {
      margin-left: auto;
      flex-shrink: 0;
      white-space: nowrap;
      font-size: var(--mpl-metric-caption-size);
      line-height: var(--mpl-metric-period-line);
      color: var(--mpl-on-surface-variant);
    }
    .value {
      grid-column: 1;
      grid-row: 2;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-size: var(--mpl-metric-value-size);
      line-height: var(--mpl-metric-value-line);
      font-weight: var(--mpl-metric-value-weight);
      color: var(--mpl-on-surface);
    }
    :host([tone='problem']) .value {
      color: var(--mpl-error);
      font-weight: var(--mpl-metric-problem-weight);
    }
    .unit {
      font-size: var(--mpl-metric-unit-size);
      margin-left: var(--mpl-metric-unit-gap);
      color: var(--mpl-on-surface-variant);
    }
    mpl-range-bar {
      grid-column: 2;
      grid-row: 2;
      min-width: 0;
    }
    .ideal {
      grid-column: 1;
      grid-row: 3;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      font-size: var(--mpl-metric-caption-size);
      line-height: var(--mpl-metric-caption-line);
      color: var(--mpl-on-surface-variant);
      white-space: nowrap;
    }
    .stats {
      grid-column: 2;
      grid-row: 3;
      display: flex;
      justify-content: space-between;
      gap: var(--mpl-metric-stats-gap);
      align-items: center;
      min-width: 0;
    }
    .stat {
      display: inline-flex;
      gap: var(--mpl-metric-stat-gap);
      height: var(--mpl-metric-caption-line);
      padding: 0 var(--mpl-metric-stat-padding);
      border-radius: var(--mpl-metric-stat-radius);
      font-size: var(--mpl-metric-stat-size);
      line-height: var(--mpl-metric-stat-line);
      align-items: center;
      white-space: nowrap;
    }
    .stat-label {
      color: var(--mpl-on-surface-variant);
      font-weight: var(--mpl-metric-stat-label-weight);
    }
    .stat-value {
      color: var(--mpl-on-surface);
      font-weight: var(--mpl-metric-stat-value-weight);
    }
    .stat.out {
      background: var(--mpl-error-container);
    }
    .out .stat-label, .out .stat-value {
      color: var(--mpl-on-error-container);
    }
  `,t([mt({attribute:!1})],Kt.prototype,"measurement",void 0),t([mt({reflect:!0})],Kt.prototype,"tone",void 0),t([mt({attribute:!1})],Kt.prototype,"stats",void 0),t([mt({type:Boolean,attribute:"hide-units"})],Kt.prototype,"hideUnits",void 0),t([mt({type:Boolean,attribute:"show-history"})],Kt.prototype,"showHistory",void 0),customElements.get("mpl-metric-row")||customElements.define("mpl-metric-row",Kt);const Vt=(()=>{const t=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M${Array.from({length:180},(t,e)=>{const i=2*e*Math.PI/180,s=50*(.94+.06*Math.cos(9*i));return`${(50+s*Math.cos(i)).toFixed(3)},${(50+s*Math.sin(i)).toFixed(3)}`}).join(" L")} Z" fill="white"/></svg>`;return`url("data:image/svg+xml,${encodeURIComponent(t)}")`})();class Jt extends ht{constructor(){super(...arguments),this._gaugeCapacity=6,this._statsMap={},this._statsRequest=0,this._statsLastFetch=-1/0,this._statsPending=!0,this._lastFetch=-1/0,this._request=0,this._pending=!1,this._tooltipHovered=!1,this._touchTooltip=!1,this._hideTooltip=()=>{clearTimeout(this._tooltipShowTimer),clearTimeout(this._tooltipHideTimer),this._tooltipShowTimer=void 0,this._tooltipHideTimer=void 0,this._tooltip=void 0,this._tooltipSource=void 0,this._hoveredGauge=void 0,this._tooltipHovered=!1,this._focusedGauge=void 0,this._touchTooltip=!1,document.removeEventListener("pointerdown",this._dismissTooltip,!0)},this._dismissTooltip=()=>{this._hideTooltip(),this._press=void 0,this._clearClickSuppression()},this._tooltipKeydown=t=>{this._clearClickSuppression(),"Escape"===t.key&&this._dismissTooltip()},this._gaugePointerMove=t=>{const e=this._press;e&&t.pointerId===e.id&&Math.hypot(t.clientX-e.x,t.clientY-e.y)>8&&this._dismissTooltip()},this._gaugePointerUp=t=>{const e=this._press;e&&t.pointerId===e.id&&(clearTimeout(this._tooltipShowTimer),this._tooltipShowTimer=void 0,this._press=void 0,e.long&&this._suppressClick?.id===e.id&&(this._suppressClick.released=!0,this._suppressClickTimer=setTimeout(()=>this._clearClickSuppression(),800)))},this._gaugePointerCancel=t=>{t.pointerId!==this._press?.id&&t.pointerId!==this._suppressClick?.id||this._dismissTooltip()}}get hass(){return this._hass}set hass(t){const e=this._hass;this._hass=t,this.requestUpdate("hass",e);const i=this._config?.entity;!i||!t||e&&e.states[i]?.last_updated===t.states[i]?.last_updated||this._queueFetch()}_clearClickSuppression(){clearTimeout(this._suppressClickTimer),this._suppressClickTimer=void 0,this._suppressClick=void 0}_showTooltip(t,e){clearTimeout(this._tooltipHideTimer),this._tooltipHideTimer=void 0,this._tooltip=t,this._tooltipSource=e,this._touchTooltip="touch"===e,this._touchTooltip&&document.addEventListener("pointerdown",this._dismissTooltip,!0)}_gaugePointerDown(t){if(this._dismissTooltip(),"touch"!==t.pointerType&&"pen"!==t.pointerType)return;const e=t.currentTarget,i={button:e,id:t.pointerId,x:t.clientX,y:t.clientY,long:!1};this._press=i,this._tooltipShowTimer=setTimeout(()=>{this._tooltipShowTimer=void 0,i.long=!0,this._suppressClick={button:e,id:i.id,released:!1},this._showTooltip(e,"touch")},450)}_gaugePointerEnter(t){if("mouse"!==t.pointerType)return;const e=t.currentTarget;if(this._tooltip===e)return this._hoveredGauge=e,clearTimeout(this._tooltipHideTimer),void(this._tooltipHideTimer=void 0);this._focusedGauge||this._touchTooltip||(this._dismissTooltip(),this._hoveredGauge=e,this._tooltipShowTimer=setTimeout(()=>{this._tooltipShowTimer=void 0,this._showTooltip(e,"mouse")},500))}_gaugePointerLeave(t){"mouse"===t.pointerType&&(this._hoveredGauge===t.currentTarget&&(this._hoveredGauge=void 0),clearTimeout(this._tooltipShowTimer),this._tooltipShowTimer=void 0,this._scheduleTooltipHide())}_scheduleTooltipHide(){clearTimeout(this._tooltipHideTimer),this._tooltip&&!this._touchTooltip&&(this._tooltipHideTimer=setTimeout(()=>{this._tooltipHideTimer=void 0,this._hoveredGauge||this._tooltipHovered||this._focusedGauge||this._hideTooltip()},150))}_tooltipPointerEnter(){this._tooltipHovered=!0,clearTimeout(this._tooltipHideTimer),this._tooltipHideTimer=void 0}_tooltipPointerLeave(){this._tooltipHovered=!1,this._scheduleTooltipHide()}_gaugeBlur(){this._focusedGauge=void 0,this._hoveredGauge||this._tooltipHovered||this._touchTooltip||this._hideTooltip()}_gaugeFocus(t){const e=t.currentTarget;e.matches(":focus-visible")&&(this._tooltip!==e&&this._dismissTooltip(),this._focusedGauge=e,this._showTooltip(e,"focus"))}_gaugeClick(t,e){const i=this._suppressClick;if(0===t.detail&&this._clearClickSuppression(),t.detail>0&&i?.released&&t.currentTarget===i.button&&(!(t instanceof PointerEvent)||t.pointerId===i.id))return this._clearClickSuppression(),t.preventDefault(),void t.stopPropagation();this._moreInfo(e)}updated(){this._positionTooltip(),this._syncStats()}_statsSensors(){return this.hass&&this._config&&this.hass.states[this._config.entity]?[...new Set(At(this._info,this._config.show_bars??yt,this.hass.states).flatMap(t=>t.sensor?[t.sensor]:[]))]:[]}_stopStats(t=!1){clearTimeout(this._statsTimer),this._statsTimer=void 0,this._statsRequest++,this._statsPending||=void 0!==this._statsInFlight,this._statsInFlight=void 0,t&&(this._statsKey=void 0,this._statsPending=!0,Object.keys(this._statsMap).length&&(this._statsMap={}))}_syncStats(){if("compact"===this._config?.display_type||this._config?.hide_history)return void this._stopStats(!0);if(!(this.isConnected&&this.hass&&this._info&&this._config))return;const t=this._statsSensors(),e=JSON.stringify([this._config.entity,[...t].sort()]);if(e!==this._statsKey&&(this._statsKey=e,this._statsRequest++,this._statsPending=!0),!t.length)return clearTimeout(this._statsTimer),void(this._statsTimer=void 0);const i=Date.now()-this._statsLastFetch,s=this._statsPending?Math.max(0,6e4-i):Math.max(0,6e5-i);clearTimeout(this._statsTimer),this._statsTimer=void 0,0===s?this._fetchStats(t):this._statsTimer=setTimeout(()=>{this._statsTimer=void 0,this._statsPending=!0,this._syncStats()},s)}async _fetchStats(t){const e=this.hass,i=++this._statsRequest;this._statsInFlight=i,this._statsPending=!1,this._statsLastFetch=Date.now(),this._syncStats();let s=!1;const o=await async function(t,e,i=Date.now()){const s=[...new Set(e)];if(0===s.length)return{};try{const e=await t.callWS({type:"recorder/statistics_during_period",start_time:new Date(i-864e5).toISOString(),statistic_ids:s,period:"hour",types:["min","max","mean"]}),o={};for(const t of s){const i=Dt(e[t]);null!==i&&(o[t]=i)}return o}catch{return{}}}({callWS:async t=>{try{return await e.callWS(t)}catch(t){throw s=!0,t}}},t,this._statsLastFetch);i===this._statsRequest&&this.isConnected&&(s||(this._statsMap=o)),this._statsInFlight===i&&(this._statsInFlight=void 0),this._syncStats()}_positionTooltip(){const t=this.shadowRoot?.querySelector(".tooltip"),e=this.shadowRoot?.querySelector("ha-card"),i=this._tooltip;if(!t||!e||!i)return;if(!i.isConnected)return void this._dismissTooltip();const s=e.getBoundingClientRect(),o=i.getBoundingClientRect(),r=getComputedStyle(t),n=parseFloat(r.width),a=parseFloat(r.height),l=o.left+o.width/2-s.left-e.clientLeft,c=Math.max(8,Math.min(l-n/2,e.clientWidth-8-n));t.style.left=`${c}px`,t.style.top=o.top-s.top-e.clientTop-a-4+"px"}setConfig(t){if(!t||"string"!=typeof t.entity||!t.entity.startsWith("plant."))throw new Error("Specify a plant entity");const e=this._config?.entity!==t.entity;this._config={...t,show_bars:t.show_bars?[...t.show_bars]:void 0},this._dismissTooltip(),this._statsRequest++,this._statsPending=!0,(e||"compact"===t.display_type||t.hide_history)&&this._stopStats(!0),e&&(this._info=void 0,this._request++,this._queueFetch()),this._syncStats()}getCardSize(){if("compact"===this._config?.display_type)return 4;const t=this.hass&&this._config&&this.hass.states[this._config.entity]?At(this._info,this._config.show_bars??yt,this.hass.states).length:0;return Math.ceil((100+86*t)/50)}getGridOptions(){return{columns:6,min_columns:4,rows:"auto"}}static getConfigForm(){return Ht}static getStubConfig(t){return{type:`custom:${vt}`,entity:Object.keys(t.states).find(t=>t.startsWith("plant."))??"plant.my_plant",show_bars:[...yt]}}_queueFetch(){if(this._request++,this._pending=!0,!this.isConnected||!this.hass||!this._config)return;const t=Math.max(0,5e3-(Date.now()-this._lastFetch));0===t?(void 0!==this._timer&&clearTimeout(this._timer),this._timer=void 0,this._fetchInfo()):void 0===this._timer&&(this._timer=setTimeout(()=>{this._timer=void 0,this._fetchInfo()},t))}async _fetchInfo(){const t=this.hass,e=this._config?.entity;if(!this.isConnected||!t||!e)return;this._pending=!1,this._lastFetch=Date.now();const i=++this._request;this._inFlight=i;try{const s=await t.callWS({type:"plant/get_info",entity_id:e});i===this._request&&e===this._config?.entity&&s?.result&&(this._info=s.result)}catch{}finally{this._inFlight===i&&(this._inFlight=void 0)}}connectedCallback(){super.connectedCallback(),this._pending&&this._queueFetch(),this._syncStats(),this._observeGauges(),window.addEventListener("pointermove",this._gaugePointerMove,!0),window.addEventListener("pointerup",this._gaugePointerUp,!0),window.addEventListener("pointercancel",this._gaugePointerCancel,!0),window.addEventListener("scroll",this._dismissTooltip,!0),this.addEventListener("scroll",this._dismissTooltip,!0),window.addEventListener("keydown",this._tooltipKeydown,!0)}disconnectedCallback(){super.disconnectedCallback(),this._stopStats(),this._dismissTooltip(),window.removeEventListener("pointermove",this._gaugePointerMove,!0),window.removeEventListener("pointerup",this._gaugePointerUp,!0),window.removeEventListener("pointercancel",this._gaugePointerCancel,!0),window.removeEventListener("scroll",this._dismissTooltip,!0),this.removeEventListener("scroll",this._dismissTooltip,!0),window.removeEventListener("keydown",this._tooltipKeydown,!0),this._gaugesObserver?.disconnect(),this._gaugesObserver=void 0,void 0!==this._gaugesFrame&&cancelAnimationFrame(this._gaugesFrame),this._gaugesFrame=void 0,void 0!==this._timer&&clearTimeout(this._timer),this._timer=void 0,this._pending||=void 0!==this._inFlight,this._inFlight=void 0,this._request++}_observeGauges(){this.isConnected&&!this._gaugesObserver&&(this._gaugesObserver=new ResizeObserver(t=>{for(const e of t){if(!this.isConnected||e.target!==this)continue;void 0!==this._gaugesFrame&&cancelAnimationFrame(this._gaugesFrame),this._gaugesFrame=void 0;const t=e.contentRect.width-32,i=Math.max(1,Math.floor((t+4)/48));this._gaugesFrame=requestAnimationFrame(()=>{this._gaugesFrame=void 0,this.isConnected&&(i!==this._gaugeCapacity&&(this._gaugeCapacity=i),this._tooltip&&this._positionTooltip())})}}),this._gaugesObserver.observe(this))}shouldUpdate(t){if(t.has("_statsMap")||t.has("_tooltip")||t.has("_tooltipSource")||t.has("_config")||t.has("_info")||t.has("_failedSrc")||t.has("_gaugeCapacity"))return!0;if(!this._config||!this.hass||!t.has("hass"))return!1;const e=t.get("hass");if(!e)return!0;const i=new Set([this._config.entity]);this._config.battery_sensor&&i.add(this._config.battery_sensor);for(const t of this._config.show_bars??yt){const e=this._info?.[t]?.sensor;e&&i.add(e)}return[...i].some(t=>e.states[t]!==this.hass.states[t])}_moreInfo(t){this.dispatchEvent(new CustomEvent("hass-more-info",{detail:{entityId:t},bubbles:!0,composed:!0}))}render(){if(!this._config||!this.hass)return V;const t=this._config,e=this.hass.states[t.entity];if(!e)return G`<ha-card><div class="warning">Entity not available: ${t.entity}</div></ha-card>`;const i="compact"===t.display_type,s=t.hide_units??!1,o=At(this._info,t.show_bars??yt,this.hass.states),r=o[this._tooltip?Array.from(this.shadowRoot.querySelectorAll(".gauge-btn")).indexOf(this._tooltip):-1],n=r?function(t){const e=t=>{const e=Math.abs(t);return String(Tt(t,e>=100?0:e>=10?1:2))},i=t.unit?` ${t.unit}`:"",s="low"===t.status?" · too low":"high"===t.status?" · too high":"",o=null===t.value?"—":e(t.value),r=null===t.min||null===t.max?"":` · ideal ${e(t.min)}–${e(t.max)}${i}`;return[t.label+s,`${o}${i}${r}`]}(r):void 0,a=o.length,l=Math.ceil(a/this._gaugeCapacity),c=a?Math.ceil(a/l):1,h=function(t,e,i){const s=Array.isArray(i.problem_sensors)&&i.problem_sensors.length>0?new Set(i.problem_sensors):void 0,o=[],r=new Set;if("gauges"===i.problem_source)for(const t of e)"low"!==t.status&&"high"!==t.status||s&&!s.has(t.key)||r.has(t.key)||(o.push({key:t.key,label:t.label,status:t.status}),r.add(t.key));else{const e=t?.attributes.problems;if(Array.isArray(e))for(const t of e){if(!t||"object"!=typeof t)continue;const{sensor_type:e,status:i}=t;if("string"!=typeof e||s&&!s.has(e)||r.has(e))continue;const n="string"==typeof i?i:"";o.push({key:e,label:wt(e),status:/low/i.test(n)?"low":/high/i.test(n)?"high":"problem"}),r.add(e)}else"problem"===t?.state&&o.push({key:"plant",label:"Needs attention",status:"problem"})}return o}(e,o,t),p=t.name||e.attributes.friendly_name||t.entity,d=h.length?h.map(t=>"problem"===t.status?t.label:`${t.label} ${t.status}`).join(" · "):t.hide_species?void 0:e.attributes.species,u=t.image??e.attributes.entity_picture,m="string"==typeof u&&u?u:void 0;m!==this._imageSrc&&(this._imageSrc=m,this._failedSrc=void 0);const g=t.battery_sensor?this.hass.states[t.battery_sensor]:void 0,v=function(t,e=10){const i=xt(t?.state),s=null===i?null:Math.max(0,Math.min(100,Math.round(i))),o=Number.isFinite(e)?e:10;return{level:s,tone:null===s?"unknown":s<o?"low":"ok"}}(g,t.battery_warn_level);return G`
      <ha-card class=${i?"compact":"full"}>
        <div class=${"header "+(t.hide_image?"no-image":"")}>
          ${t.hide_image?V:G`
            <button class="image-btn" type="button" aria-label=${`More information about ${p}`} @click=${()=>this._moreInfo(t.entity)}>
              ${m&&m!==this._failedSrc?G`<img class="photo" src=${m} alt="" @error=${()=>{this._failedSrc=m}}>`:G`<span class="photo placeholder"><ha-icon icon="mdi:flower-outline" aria-hidden="true"></ha-icon></span>`}
              ${h.length?G`<span class="problem-badge" aria-label="Needs attention">
                <svg viewBox="0 0 18 18" aria-hidden="true" focusable="false">
                  <rect x="8" y="4" width="2" height="6.5" rx="1"></rect>
                  <circle cx="9" cy="13.25" r="1.25"></circle>
                </svg>
              </span>`:V}
            </button>`}
          <button class="text-btn" type="button" aria-label=${`More information about ${p}`} @click=${()=>this._moreInfo(t.entity)}>
            <span class="name" title=${p}>${p}</span>
            ${d?G`<span class=${"subtitle "+(h.length?"problems":"")} title=${d}>${d}</span>`:V}
          </button>
          ${g?G`
            <button class="battery" type="button" aria-label=${`Battery: ${null===v.level?"unknown":`${v.level}%`}. More information`}
              @click=${e=>{e.stopPropagation(),this._moreInfo(t.battery_sensor)}}>
              <mpl-battery .level=${v.level} .tone=${v.tone}></mpl-battery>
            </button>`:V}
        </div>
        ${!i&&o.length?G`<div class="tiles">${o.map(e=>{const i=t.hide_history?null:function(t,e){return null===t||null===e?t:{min:Math.min(t.min,e),max:Math.max(t.max,e),mean:t.mean}}(e.sensor?this._statsMap[e.sensor]??null:null,e.value),o=Pt(e,h);return G`<button class=${"tile-btn"+("problem"===o?" problem":"")} type="button" aria-label=${function(t,e){return Ct(t)+(e?` · last 24 h ${Bt(e.min)}–${Bt(e.max)}, average ${Bt(e.mean)}`:"")}(e,i)}
            @click=${()=>this._moreInfo(e.sensor??t.entity)}>
            <mpl-metric-row .measurement=${e} .tone=${o} .stats=${i} .hideUnits=${s} .showHistory=${!t.hide_history}></mpl-metric-row>
          </button>`})}</div>`:V}
        ${i&&o.length?G`<div class="gauges" style=${`--mpl-cols: ${c}`}>${o.map(e=>G`
          <button class="gauge-btn" type="button" aria-label=${Ct(e)}
            @pointerdown=${this._gaugePointerDown} @pointerenter=${this._gaugePointerEnter} @pointerleave=${this._gaugePointerLeave}
            @focus=${this._gaugeFocus} @blur=${this._gaugeBlur}
            @contextmenu=${t=>t.preventDefault()}
            @click=${i=>this._gaugeClick(i,e.sensor??t.entity)}>
            <mpl-gauge .embedded=${!0} .fraction=${e.fraction} .tone=${Pt(e,h)} .icon=${e.icon}
              .value=${s?"":Et(e.value,e.unit,s)} .label=${Ct(e)}></mpl-gauge>
          </button>`)}</div>`:V}
        ${i&&this._tooltip&&n?G`<div class="tooltip" role="tooltip" id="mpl-tooltip" data-source=${this._tooltipSource}
          @pointerenter=${this._tooltipPointerEnter} @pointerleave=${this._tooltipPointerLeave}>
          <span class="tooltip-title">${n[0]}</span>
          <span class="tooltip-body">${n[1]}</span>
        </div>`:V}
      </ha-card>`}}Jt.styles=[Ut,a`
    :host { display: block; --mpl-tile-gap: 2px; --mpl-tile-margin: 12px; --mpl-tile-padding: 8px 12px; --mpl-tile-corner: 4px; --mpl-tile-outer-corner: 16px; }
    ha-card { position: relative; display: block; box-sizing: border-box; padding: 16px; background: var(--mpl-surface-bg); color: var(--mpl-on-surface); border-radius: var(--ha-card-border-radius, var(--mpl-shape-card)); }
    .tooltip { position: absolute; background: var(--mpl-inverse-surface); color: var(--mpl-inverse-on-surface); font-size: var(--md-sys-typescale-body-small-size, 12px); line-height: 16px; font-weight: 400; padding: 4px 8px; min-height: 24px; box-sizing: border-box; border-radius: var(--md-sys-shape-corner-extra-small, 4px); max-width: calc(100% - 16px); width: max-content; pointer-events: none; z-index: 2; animation: tooltip-enter 150ms cubic-bezier(0.2,0,0,1); transform-origin: bottom center; }
    .tooltip[data-source='mouse'] { pointer-events: auto; }
    .tooltip-title, .tooltip-body { display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .tooltip-title { font-weight: 500; }
    @keyframes tooltip-enter { from { opacity: 0; transform: scale(.8); } to { opacity: 1; transform: scale(1); } }
    @media (prefers-reduced-motion: reduce) { .tooltip { animation: none; } }
    .header { display: grid; grid-template-columns: auto minmax(0, 1fr) auto; gap: 12px; align-items: center; }
    .header.no-image { grid-template-columns: minmax(0, 1fr) auto; }
    button { appearance: none; border: 0; margin: 0; padding: 0; background: none; color: inherit; font: inherit; cursor: pointer; }
    button:focus-visible { outline: 2px solid var(--mpl-primary); outline-offset: 2px; }
    .image-btn { position: relative; width: 56px; height: 56px; border-radius: var(--mpl-shape-full); }
    .photo { display: block; width: 100%; height: 100%; object-fit: cover; mask-image: ${n(Vt)}; -webkit-mask-image: ${n(Vt)}; mask-size: 100% 100%; -webkit-mask-size: 100% 100%; }
    .placeholder { display: grid; place-items: center; background: var(--mpl-secondary-container); color: var(--mpl-on-secondary-container); }
    .problem-badge { position: absolute; bottom: 0; right: 0; display: grid; place-items: center; width: 18px; height: 18px; border-radius: var(--mpl-shape-full); background: var(--mpl-error); box-shadow: 0 0 0 2px var(--mpl-surface-bg); }
    .problem-badge svg { display: block; width: 18px; height: 18px; fill: var(--mpl-on-error); }
    .text-btn { min-width: 0; min-height: 44px; text-align: left; border-radius: 12px; }
    .name, .subtitle { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .name { font-size: 16px; font-weight: 500; line-height: 24px; color: var(--mpl-on-surface); }
    .subtitle { font-size: 14px; line-height: 20px; color: var(--mpl-on-surface-variant); }
    .problems { color: var(--mpl-error); }
    .battery { position: relative; display: inline-flex; align-items: center; padding: 4px; border-radius: 8px; }
    /* The 30x15 glyph plus padding stays bare; the invisible hit area is 44x44. */
    .battery::before { content: ''; position: absolute; width: max(100%, 44px); height: max(100%, 44px); left: 50%; top: 50%; transform: translate(-50%, -50%); }
    .gauges { display: flex; flex-wrap: wrap; justify-content: center; gap: 4px; margin-top: 12px; }
    .gauge-btn { flex: 0 0 calc((100% - (var(--mpl-cols) - 1) * 4px) / var(--mpl-cols)); display: grid; justify-items: center; min-width: 0; min-height: 44px; border-radius: 12px; }
    .gauge-btn:hover, .text-btn:hover, .battery:hover { background: color-mix(in srgb, var(--mpl-on-surface) 8%, transparent); }
    .gauge-btn { -webkit-touch-callout: none; user-select: none; touch-action: manipulation; }
    .gauge-btn:active, .text-btn:active { background: color-mix(in srgb, var(--mpl-on-surface) 12%, transparent); }
    .tiles { display: flex; flex-direction: column; gap: var(--mpl-tile-gap); margin-top: var(--mpl-tile-margin); }
    .tile-btn { width: 100%; text-align: left; padding: var(--mpl-tile-padding); background: var(--mpl-surface-container-high); border-radius: var(--mpl-tile-corner); --mpl-range-bar-ring: var(--mpl-surface-container-high); }
    .tile-btn.problem { box-shadow: inset 4px 0 0 var(--mpl-error); background: linear-gradient(to right, var(--mpl-surface-container-high) 45%, color-mix(in srgb, var(--mpl-error-container) 40%, var(--mpl-surface-container-high))); }
    .tile-btn:first-child { border-top-left-radius: var(--mpl-tile-outer-corner); border-top-right-radius: var(--mpl-tile-outer-corner); }
    .tile-btn:last-child { border-bottom-left-radius: var(--mpl-tile-outer-corner); border-bottom-right-radius: var(--mpl-tile-outer-corner); }
    .tile-btn:hover { background-color: color-mix(in srgb, var(--mpl-on-surface) 8%, var(--mpl-surface-container-high)); }
    .warning { color: var(--mpl-error); }
  `],t([mt({attribute:!1,noAccessor:!0})],Jt.prototype,"hass",null),t([gt()],Jt.prototype,"_config",void 0),t([gt()],Jt.prototype,"_info",void 0),t([gt()],Jt.prototype,"_failedSrc",void 0),t([gt()],Jt.prototype,"_gaugeCapacity",void 0),t([gt()],Jt.prototype,"_statsMap",void 0),t([gt()],Jt.prototype,"_tooltip",void 0),t([gt()],Jt.prototype,"_tooltipSource",void 0),customElements.get(vt)||customElements.define(vt,Jt);const Zt=window;Zt.customCards??=[],Zt.customCards.some(t=>t.type===vt)||Zt.customCards.push({type:vt,name:ft,description:"A Material 3 Expressive plant card with circular range gauges, problem states and a battery indicator.",preview:!0,documentationURL:"https://github.com/lageorgem/ha-material-plant-card"}),console.info(`${ft} v0.1.0`);export{Jt as MaterialPlantCard};
