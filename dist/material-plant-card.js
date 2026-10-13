function t(t,e,i,s){var o,r=arguments.length,n=r<3?e:null===s?s=Object.getOwnPropertyDescriptor(e,i):s;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)n=Reflect.decorate(t,e,i,s);else for(var a=t.length-1;a>=0;a--)(o=t[a])&&(n=(r<3?o(n):r>3?o(e,i,n):o(e,i))||n);return r>3&&n&&Object.defineProperty(e,i,n),n}"function"==typeof SuppressedError&&SuppressedError;const e=globalThis,i=e.ShadowRoot&&(void 0===e.ShadyCSS||e.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,s=Symbol(),o=new WeakMap;let r=class{constructor(t,e,i){if(this._$cssResult$=!0,i!==s)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e}get styleSheet(){let t=this.o;const e=this.t;if(i&&void 0===t){const i=void 0!==e&&1===e.length;i&&(t=o.get(e)),void 0===t&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),i&&o.set(e,t))}return t}toString(){return this.cssText}};const n=t=>new r("string"==typeof t?t:t+"",void 0,s),a=(t,...e)=>{const i=1===t.length?t[0]:e.reduce((e,i,s)=>e+(t=>{if(!0===t._$cssResult$)return t.cssText;if("number"==typeof t)return t;throw Error("Value passed to 'css' function must be a 'css' function result: "+t+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+t[s+1],t[0]);return new r(i,t,s)},l=i?t=>t:t=>t instanceof CSSStyleSheet?(t=>{let e="";for(const i of t.cssRules)e+=i.cssText;return n(e)})(t):t,{is:h,defineProperty:c,getOwnPropertyDescriptor:p,getOwnPropertyNames:u,getOwnPropertySymbols:d,getPrototypeOf:m}=Object,g=globalThis,v=g.trustedTypes,_=v?v.emptyScript:"",y=g.reactiveElementPolyfillSupport,f=(t,e)=>t,b={toAttribute(t,e){switch(e){case Boolean:t=t?_:null;break;case Object:case Array:t=null==t?t:JSON.stringify(t)}return t},fromAttribute(t,e){let i=t;switch(e){case Boolean:i=null!==t;break;case Number:i=null===t?null:Number(t);break;case Object:case Array:try{i=JSON.parse(t)}catch(t){i=null}}return i}},$=(t,e)=>!h(t,e),w={attribute:!0,type:String,converter:b,reflect:!1,useDefault:!1,hasChanged:$};Symbol.metadata??=Symbol("metadata"),g.litPropertyMetadata??=new WeakMap;let x=class extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,e=w){if(e.state&&(e.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(t)&&((e=Object.create(e)).wrapped=!0),this.elementProperties.set(t,e),!e.noAccessor){const i=Symbol(),s=this.getPropertyDescriptor(t,i,e);void 0!==s&&c(this.prototype,t,s)}}static getPropertyDescriptor(t,e,i){const{get:s,set:o}=p(this.prototype,t)??{get(){return this[e]},set(t){this[e]=t}};return{get:s,set(e){const r=s?.call(this);o?.call(this,e),this.requestUpdate(t,r,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??w}static _$Ei(){if(this.hasOwnProperty(f("elementProperties")))return;const t=m(this);t.finalize(),void 0!==t.l&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty(f("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(f("properties"))){const t=this.properties,e=[...u(t),...d(t)];for(const i of e)this.createProperty(i,t[i])}const t=this[Symbol.metadata];if(null!==t){const e=litPropertyMetadata.get(t);if(void 0!==e)for(const[t,i]of e)this.elementProperties.set(t,i)}this._$Eh=new Map;for(const[t,e]of this.elementProperties){const i=this._$Eu(t,e);void 0!==i&&this._$Eh.set(i,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){const e=[];if(Array.isArray(t)){const i=new Set(t.flat(1/0).reverse());for(const t of i)e.unshift(l(t))}else void 0!==t&&e.push(l(t));return e}static _$Eu(t,e){const i=e.attribute;return!1===i?void 0:"string"==typeof i?i:"string"==typeof t?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this))}addController(t){(this._$EO??=new Set).add(t),void 0!==this.renderRoot&&this.isConnected&&t.hostConnected?.()}removeController(t){this._$EO?.delete(t)}_$E_(){const t=new Map,e=this.constructor.elementProperties;for(const i of e.keys())this.hasOwnProperty(i)&&(t.set(i,this[i]),delete this[i]);t.size>0&&(this._$Ep=t)}createRenderRoot(){const t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return((t,s)=>{if(i)t.adoptedStyleSheets=s.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(const i of s){const s=document.createElement("style"),o=e.litNonce;void 0!==o&&s.setAttribute("nonce",o),s.textContent=i.cssText,t.appendChild(s)}})(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(t=>t.hostConnected?.())}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach(t=>t.hostDisconnected?.())}attributeChangedCallback(t,e,i){this._$AK(t,i)}_$ET(t,e){const i=this.constructor.elementProperties.get(t),s=this.constructor._$Eu(t,i);if(void 0!==s&&!0===i.reflect){const o=(void 0!==i.converter?.toAttribute?i.converter:b).toAttribute(e,i.type);this._$Em=t,null==o?this.removeAttribute(s):this.setAttribute(s,o),this._$Em=null}}_$AK(t,e){const i=this.constructor,s=i._$Eh.get(t);if(void 0!==s&&this._$Em!==s){const t=i.getPropertyOptions(s),o="function"==typeof t.converter?{fromAttribute:t.converter}:void 0!==t.converter?.fromAttribute?t.converter:b;this._$Em=s;const r=o.fromAttribute(e,t.type);this[s]=r??this._$Ej?.get(s)??r,this._$Em=null}}requestUpdate(t,e,i,s=!1,o){if(void 0!==t){const r=this.constructor;if(!1===s&&(o=this[t]),i??=r.getPropertyOptions(t),!((i.hasChanged??$)(o,e)||i.useDefault&&i.reflect&&o===this._$Ej?.get(t)&&!this.hasAttribute(r._$Eu(t,i))))return;this.C(t,e,i)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(t,e,{useDefault:i,reflect:s,wrapped:o},r){i&&!(this._$Ej??=new Map).has(t)&&(this._$Ej.set(t,r??e??this[t]),!0!==o||void 0!==r)||(this._$AL.has(t)||(this.hasUpdated||i||(e=void 0),this._$AL.set(t,e)),!0===s&&this._$Em!==t&&(this._$Eq??=new Set).add(t))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(t){Promise.reject(t)}const t=this.scheduleUpdate();return null!=t&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[t,e]of this._$Ep)this[t]=e;this._$Ep=void 0}const t=this.constructor.elementProperties;if(t.size>0)for(const[e,i]of t){const{wrapped:t}=i,s=this[e];!0!==t||this._$AL.has(e)||void 0===s||this.C(e,void 0,i,s)}}let t=!1;const e=this._$AL;try{t=this.shouldUpdate(e),t?(this.willUpdate(e),this._$EO?.forEach(t=>t.hostUpdate?.()),this.update(e)):this._$EM()}catch(e){throw t=!1,this._$EM(),e}t&&this._$AE(e)}willUpdate(t){}_$AE(t){this._$EO?.forEach(t=>t.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return!0}update(t){this._$Eq&&=this._$Eq.forEach(t=>this._$ET(t,this[t])),this._$EM()}updated(t){}firstUpdated(t){}};x.elementStyles=[],x.shadowRootOptions={mode:"open"},x[f("elementProperties")]=new Map,x[f("finalized")]=new Map,y?.({ReactiveElement:x}),(g.reactiveElementVersions??=[]).push("2.1.2");const k=globalThis,P=t=>t,T=k.trustedTypes,M=T?T.createPolicy("lit-html",{createHTML:t=>t}):void 0,S="$lit$",E=`lit$${Math.random().toFixed(9).slice(2)}$`,A="?"+E,C=`<${A}>`,L=document,O=()=>L.createComment(""),H=t=>null===t||"object"!=typeof t&&"function"!=typeof t,z=Array.isArray,I="[ \t\n\f\r]",F=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,U=/-->/g,N=/>/g,D=RegExp(`>|${I}(?:([^\\s"'>=/]+)(${I}*=${I}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),R=/'/g,j=/"/g,B=/^(?:script|style|textarea|title)$/i,q=t=>(e,...i)=>({_$litType$:t,strings:e,values:i}),G=q(1),W=q(2),Z=Symbol.for("lit-noChange"),K=Symbol.for("lit-nothing"),V=new WeakMap,Y=L.createTreeWalker(L,129);function J(t,e){if(!z(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==M?M.createHTML(e):e}const X=(t,e)=>{const i=t.length-1,s=[];let o,r=2===e?"<svg>":3===e?"<math>":"",n=F;for(let e=0;e<i;e++){const i=t[e];let a,l,h=-1,c=0;for(;c<i.length&&(n.lastIndex=c,l=n.exec(i),null!==l);)c=n.lastIndex,n===F?"!--"===l[1]?n=U:void 0!==l[1]?n=N:void 0!==l[2]?(B.test(l[2])&&(o=RegExp("</"+l[2],"g")),n=D):void 0!==l[3]&&(n=D):n===D?">"===l[0]?(n=o??F,h=-1):void 0===l[1]?h=-2:(h=n.lastIndex-l[2].length,a=l[1],n=void 0===l[3]?D:'"'===l[3]?j:R):n===j||n===R?n=D:n===U||n===N?n=F:(n=D,o=void 0);const p=n===D&&t[e+1].startsWith("/>")?" ":"";r+=n===F?i+C:h>=0?(s.push(a),i.slice(0,h)+S+i.slice(h)+E+p):i+E+(-2===h?e:p)}return[J(t,r+(t[i]||"<?>")+(2===e?"</svg>":3===e?"</math>":"")),s]};class Q{constructor({strings:t,_$litType$:e},i){let s;this.parts=[];let o=0,r=0;const n=t.length-1,a=this.parts,[l,h]=X(t,e);if(this.el=Q.createElement(l,i),Y.currentNode=this.el.content,2===e||3===e){const t=this.el.content.firstChild;t.replaceWith(...t.childNodes)}for(;null!==(s=Y.nextNode())&&a.length<n;){if(1===s.nodeType){if(s.hasAttributes())for(const t of s.getAttributeNames())if(t.endsWith(S)){const e=h[r++],i=s.getAttribute(t).split(E),n=/([.?@])?(.*)/.exec(e);a.push({type:1,index:o,name:n[2],strings:i,ctor:"."===n[1]?ot:"?"===n[1]?rt:"@"===n[1]?nt:st}),s.removeAttribute(t)}else t.startsWith(E)&&(a.push({type:6,index:o}),s.removeAttribute(t));if(B.test(s.tagName)){const t=s.textContent.split(E),e=t.length-1;if(e>0){s.textContent=T?T.emptyScript:"";for(let i=0;i<e;i++)s.append(t[i],O()),Y.nextNode(),a.push({type:2,index:++o});s.append(t[e],O())}}}else if(8===s.nodeType)if(s.data===A)a.push({type:2,index:o});else{let t=-1;for(;-1!==(t=s.data.indexOf(E,t+1));)a.push({type:7,index:o}),t+=E.length-1}o++}}static createElement(t,e){const i=L.createElement("template");return i.innerHTML=t,i}}function tt(t,e,i=t,s){if(e===Z)return e;let o=void 0!==s?i._$Co?.[s]:i._$Cl;const r=H(e)?void 0:e._$litDirective$;return o?.constructor!==r&&(o?._$AO?.(!1),void 0===r?o=void 0:(o=new r(t),o._$AT(t,i,s)),void 0!==s?(i._$Co??=[])[s]=o:i._$Cl=o),void 0!==o&&(e=tt(t,o._$AS(t,e.values),o,s)),e}class et{constructor(t,e){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){const{el:{content:e},parts:i}=this._$AD,s=(t?.creationScope??L).importNode(e,!0);Y.currentNode=s;let o=Y.nextNode(),r=0,n=0,a=i[0];for(;void 0!==a;){if(r===a.index){let e;2===a.type?e=new it(o,o.nextSibling,this,t):1===a.type?e=new a.ctor(o,a.name,a.strings,this,t):6===a.type&&(e=new at(o,this,t)),this._$AV.push(e),a=i[++n]}r!==a?.index&&(o=Y.nextNode(),r++)}return Y.currentNode=L,s}p(t){let e=0;for(const i of this._$AV)void 0!==i&&(void 0!==i.strings?(i._$AI(t,i,e),e+=i.strings.length-2):i._$AI(t[e])),e++}}class it{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,e,i,s){this.type=2,this._$AH=K,this._$AN=void 0,this._$AA=t,this._$AB=e,this._$AM=i,this.options=s,this._$Cv=s?.isConnected??!0}get parentNode(){let t=this._$AA.parentNode;const e=this._$AM;return void 0!==e&&11===t?.nodeType&&(t=e.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,e=this){t=tt(this,t,e),H(t)?t===K||null==t||""===t?(this._$AH!==K&&this._$AR(),this._$AH=K):t!==this._$AH&&t!==Z&&this._(t):void 0!==t._$litType$?this.$(t):void 0!==t.nodeType?this.T(t):(t=>z(t)||"function"==typeof t?.[Symbol.iterator])(t)?this.k(t):this._(t)}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}_(t){this._$AH!==K&&H(this._$AH)?this._$AA.nextSibling.data=t:this.T(L.createTextNode(t)),this._$AH=t}$(t){const{values:e,_$litType$:i}=t,s="number"==typeof i?this._$AC(t):(void 0===i.el&&(i.el=Q.createElement(J(i.h,i.h[0]),this.options)),i);if(this._$AH?._$AD===s)this._$AH.p(e);else{const t=new et(s,this),i=t.u(this.options);t.p(e),this.T(i),this._$AH=t}}_$AC(t){let e=V.get(t.strings);return void 0===e&&V.set(t.strings,e=new Q(t)),e}k(t){z(this._$AH)||(this._$AH=[],this._$AR());const e=this._$AH;let i,s=0;for(const o of t)s===e.length?e.push(i=new it(this.O(O()),this.O(O()),this,this.options)):i=e[s],i._$AI(o),s++;s<e.length&&(this._$AR(i&&i._$AB.nextSibling,s),e.length=s)}_$AR(t=this._$AA.nextSibling,e){for(this._$AP?.(!1,!0,e);t!==this._$AB;){const e=P(t).nextSibling;P(t).remove(),t=e}}setConnected(t){void 0===this._$AM&&(this._$Cv=t,this._$AP?.(t))}}class st{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,e,i,s,o){this.type=1,this._$AH=K,this._$AN=void 0,this.element=t,this.name=e,this._$AM=s,this.options=o,i.length>2||""!==i[0]||""!==i[1]?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=K}_$AI(t,e=this,i,s){const o=this.strings;let r=!1;if(void 0===o)t=tt(this,t,e,0),r=!H(t)||t!==this._$AH&&t!==Z,r&&(this._$AH=t);else{const s=t;let n,a;for(t=o[0],n=0;n<o.length-1;n++)a=tt(this,s[i+n],e,n),a===Z&&(a=this._$AH[n]),r||=!H(a)||a!==this._$AH[n],a===K?t=K:t!==K&&(t+=(a??"")+o[n+1]),this._$AH[n]=a}r&&!s&&this.j(t)}j(t){t===K?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}}class ot extends st{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===K?void 0:t}}class rt extends st{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==K)}}class nt extends st{constructor(t,e,i,s,o){super(t,e,i,s,o),this.type=5}_$AI(t,e=this){if((t=tt(this,t,e,0)??K)===Z)return;const i=this._$AH,s=t===K&&i!==K||t.capture!==i.capture||t.once!==i.once||t.passive!==i.passive,o=t!==K&&(i===K||s);s&&this.element.removeEventListener(this.name,this,i),o&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t)}}class at{constructor(t,e,i){this.element=t,this.type=6,this._$AN=void 0,this._$AM=e,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(t){tt(this,t)}}const lt=k.litHtmlPolyfillSupport;lt?.(Q,it),(k.litHtmlVersions??=[]).push("3.3.3");const ht=globalThis;class ct extends x{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){const e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=((t,e,i)=>{const s=i?.renderBefore??e;let o=s._$litPart$;if(void 0===o){const t=i?.renderBefore??null;s._$litPart$=o=new it(e.insertBefore(O(),t),t,void 0,i??{})}return o._$AI(t),o})(e,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return Z}}ct._$litElement$=!0,ct.finalized=!0,ht.litElementHydrateSupport?.({LitElement:ct});const pt=ht.litElementPolyfillSupport;pt?.({LitElement:ct}),(ht.litElementVersions??=[]).push("4.2.2");const ut={attribute:!0,type:String,converter:b,reflect:!1,hasChanged:$},dt=(t=ut,e,i)=>{const{kind:s,metadata:o}=i;let r=globalThis.litPropertyMetadata.get(o);if(void 0===r&&globalThis.litPropertyMetadata.set(o,r=new Map),"setter"===s&&((t=Object.create(t)).wrapped=!0),r.set(i.name,t),"accessor"===s){const{name:s}=i;return{set(i){const o=e.get.call(this);e.set.call(this,i),this.requestUpdate(s,o,t,!0,i)},init(e){return void 0!==e&&this.C(s,void 0,t,e),e}}}if("setter"===s){const{name:s}=i;return function(i){const o=this[s];e.call(this,i),this.requestUpdate(s,o,t,!0,i)}}throw Error("Unsupported decorator location: "+s)};function mt(t){return(e,i)=>"object"==typeof i?dt(t,e,i):((t,e,i)=>{const s=e.hasOwnProperty(i);return e.constructor.createProperty(i,t),s?Object.getOwnPropertyDescriptor(e,i):void 0})(t,e,i)}function gt(t){return mt({...t,state:!0,attribute:!1})}const vt="material-plant-card",_t="Material Plant Card",yt=["moisture","conductivity","temperature","illuminance","humidity","dli","dli_24h","co2","soil_temperature","vpd"],ft=["moisture","conductivity","temperature","illuminance","humidity","dli"],bt={moisture:"Moisture",conductivity:"Conductivity",temperature:"Temperature",illuminance:"Illuminance",humidity:"Air humidity",dli:"DLI",dli_24h:"DLI (24h)",co2:"CO₂",soil_temperature:"Soil temperature",vpd:"VPD"},$t={moisture:"mdi:water",conductivity:"mdi:spa-outline",temperature:"mdi:thermometer",illuminance:"mdi:brightness-6",humidity:"mdi:water-percent",dli:"mdi:counter",dli_24h:"mdi:counter",co2:"mdi:molecule-co2",soil_temperature:"mdi:thermometer-probe",vpd:"mdi:water-thermometer-outline"},wt={"24h":864e5,"3d":2592e5,"7d":6048e5,"14d":12096e5,"30d":2592e6};function xt(t){return"string"==typeof t&&Object.prototype.hasOwnProperty.call(wt,t)}function kt(t){return"summary"===t||"graph"===t}function Pt(t,e){const i=t.metrics?.[e]??{},s=xt(i.period)?i.period:xt(t.history_period)?t.history_period:"24h",o="number"==typeof i.days&&Number.isFinite(i.days)?Math.max(1,Math.min(30,Math.round(i.days))):7,r="plant"===(n=i.problem_trigger)||"out_of_range"===n||"low"===n||"high"===n||"never"===n?i.problem_trigger:Array.isArray(t.problem_sensors)&&t.problem_sensors.length>0&&!t.problem_sensors.includes(e)?"never":"gauges"===t.problem_source?"out_of_range":"plant";var n;const a=kt(i.display)?i.display:kt(t.full_display)?t.full_display:"summary",l="number"==typeof i.daylight_offset&&Number.isFinite(i.daylight_offset)?Math.max(0,Math.min(180,Math.round(i.daylight_offset))):30;return{icon:"string"==typeof i.icon&&i.icon.length>0?i.icon:void 0,period:s,periodMs:wt[s],days:o,trigger:r,display:a,daylightOnly:"illuminance"===e&&("boolean"!=typeof i.daylight_only||i.daylight_only),daylightOffset:l}}function Tt(t){if(Object.prototype.hasOwnProperty.call(bt,t))return bt[t];const e=t.replace(/_/g," ");return e.charAt(0).toUpperCase()+e.slice(1)}function Mt(t){if("number"!=typeof t&&"string"!=typeof t)return null;if("string"==typeof t&&""===t.trim())return null;const e=Number(t);return Number.isFinite(e)?e:null}function St(t,e,i){return null===t||null===e||null===i||e>=i?"unknown":t<e?"low":t>i?"high":"ok"}function Et(t,e,i,s){if(null===t||null===e||null===i||e>=i)return null;let o=(t-e)/(i-e);return"lx"===s&&e>0&&(o=t<=0?-1/0:(Math.log(t)-Math.log(e))/(Math.log(i)-Math.log(e))),Math.max(0,Math.min(1,.2+.6*o))}function At(t,e,i,s){const o=[];for(const r of new Set(e)){if(!t||!Object.prototype.hasOwnProperty.call(t,r))continue;const e=t[r];if(!e)continue;const n=e.sensor||void 0,a=n?i[n]:void 0;if(n&&!a)continue;const l=Mt(a?a.state:e.current),h=Mt(e.min),c=Mt(e.max),p=String(a?.attributes.unit_of_measurement??e.unit_of_measurement??""),u=Object.prototype.hasOwnProperty.call($t,r)?$t[r]:"mdi:help-circle-outline",d=s?.[r],m="string"==typeof d&&d.length>0?d:"string"==typeof e.icon&&e.icon.length>0?e.icon:u;o.push({key:r,label:Tt(r),sensor:n,icon:m,unit:p,value:l,min:h,max:c,status:St(l,h,c),fraction:Et(l,h,c,p)})}return o}function Ct(t,e){const[i,s="0"]=String(Math.abs(t)).split("e"),o=Number(`${i}e${Number(s)+e}`);return Math.sign(t)*Math.round(o)/10**e}function Lt(t,e,i=!1){if(null===t)return"—";const s=Math.abs(t);let o;return o=s>=1e4?`${Ct(t/1e3,0)}k`:s>=1e3?`${Ct(t/1e3,1)}k`:String(Ct(t,s>=100?0:s>=10?1:2)),o+(i?"":"%"===e?"%":["°C","°F","°"].includes(e)?"°":"")}function Ot(t){const e=t.unit?` ${t.unit}`:"",i=null===t.value?"—":String(t.value),s=null===t.min||null===t.max?"":` (${String(t.min)}–${String(t.max)}${e})`,o="low"===t.status||"high"===t.status?` · ${t.status}`:"";return`${t.label}: ${i}${e}${s}${o}`.replace(/ {2,}/g," ")}function Ht(t,e){return"unknown"===t.status?"unknown":"ok"===t.status?"ok":e.some(e=>e.key===t.key)?"problem":"advisory"}const zt=()=>yt.map(t=>({value:t,label:bt[t]})),It={entity:"Plant entity",name:"Name",battery_sensor:"Battery sensor",display_type:"Display type",show_bars:"Gauges",hide_units:"Hide units",hide_history:"Hide history",history_period:"Default history window",full_display:"Full mode display",icon:"Icon",problem_trigger:"Problem trigger",display:"Display",days:"Days (1 = today)",period:"History window",daylight_only:"Daylight only (sunrise/sunset)",daylight_offset:"Ignore after sunrise / before sunset",problem_source:"Problem source",problem_sensors:"Problem sensors",hide_species:"Hide species",hide_image:"Hide image",image:"Image",battery_warn_level:"Battery low below"},Ft={hide_units:"Hides units next to values.",hide_history:"Full mode only: hides the history range, average and Min/Avg/Max.",history_period:"Default full-mode history window; each metric can override it. DLI uses its Days setting.",full_display:"Summary shows the range and Min/Avg/Max; Graph shows the history line. Each metric can override it.",problem_trigger:"Independent of the plant monitor unless set to Follow plant monitor.",days:"DLI uses the maximum value of each day.",daylight_offset:"Minutes after sunrise and before sunset to ignore (default 30).",show_bars:`Default: ${ft.map(t=>bt[t]).join(", ")}.`,problem_source:"Plant monitor follows the integration's problem triggers; Gauges flags any out-of-range value.",problem_sensors:"Leave empty to allow every sensor.",image:"Overrides the plant picture.",battery_warn_level:"Battery turns red below this level (default 10%)."};const Ut={schema:[{name:"entity",required:!0,selector:{entity:{domain:"plant"}}},{name:"name",selector:{text:{}}},{name:"battery_sensor",selector:{entity:{domain:"sensor",device_class:"battery"}}},{name:"display_type",selector:{select:{mode:"dropdown",options:[{value:"full",label:"Full (metric tiles)"},{value:"compact",label:"Compact (gauges)"}]}}},{type:"expandable",name:"",title:"Metrics",icon:"mdi:gauge",flatten:!0,schema:[{name:"show_bars",selector:{select:{multiple:!0,reorder:!0,mode:"list",options:zt()}}},{name:"hide_units",selector:{boolean:{}}},{name:"hide_history",selector:{boolean:{}}},{name:"history_period",selector:{select:{mode:"dropdown",options:[{value:"24h",label:"Last 24 hours"},{value:"3d",label:"Last 3 days"},{value:"7d",label:"Last 7 days"},{value:"14d",label:"Last 14 days"},{value:"30d",label:"Last 30 days"}]}}},{name:"full_display",selector:{select:{mode:"dropdown",options:[{value:"summary",label:"Summary"},{value:"graph",label:"Graph"}]}}}]},{type:"expandable",name:"metrics",title:"Per-metric settings",icon:"mdi:tune-variant",schema:yt.map(t=>({type:"expandable",name:t,title:bt[t],icon:$t[t],schema:[{name:"icon",selector:{icon:{}}},{name:"problem_trigger",selector:{select:{mode:"dropdown",options:[{value:"plant",label:"Follow plant monitor"},{value:"out_of_range",label:"Outside ideal range"},{value:"low",label:"Too low only"},{value:"high",label:"Too high only"},{value:"never",label:"Never"}]}}},{name:"display",selector:{select:{mode:"dropdown",options:[{value:"summary",label:"Summary"},{value:"graph",label:"Graph"}]}}},"dli"===t?{name:"days",selector:{number:{min:1,max:30,step:1,mode:"slider",unit_of_measurement:"days"}}}:{name:"period",selector:{select:{mode:"dropdown",options:[{value:"24h",label:"Last 24 hours"},{value:"3d",label:"Last 3 days"},{value:"7d",label:"Last 7 days"},{value:"14d",label:"Last 14 days"},{value:"30d",label:"Last 30 days"}]}}},..."illuminance"===t?[{name:"daylight_only",selector:{boolean:{}}},{name:"daylight_offset",selector:{number:{min:0,max:180,step:5,mode:"box",unit_of_measurement:"min"}}}]:[]]}))},{type:"expandable",name:"",title:"Problems",icon:"mdi:alert-circle-outline",flatten:!0,schema:[{name:"problem_source",selector:{select:{mode:"dropdown",options:[{value:"plant",label:"Plant monitor (integration problem triggers)"},{value:"gauges",label:"Gauges (any out-of-range value)"}]}}},{name:"problem_sensors",selector:{select:{multiple:!0,mode:"list",options:zt()}}}]},{type:"expandable",name:"",title:"Appearance",icon:"mdi:palette-outline",flatten:!0,schema:[{name:"hide_species",selector:{boolean:{}}},{name:"hide_image",selector:{boolean:{}}},{name:"image",selector:{text:{}}},{name:"battery_warn_level",selector:{number:{min:0,max:100,step:1,mode:"box",unit_of_measurement:"%"}}}]}],computeLabel:t=>Object.prototype.hasOwnProperty.call(It,t.name)?It[t.name]:void 0,computeHelper:t=>Object.prototype.hasOwnProperty.call(Ft,t.name)?Ft[t.name]:void 0,assertConfig:t=>{if(null!=t.entity&&("string"!=typeof t.entity||!t.entity.startsWith("plant.")))throw new Error("Specify a plant entity")}},Nt=a`
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
`,Dt=[{name:"low",start:135,end:185},{name:"ok",start:193,end:347},{name:"high",start:355,end:405}];function Rt(t,e,i,s){const o=s*Math.PI/180;return{x:t+i*Math.cos(o),y:e+i*Math.sin(o)}}function jt(t,e,i,s,o){const r=Rt(t,e,i,s),n=Rt(t,e,i,o),a=o-s>180?1:0;return`M ${r.x} ${r.y} A ${i} ${i} 0 ${a} 1 ${n.x} ${n.y}`}class Bt extends ct{constructor(){super(...arguments),this.fraction=null,this.tone="unknown",this.icon="",this.value="",this.label="",this.embedded=!1}render(){const t=this.fraction,e=null!==t&&"unknown"!==this.tone,i=135+270*(t??0),s=Rt(24,24,20,i);return G`
      <div
        class="gauge"
        role=${this.embedded?K:"meter"}
        aria-label=${this.embedded?K:this.label}
        aria-valuemin=${this.embedded?K:"0"}
        aria-valuemax=${this.embedded?K:"100"}
        aria-valuenow=${this.embedded||null===t?K:Math.round(100*t)}
        aria-valuetext=${this.embedded?K:this.label}
      >
        <div class="dial">
          <svg viewBox="0 0 48 48" aria-hidden="true" focusable="false">
            ${W`
              ${Dt.map(t=>W`
                <path class=${`track-${t.name}`} d=${jt(24,24,20,t.start,t.end)}></path>
              `)}
              ${e?Dt.map(t=>{if(i<=t.start)return K;const e=jt(24,24,20,t.start,Math.min(t.end,i));return W`
                  <path class=${`active active-${t.name}`} d=${e} style=${`d: path('${e}')`}></path>
                `}):K}
              ${e?W`
                <circle class="dot" cx=${s.x} cy=${s.y} r="3.5"
                  style=${`cx: ${s.x}px; cy: ${s.y}px;`}></circle>
              `:K}
            `}
          </svg>
          <ha-icon icon=${this.icon} aria-hidden="true"></ha-icon>
        </div>
        ${""!==this.value?G`<div class="value">${this.value}</div>`:K}
      </div>
    `}}Bt.styles=[Nt,a`
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
    `],t([mt({type:Number})],Bt.prototype,"fraction",void 0),t([mt({reflect:!0})],Bt.prototype,"tone",void 0),t([mt()],Bt.prototype,"icon",void 0),t([mt()],Bt.prototype,"value",void 0),t([mt()],Bt.prototype,"label",void 0),t([mt({type:Boolean,attribute:"embedded"})],Bt.prototype,"embedded",void 0),customElements.get("mpl-gauge")||customElements.define("mpl-gauge",Bt);let qt=0;class Gt extends ct{constructor(){super(...arguments),this.level=null,this.tone="unknown",this.clipId="mpl-battery-"+ ++qt}render(){const t=null===this.level||Number.isNaN(this.level)?null:Math.round(Math.min(100,Math.max(0,this.level))),e=26*(t??0)/100,i=`${this.clipId}-body`,s=`${this.clipId}-filled`,o=`${this.clipId}-unfilled`;return G`
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
          `:K}
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
    `}}function Wt(t,e=0,i){let s;if(i&&Number.isFinite(t)&&Number.isFinite(e))try{s=new Intl.DateTimeFormat("en-US",{timeZone:i,calendar:"gregory",numberingSystem:"latn",year:"numeric",month:"numeric",day:"numeric"})}catch{}if(s){const i=t=>{const e=s.formatToParts(t),i=t=>Number(e.find(e=>e.type===t)?.value),o=new Date(0);return o.setUTCFullYear(i("year"),i("month")-1,i("day")),o.getTime()},o=new Date(i(t));o.setUTCDate(o.getUTCDate()-e);const r=o.getTime();let n=r-1296e5,a=r+1296e5;for(;n<a;){const t=Math.floor((n+a)/2);i(t)<r?n=t+1:a=t}return n}const o=new Date(t);return o.setHours(0,0,0,0),o.setDate(o.getDate()-e),o.getTime()}Gt.styles=a`
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
  `,t([mt({type:Number})],Gt.prototype,"level",void 0),t([mt({reflect:!0})],Gt.prototype,"tone",void 0),customElements.get("mpl-battery")||customElements.define("mpl-battery",Gt);const Zt=864e5,Kt=6e4,Vt=Math.PI/180,Yt=90.833*Vt;function Jt(t){const e=(t/Zt+2440587.5-2451545)/36525,i=(280.46646+e*(36000.76983+3032e-7*e))%360*Vt,s=(357.52911+e*(35999.05029-1537e-7*e))*Vt,o=.016708634-e*(42037e-9+1.267e-7*e),r=Math.sin(s)*(1.914602-e*(.004817+14e-6*e))+Math.sin(2*s)*(.019993-101e-6*e)+289e-6*Math.sin(3*s),n=(125.04-1934.136*e)*Vt,a=i+(r-.00569-.00478*Math.sin(n))*Vt,l=(23+(26+(21.448-e*(46.815+e*(59e-5-.001813*e)))/60)/60+.00256*Math.cos(n))*Vt,h=Math.tan(l/2)**2,c=4/Vt*(h*Math.sin(2*i)-2*o*Math.sin(s)+4*o*h*Math.sin(s)*Math.cos(2*i)-.5*h*h*Math.sin(4*i)-1.25*o*o*Math.sin(2*s));return{declination:Math.asin(Math.sin(l)*Math.sin(a)),equationMinutes:c}}function Xt(t,e,i){const s=Math.floor((t+i/360*Zt)/Zt)*Zt,o=720-4*i;let r=s+o*Kt;for(let t=0;t<2;t++)r=s+(o-Jt(r).equationMinutes)*Kt;const n=e*Vt,a=t=>(Math.cos(Yt)-Math.sin(n)*Math.sin(t))/(Math.cos(n)*Math.cos(t)),l=Jt(r),h=a(l.declination);if(h<-1)return"polar-day";if(h>1)return"polar-night";const c=t=>{let e=s+(o-l.equationMinutes+t*(4/Vt)*Math.acos(h))*Kt;for(let i=0;i<2;i++){const i=Jt(e),r=a(i.declination);if(r<-1||r>1)break;e=s+(o-i.equationMinutes+t*(4/Vt)*Math.acos(r))*Kt}return e};return{sunrise:c(-1),sunset:c(1)}}class Qt extends ct{constructor(){super(...arguments),this.value=null,this.tone="unknown",this.spanFrom=null,this.spanTo=null,this.avg=null,this.avgOk=null,this.showTicks=!1}connectedCallback(){super.connectedCallback(),this.setAttribute("aria-hidden","true")}render(){const t="unknown"!==this.tone,e=this.spanFrom,i=this.spanTo,s=null!==e&&null!==i?100*Math.abs(i-e):0,o=null!==e&&null!==i?(e+i)/2*100:0,r=null===this.avgOk?"var(--mpl-on-surface-variant)":this.avgOk?"var(--mpl-success)":"var(--mpl-error)";return G`
      <div class="track"></div>
      ${this.showTicks?G`
        <div class="tick tick-low"></div>
        <div class="tick tick-high"></div>
      `:K}
      ${t&&null!==e&&null!==i?G`
        <div class="span" style=${`left: calc(${o}% - max(${s}%, 8px) / 2); width: max(${s}%, 8px); background: ${function(t,e){const i="var(--mpl-success)",s="var(--mpl-error)",o=t=>t<.2||t>.8?s:i;if(t===e)return o(t);if(t>=.2&&e<=.8)return i;if(e<=.2||t>=.8)return s;const r=[t,...[.2,.8].filter(i=>i>t&&i<e),e],n=i=>Number(((i-t)/(e-t)*100).toFixed(10));return`linear-gradient(to right, ${r.slice(0,-1).map((t,e)=>{const i=r[e+1];return`${o((t+i)/2)} ${n(t)}% ${n(i)}%`}).join(", ")})`}(Math.min(e,i),Math.max(e,i))};`}></div>
      `:K}
      ${t&&null!==this.avg?G`
        <div class="avg" style=${`left: clamp(0px, calc(${100*this.avg}% - 5px), calc(100% - 10px)); background: ${r};`}></div>
      `:K}
      ${t&&null!==this.value?G`
        <div class="dot" style=${`left: clamp(0px, calc(${100*this.value}% - 7px), calc(100% - 14px));`}></div>
      `:K}
    `}}Qt.styles=a`
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
  `,t([mt({type:Number})],Qt.prototype,"value",void 0),t([mt({reflect:!0})],Qt.prototype,"tone",void 0),t([mt({type:Number})],Qt.prototype,"spanFrom",void 0),t([mt({type:Number})],Qt.prototype,"spanTo",void 0),t([mt({type:Number})],Qt.prototype,"avg",void 0),t([mt({type:Boolean})],Qt.prototype,"avgOk",void 0),t([mt({type:Boolean})],Qt.prototype,"showTicks",void 0),customElements.get("mpl-range-bar")||customElements.define("mpl-range-bar",Qt);const te=48,ee=t=>44-40*t;let ie=0;class se extends ct{constructor(){super(...arguments),this.points=[],this.start=0,this.end=0,this.minMarker=null,this.maxMarker=null,this.current=null,this.thresholdLow=.2,this.thresholdHigh=.8,this.events=[],this.summary="",this._width=0,this._hoverIndex=null,this._mouseBubble=!1,this._dismissed=!1,this._gradientId="mpl-history-gradient-"+ ++ie,this._keyDown=t=>{"Escape"===t.key&&(this._dismissed=this._mouseBubble,this._hide())},this._pointerEnter=t=>{"mouse"!==t.pointerType&&t.pointerType||void 0!==this._pressedPointer||(this._clearHideTimer(),this._pick(t))},this._bubbleEnter=()=>{this._clearHideTimer()},this._bubbleLeave=()=>{this._mouseBubble&&this._scheduleHide(150)},this._stop=t=>{t.stopPropagation()},this._contextMenu=t=>{t.stopPropagation(),t.preventDefault()},this._pointerDown=t=>{t.stopPropagation(),this._inBubble(t)||(this._clearHideTimer(),this._pick(t),"touch"!==t.pointerType&&"pen"!==t.pointerType||(this._pressedPointer=t.pointerId,t.isTrusted&&this.setPointerCapture(t.pointerId)))},this._pointerMove=t=>{if(!this._inBubble(t))if("mouse"!==t.pointerType&&t.pointerType)t.pointerId===this._pressedPointer&&this._pick(t);else{if(void 0!==this._pressedPointer)return;this._clearHideTimer(),this._pick(t)}},this._pointerLeave=t=>{"mouse"!==t.pointerType&&t.pointerType||void 0!==this._pressedPointer||(this._dismissed=!1,this._scheduleHide(150))},this._pointerUp=t=>{t.stopPropagation(),this._release(t)},this._release=t=>{void 0!==this._pressedPointer&&t.pointerId===this._pressedPointer&&(this.hasPointerCapture(t.pointerId)&&this.releasePointerCapture(t.pointerId),this._pressedPointer=void 0,this._scheduleHide(2e3))}}connectedCallback(){super.connectedCallback(),this.setAttribute("role","img"),this.addEventListener("click",this._stop),this.addEventListener("contextmenu",this._contextMenu),this.addEventListener("pointerdown",this._pointerDown),this.addEventListener("pointermove",this._pointerMove),this.addEventListener("pointerenter",this._pointerEnter),this.addEventListener("pointerleave",this._pointerLeave),this.addEventListener("pointerup",this._pointerUp),this.addEventListener("pointercancel",this._release),window.addEventListener("pointerup",this._release),window.addEventListener("pointercancel",this._release),this._observer=new ResizeObserver(t=>{const e=t.find(t=>t.target===this);if(!e||!this.isConnected)return;void 0!==this._frame&&cancelAnimationFrame(this._frame);const i=e.contentRect.width;this._frame=requestAnimationFrame(()=>{this._frame=void 0,this.isConnected&&this._width!==i&&(this._width=i)})}),this._observer.observe(this)}disconnectedCallback(){super.disconnectedCallback(),this._observer?.disconnect(),this._observer=void 0,void 0!==this._frame&&cancelAnimationFrame(this._frame),this._frame=void 0,this._hide(),this._dismissed=!1,void 0!==this._pressedPointer&&this.hasPointerCapture(this._pressedPointer)&&this.releasePointerCapture(this._pressedPointer),this._pressedPointer=void 0,this.removeEventListener("click",this._stop),this.removeEventListener("contextmenu",this._contextMenu),this.removeEventListener("pointerdown",this._pointerDown),this.removeEventListener("pointermove",this._pointerMove),this.removeEventListener("pointerenter",this._pointerEnter),this.removeEventListener("pointerleave",this._pointerLeave),this.removeEventListener("pointerup",this._pointerUp),this.removeEventListener("pointercancel",this._release),window.removeEventListener("pointerup",this._release),window.removeEventListener("pointercancel",this._release)}_x(t){const e=this.end-this.start;return e>0?Math.max(0,Math.min(this._width,(t-this.start)/e*this._width)):0}_clearHideTimer(){clearTimeout(this._hideTimer),this._hideTimer=void 0}_pick(t){const e="mouse"===t.pointerType||!t.pointerType;if(e&&this._dismissed)return;const i=t.clientX-this.getBoundingClientRect().left;let s=1/0,o=null;this.points.forEach((t,e)=>{if(null===t.f)return;const r=Math.abs(this._x(t.t)-i);r<s&&(s=r,o=e)}),this._hoverIndex=o,this._mouseBubble=e,null!==o?document.addEventListener("keydown",this._keyDown):this._hide()}_hide(){this._clearHideTimer(),this._hoverIndex=null,document.removeEventListener("keydown",this._keyDown)}_scheduleHide(t){this._clearHideTimer(),this._hideTimer=setTimeout(()=>this._hide(),t)}_inBubble(t){return t.composedPath().some(t=>t instanceof Element&&t.classList.contains("bubble"))}_hoverPoint(){const t=null===this._hoverIndex?void 0:this.points[this._hoverIndex];return null!==t?.f?t:void 0}updated(){this.setAttribute("aria-label",this.summary);const t=this._hoverPoint();t||document.removeEventListener("keydown",this._keyDown);const e=this.shadowRoot?.querySelector(".bubble");if(!t||!e)return;const i=e.getBoundingClientRect().width,s=Math.max(0,Math.min(this._width-i,this._x(t.t)-i/2));e.style.left=`${s}px`}_marker(t,e){if(!t)return K;const i=this._x(t.t),s="min"===e?te:0,o="min"===e?42:6,r=t.ok?"var(--mpl-success)":"var(--mpl-error)";return W`<polygon class=${`${e}-marker`} points=${`${i},${o} ${i-4},${s} ${i+4},${s}`}
      fill=${r}></polygon>
      <circle class=${`${e}-dot`} cx=${i} cy=${ee(t.f)} r="2.5" fill=${r}></circle>`}render(){let t="",e=!1;const i=[];this.points.forEach((s,o)=>{null!==s.f?(t+=`${e?"L":"M"}${this._x(s.t)},${ee(s.f)} `,e=!0,0!==o&&null!==this.points[o-1].f||o!==this.points.length-1&&null!==this.points[o+1].f||i.push(s)):e=!1});const s=`url(#${this._gradientId})`,o=this.thresholdLow,r=this.thresholdHigh,n=this.events.filter(t=>t.t>=this.start&&t.t<=this.end),a=this._hoverPoint(),l=this.current,h="problem"===l?.tone?"var(--mpl-error)":"advisory"===l?.tone?"var(--mpl-on-surface-variant)":"var(--mpl-success)";return G`
      <svg width=${this._width} height=${te} aria-hidden="true" focusable="false">
        <defs>
          <linearGradient id=${this._gradientId} gradientUnits="userSpaceOnUse" x1="0" x2="0" y1="0" y2=${te}>
            <stop offset="0" stop-color=${null===r?"var(--mpl-success)":"var(--mpl-error)"}></stop>
            ${null!==r?W`
              <stop offset=${ee(r)/te} stop-color="var(--mpl-error)"></stop>
              <stop offset=${ee(r)/te} stop-color="var(--mpl-success)"></stop>`:K}
            ${null!==o?W`
              <stop offset=${ee(o)/te} stop-color="var(--mpl-success)"></stop>
              <stop offset=${ee(o)/te} stop-color="var(--mpl-error)"></stop>`:K}
            <stop offset="1" stop-color=${null===o?"var(--mpl-success)":"var(--mpl-error)"}></stop>
          </linearGradient>
        </defs>
        ${[r,o].filter(t=>null!==t).map(t=>W`<line class="threshold-guide" x1="0" x2=${this._width}
          y1=${ee(t)} y2=${ee(t)} stroke="var(--mpl-outline)" opacity="1" stroke-width="1" stroke-dasharray="3 3"></line>`)}
        ${n.map(t=>W`<line class="event-line" x1=${this._x(t.t)} x2=${this._x(t.t)}
          y1="0" y2=${te} stroke="var(--mpl-outline)" stroke-width="1" stroke-dasharray="1 3" opacity="0.8"></line>`)}
        <path class="history-line" d=${t.trim()} fill="none" stroke=${s} stroke-width="2"
          stroke-linecap="round" stroke-linejoin="round"></path>
        ${i.map(t=>W`<circle class="isolated-point" cx=${this._x(t.t)} cy=${ee(t.f)}
          r="1.5" fill=${s}></circle>`)}
        ${this._marker(this.maxMarker,"max")}
        ${this._marker(this.minMarker,"min")}
        ${l&&"unknown"!==l.tone?W`<circle class="current-ring"
          cx=${this._x(l.t)} cy=${ee(l.f)} r="4"
          fill="var(--mpl-range-bar-ring, var(--mpl-surface-container-high))"
          stroke=${h} stroke-width="2"></circle>`:K}
        ${a?W`
          <line class="hover-guide" x1=${this._x(a.t)} x2=${this._x(a.t)} y1="0" y2=${te}
            stroke="var(--mpl-on-surface-variant)" stroke-width="1" opacity="0.4"></line>
          <circle class="hover-dot" cx=${this._x(a.t)} cy=${ee(a.f)} r="3" fill=${((t,e,i)=>null!==e&&t<e||null!==i&&t>i?"var(--mpl-error)":"var(--mpl-success)")(a.f,o,r)}></circle>
        `:K}
      </svg>
      ${n.map(t=>G`<ha-icon class="event-icon" icon=${t.icon} aria-hidden="true"
        style=${`left: ${Math.max(0,Math.min(this._width-14,this._x(t.t)-7))}px`}></ha-icon>`)}
      ${a?G`<div class=${this._mouseBubble?"bubble mouse-bubble":"bubble"} aria-hidden="true"
        @pointerenter=${this._bubbleEnter} @pointerleave=${this._bubbleLeave}>${a.label}</div>`:K}
    `}}se.styles=a`
    :host {
      display: block;
      position: relative;
      height: 48px;
      width: 100%;
      touch-action: pan-y;
      cursor: crosshair;
    }
    svg { display: block; overflow: visible; }
    .event-icon {
      position: absolute;
      top: 0;
      display: block;
      width: 14px;
      height: 14px;
      --mdc-icon-size: 14px;
      color: var(--mpl-on-surface-variant);
      pointer-events: none;
    }
    .bubble.mouse-bubble { pointer-events: auto; }
    .bubble {
      position: absolute;
      bottom: calc(100% + 4px);
      background: var(--mpl-inverse-surface);
      color: var(--mpl-inverse-on-surface);
      font-size: 11px;
      line-height: 16px;
      padding: 2px 6px;
      border-radius: 4px;
      white-space: nowrap;
      pointer-events: none;
      box-sizing: border-box;
      max-width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      z-index: 1;
    }
  `,t([mt({attribute:!1})],se.prototype,"points",void 0),t([mt({type:Number})],se.prototype,"start",void 0),t([mt({type:Number})],se.prototype,"end",void 0),t([mt({attribute:!1})],se.prototype,"minMarker",void 0),t([mt({attribute:!1})],se.prototype,"maxMarker",void 0),t([mt({attribute:!1})],se.prototype,"current",void 0),t([mt({attribute:!1})],se.prototype,"thresholdLow",void 0),t([mt({attribute:!1})],se.prototype,"thresholdHigh",void 0),t([mt({attribute:!1})],se.prototype,"events",void 0),t([mt()],se.prototype,"summary",void 0),t([gt()],se.prototype,"_width",void 0),t([gt()],se.prototype,"_hoverIndex",void 0),t([gt()],se.prototype,"_mouseBubble",void 0),customElements.get("mpl-history-graph")||customElements.define("mpl-history-graph",se);const oe=t=>Lt(t,"",!0),re={"mol/d⋅m²":"mol/d","mol/d·m²":"mol/d","mol/(d⋅m²)":"mol/d"};function ne(t){const e=Math.abs(t);if(e>=1e3)return Lt(t,"",!0);const i=e>=10?0:e>=.1?1:2,[s,o="0"]=String(e).split("e"),r=Number(`${s}e${Number(o)+i}`);return String(Math.sign(t)*Math.round(r)/10**i)}function ae(t,e,i="last 24 h"){return Ot(t)+(e?` · ${i} ${oe(e.min)}–${oe(e.max)}, average ${oe(e.mean)}`:"")}class le extends ct{constructor(){super(...arguments),this.tone="unknown",this.history=null,this.events=[],this.display="summary",this.daily=!1,this.periodText="last 24 h",this.hideUnits=!1,this.showHistory=!0,this.periodLabel="Last 24 h"}render(){const t=this.measurement;if(!t)return K;const e=this.history?.stats??null,i=e=>Et(e,t.min,t.max,t.unit),s=St(e?.mean??null,t.min,t.max),o=(e,i)=>{const s=St(i,t.min,t.max);return G`<span class=${"low"===s||"high"===s?"stat out":"stat"}>
        <span class="stat-label">${e}</span><span class="stat-value">${null===i?"—":ne(i)}</span>
      </span>`};return G`
      <div class="title">
        <ha-icon icon=${t.icon} aria-hidden="true"></ha-icon>
        <span class="label">${t.label}</span>
        ${this.showHistory?G`<span class="period">${this.periodLabel}</span>`:K}
      </div>
      <div class="value">${Lt(t.value,t.unit,!0)}${this.hideUnits||""===t.unit?K:G`<span class="unit">${re[t.unit]??t.unit}</span>`}</div>
      ${"graph"===this.display?(()=>{const i=this.history?.series??[],s=function(t,e,i,s){let o=1/0,r=-1/0;for(const e of t)null!==e&&Number.isFinite(e)&&(o=Math.min(o,e),r=Math.max(r,e));const n=null!==e&&null!==i;if(n&&o<=r){const t=r<=e&&o<e,n=o>=i&&r>i;if(t||n){const a=t?o:i,l=t?e:r,h="lx"===s&&a>0,c=h?Math.log(a):a,p=(h?Math.log(l):l)-c;return{mode:t?"below":"above",map:t=>{if(null===t)return null;const e=h?t<=0?-1/0:Math.log(t):t;return Math.max(0,Math.min(1,.08+.84*(e-c)/p))},thresholdLow:t?.92:null,thresholdHigh:n?.08:null}}}return{mode:"full",map:t=>Et(t,e,i,s),thresholdLow:n?.2:null,thresholdHigh:n?.8:null}}(i.map(({v:t})=>t),t.min,t.max,t.unit),o=i[i.length-1],r=o?.t??Date.now(),n=i[0]?.t??r-864e5,a=this.daily?{weekday:"short",day:"numeric",month:"short"}:r-n<=864e5?{hour:"2-digit",minute:"2-digit"}:{weekday:"short",hour:"2-digit",minute:"2-digit"},l=new Intl.DateTimeFormat(this.locale,{...a,timeZone:this.timeZone}),h=re[t.unit]??t.unit,c=i.map(({t:e,v:i})=>({t:e,f:s.map(i),label:`${l.format(e)} · ${Lt(i,t.unit,!0)}${h?" "+h:""}`})),p=e=>{if(!e)return null;const i=s.map(e.v);return null===i?null:{t:e.t,f:i,ok:"ok"===St(e.v,t.min,t.max)}},u=s.map(o?.v??null);return G`<mpl-history-graph
        .points=${c} .start=${n} .end=${r}
        .thresholdLow=${s.thresholdLow} .thresholdHigh=${s.thresholdHigh} .events=${this.events}
        .minMarker=${p(this.history?.minPoint??null)}
        .maxMarker=${p(this.history?.maxPoint??null)}
        .current=${o&&null!==u?{t:o.t,f:u,tone:this.tone}:null}
        .summary=${ae(t,e,this.periodText)}
      ></mpl-history-graph>`})():G`<mpl-range-bar
          .value=${i(t.value)}
          .tone=${this.tone}
          .spanFrom=${e?i(e.min):null}
          .spanTo=${e?i(e.max):null}
          .avg=${e?i(e.mean):null}
          .avgOk=${"unknown"===s?null:"ok"===s}
          .showTicks=${null!==t.min&&null!==t.max}
      ></mpl-range-bar>`}
      ${null!==t.min&&null!==t.max?G`<span class="ideal">Ideal ${ne(t.min)}–${ne(t.max)}</span>`:K}
      ${"summary"===this.display&&this.showHistory?G`<div class="stats">
        ${o("Min",e?.min??null)}
        ${o("Avg",e?.mean??null)}
        ${o("Max",e?.max??null)}
      </div>`:K}
    `}}le.styles=a`
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
    mpl-history-graph {
      grid-column: 2;
      grid-row: 2 / 4;
      min-width: 0;
      height: calc(var(--mpl-metric-value-line) + var(--mpl-metric-caption-line));
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
  `,t([mt({attribute:!1})],le.prototype,"measurement",void 0),t([mt({reflect:!0})],le.prototype,"tone",void 0),t([mt({attribute:!1})],le.prototype,"history",void 0),t([mt({attribute:!1})],le.prototype,"events",void 0),t([mt()],le.prototype,"display",void 0),t([mt({type:Boolean})],le.prototype,"daily",void 0),t([mt()],le.prototype,"periodText",void 0),t([mt()],le.prototype,"locale",void 0),t([mt({attribute:"time-zone"})],le.prototype,"timeZone",void 0),t([mt({type:Boolean,attribute:"hide-units"})],le.prototype,"hideUnits",void 0),t([mt({type:Boolean,attribute:"show-history"})],le.prototype,"showHistory",void 0),t([mt({type:String,attribute:"period-label"})],le.prototype,"periodLabel",void 0),customElements.get("mpl-metric-row")||customElements.define("mpl-metric-row",le);const he=(()=>{const t=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M${Array.from({length:180},(t,e)=>{const i=2*e*Math.PI/180,s=50*(.94+.06*Math.cos(9*i));return`${(50+s*Math.cos(i)).toFixed(3)},${(50+s*Math.sin(i)).toFixed(3)}`}).join(" L")} Z" fill="white"/></svg>`;return`url("data:image/svg+xml,${encodeURIComponent(t)}")`})();class ce extends ct{constructor(){super(...arguments),this._gaugeCapacity=6,this._statsMap={hourly:{},cumulative:{},failedGroups:{hourly:!1,cumulative:!1}},this._statsRequest=0,this._statsLastFetch=-1/0,this._statsPending=!0,this._lastFetch=-1/0,this._request=0,this._pending=!1,this._tooltipHovered=!1,this._touchTooltip=!1,this._graphPointerRelease=t=>{const e=this._graphPress;e&&e.id===t.pointerId&&(this._graphPress=void 0,"pointercancel"!==t.type&&"mouse"===t.pointerType&&this._fromGraph(t)||e.tile.classList.remove("graph-active"))},this._hideTooltip=()=>{clearTimeout(this._tooltipShowTimer),clearTimeout(this._tooltipHideTimer),this._tooltipShowTimer=void 0,this._tooltipHideTimer=void 0,this._tooltip=void 0,this._tooltipSource=void 0,this._hoveredGauge=void 0,this._tooltipHovered=!1,this._focusedGauge=void 0,this._touchTooltip=!1,document.removeEventListener("pointerdown",this._dismissTooltip,!0)},this._dismissTooltip=()=>{this._hideTooltip(),this._press=void 0,this._clearClickSuppression()},this._tooltipKeydown=t=>{this._clearClickSuppression(),"Escape"===t.key&&this._dismissTooltip()},this._gaugePointerMove=t=>{const e=this._press;e&&t.pointerId===e.id&&Math.hypot(t.clientX-e.x,t.clientY-e.y)>8&&this._dismissTooltip()},this._gaugePointerUp=t=>{const e=this._press;e&&t.pointerId===e.id&&(clearTimeout(this._tooltipShowTimer),this._tooltipShowTimer=void 0,this._press=void 0,e.long&&this._suppressClick?.id===e.id&&(this._suppressClick.released=!0,this._suppressClickTimer=setTimeout(()=>this._clearClickSuppression(),800)))},this._gaugePointerCancel=t=>{t.pointerId!==this._press?.id&&t.pointerId!==this._suppressClick?.id||this._dismissTooltip()}}get hass(){return this._hass}set hass(t){const e=this._hass;this._hass=t,this.requestUpdate("hass",e);const i=this._config?.entity;!i||!t||e&&e.states[i]?.last_updated===t.states[i]?.last_updated||this._queueFetch()}_fromGraph(t){return t.composedPath().some(t=>t instanceof Element&&"MPL-HISTORY-GRAPH"===t.tagName)}_tilePointerOver(t){const e=t.currentTarget;e.classList.toggle("graph-active",this._fromGraph(t)||this._graphPress?.tile===e)}_tilePointerOut(t){const e=t.currentTarget;this._fromGraph(t)&&this._graphPress?.tile!==e&&e.classList.remove("graph-active")}_tilePointerDown(t){if(!this._fromGraph(t))return;const e=t.currentTarget;this._graphPress={tile:e,id:t.pointerId},e.classList.add("graph-active")}_tilePointerLeave(t){const e=t.currentTarget;e.classList.remove("graph-active"),this._graphPress?.tile===e&&(this._graphPress=void 0)}_clearClickSuppression(){clearTimeout(this._suppressClickTimer),this._suppressClickTimer=void 0,this._suppressClick=void 0}_showTooltip(t,e){clearTimeout(this._tooltipHideTimer),this._tooltipHideTimer=void 0,this._tooltip=t,this._tooltipSource=e,this._touchTooltip="touch"===e,this._touchTooltip&&document.addEventListener("pointerdown",this._dismissTooltip,!0)}_gaugePointerDown(t){if(this._dismissTooltip(),"touch"!==t.pointerType&&"pen"!==t.pointerType)return;const e=t.currentTarget,i={button:e,id:t.pointerId,x:t.clientX,y:t.clientY,long:!1};this._press=i,this._tooltipShowTimer=setTimeout(()=>{this._tooltipShowTimer=void 0,i.long=!0,this._suppressClick={button:e,id:i.id,released:!1},this._showTooltip(e,"touch")},450)}_gaugePointerEnter(t){if("mouse"!==t.pointerType)return;const e=t.currentTarget;if(this._tooltip===e)return this._hoveredGauge=e,clearTimeout(this._tooltipHideTimer),void(this._tooltipHideTimer=void 0);this._focusedGauge||this._touchTooltip||(this._dismissTooltip(),this._hoveredGauge=e,this._tooltipShowTimer=setTimeout(()=>{this._tooltipShowTimer=void 0,this._showTooltip(e,"mouse")},500))}_gaugePointerLeave(t){"mouse"===t.pointerType&&(this._hoveredGauge===t.currentTarget&&(this._hoveredGauge=void 0),clearTimeout(this._tooltipShowTimer),this._tooltipShowTimer=void 0,this._scheduleTooltipHide())}_scheduleTooltipHide(){clearTimeout(this._tooltipHideTimer),this._tooltip&&!this._touchTooltip&&(this._tooltipHideTimer=setTimeout(()=>{this._tooltipHideTimer=void 0,this._hoveredGauge||this._tooltipHovered||this._focusedGauge||this._hideTooltip()},150))}_tooltipPointerEnter(){this._tooltipHovered=!0,clearTimeout(this._tooltipHideTimer),this._tooltipHideTimer=void 0}_tooltipPointerLeave(){this._tooltipHovered=!1,this._scheduleTooltipHide()}_gaugeBlur(){this._focusedGauge=void 0,this._hoveredGauge||this._tooltipHovered||this._touchTooltip||this._hideTooltip()}_gaugeFocus(t){const e=t.currentTarget;e.matches(":focus-visible")&&(this._tooltip!==e&&this._dismissTooltip(),this._focusedGauge=e,this._showTooltip(e,"focus"))}_gaugeClick(t,e){const i=this._suppressClick;if(0===t.detail&&this._clearClickSuppression(),t.detail>0&&i?.released&&t.currentTarget===i.button&&(!(t instanceof PointerEvent)||t.pointerId===i.id))return this._clearClickSuppression(),t.preventDefault(),void t.stopPropagation();this._moreInfo(e)}updated(){this._positionTooltip(),this._syncStats()}_isCumulative(t){const e=t?this.hass?.states[t]?.attributes.state_class:void 0;return"total"===e||"total_increasing"===e}_statsSensors(t){const e="string"==typeof this.hass?.config?.time_zone?this.hass.config.time_zone:void 0,i=new Set,s=new Set;let o=0,r=1;const n=[];if(this.hass&&this._config&&this.hass.states[this._config.entity])for(const t of At(this._info,this._config.show_bars??ft,this.hass.states)){if(!t.sensor)continue;const e=Pt(this._config,t.key),a=this._isCumulative(t.sensor);(a?s:i).add(t.sensor),a?r=Math.max(r,e.days):o=Math.max(o,wt[e.period]),n.push([t.key,t.sensor,a,e.period,e.days,e.daylightOnly,e.daylightOffset])}return{fetch:{hourly:[...i],hourlyStart:t-o,cumulative:[...s],cumulativeStart:Wt(t,r-1,e)},key:JSON.stringify([this._config?.entity,n,this.hass?.config?.latitude,this.hass?.config?.longitude,e])}}_stopStats(t=!1){clearTimeout(this._statsTimer),this._statsTimer=void 0,this._statsRequest++,this._statsPending||=void 0!==this._statsInFlight,this._statsInFlight=void 0,t&&(this._statsKey=void 0,this._statsPending=!0,(Object.keys(this._statsMap.hourly).length||Object.keys(this._statsMap.cumulative).length)&&(this._statsMap={hourly:{},cumulative:{},failedGroups:{hourly:!1,cumulative:!1}}))}_syncStats(){if("compact"===this._config?.display_type||this._config?.hide_history)return void this._stopStats(!0);if(!(this.isConnected&&this.hass&&this._info&&this._config))return;const{fetch:t,key:e}=this._statsSensors(Date.now());if(e!==this._statsKey&&(this._statsKey=e,this._statsRequest++,this._statsPending=!0),!t.hourly.length&&!t.cumulative.length)return clearTimeout(this._statsTimer),void(this._statsTimer=void 0);const i=Date.now()-this._statsLastFetch,s=this._statsPending?Math.max(0,6e4-i):Math.max(0,6e5-i);clearTimeout(this._statsTimer),this._statsTimer=void 0,0===s?this._fetchStats(t):this._statsTimer=setTimeout(()=>{this._statsTimer=void 0,this._statsPending=!0,this._syncStats()},s)}async _fetchStats(t){const e=this.hass,i=++this._statsRequest;this._statsInFlight=i,this._statsPending=!1,this._statsLastFetch=Date.now(),this._syncStats();const s=await async function(t,e,i=Date.now()){const s={hourly:{},cumulative:{},failedGroups:{hourly:!1,cumulative:!1}};return await Promise.all(["hourly","cumulative"].map(async o=>{try{const r=[...new Set(e[o])];if(0===r.length)return;s[o]=await t.callWS({type:"recorder/statistics_during_period",start_time:new Date("hourly"===o?e.hourlyStart:e.cumulativeStart).toISOString(),end_time:new Date(i).toISOString(),statistic_ids:r,period:"hour",types:"hourly"===o?["min","max","mean"]:["state"]})}catch{s.failedGroups[o]=!0}})),s}({callWS:t=>e.callWS(t)},t,this._statsLastFetch);i===this._statsRequest&&this.isConnected&&(this._statsMap={...s,hourly:s.failedGroups.hourly?this._statsMap.hourly:s.hourly,cumulative:s.failedGroups.cumulative?this._statsMap.cumulative:s.cumulative}),this._statsInFlight===i&&(this._statsInFlight=void 0),this._syncStats()}_positionTooltip(){const t=this.shadowRoot?.querySelector(".tooltip"),e=this.shadowRoot?.querySelector("ha-card"),i=this._tooltip;if(!t||!e||!i)return;if(!i.isConnected)return void this._dismissTooltip();const s=e.getBoundingClientRect(),o=i.getBoundingClientRect(),r=getComputedStyle(t),n=parseFloat(r.width),a=parseFloat(r.height),l=o.left+o.width/2-s.left-e.clientLeft,h=Math.max(8,Math.min(l-n/2,e.clientWidth-8-n));t.style.left=`${h}px`,t.style.top=o.top-s.top-e.clientTop-a-4+"px"}setConfig(t){if(!t||"string"!=typeof t.entity||!t.entity.startsWith("plant."))throw new Error("Specify a plant entity");const e=this._config?.entity!==t.entity;this._config={...t,show_bars:t.show_bars?[...t.show_bars]:void 0},this._dismissTooltip(),this._statsRequest++,this._statsPending=!0,(e||"compact"===t.display_type||t.hide_history)&&this._stopStats(!0),e&&(this._info=void 0,this._request++,this._queueFetch()),this._syncStats()}getCardSize(){if("compact"===this._config?.display_type)return 4;const t=this.hass&&this._config&&this.hass.states[this._config.entity]?At(this._info,this._config.show_bars??ft,this.hass.states).length:0;return Math.ceil((100+86*t)/50)}getGridOptions(){return{columns:6,min_columns:4,rows:"auto"}}static getConfigForm(){return Ut}static getStubConfig(t){return{type:`custom:${vt}`,entity:Object.keys(t.states).find(t=>t.startsWith("plant."))??"plant.my_plant",show_bars:[...ft]}}_queueFetch(){if(this._request++,this._pending=!0,!this.isConnected||!this.hass||!this._config)return;const t=Math.max(0,5e3-(Date.now()-this._lastFetch));0===t?(void 0!==this._timer&&clearTimeout(this._timer),this._timer=void 0,this._fetchInfo()):void 0===this._timer&&(this._timer=setTimeout(()=>{this._timer=void 0,this._fetchInfo()},t))}async _fetchInfo(){const t=this.hass,e=this._config?.entity;if(!this.isConnected||!t||!e)return;this._pending=!1,this._lastFetch=Date.now();const i=++this._request;this._inFlight=i;try{const s=await t.callWS({type:"plant/get_info",entity_id:e});i===this._request&&e===this._config?.entity&&s?.result&&(this._info=s.result)}catch{}finally{this._inFlight===i&&(this._inFlight=void 0)}}connectedCallback(){super.connectedCallback(),this._pending&&this._queueFetch(),this._syncStats(),this._observeGauges(),window.addEventListener("pointermove",this._gaugePointerMove,!0),window.addEventListener("pointerup",this._gaugePointerUp,!0),window.addEventListener("pointercancel",this._gaugePointerCancel,!0),window.addEventListener("pointerup",this._graphPointerRelease,!0),window.addEventListener("pointercancel",this._graphPointerRelease,!0),window.addEventListener("scroll",this._dismissTooltip,!0),this.addEventListener("scroll",this._dismissTooltip,!0),window.addEventListener("keydown",this._tooltipKeydown,!0)}disconnectedCallback(){super.disconnectedCallback(),this._stopStats(),this._dismissTooltip(),window.removeEventListener("pointermove",this._gaugePointerMove,!0),window.removeEventListener("pointerup",this._gaugePointerUp,!0),window.removeEventListener("pointercancel",this._gaugePointerCancel,!0),window.removeEventListener("pointerup",this._graphPointerRelease,!0),window.removeEventListener("pointercancel",this._graphPointerRelease,!0),this._graphPress=void 0,this.shadowRoot?.querySelectorAll(".graph-active").forEach(t=>t.classList.remove("graph-active")),window.removeEventListener("scroll",this._dismissTooltip,!0),this.removeEventListener("scroll",this._dismissTooltip,!0),window.removeEventListener("keydown",this._tooltipKeydown,!0),this._gaugesObserver?.disconnect(),this._gaugesObserver=void 0,void 0!==this._gaugesFrame&&cancelAnimationFrame(this._gaugesFrame),this._gaugesFrame=void 0,void 0!==this._timer&&clearTimeout(this._timer),this._timer=void 0,this._pending||=void 0!==this._inFlight,this._inFlight=void 0,this._request++}_observeGauges(){this.isConnected&&!this._gaugesObserver&&(this._gaugesObserver=new ResizeObserver(t=>{for(const e of t){if(!this.isConnected||e.target!==this)continue;void 0!==this._gaugesFrame&&cancelAnimationFrame(this._gaugesFrame),this._gaugesFrame=void 0;const t=e.contentRect.width-32,i=Math.max(1,Math.floor((t+4)/48));this._gaugesFrame=requestAnimationFrame(()=>{this._gaugesFrame=void 0,this.isConnected&&(i!==this._gaugeCapacity&&(this._gaugeCapacity=i),this._tooltip&&this._positionTooltip())})}}),this._gaugesObserver.observe(this))}shouldUpdate(t){if(t.has("_statsMap")||t.has("_tooltip")||t.has("_tooltipSource")||t.has("_config")||t.has("_info")||t.has("_failedSrc")||t.has("_gaugeCapacity"))return!0;if(!this._config||!this.hass||!t.has("hass"))return!1;const e=t.get("hass");if(!e)return!0;if(e.config?.latitude!==this.hass.config?.latitude||e.config?.longitude!==this.hass.config?.longitude||e.config?.time_zone!==this.hass.config?.time_zone||e.locale?.language!==this.hass.locale?.language||e.language!==this.hass.language)return!0;const i=new Set([this._config.entity]);this._config.battery_sensor&&i.add(this._config.battery_sensor);for(const t of this._config.show_bars??ft){const e=this._info?.[t]?.sensor;e&&i.add(e)}return[...i].some(t=>e.states[t]!==this.hass.states[t])}_moreInfo(t){this.dispatchEvent(new CustomEvent("hass-more-info",{detail:{entityId:t},bubbles:!0,composed:!0}))}render(){if(!this._config||!this.hass)return K;const t=this._config,e="string"==typeof this.hass.config?.time_zone?this.hass.config.time_zone:void 0,i=this.hass.states[t.entity];if(!i)return G`<ha-card><div class="warning">Entity not available: ${t.entity}</div></ha-card>`;const s="compact"===t.display_type,o=t.hide_units??!1,r=Object.fromEntries(Object.keys(t.metrics??{}).map(e=>[e,Pt(t,e).icon??""])),n=At(this._info,t.show_bars??ft,this.hass.states,r),a=n[this._tooltip?Array.from(this.shadowRoot.querySelectorAll(".gauge-btn")).indexOf(this._tooltip):-1],l=a?function(t){const e=t=>{const e=Math.abs(t);return String(Ct(t,e>=100?0:e>=10?1:2))},i=t.unit?` ${t.unit}`:"",s="low"===t.status?" · too low":"high"===t.status?" · too high":"",o=null===t.value?"—":e(t.value),r=null===t.min||null===t.max?"":` · ideal ${e(t.min)}–${e(t.max)}${i}`;return[t.label+s,`${o}${i}${r}`]}(a):void 0,h=n.length,c=Math.ceil(h/this._gaugeCapacity),p=h?Math.ceil(h/c):1,u=function(t,e,i){const s=[],o=new Set,r=t?.attributes.problems,n=new Map;if(Array.isArray(r))for(const t of r){if(!t||"object"!=typeof t)continue;const{sensor_type:e,status:i}=t;if("string"!=typeof e||n.has(e))continue;const s="string"==typeof i?i:"";n.set(e,{key:e,label:Tt(e),status:/low/i.test(s)?"low":/high/i.test(s)?"high":"problem"})}for(const t of e){if(o.has(t.key))continue;const e=Pt(i,t.key).trigger;if("plant"===e){const e=n.get(t.key);if(!e)continue;s.push({...e,label:t.label})}else{if("low"!==t.status&&"high"!==t.status)continue;if("out_of_range"!==e&&e!==t.status)continue;s.push({key:t.key,label:t.label,status:t.status})}o.add(t.key)}const a=new Set(e.map(t=>t.key));for(const[t,e]of n)a.has(t)||o.has(t)||"plant"!==Pt(i,t).trigger||(s.push(e),o.add(t));return Array.isArray(r)||"problem"!==t?.state||"gauges"===i.problem_source||o.has("plant")||s.push({key:"plant",label:"Needs attention",status:"problem"}),s}(i,n,t),d=t.name||i.attributes.friendly_name||t.entity,m=u.length?u.map(t=>"problem"===t.status?t.label:`${t.label} ${t.status}`).join(" · "):t.hide_species?void 0:i.attributes.species,g=t.image??i.attributes.entity_picture,v="string"==typeof g&&g?g:void 0;v!==this._imageSrc&&(this._imageSrc=v,this._failedSrc=void 0);const _=t.battery_sensor?this.hass.states[t.battery_sensor]:void 0,y=function(t,e=10){const i=Mt(t?.state),s=null===i?null:Math.max(0,Math.min(100,Math.round(i))),o=Number.isFinite(e)?e:10;return{level:s,tone:null===s?"unknown":s<o?"low":"ok"}}(_,t.battery_warn_level);return G`
      <ha-card class=${s?"compact":"full"}>
        <div class=${"header "+(t.hide_image?"no-image":"")}>
          ${t.hide_image?K:G`
            <button class="image-btn" type="button" aria-label=${`More information about ${d}`} @click=${()=>this._moreInfo(t.entity)}>
              ${v&&v!==this._failedSrc?G`<img class="photo" src=${v} alt="" @error=${()=>{this._failedSrc=v}}>`:G`<span class="photo placeholder"><ha-icon icon="mdi:flower-outline" aria-hidden="true"></ha-icon></span>`}
              ${u.length?G`<span class="problem-badge" aria-label="Needs attention">
                <svg viewBox="0 0 18 18" aria-hidden="true" focusable="false">
                  <rect x="8" y="4" width="2" height="6.5" rx="1"></rect>
                  <circle cx="9" cy="13.25" r="1.25"></circle>
                </svg>
              </span>`:K}
            </button>`}
          <button class="text-btn" type="button" aria-label=${`More information about ${d}`} @click=${()=>this._moreInfo(t.entity)}>
            <span class="name" title=${d}>${d}</span>
            ${m?G`<span class=${"subtitle "+(u.length?"problems":"")} title=${m}>${m}</span>`:K}
          </button>
          ${_?G`
            <button class="battery" type="button" aria-label=${`Battery: ${null===y.level?"unknown":`${y.level}%`}. More information`}
              @click=${e=>{e.stopPropagation(),this._moreInfo(t.battery_sensor)}}>
              <mpl-battery .level=${y.level} .tone=${y.tone}></mpl-battery>
            </button>`:K}
        </div>
        ${!s&&n.length?G`<div class="tiles">${n.map(i=>{const s=Pt(t,i.key),r=Date.now(),n=this._isCumulative(i.sensor),a=this.hass.config?.latitude,l=this.hass.config?.longitude,h="illuminance"===i.key&&!n&&Number.isFinite(a)&&Number.isFinite(l)&&s.periodMs<=2592e5?function(t,e,i,s){const o=[];for(let r=t-Zt;r<=e+Zt;r+=Zt){const n=Xt(r,i,s);if("string"!=typeof n)for(const i of["sunrise","sunset"]){const s=n[i];t<=s&&s<=e&&o.push({t:s,kind:i})}}return o.sort((t,e)=>t.t-e.t),o.filter((t,e)=>0===e||t.t-o[e-1].t>Kt)}(r-s.periodMs,r,a,l).map(t=>({t:t.t,icon:"sunrise"===t.kind?"mdi:weather-sunset-up":"mdi:weather-sunset-down"})):[],c=!n&&s.daylightOnly&&Number.isFinite(a)&&Number.isFinite(l),p=c?(t,e)=>function(t,e,i,s,o){const r=Xt((t+e)/2,i,s);if("polar-day"===r)return!0;if("polar-night"===r)return!1;const n=o*Kt;return t>=r.sunrise+n&&e<=r.sunset-n}(t,e,a,l,s.daylightOffset):void 0,d=!p||p(r,r),m=t.hide_history?null:n?function(t,e){const i=Math.max(1,Math.min(30,Math.round(e.days))),s={stats:null,series:[],minPoint:null,maxPoint:null};let o=0,r=0;for(let n=i-1;n>=0;n--){const a=Wt(e.now,n,e.timeZone),l=Wt(e.now,n-1,e.timeZone),h=(t??[]).filter(t=>a<=t.start&&t.start<l).sort((t,e)=>t.start-e.start);let c=null;for(const t of h){const e="number"==typeof t.state&&Number.isFinite(t.state)?t.state:null;null!==e&&(c=null===c?e:Math.max(c,e)),1===i&&s.series.push({t:(t.start+t.end)/2,v:e})}if(0===n&&null!==e.current&&(c=null===c?e.current:Math.max(c,e.current),1===i&&s.series.push({t:e.now,v:e.current})),1===i)return s.stats=null===c?null:{min:c,max:c,mean:c},s;const p=a+432e5;s.series.push({t:p,v:c}),null!==c&&((null===s.minPoint||c<s.minPoint.v)&&(s.minPoint={t:p,v:c}),(null===s.maxPoint||c>s.maxPoint.v)&&(s.maxPoint={t:p,v:c}),o+=c,r++)}return null!==s.minPoint&&null!==s.maxPoint&&(s.stats={min:s.minPoint.v,max:s.maxPoint.v,mean:o/r}),s}(i.sensor?this._statsMap.cumulative[i.sensor]:void 0,{days:s.days,now:r,current:i.value,timeZone:e}):function(t,e){const i={stats:null,series:[],minPoint:null,maxPoint:null};let s=0,o=0;const r=(t??[]).filter(t=>e.start<=t.start&&t.start<e.now).sort((t,e)=>t.start-e.start);for(const t of r){const r=(t.start+t.end)/2;"number"==typeof t.min&&Number.isFinite(t.min)&&"number"==typeof t.max&&Number.isFinite(t.max)&&"number"==typeof t.mean&&Number.isFinite(t.mean)&&(!e.keep||e.keep(t.start,t.end))?(i.series.push({t:r,v:t.mean}),(null===i.minPoint||t.min<i.minPoint.v)&&(i.minPoint={t:r,v:t.min}),(null===i.maxPoint||t.max>i.maxPoint.v)&&(i.maxPoint={t:r,v:t.max}),s+=t.mean,o++):i.series.push({t:r,v:null})}var n,a;return null!==i.minPoint&&null!==i.maxPoint&&(i.stats={min:i.minPoint.v,max:i.maxPoint.v,mean:s/o}),null!==e.current&&(i.series.push({t:e.now,v:e.current}),null!==i.minPoint&&e.current<i.minPoint.v&&(i.minPoint={t:e.now,v:e.current}),null!==i.maxPoint&&e.current>i.maxPoint.v&&(i.maxPoint={t:e.now,v:e.current}),i.stats=(n=i.stats,a=e.current,null===n||null===a?n:{min:Math.min(n.min,a),max:Math.max(n.max,a),mean:n.mean})),i}(i.sensor?this._statsMap.hourly[i.sensor]:void 0,{start:r-s.periodMs,now:r,current:d?i.value:null,keep:p}),g=Ht(i,u),v=n||!d||"low"!==i.status&&"high"!==i.status?g:"problem",_="24h"===s.period?"24 h":`${parseInt(s.period)} d`,y="24h"===s.period?"24 h":`${parseInt(s.period)} days`,f=n?1===s.days?"Today":`Daily max · ${s.days} d`:`${c?"Daylight ·":"Last"} ${_}`,b=n?1===s.days?"today":`daily maximum, last ${s.days} days`:`${c?"daylight, ":""}last ${y}`;return G`<div class=${"tile"+("problem"===g?" problem":"")} role="button" tabindex="0" aria-label=${ae(i,m?.stats??null,b)}
            @pointerover=${this._tilePointerOver} @pointerout=${this._tilePointerOut} @pointerleave=${this._tilePointerLeave}
            @pointerdown=${{handleEvent:t=>this._tilePointerDown(t),capture:!0}}
            @click=${()=>this._moreInfo(i.sensor??t.entity)}
            @keydown=${e=>{e.target!==e.currentTarget||"Enter"!==e.key&&" "!==e.key||(" "===e.key&&e.preventDefault(),this._moreInfo(i.sensor??t.entity))}}>
            <mpl-metric-row .measurement=${i} .tone=${v} .display=${s.display} .history=${m} .events=${h}
              .periodLabel=${f} .periodText=${b} .daily=${n&&s.days>1}
              .locale=${this.hass.locale?.language??this.hass.language} .timeZone=${e} .hideUnits=${o} .showHistory=${!t.hide_history}></mpl-metric-row>
          </div>`})}</div>`:K}
        ${s&&n.length?G`<div class="gauges" style=${`--mpl-cols: ${p}`}>${n.map(e=>G`
          <button class="gauge-btn" type="button" aria-label=${Ot(e)}
            @pointerdown=${this._gaugePointerDown} @pointerenter=${this._gaugePointerEnter} @pointerleave=${this._gaugePointerLeave}
            @focus=${this._gaugeFocus} @blur=${this._gaugeBlur}
            @contextmenu=${t=>t.preventDefault()}
            @click=${i=>this._gaugeClick(i,e.sensor??t.entity)}>
            <mpl-gauge .embedded=${!0} .fraction=${e.fraction} .tone=${Ht(e,u)} .icon=${e.icon}
              .value=${o?"":Lt(e.value,e.unit,o)} .label=${Ot(e)}></mpl-gauge>
          </button>`)}</div>`:K}
        ${s&&this._tooltip&&l?G`<div class="tooltip" role="tooltip" id="mpl-tooltip" data-source=${this._tooltipSource}
          @pointerenter=${this._tooltipPointerEnter} @pointerleave=${this._tooltipPointerLeave}>
          <span class="tooltip-title">${l[0]}</span>
          <span class="tooltip-body">${l[1]}</span>
        </div>`:K}
      </ha-card>`}}ce.styles=[Nt,a`
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
    button:focus-visible, .tile:focus-visible { outline: 2px solid var(--mpl-primary); outline-offset: 2px; }
    .image-btn { position: relative; width: 56px; height: 56px; border-radius: var(--mpl-shape-full); }
    .photo { display: block; width: 100%; height: 100%; object-fit: cover; mask-image: ${n(he)}; -webkit-mask-image: ${n(he)}; mask-size: 100% 100%; -webkit-mask-size: 100% 100%; }
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
    .tile { box-sizing: border-box; width: 100%; text-align: left; cursor: pointer; padding: var(--mpl-tile-padding); background: var(--mpl-surface-container-high); border-radius: var(--mpl-tile-corner); --mpl-range-bar-ring: var(--mpl-surface-container-high); }
    .tile.problem { background: linear-gradient(to right, var(--mpl-surface-container-high) 45%, color-mix(in srgb, var(--mpl-error-container) 40%, var(--mpl-surface-container-high))); }
    .tile:first-child { border-top-left-radius: var(--mpl-tile-outer-corner); border-top-right-radius: var(--mpl-tile-outer-corner); }
    .tile:last-child { border-bottom-left-radius: var(--mpl-tile-outer-corner); border-bottom-right-radius: var(--mpl-tile-outer-corner); }
    /* Touch can leave a sticky :hover after scrubbing; only hover-capable inputs get this layer. */
    @media (hover: hover) {
      .tile:hover:not(.graph-active) { background-color: color-mix(in srgb, var(--mpl-on-surface) 8%, var(--mpl-surface-container-high)); }
    }
    .warning { color: var(--mpl-error); }
  `],t([mt({attribute:!1,noAccessor:!0})],ce.prototype,"hass",null),t([gt()],ce.prototype,"_config",void 0),t([gt()],ce.prototype,"_info",void 0),t([gt()],ce.prototype,"_failedSrc",void 0),t([gt()],ce.prototype,"_gaugeCapacity",void 0),t([gt()],ce.prototype,"_statsMap",void 0),t([gt()],ce.prototype,"_tooltip",void 0),t([gt()],ce.prototype,"_tooltipSource",void 0),customElements.get(vt)||customElements.define(vt,ce);const pe=window;pe.customCards??=[],pe.customCards.some(t=>t.type===vt)||pe.customCards.push({type:vt,name:_t,description:"A Material 3 Expressive plant card with circular range gauges, problem states and a battery indicator.",preview:!0,documentationURL:"https://github.com/lageorgem/ha-material-plant-card"}),console.info(`${_t} v0.1.0`);export{ce as MaterialPlantCard};
