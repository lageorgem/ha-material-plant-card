function t(t,e,i,s){var r,o=arguments.length,a=o<3?e:null===s?s=Object.getOwnPropertyDescriptor(e,i):s;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(t,e,i,s);else for(var n=t.length-1;n>=0;n--)(r=t[n])&&(a=(o<3?r(a):o>3?r(e,i,a):r(e,i))||a);return o>3&&a&&Object.defineProperty(e,i,a),a}"function"==typeof SuppressedError&&SuppressedError;const e=globalThis,i=e.ShadowRoot&&(void 0===e.ShadyCSS||e.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,s=Symbol(),r=new WeakMap;let o=class{constructor(t,e,i){if(this._$cssResult$=!0,i!==s)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e}get styleSheet(){let t=this.o;const e=this.t;if(i&&void 0===t){const i=void 0!==e&&1===e.length;i&&(t=r.get(e)),void 0===t&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),i&&r.set(e,t))}return t}toString(){return this.cssText}};const a=t=>new o("string"==typeof t?t:t+"",void 0,s),n=(t,...e)=>{const i=1===t.length?t[0]:e.reduce((e,i,s)=>e+(t=>{if(!0===t._$cssResult$)return t.cssText;if("number"==typeof t)return t;throw Error("Value passed to 'css' function must be a 'css' function result: "+t+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+t[s+1],t[0]);return new o(i,t,s)},l=i?t=>t:t=>t instanceof CSSStyleSheet?(t=>{let e="";for(const i of t.cssRules)e+=i.cssText;return a(e)})(t):t,{is:h,defineProperty:c,getOwnPropertyDescriptor:p,getOwnPropertyNames:d,getOwnPropertySymbols:u,getPrototypeOf:m}=Object,g=globalThis,v=g.trustedTypes,y=v?v.emptyScript:"",f=g.reactiveElementPolyfillSupport,_=(t,e)=>t,b={toAttribute(t,e){switch(e){case Boolean:t=t?y:null;break;case Object:case Array:t=null==t?t:JSON.stringify(t)}return t},fromAttribute(t,e){let i=t;switch(e){case Boolean:i=null!==t;break;case Number:i=null===t?null:Number(t);break;case Object:case Array:try{i=JSON.parse(t)}catch(t){i=null}}return i}},$=(t,e)=>!h(t,e),x={attribute:!0,type:String,converter:b,reflect:!1,useDefault:!1,hasChanged:$};Symbol.metadata??=Symbol("metadata"),g.litPropertyMetadata??=new WeakMap;let w=class extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,e=x){if(e.state&&(e.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(t)&&((e=Object.create(e)).wrapped=!0),this.elementProperties.set(t,e),!e.noAccessor){const i=Symbol(),s=this.getPropertyDescriptor(t,i,e);void 0!==s&&c(this.prototype,t,s)}}static getPropertyDescriptor(t,e,i){const{get:s,set:r}=p(this.prototype,t)??{get(){return this[e]},set(t){this[e]=t}};return{get:s,set(e){const o=s?.call(this);r?.call(this,e),this.requestUpdate(t,o,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??x}static _$Ei(){if(this.hasOwnProperty(_("elementProperties")))return;const t=m(this);t.finalize(),void 0!==t.l&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty(_("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(_("properties"))){const t=this.properties,e=[...d(t),...u(t)];for(const i of e)this.createProperty(i,t[i])}const t=this[Symbol.metadata];if(null!==t){const e=litPropertyMetadata.get(t);if(void 0!==e)for(const[t,i]of e)this.elementProperties.set(t,i)}this._$Eh=new Map;for(const[t,e]of this.elementProperties){const i=this._$Eu(t,e);void 0!==i&&this._$Eh.set(i,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){const e=[];if(Array.isArray(t)){const i=new Set(t.flat(1/0).reverse());for(const t of i)e.unshift(l(t))}else void 0!==t&&e.push(l(t));return e}static _$Eu(t,e){const i=e.attribute;return!1===i?void 0:"string"==typeof i?i:"string"==typeof t?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this))}addController(t){(this._$EO??=new Set).add(t),void 0!==this.renderRoot&&this.isConnected&&t.hostConnected?.()}removeController(t){this._$EO?.delete(t)}_$E_(){const t=new Map,e=this.constructor.elementProperties;for(const i of e.keys())this.hasOwnProperty(i)&&(t.set(i,this[i]),delete this[i]);t.size>0&&(this._$Ep=t)}createRenderRoot(){const t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return((t,s)=>{if(i)t.adoptedStyleSheets=s.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(const i of s){const s=document.createElement("style"),r=e.litNonce;void 0!==r&&s.setAttribute("nonce",r),s.textContent=i.cssText,t.appendChild(s)}})(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(t=>t.hostConnected?.())}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach(t=>t.hostDisconnected?.())}attributeChangedCallback(t,e,i){this._$AK(t,i)}_$ET(t,e){const i=this.constructor.elementProperties.get(t),s=this.constructor._$Eu(t,i);if(void 0!==s&&!0===i.reflect){const r=(void 0!==i.converter?.toAttribute?i.converter:b).toAttribute(e,i.type);this._$Em=t,null==r?this.removeAttribute(s):this.setAttribute(s,r),this._$Em=null}}_$AK(t,e){const i=this.constructor,s=i._$Eh.get(t);if(void 0!==s&&this._$Em!==s){const t=i.getPropertyOptions(s),r="function"==typeof t.converter?{fromAttribute:t.converter}:void 0!==t.converter?.fromAttribute?t.converter:b;this._$Em=s;const o=r.fromAttribute(e,t.type);this[s]=o??this._$Ej?.get(s)??o,this._$Em=null}}requestUpdate(t,e,i,s=!1,r){if(void 0!==t){const o=this.constructor;if(!1===s&&(r=this[t]),i??=o.getPropertyOptions(t),!((i.hasChanged??$)(r,e)||i.useDefault&&i.reflect&&r===this._$Ej?.get(t)&&!this.hasAttribute(o._$Eu(t,i))))return;this.C(t,e,i)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(t,e,{useDefault:i,reflect:s,wrapped:r},o){i&&!(this._$Ej??=new Map).has(t)&&(this._$Ej.set(t,o??e??this[t]),!0!==r||void 0!==o)||(this._$AL.has(t)||(this.hasUpdated||i||(e=void 0),this._$AL.set(t,e)),!0===s&&this._$Em!==t&&(this._$Eq??=new Set).add(t))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(t){Promise.reject(t)}const t=this.scheduleUpdate();return null!=t&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[t,e]of this._$Ep)this[t]=e;this._$Ep=void 0}const t=this.constructor.elementProperties;if(t.size>0)for(const[e,i]of t){const{wrapped:t}=i,s=this[e];!0!==t||this._$AL.has(e)||void 0===s||this.C(e,void 0,i,s)}}let t=!1;const e=this._$AL;try{t=this.shouldUpdate(e),t?(this.willUpdate(e),this._$EO?.forEach(t=>t.hostUpdate?.()),this.update(e)):this._$EM()}catch(e){throw t=!1,this._$EM(),e}t&&this._$AE(e)}willUpdate(t){}_$AE(t){this._$EO?.forEach(t=>t.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return!0}update(t){this._$Eq&&=this._$Eq.forEach(t=>this._$ET(t,this[t])),this._$EM()}updated(t){}firstUpdated(t){}};w.elementStyles=[],w.shadowRootOptions={mode:"open"},w[_("elementProperties")]=new Map,w[_("finalized")]=new Map,f?.({ReactiveElement:w}),(g.reactiveElementVersions??=[]).push("2.1.2");const k=globalThis,M=t=>t,S=k.trustedTypes,P=S?S.createPolicy("lit-html",{createHTML:t=>t}):void 0,T="$lit$",A=`lit$${Math.random().toFixed(9).slice(2)}$`,E="?"+A,C=`<${E}>`,L=document,O=()=>L.createComment(""),z=t=>null===t||"object"!=typeof t&&"function"!=typeof t,D=Array.isArray,I="[ \t\n\f\r]",H=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,R=/-->/g,F=/>/g,N=RegExp(`>|${I}(?:([^\\s"'>=/]+)(${I}*=${I}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),U=/'/g,j=/"/g,q=/^(?:script|style|textarea|title)$/i,B=t=>(e,...i)=>({_$litType$:t,strings:e,values:i}),G=B(1),W=B(2),K=Symbol.for("lit-noChange"),Z=Symbol.for("lit-nothing"),V=new WeakMap,X=L.createTreeWalker(L,129);function Y(t,e){if(!D(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==P?P.createHTML(e):e}const J=(t,e)=>{const i=t.length-1,s=[];let r,o=2===e?"<svg>":3===e?"<math>":"",a=H;for(let e=0;e<i;e++){const i=t[e];let n,l,h=-1,c=0;for(;c<i.length&&(a.lastIndex=c,l=a.exec(i),null!==l);)c=a.lastIndex,a===H?"!--"===l[1]?a=R:void 0!==l[1]?a=F:void 0!==l[2]?(q.test(l[2])&&(r=RegExp("</"+l[2],"g")),a=N):void 0!==l[3]&&(a=N):a===N?">"===l[0]?(a=r??H,h=-1):void 0===l[1]?h=-2:(h=a.lastIndex-l[2].length,n=l[1],a=void 0===l[3]?N:'"'===l[3]?j:U):a===j||a===U?a=N:a===R||a===F?a=H:(a=N,r=void 0);const p=a===N&&t[e+1].startsWith("/>")?" ":"";o+=a===H?i+C:h>=0?(s.push(n),i.slice(0,h)+T+i.slice(h)+A+p):i+A+(-2===h?e:p)}return[Y(t,o+(t[i]||"<?>")+(2===e?"</svg>":3===e?"</math>":"")),s]};class Q{constructor({strings:t,_$litType$:e},i){let s;this.parts=[];let r=0,o=0;const a=t.length-1,n=this.parts,[l,h]=J(t,e);if(this.el=Q.createElement(l,i),X.currentNode=this.el.content,2===e||3===e){const t=this.el.content.firstChild;t.replaceWith(...t.childNodes)}for(;null!==(s=X.nextNode())&&n.length<a;){if(1===s.nodeType){if(s.hasAttributes())for(const t of s.getAttributeNames())if(t.endsWith(T)){const e=h[o++],i=s.getAttribute(t).split(A),a=/([.?@])?(.*)/.exec(e);n.push({type:1,index:r,name:a[2],strings:i,ctor:"."===a[1]?rt:"?"===a[1]?ot:"@"===a[1]?at:st}),s.removeAttribute(t)}else t.startsWith(A)&&(n.push({type:6,index:r}),s.removeAttribute(t));if(q.test(s.tagName)){const t=s.textContent.split(A),e=t.length-1;if(e>0){s.textContent=S?S.emptyScript:"";for(let i=0;i<e;i++)s.append(t[i],O()),X.nextNode(),n.push({type:2,index:++r});s.append(t[e],O())}}}else if(8===s.nodeType)if(s.data===E)n.push({type:2,index:r});else{let t=-1;for(;-1!==(t=s.data.indexOf(A,t+1));)n.push({type:7,index:r}),t+=A.length-1}r++}}static createElement(t,e){const i=L.createElement("template");return i.innerHTML=t,i}}function tt(t,e,i=t,s){if(e===K)return e;let r=void 0!==s?i._$Co?.[s]:i._$Cl;const o=z(e)?void 0:e._$litDirective$;return r?.constructor!==o&&(r?._$AO?.(!1),void 0===o?r=void 0:(r=new o(t),r._$AT(t,i,s)),void 0!==s?(i._$Co??=[])[s]=r:i._$Cl=r),void 0!==r&&(e=tt(t,r._$AS(t,e.values),r,s)),e}class et{constructor(t,e){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){const{el:{content:e},parts:i}=this._$AD,s=(t?.creationScope??L).importNode(e,!0);X.currentNode=s;let r=X.nextNode(),o=0,a=0,n=i[0];for(;void 0!==n;){if(o===n.index){let e;2===n.type?e=new it(r,r.nextSibling,this,t):1===n.type?e=new n.ctor(r,n.name,n.strings,this,t):6===n.type&&(e=new nt(r,this,t)),this._$AV.push(e),n=i[++a]}o!==n?.index&&(r=X.nextNode(),o++)}return X.currentNode=L,s}p(t){let e=0;for(const i of this._$AV)void 0!==i&&(void 0!==i.strings?(i._$AI(t,i,e),e+=i.strings.length-2):i._$AI(t[e])),e++}}class it{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,e,i,s){this.type=2,this._$AH=Z,this._$AN=void 0,this._$AA=t,this._$AB=e,this._$AM=i,this.options=s,this._$Cv=s?.isConnected??!0}get parentNode(){let t=this._$AA.parentNode;const e=this._$AM;return void 0!==e&&11===t?.nodeType&&(t=e.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,e=this){t=tt(this,t,e),z(t)?t===Z||null==t||""===t?(this._$AH!==Z&&this._$AR(),this._$AH=Z):t!==this._$AH&&t!==K&&this._(t):void 0!==t._$litType$?this.$(t):void 0!==t.nodeType?this.T(t):(t=>D(t)||"function"==typeof t?.[Symbol.iterator])(t)?this.k(t):this._(t)}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}_(t){this._$AH!==Z&&z(this._$AH)?this._$AA.nextSibling.data=t:this.T(L.createTextNode(t)),this._$AH=t}$(t){const{values:e,_$litType$:i}=t,s="number"==typeof i?this._$AC(t):(void 0===i.el&&(i.el=Q.createElement(Y(i.h,i.h[0]),this.options)),i);if(this._$AH?._$AD===s)this._$AH.p(e);else{const t=new et(s,this),i=t.u(this.options);t.p(e),this.T(i),this._$AH=t}}_$AC(t){let e=V.get(t.strings);return void 0===e&&V.set(t.strings,e=new Q(t)),e}k(t){D(this._$AH)||(this._$AH=[],this._$AR());const e=this._$AH;let i,s=0;for(const r of t)s===e.length?e.push(i=new it(this.O(O()),this.O(O()),this,this.options)):i=e[s],i._$AI(r),s++;s<e.length&&(this._$AR(i&&i._$AB.nextSibling,s),e.length=s)}_$AR(t=this._$AA.nextSibling,e){for(this._$AP?.(!1,!0,e);t!==this._$AB;){const e=M(t).nextSibling;M(t).remove(),t=e}}setConnected(t){void 0===this._$AM&&(this._$Cv=t,this._$AP?.(t))}}class st{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,e,i,s,r){this.type=1,this._$AH=Z,this._$AN=void 0,this.element=t,this.name=e,this._$AM=s,this.options=r,i.length>2||""!==i[0]||""!==i[1]?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=Z}_$AI(t,e=this,i,s){const r=this.strings;let o=!1;if(void 0===r)t=tt(this,t,e,0),o=!z(t)||t!==this._$AH&&t!==K,o&&(this._$AH=t);else{const s=t;let a,n;for(t=r[0],a=0;a<r.length-1;a++)n=tt(this,s[i+a],e,a),n===K&&(n=this._$AH[a]),o||=!z(n)||n!==this._$AH[a],n===Z?t=Z:t!==Z&&(t+=(n??"")+r[a+1]),this._$AH[a]=n}o&&!s&&this.j(t)}j(t){t===Z?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}}class rt extends st{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===Z?void 0:t}}class ot extends st{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==Z)}}class at extends st{constructor(t,e,i,s,r){super(t,e,i,s,r),this.type=5}_$AI(t,e=this){if((t=tt(this,t,e,0)??Z)===K)return;const i=this._$AH,s=t===Z&&i!==Z||t.capture!==i.capture||t.once!==i.once||t.passive!==i.passive,r=t!==Z&&(i===Z||s);s&&this.element.removeEventListener(this.name,this,i),r&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t)}}class nt{constructor(t,e,i){this.element=t,this.type=6,this._$AN=void 0,this._$AM=e,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(t){tt(this,t)}}const lt=k.litHtmlPolyfillSupport;lt?.(Q,it),(k.litHtmlVersions??=[]).push("3.3.3");const ht=globalThis;let ct=class extends w{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){const e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=((t,e,i)=>{const s=i?.renderBefore??e;let r=s._$litPart$;if(void 0===r){const t=i?.renderBefore??null;s._$litPart$=r=new it(e.insertBefore(O(),t),t,void 0,i??{})}return r._$AI(t),r})(e,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return K}};ct._$litElement$=!0,ct.finalized=!0,ht.litElementHydrateSupport?.({LitElement:ct});const pt=ht.litElementPolyfillSupport;pt?.({LitElement:ct}),(ht.litElementVersions??=[]).push("4.2.2");const dt={attribute:!0,type:String,converter:b,reflect:!1,hasChanged:$},ut=(t=dt,e,i)=>{const{kind:s,metadata:r}=i;let o=globalThis.litPropertyMetadata.get(r);if(void 0===o&&globalThis.litPropertyMetadata.set(r,o=new Map),"setter"===s&&((t=Object.create(t)).wrapped=!0),o.set(i.name,t),"accessor"===s){const{name:s}=i;return{set(i){const r=e.get.call(this);e.set.call(this,i),this.requestUpdate(s,r,t,!0,i)},init(e){return void 0!==e&&this.C(s,void 0,t,e),e}}}if("setter"===s){const{name:s}=i;return function(i){const r=this[s];e.call(this,i),this.requestUpdate(s,r,t,!0,i)}}throw Error("Unsupported decorator location: "+s)};function mt(t){return(e,i)=>"object"==typeof i?ut(t,e,i):((t,e,i)=>{const s=e.hasOwnProperty(i);return e.constructor.createProperty(i,t),s?Object.getOwnPropertyDescriptor(e,i):void 0})(t,e,i)}function gt(t){return mt({...t,state:!0,attribute:!1})}const vt="material-plant-card",yt="Material Plant Card",ft=["moisture","conductivity","temperature","illuminance","humidity","dli","dli_24h","co2","soil_temperature","vpd"],_t=["moisture","conductivity","temperature","illuminance","humidity","dli"],bt={moisture:"Moisture",conductivity:"Conductivity",temperature:"Temperature",illuminance:"Illuminance",humidity:"Air humidity",dli:"DLI",dli_24h:"DLI (24h)",co2:"CO₂",soil_temperature:"Soil temperature",vpd:"VPD"},$t={moisture:"mdi:water",conductivity:"mdi:spa-outline",temperature:"mdi:thermometer",illuminance:"mdi:brightness-6",humidity:"mdi:water-percent",dli:"mdi:counter",dli_24h:"mdi:counter",co2:"mdi:molecule-co2",soil_temperature:"mdi:thermometer-probe",vpd:"mdi:water-thermometer-outline"};function xt(t,e){let i=null,s=null;for(const r of t){if(null===r.v||!Number.isFinite(r.v)||e&&!e(r.t))continue;const t=r;(null===i||t.v<i.v)&&(i=t),(null===s||t.v>s.v)&&(s=t)}return{minPoint:i,maxPoint:s}}function wt(t,e=0,i){let s;if(i&&Number.isFinite(t)&&Number.isFinite(e))try{s=new Intl.DateTimeFormat("en-US",{timeZone:i,calendar:"gregory",numberingSystem:"latn",year:"numeric",month:"numeric",day:"numeric"})}catch{}if(s){const i=t=>{const e=s.formatToParts(t),i=t=>Number(e.find(e=>e.type===t)?.value),r=new Date(0);return r.setUTCFullYear(i("year"),i("month")-1,i("day")),r.getTime()},r=new Date(i(t));r.setUTCDate(r.getUTCDate()-e);const o=r.getTime();let a=o-1296e5,n=o+1296e5;for(;a<n;){const t=Math.floor((a+n)/2);i(t)<o?a=t+1:n=t}return a}const r=new Date(t);return r.setHours(0,0,0,0),r.setDate(r.getDate()-e),r.getTime()}function kt(t,e){const i={stats:null,series:[],minPoint:null,maxPoint:null};let s=0,r=0;const o=(t??[]).filter(t=>e.start<=t.start&&t.start<e.now).sort((t,e)=>t.start-e.start);for(const t of o){const o=(t.start+t.end)/2;"number"==typeof t.min&&Number.isFinite(t.min)&&"number"==typeof t.max&&Number.isFinite(t.max)&&"number"==typeof t.mean&&Number.isFinite(t.mean)&&(!e.keep||e.keep(t.start,t.end))?(i.series.push({t:o,v:t.mean}),(null===i.minPoint||t.min<i.minPoint.v)&&(i.minPoint={t:o,v:t.min}),(null===i.maxPoint||t.max>i.maxPoint.v)&&(i.maxPoint={t:o,v:t.max}),s+=t.mean,r++):i.series.push({t:o,v:null})}var a,n;return null!==i.minPoint&&null!==i.maxPoint&&(i.stats={min:i.minPoint.v,max:i.maxPoint.v,mean:s/r}),null!==e.current&&(i.series.push({t:e.now,v:e.current}),null!==i.minPoint&&e.current<i.minPoint.v&&(i.minPoint={t:e.now,v:e.current}),null!==i.maxPoint&&e.current>i.maxPoint.v&&(i.maxPoint={t:e.now,v:e.current}),i.stats=(a=i.stats,n=e.current,null===a||null===n?a:{min:Math.min(a.min,n),max:Math.max(a.max,n),mean:a.mean})),i}const Mt={today:864e5,"24h":864e5,"3d":2592e5,"7d":6048e5,"14d":12096e5,"30d":2592e6};function St(t,e,i){return"today"===t?wt(e,0,i):e-Mt[t]}function Pt(t){if(Array.isArray(t.metrics)){const e=new Set;return t.metrics.filter(t=>!(!t||"object"!=typeof t||Array.isArray(t)||"string"!=typeof t.type||0===t.type.length||e.has(t.type)||(e.add(t.type),0)))}return Array.isArray(t.show_bars)?[...new Set(t.show_bars.filter(t=>"string"==typeof t))].map(t=>({type:t})):_t.map(t=>({type:t}))}function Tt(t){const e="string"==typeof(i=t.period)&&Object.prototype.hasOwnProperty.call(Mt,i)?t.period:"today";var i;const s="number"==typeof t.days&&Number.isFinite(t.days)?Math.max(1,Math.min(30,Math.round(t.days))):7,r=function(t){return"plant"===t||"out_of_range"===t||"low"===t||"high"===t||"never"===t}(t.problem_trigger)?t.problem_trigger:"plant",o=function(t){return"summary"===t||"graph"===t}(t.display)?t.display:"summary",a="number"==typeof t.daylight_offset&&Number.isFinite(t.daylight_offset)?Math.max(0,Math.min(180,Math.round(t.daylight_offset))):30;return{icon:"string"==typeof t.icon&&t.icon.length>0?t.icon:void 0,period:e,periodMs:Mt[e],days:s,trigger:r,display:o,daylightOnly:"illuminance"===t.type&&("boolean"!=typeof t.daylight_only||t.daylight_only),daylightOffset:a}}function At(t){if(Object.prototype.hasOwnProperty.call(bt,t))return bt[t];const e=t.replace(/_/g," ");return e.charAt(0).toUpperCase()+e.slice(1)}function Et(t){if("number"!=typeof t&&"string"!=typeof t)return null;if("string"==typeof t&&""===t.trim())return null;const e=Number(t);return Number.isFinite(e)?e:null}function Ct(t,e,i){return null===t||null===e||null===i||e>=i?"unknown":t<e?"low":t>i?"high":"ok"}function Lt(t,e,i,s){if(null===t||null===e||null===i||e>=i)return null;let r=(t-e)/(i-e);return"lx"===s&&e>0&&(r=t<=0?-1/0:(Math.log(t)-Math.log(e))/(Math.log(i)-Math.log(e))),Math.max(0,Math.min(1,.2+.6*r))}function Ot(t,e,i,s){const r=[];for(const o of new Set(e)){if(!t||!Object.prototype.hasOwnProperty.call(t,o))continue;const e=t[o];if(!e)continue;const a=e.sensor||void 0,n=a?i[a]:void 0;if(a&&!n)continue;const l=Et(n?n.state:e.current),h=Et(e.min),c=Et(e.max),p=String(n?.attributes.unit_of_measurement??e.unit_of_measurement??""),d=Object.prototype.hasOwnProperty.call($t,o)?$t[o]:"mdi:help-circle-outline",u=s?.[o],m="string"==typeof u&&u.length>0?u:"string"==typeof e.icon&&e.icon.length>0?e.icon:d;r.push({key:o,label:At(o),sensor:a,icon:m,unit:p,value:l,min:h,max:c,status:Ct(l,h,c),fraction:Lt(l,h,c,p)})}return r}function zt(t,e){const[i,s="0"]=String(Math.abs(t)).split("e"),r=Number(`${i}e${Number(s)+e}`);return Math.sign(t)*Math.round(r)/10**e}function Dt(t,e,i=!1){if(null===t)return"—";const s=Math.abs(t);let r;return r=s>=1e4?`${zt(t/1e3,0)}k`:s>=1e3?`${zt(t/1e3,1)}k`:String(zt(t,s>=100?0:s>=10?1:2)),r+(i?"":"%"===e?"%":["°C","°F","°"].includes(e)?"°":"")}function It(t){const e=Math.abs(t);if(e>=1e3)return Dt(t,"",!0);const i=e>=10?0:e>=.1?1:2,[s,r="0"]=String(e).split("e"),o=Number(`${s}e${Number(r)+i}`);return String(Math.sign(t)*Math.round(o)/10**i)}function Ht(t){const e=t.unit?` ${t.unit}`:"",i=null===t.value?"—":String(t.value),s=null===t.min||null===t.max?"":` (${String(t.min)}–${String(t.max)}${e})`,r="low"===t.status||"high"===t.status?` · ${t.status}`:"";return`${t.label}: ${i}${e}${s}${r}`.replace(/ {2,}/g," ")}function Rt(t,e){return"unknown"===t.status?"unknown":"ok"===t.status?"ok":e.some(e=>e.key===t.key)?"problem":"advisory"}const Ft=n`
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
    --mpl-error-container: var(--md-sys-color-error-container, color-mix(in srgb, var(--mpl-error) 30%, var(--mpl-surface-bg)));
    --mpl-on-error-container: var(--md-sys-color-on-error-container, var(--mpl-on-surface));
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
    --mpl-ease-spatial: cubic-bezier(0.38, 1.21, 0.22, 1);
  }
`;let Nt=class{constructor(t){}get _$AU(){return this._$AM._$AU}_$AT(t,e,i){this._$Ct=t,this._$AM=e,this._$Ci=i}_$AS(t,e){return this.update(t,e)}update(t,e){return this.render(...e)}};const Ut={},jt=(t=>(...e)=>({_$litDirective$:t,values:e}))(class extends Nt{constructor(){super(...arguments),this.key=Z}render(t,e){return this.key=t,e}update(t,[e,i]){return e!==this.key&&(((t,e=Ut)=>{t._$AH=e})(t),this.key=e),i}}),qt=[{name:"low",start:135,end:185},{name:"ok",start:193,end:347},{name:"high",start:355,end:405}];function Bt(t,e,i,s){const r=s*Math.PI/180;return{x:t+i*Math.cos(r),y:e+i*Math.sin(r)}}function Gt(t,e,i,s,r){const o=Bt(t,e,i,s),a=Bt(t,e,i,r),n=r-s>180?1:0;return`M ${o.x} ${o.y} A ${i} ${i} 0 ${n} 1 ${a.x} ${a.y}`}class Wt extends ct{constructor(){super(...arguments),this.fraction=null,this.tone="unknown",this.icon="",this.value="",this.label="",this.embedded=!1,this.dataEpoch=0,this.hadIndicator=!1,this.entrySegments=[],this.sweepDuration=0}willUpdate(){const t=null!==this.fraction&&"unknown"!==this.tone;if(t&&!this.hadIndicator){this.dataEpoch++;const t=135+270*this.fraction,e=qt.map(e=>Math.max(0,Math.min(e.end,t)-e.start)),i=e.reduce((t,e)=>t+e,0);let s=0;this.entrySegments=e.map(t=>{const e=i>0?700*t/i:0,r={duration:e,delay:s};return s+=e,r}),this.sweepDuration=s}this.hadIndicator=t}render(){const t=this.fraction,e=null!==t&&"unknown"!==this.tone,i=135+270*(t??0),s=Bt(24,24,20,i);return G`
      <div
        class="gauge"
        role=${this.embedded?Z:"meter"}
        aria-label=${this.embedded?Z:this.label}
        aria-valuemin=${this.embedded?Z:"0"}
        aria-valuemax=${this.embedded?Z:"100"}
        aria-valuenow=${this.embedded||null===t?Z:Math.round(100*t)}
        aria-valuetext=${this.embedded?Z:this.label}
      >
        <div class="dial">
          <svg viewBox="0 0 48 48" aria-hidden="true" focusable="false">
            ${W`
              ${qt.map(t=>W`
                <path class=${`track-${t.name}`} d=${Gt(24,24,20,t.start,t.end)}></path>
              `)}
              ${e?jt(this.dataEpoch,W`
              ${qt.map((t,e)=>{if(i<=t.start)return Z;const s=Gt(24,24,20,t.start,Math.min(t.end,i)),r=this.entrySegments[e];return W`
                  <path class=${`active active-${t.name}${r.duration>0?" entering":""}`}
                    pathLength="1" d=${s}
                    style=${`d: path('${s}'); --mpl-gauge-entry-duration: ${r.duration}ms; --mpl-gauge-entry-delay: ${r.delay}ms;`}></path>
                `})}
                <circle class="dot" cx=${s.x} cy=${s.y} r="3.5"
                  style=${`cx: ${s.x}px; cy: ${s.y}px; --mpl-gauge-entry-delay: ${this.sweepDuration}ms;`}></circle>
              `):Z}
            `}
          </svg>
          <ha-icon icon=${this.icon} aria-hidden="true"></ha-icon>
        </div>
        ${jt(this.dataEpoch,""!==this.value?G`<div class="value">${this.value}</div>`:Z)}
      </div>
    `}}Wt.styles=[Ft,n`
      :host {
        --mpl-gauge-icon-size: calc(var(--mpl-gauge-size, 44px) * 18 / 44);
        --mpl-gauge-value-size: clamp(11px, calc(var(--mpl-gauge-size, 44px) * 12 / 44), 16px);
        --mpl-gauge-value-line: calc(var(--mpl-gauge-value-size) * 4 / 3);
        --mpl-gauge-entry-easing: cubic-bezier(0.2, 0, 0, 1);
        --mpl-gauge-pop-duration: 250ms;
        --mpl-gauge-fade-duration: 300ms;
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
        width: var(--mpl-gauge-size, 44px);
        height: var(--mpl-gauge-size, 44px);
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
        transform-box: fill-box;
        transform-origin: center;
        animation: mpl-gauge-pop var(--mpl-gauge-pop-duration) var(--mpl-gauge-entry-easing)
          var(--mpl-gauge-entry-delay) backwards;
      }
      .active.entering {
        stroke-dasharray: 1;
        animation: mpl-gauge-sweep var(--mpl-gauge-entry-duration) var(--mpl-gauge-entry-easing)
          var(--mpl-gauge-entry-delay) backwards;
      }
      @keyframes mpl-gauge-sweep {
        from { stroke-dashoffset: 1; }
        to { stroke-dashoffset: 0; }
      }
      @keyframes mpl-gauge-pop {
        from { transform: scale(0); opacity: 0; }
        to { transform: scale(1); opacity: 1; }
      }
      @keyframes mpl-gauge-fade {
        from { opacity: 0; }
        to { opacity: 1; }
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
        animation: mpl-gauge-fade var(--mpl-gauge-fade-duration) var(--mpl-gauge-entry-easing);
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
        .active.entering,
        .dot,
        .value {
          animation: none;
          stroke-dasharray: none;
        }
      }
    `],t([mt({type:Number})],Wt.prototype,"fraction",void 0),t([mt({reflect:!0})],Wt.prototype,"tone",void 0),t([mt()],Wt.prototype,"icon",void 0),t([mt()],Wt.prototype,"value",void 0),t([mt()],Wt.prototype,"label",void 0),t([mt({type:Boolean,attribute:"embedded"})],Wt.prototype,"embedded",void 0),customElements.get("mpl-gauge")||customElements.define("mpl-gauge",Wt);let Kt=0;class Zt extends ct{constructor(){super(...arguments),this.level=null,this.tone="unknown",this.clipId="mpl-battery-"+ ++Kt}render(){const t=null===this.level||Number.isNaN(this.level)?null:Math.round(Math.min(100,Math.max(0,this.level))),e=26*(t??0)/100,i=`${this.clipId}-body`,s=`${this.clipId}-filled`,r=`${this.clipId}-unfilled`;return G`
      <svg viewBox="0 0 30 15" aria-hidden="true" focusable="false">
        ${W`
          <defs>
            <clipPath id=${i} clipPathUnits="userSpaceOnUse">
              <rect x="0.5" y="0.5" width="26" height="14" rx="4"></rect>
            </clipPath>
            <clipPath id=${s} clipPathUnits="userSpaceOnUse">
              <rect x="0.5" y="0.5" width=${e} height="14"></rect>
            </clipPath>
            <clipPath id=${r} clipPathUnits="userSpaceOnUse">
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
          `:Z}
          ${null===t?W`
            <text x="13.5" y="7.5" text-anchor="middle" dominant-baseline="central"
              fill="var(--mpl-on-surface-variant)">?</text>
          `:W`
            <text class="number-filled" x="13.5" y="7.5" text-anchor="middle"
              dominant-baseline="central" clip-path=${`url(#${s})`}>${t}</text>
            <text x="13.5" y="7.5" text-anchor="middle" dominant-baseline="central"
              fill="currentColor" clip-path=${`url(#${r})`}>${t}</text>
          `}
        `}
      </svg>
    `}}Zt.styles=n`
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
  `,t([mt({type:Number})],Zt.prototype,"level",void 0),t([mt({reflect:!0})],Zt.prototype,"tone",void 0),customElements.get("mpl-battery")||customElements.define("mpl-battery",Zt);const Vt=864e5,Xt=6e4,Yt=Math.PI/180,Jt=90.833*Yt;function Qt(t){const e=(t/Vt+2440587.5-2451545)/36525,i=(280.46646+e*(36000.76983+3032e-7*e))%360*Yt,s=(357.52911+e*(35999.05029-1537e-7*e))*Yt,r=.016708634-e*(42037e-9+1.267e-7*e),o=Math.sin(s)*(1.914602-e*(.004817+14e-6*e))+Math.sin(2*s)*(.019993-101e-6*e)+289e-6*Math.sin(3*s),a=(125.04-1934.136*e)*Yt,n=i+(o-.00569-.00478*Math.sin(a))*Yt,l=(23+(26+(21.448-e*(46.815+e*(59e-5-.001813*e)))/60)/60+.00256*Math.cos(a))*Yt,h=Math.tan(l/2)**2,c=4/Yt*(h*Math.sin(2*i)-2*r*Math.sin(s)+4*r*h*Math.sin(s)*Math.cos(2*i)-.5*h*h*Math.sin(4*i)-1.25*r*r*Math.sin(2*s));return{declination:Math.asin(Math.sin(l)*Math.sin(n)),equationMinutes:c}}function te(t,e,i){const s=Math.floor((t+i/360*Vt)/Vt)*Vt,r=720-4*i;let o=s+r*Xt;for(let t=0;t<2;t++)o=s+(r-Qt(o).equationMinutes)*Xt;const a=e*Yt,n=t=>(Math.cos(Jt)-Math.sin(a)*Math.sin(t))/(Math.cos(a)*Math.cos(t)),l=Qt(o),h=n(l.declination);if(h<-1)return"polar-day";if(h>1)return"polar-night";const c=t=>{let e=s+(r-l.equationMinutes+t*(4/Yt)*Math.acos(h))*Xt;for(let i=0;i<2;i++){const i=Qt(e),o=n(i.declination);if(o<-1||o>1)break;e=s+(r-i.equationMinutes+t*(4/Yt)*Math.acos(o))*Xt}return e};return{sunrise:c(-1),sunset:c(1)}}function ee(t,e,i,s,r){const o=te((t+e)/2,i,s);if("polar-day"===o)return!0;if("polar-night"===o)return!1;const a=r*Xt;return t>=o.sunrise+a&&e<=o.sunset-a}function ie(t,e,i=0){if(0===t)return"0";const s=Math.abs(t)>=1e3&&e>=400,r=s?1e3:1,o=(t/r).toFixed((a=e/r/4,Math.max(0,-Math.floor(Math.log10(a)+1e-9))+i));var a;return 0===Number(o)&&t<0?"0":`${o}${s?"k":""}`}class se extends ct{constructor(){super(...arguments),this.value=null,this.tone="unknown",this.spanFrom=null,this.spanTo=null,this.avg=null,this.avgOk=null,this.showTicks=!1}connectedCallback(){super.connectedCallback(),this.setAttribute("aria-hidden","true")}render(){const t="unknown"!==this.tone,e=this.spanFrom,i=this.spanTo,s=null!==e&&null!==i?100*Math.abs(i-e):0,r=null!==e&&null!==i?(e+i)/2*100:0,o=null===this.avgOk?"var(--mpl-on-surface-variant)":this.avgOk?"var(--mpl-success)":"var(--mpl-error)";return G`
      <div class="track"></div>
      ${this.showTicks?G`
        <div class="tick tick-low"></div>
        <div class="tick tick-high"></div>
      `:Z}
      ${t&&null!==e&&null!==i?G`
        <div class="span" style=${`left: calc(${r}% - max(${s}%, 8px) / 2); width: max(${s}%, 8px); background: ${function(t,e){const i="var(--mpl-success)",s="var(--mpl-error)",r=t=>t<.2||t>.8?s:i;if(t===e)return r(t);if(t>=.2&&e<=.8)return i;if(e<=.2||t>=.8)return s;const o=[t,...[.2,.8].filter(i=>i>t&&i<e),e],a=i=>Number(((i-t)/(e-t)*100).toFixed(10));return`linear-gradient(to right, ${o.slice(0,-1).map((t,e)=>{const i=o[e+1];return`${r((t+i)/2)} ${a(t)}% ${a(i)}%`}).join(", ")})`}(Math.min(e,i),Math.max(e,i))};`}></div>
      `:Z}
      ${t&&null!==this.avg?G`
        <div class="avg" style=${`left: clamp(0px, calc(${100*this.avg}% - 5px), calc(100% - 10px)); background: ${o};`}></div>
      `:Z}
      ${t&&null!==this.value?G`
        <div class="dot" style=${`left: clamp(0px, calc(${100*this.value}% - 7px), calc(100% - 14px));`}></div>
      `:Z}
    `}}se.styles=n`
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
      transform-origin: center;
      animation: mpl-span-in 600ms var(--mpl-ease-spatial, cubic-bezier(0.38, 1.21, 0.22, 1)) both;
    }
    .avg {
      top: 20px;
      width: 10px;
      height: 6px;
      clip-path: polygon(50% 0, 100% 100%, 0 100%);
      animation: mpl-avg-in 350ms var(--mpl-ease-spatial, cubic-bezier(0.38, 1.21, 0.22, 1)) 350ms both;
    }
    .dot {
      top: 5px;
      width: 14px;
      height: 14px;
      box-sizing: border-box;
      border-radius: 50%;
      background: var(--mpl-range-bar-ring, var(--mpl-surface-container-high));
      border: 3px solid var(--mpl-range-bar-tone);
      animation: mpl-dot-in 450ms var(--mpl-ease-spatial, cubic-bezier(0.38, 1.21, 0.22, 1)) 200ms both;
    }
    .dot,
    .span,
    .avg {
      transition:
        left 500ms var(--mpl-ease-spatial, cubic-bezier(0.38, 1.21, 0.22, 1)),
        width 500ms var(--mpl-ease-spatial, cubic-bezier(0.38, 1.21, 0.22, 1));
    }
    @keyframes mpl-span-in {
      from { transform: scaleX(0); opacity: 0; }
      to { transform: scaleX(1); opacity: 1; }
    }
    @keyframes mpl-dot-in {
      from { transform: scale(0); }
      to { transform: scale(1); }
    }
    @keyframes mpl-avg-in {
      from { opacity: 0; transform: translateY(4px); }
      to { opacity: 1; transform: none; }
    }
    @media (prefers-reduced-motion: reduce) {
      .dot,
      .span,
      .avg {
        transition: none;
        animation: none;
      }
    }
  `,t([mt({type:Number})],se.prototype,"value",void 0),t([mt({reflect:!0})],se.prototype,"tone",void 0),t([mt({type:Number})],se.prototype,"spanFrom",void 0),t([mt({type:Number})],se.prototype,"spanTo",void 0),t([mt({type:Number})],se.prototype,"avg",void 0),t([mt({type:Boolean})],se.prototype,"avgOk",void 0),t([mt({type:Boolean})],se.prototype,"showTicks",void 0),customElements.get("mpl-range-bar")||customElements.define("mpl-range-bar",se);const re=64,oe=(t,e,i)=>null===e||null===i?"var(--mpl-on-surface-variant)":t<e||t>i?"var(--mpl-error)":"var(--mpl-success)";let ae=0;class ne extends ct{constructor(){super(...arguments),this.points=[],this.ticks=[],this.start=0,this.end=0,this.minMarker=null,this.maxMarker=null,this.current=null,this.thresholdLow=.2,this.thresholdHigh=.8,this.events=[],this.summary="",this._width=0,this._hoverIndex=null,this._mouseBubble=!1,this._dismissed=!1,this._gradientId="mpl-history-gradient-"+ ++ae,this._hasData=!1,this._dataEpoch=0,this._keyDown=t=>{"Escape"===t.key&&(this._dismissed=this._mouseBubble,this._hide())},this._pointerEnter=t=>{"mouse"!==t.pointerType&&t.pointerType||void 0!==this._pressedPointer||(this._clearHideTimer(),this._pick(t))},this._bubbleEnter=()=>{this._clearHideTimer()},this._bubbleLeave=()=>{this._mouseBubble&&this._scheduleHide(150)},this._stop=t=>{t.stopPropagation()},this._contextMenu=t=>{t.stopPropagation(),t.preventDefault()},this._pointerDown=t=>{t.stopPropagation(),this._inBubble(t)||(this._clearHideTimer(),this._pick(t),"touch"!==t.pointerType&&"pen"!==t.pointerType||(this._pressedPointer=t.pointerId,t.isTrusted&&this.setPointerCapture(t.pointerId)))},this._pointerMove=t=>{if(!this._inBubble(t))if("mouse"!==t.pointerType&&t.pointerType)t.pointerId===this._pressedPointer&&this._pick(t);else{if(void 0!==this._pressedPointer)return;this._clearHideTimer(),this._pick(t)}},this._pointerLeave=t=>{"mouse"!==t.pointerType&&t.pointerType||void 0!==this._pressedPointer||(this._dismissed=!1,this._scheduleHide(150))},this._pointerUp=t=>{t.stopPropagation(),this._release(t)},this._release=t=>{void 0!==this._pressedPointer&&t.pointerId===this._pressedPointer&&(this.hasPointerCapture(t.pointerId)&&this.releasePointerCapture(t.pointerId),this._pressedPointer=void 0,this._scheduleHide(2e3))}}connectedCallback(){super.connectedCallback(),this.setAttribute("role","img"),this.addEventListener("click",this._stop),this.addEventListener("contextmenu",this._contextMenu),this.addEventListener("pointerdown",this._pointerDown),this.addEventListener("pointermove",this._pointerMove),this.addEventListener("pointerenter",this._pointerEnter),this.addEventListener("pointerleave",this._pointerLeave),this.addEventListener("pointerup",this._pointerUp),this.addEventListener("pointercancel",this._release),window.addEventListener("pointerup",this._release),window.addEventListener("pointercancel",this._release),this._observer=new ResizeObserver(t=>{const e=t.find(t=>t.target===this);if(!e||!this.isConnected)return;void 0!==this._frame&&cancelAnimationFrame(this._frame);const i=e.contentRect.width;this._frame=requestAnimationFrame(()=>{this._frame=void 0,this.isConnected&&this._width!==i&&(this._width=i)})}),this._observer.observe(this)}disconnectedCallback(){super.disconnectedCallback(),this._observer?.disconnect(),this._observer=void 0,void 0!==this._frame&&cancelAnimationFrame(this._frame),this._frame=void 0,this._hide(),this._dismissed=!1,void 0!==this._pressedPointer&&this.hasPointerCapture(this._pressedPointer)&&this.releasePointerCapture(this._pressedPointer),this._pressedPointer=void 0,this.removeEventListener("click",this._stop),this.removeEventListener("contextmenu",this._contextMenu),this.removeEventListener("pointerdown",this._pointerDown),this.removeEventListener("pointermove",this._pointerMove),this.removeEventListener("pointerenter",this._pointerEnter),this.removeEventListener("pointerleave",this._pointerLeave),this.removeEventListener("pointerup",this._pointerUp),this.removeEventListener("pointercancel",this._release),window.removeEventListener("pointerup",this._release),window.removeEventListener("pointercancel",this._release)}get _plotLeft(){return this.ticks.some(t=>""!==t.label)?26:0}get _plotWidth(){return Math.max(0,this._width-this._plotLeft)}_x(t){const e=this.end-this.start;return e>0?this._plotLeft+Math.max(0,Math.min(this._plotWidth,(t-this.start)/e*this._plotWidth)):this._plotLeft}_clearHideTimer(){clearTimeout(this._hideTimer),this._hideTimer=void 0}_pick(t){const e="mouse"===t.pointerType||!t.pointerType;if(e&&this._dismissed)return;const i=t.clientX-this.getBoundingClientRect().left;let s=1/0,r=null;this.points.forEach((t,e)=>{if(null===t.f)return;const o=Math.abs(this._x(t.t)-i);o<s&&(s=o,r=e)}),this._hoverIndex=r,this._mouseBubble=e,null!==r?document.addEventListener("keydown",this._keyDown):this._hide()}_hide(){this._clearHideTimer(),this._hoverIndex=null,document.removeEventListener("keydown",this._keyDown)}_scheduleHide(t){this._clearHideTimer(),this._hideTimer=setTimeout(()=>this._hide(),t)}_inBubble(t){return t.composedPath().some(t=>t instanceof Element&&t.classList.contains("bubble"))}_hoverPoint(){const t=null===this._hoverIndex?void 0:this.points[this._hoverIndex];return null!==t?.f?t:void 0}willUpdate(){const t=this.points.some(t=>null!==t.f);t&&!this._hasData&&this._dataEpoch++,this._hasData=t}updated(){this.setAttribute("aria-label",this.summary);const t=this._hoverPoint();t||document.removeEventListener("keydown",this._keyDown);const e=this.shadowRoot?.querySelector(".bubble");if(!t||!e)return;const i=e.getBoundingClientRect().width,s=Math.max(this._plotLeft,Math.min(this._width-i,this._x(t.t)-i/2));e.style.left=`${s}px`}_marker(t,e,i){if(!t)return Z;const s=this._x(t.t),r=Math.max(this._plotLeft+3,Math.min(this._width-3,s)),o="min"===e?1:-1,a=i(t.f)+3.5*o,n=a+4*o,l=t.ok?"var(--mpl-success)":"var(--mpl-error)";return W`<polygon class=${`${e}-marker`} points=${`${r},${a} ${r-3},${n} ${r+3},${n}`}
      fill=${l}></polygon>
      <circle class=${`${e}-dot`} cx=${s} cy=${i(t.f)} r=${2} fill=${l}></circle>`}render(){const t=this.events.filter(t=>t.t>=this.start&&t.t<=this.end),e=t.length>0?14:0,i=e+8,s=t=>56-t*(56-i);let r="",o=!1;const a=[];this.points.forEach((t,e)=>{null!==t.f?(r+=`${o?"L":"M"}${this._x(t.t)},${s(t.f)} `,o=!0,0!==e&&null!==this.points[e-1].f||e!==this.points.length-1&&null!==this.points[e+1].f||a.push(t)):o=!1});const n=`url(#${this._gradientId})`,l=this.thresholdLow,h=this.thresholdHigh,c=null!==l&&null!==h,p=t=>Math.max(0,Math.min(1,s(t)/re)),d=this._hoverPoint(),u=this.current,m="problem"===u?.tone?"var(--mpl-error)":"advisory"===u?.tone?"var(--mpl-on-surface-variant)":"var(--mpl-success)";return G`
      <svg width=${this._width} height=${re} aria-hidden="true" focusable="false">
        <defs>
          <linearGradient id=${this._gradientId} gradientUnits="userSpaceOnUse" x1="0" x2="0" y1="0" y2=${re}>
            <stop offset="0" stop-color=${oe(1,l,h)}></stop>
            ${c&&h>=0&&h<=1?W`
              <stop offset=${p(h)} stop-color="var(--mpl-error)"></stop>
              <stop offset=${p(h)} stop-color="var(--mpl-success)"></stop>`:Z}
            ${c&&l>=0&&l<=1?W`
              <stop offset=${p(l)} stop-color="var(--mpl-success)"></stop>
              <stop offset=${p(l)} stop-color="var(--mpl-error)"></stop>`:Z}
            <stop offset="1" stop-color=${oe(0,l,h)}></stop>
          </linearGradient>
        </defs>
        ${this.ticks.map(t=>W`<line class=${t.kind?`gridline gridline-${t.kind}`:"gridline"}
          x1=${this._plotLeft} x2=${this._width} y1=${s(t.f)} y2=${s(t.f)}
          stroke=${"avg"===t.kind?"var(--mpl-outline)":"var(--mpl-outline-variant)"}
          stroke-width="1" stroke-dasharray=${"avg"===t.kind?"2 3":Z}
          opacity=${"avg"===t.kind?"0.7":"0.6"}></line>
          ${""!==t.label?W`<text class="tick-label" x=${22} y=${s(t.f)} text-anchor="end"
            dominant-baseline="central">${t.label}</text>`:Z}`)}
        ${t.map(t=>W`<line class="event-line" x1=${this._x(t.t)} x2=${this._x(t.t)}
          y1=${e} y2=${re} stroke="var(--mpl-outline)" stroke-width="1" stroke-dasharray="3 3" opacity="1"></line>`)}
        ${this._hasData?jt(this._dataEpoch,W`
        <path class="history-line" pathLength="1" d=${r.trim()} fill="none" stroke=${n} stroke-width="2"
          stroke-linecap="round" stroke-linejoin="round"></path>
        ${a.map(t=>W`<circle class="isolated-point" cx=${this._x(t.t)} cy=${s(t.f)}
          r="1.5" fill=${n}></circle>`)}
        ${this._marker(this.maxMarker,"max",s)}
        ${this._marker(this.minMarker,"min",s)}
        ${u&&"unknown"!==u.tone?W`<circle class="current-ring"
          cx=${this._x(u.t)} cy=${s(u.f)} r="3.5"
          fill="var(--mpl-range-bar-ring, var(--mpl-surface-container-high))"
           stroke=${m} stroke-width="2"></circle>`:Z}
        `):Z}
        ${d?W`
          <line class="hover-guide" x1=${this._x(d.t)} x2=${this._x(d.t)} y1="0" y2=${re}
            stroke="var(--mpl-on-surface-variant)" stroke-width="1" opacity="0.4"></line>
          <circle class="hover-dot" cx=${this._x(d.t)} cy=${s(d.f)} r="3" fill=${oe(d.f,l,h)}></circle>
        `:Z}
      </svg>
      ${t.map(t=>G`<ha-icon class="event-icon" icon=${t.icon} aria-hidden="true"
        style=${`left: ${Math.max(this._plotLeft,Math.min(this._width-12,this._x(t.t)-6))}px`}></ha-icon>`)}
      ${d?G`<div class=${this._mouseBubble?"bubble mouse-bubble":"bubble"} aria-hidden="true"
        style=${`max-width: ${this._plotWidth}px`}
        @pointerenter=${this._bubbleEnter} @pointerleave=${this._bubbleLeave}>${d.label}</div>`:Z}
    `}}ne.styles=n`
    :host {
      display: block;
      position: relative;
      height: ${re}px;
      width: 100%;
      touch-action: pan-y;
      cursor: crosshair;
    }
    svg { display: block; overflow: visible; }
    .tick-label {
      font-size: 9px;
      fill: var(--mpl-on-surface-variant);
      font-variant-numeric: tabular-nums;
    }
    .history-line:not([d=""]) {
      stroke-dasharray: 1;
      animation: mpl-line-draw 900ms cubic-bezier(0.2, 0, 0, 1) both;
    }
    .isolated-point {
      animation: mpl-point-in 300ms cubic-bezier(0.2, 0, 0, 1) 300ms both;
    }
    .min-marker, .max-marker, .min-dot, .max-dot, .current-ring {
      animation: mpl-mark-in 300ms var(--mpl-ease-spatial, cubic-bezier(0.38, 1.21, 0.22, 1)) 700ms both;
      transform-box: fill-box;
      transform-origin: center;
    }
    @keyframes mpl-line-draw {
      from { stroke-dashoffset: 1; }
      to { stroke-dashoffset: 0; }
    }
    @keyframes mpl-point-in {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes mpl-mark-in {
      from { opacity: 0; transform: scale(0.4); }
      to { opacity: 1; transform: none; }
    }
    @media (prefers-reduced-motion: reduce) {
      .history-line:not([d=""]), .isolated-point,
      .min-marker, .max-marker, .min-dot, .max-dot, .current-ring {
        animation: none;
        stroke-dasharray: none;
      }
    }
    .event-icon {
      position: absolute;
      top: 1px;
      display: block;
      width: ${12}px;
      height: ${12}px;
      --mdc-icon-size: ${12}px;
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
  `,t([mt({attribute:!1})],ne.prototype,"points",void 0),t([mt({attribute:!1})],ne.prototype,"ticks",void 0),t([mt({type:Number})],ne.prototype,"start",void 0),t([mt({type:Number})],ne.prototype,"end",void 0),t([mt({attribute:!1})],ne.prototype,"minMarker",void 0),t([mt({attribute:!1})],ne.prototype,"maxMarker",void 0),t([mt({attribute:!1})],ne.prototype,"current",void 0),t([mt({attribute:!1})],ne.prototype,"thresholdLow",void 0),t([mt({attribute:!1})],ne.prototype,"thresholdHigh",void 0),t([mt({attribute:!1})],ne.prototype,"events",void 0),t([mt()],ne.prototype,"summary",void 0),t([gt()],ne.prototype,"_width",void 0),t([gt()],ne.prototype,"_hoverIndex",void 0),t([gt()],ne.prototype,"_mouseBubble",void 0),customElements.get("mpl-history-graph")||customElements.define("mpl-history-graph",ne);const le=t=>Dt(t,"",!0),he={"mol/d⋅m²":"mol/d","mol/d·m²":"mol/d","mol/(d⋅m²)":"mol/d"};function ce(t,e,i="last 24 h"){return Ht(t)+(e?` · ${i} ${le(e.min)}–${le(e.max)}, average ${le(e.mean)}`:"")}class pe extends ct{constructor(){super(...arguments),this.tone="unknown",this.history=null,this.events=[],this.display="summary",this.daily=!1,this.periodText="today",this.hideUnits=!1,this.periodLabel="Today"}render(){const t=this.measurement;if(!t)return Z;const e=this.history?.stats??null,i=e=>Lt(e,t.min,t.max,t.unit),s=Ct(e?.mean??null,t.min,t.max),r=(e,i)=>{const s=Ct(i,t.min,t.max);return G`<span class=${"low"===s||"high"===s?"stat out":"stat"}>
        <span class="stat-label">${e}</span><span class="stat-value">${null===i?"—":Dt(i,"",!0)}</span>
      </span>`};return G`
      <div class="title">
        <ha-icon icon=${t.icon} aria-hidden="true"></ha-icon>
        <span class="label">${t.label}</span>
        <span class="period">${this.periodLabel}</span>
      </div>
      <div class="value">${Dt(t.value,t.unit,!0)}${this.hideUnits||""===t.unit?Z:G`<span class="unit">${he[t.unit]??t.unit}</span>`}</div>
      ${"graph"===this.display?(()=>{const i=this.history?.series??[],s=function(t,e,i){let s=1/0,r=-1/0,o=0;for(const e of t)null!==e&&Number.isFinite(e)&&(s=Math.min(s,e),r=Math.max(r,e),o++);if(s>r)return{map:()=>null,ticks:[],thresholdLow:null,thresholdHigh:null};let a=0;for(const e of t)null!==e&&Number.isFinite(e)&&(a+=e/o);const n=r-s<1e-9,l=s;if(n){const t=Math.max(.05*Math.abs(s),.5);s-=t,r+=t}const h=s,c=r,p=c-h,d=t=>null!==t&&Number.isFinite(t)?(t-h)/p:null;let u;if(n)u=[{f:.5,kind:"avg",label:ie(l,p)}];else{let t=[h,a,c].map(t=>ie(t,p));for(let e=1;e<=3&&new Set(t).size<3;e++)t=[h,a,c].map(t=>ie(t,p,e));const e=d(a);u=[{f:0,kind:"min",label:t[0]},{f:e,kind:"avg",label:Math.abs(e)<.22||Math.abs(e-1)<.22?"":t[1]},{f:1,kind:"max",label:t[2]}]}const m=null!==e&&null!==i&&Number.isFinite(e)&&Number.isFinite(i)&&e<i;return{map:d,ticks:u,thresholdLow:m?d(e):null,thresholdHigh:m?d(i):null}}([...i.map(({v:t})=>t),t.value],t.min,t.max),r=i[i.length-1],o=Number.isFinite(this.graphStart)&&Number.isFinite(this.graphEnd),a=o?this.graphEnd:r?.t??Date.now(),n=o?this.graphStart:i[0]?.t??a-864e5,l=this.daily?{weekday:"short",day:"numeric",month:"short"}:a-n<=864e5?{hour:"2-digit",minute:"2-digit"}:{weekday:"short",hour:"2-digit",minute:"2-digit"},h=new Intl.DateTimeFormat(this.locale,{...l,timeZone:this.timeZone}),c=this.hideUnits?"":he[t.unit]??t.unit,p=i.map(({t:e,v:i})=>({t:e,f:s.map(i),label:`${h.format(e)} · ${Dt(i,t.unit,!0)}${c?" "+c:""}`})),d=e=>{if(!e)return null;const i=s.map(e.v);return null===i?null:{t:e.t,f:i,ok:"ok"===Ct(e.v,t.min,t.max)}},u=s.map(r?.v??null);return G`<mpl-history-graph
        .points=${p} .start=${n} .end=${a} .ticks=${s.ticks}
        .thresholdLow=${s.thresholdLow} .thresholdHigh=${s.thresholdHigh} .events=${this.events}
        .minMarker=${d(this.history?.minPoint??null)}
        .maxMarker=${d(this.history?.maxPoint??null)}
        .current=${r&&null!==u?{t:r.t,f:u,tone:this.tone}:null}
        .summary=${ce(t,e,this.periodText)}
      ></mpl-history-graph>`})():G`<mpl-range-bar
          .value=${i(t.value)}
          .tone=${this.tone}
          .spanFrom=${e?i(e.min):null}
          .spanTo=${e?i(e.max):null}
          .avg=${e?i(e.mean):null}
          .avgOk=${"unknown"===s?null:"ok"===s}
          .showTicks=${null!==t.min&&null!==t.max}
      ></mpl-range-bar>`}
      ${null!==t.min&&null!==t.max?G`<span class="ideal">Ideal ${It(t.min)}–${It(t.max)}</span>`:Z}
      ${"summary"===this.display?G`<div class="stats">
        ${r("Min",e?.min??null)}
        ${r("Avg",e?.mean??null)}
        ${r("Max",e?.max??null)}
      </div>`:Z}
    `}}pe.styles=n`
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
      --mpl-metric-graph-caption-track: 36px;
      --mpl-metric-period-line: 16px;
      --mpl-metric-stat-size: 11px;
      --mpl-metric-stat-line: 16px;
      --mpl-metric-stat-gap: 2px;
      --mpl-metric-stats-gap: 4px;
      --mpl-metric-stat-padding: 4px;
      --mpl-metric-stat-radius: 6px;
      --mpl-metric-stat-label-weight: 400;
      --mpl-metric-stat-value-weight: 600;
      display: grid;
      container-type: inline-size;
      container-name: mpl-metric;
      grid-template-columns: var(--mpl-metric-column-width) minmax(0, 1fr);
      grid-template-rows: var(--mpl-metric-label-line) var(--mpl-metric-value-line) var(--mpl-metric-caption-line);
      column-gap: var(--mpl-metric-column-gap);
      row-gap: 0;
      align-items: center;
      min-width: 0;
    }
    :host([display='graph']) {
      height: calc(var(--mpl-metric-label-line) + var(--mpl-metric-value-line) + var(--mpl-metric-graph-caption-track));
      grid-template-rows: var(--mpl-metric-label-line) 1fr auto;
    }
    :host([display='graph']) .value,
    :host([display='graph']) .ideal {
      align-self: end;
    }
    :host([display='graph']) .ideal {
      min-height: var(--mpl-metric-caption-line);
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
      height: calc(var(--mpl-metric-value-line) + var(--mpl-metric-graph-caption-track));
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
    /* Arial chips 159.55px + 88px column + 12px gap + 20px headroom for production Roboto; round up to 280px. */
    @container mpl-metric (width < 280px) {
      :host([display='summary']) .ideal {
        display: none;
      }
      :host([display='summary']) .stats {
        grid-column: 1 / -1;
        justify-content: center;
      }
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
  `,t([mt({attribute:!1})],pe.prototype,"measurement",void 0),t([mt({reflect:!0})],pe.prototype,"tone",void 0),t([mt({attribute:!1})],pe.prototype,"history",void 0),t([mt({attribute:!1})],pe.prototype,"events",void 0),t([mt({attribute:!1})],pe.prototype,"graphStart",void 0),t([mt({attribute:!1})],pe.prototype,"graphEnd",void 0),t([mt({reflect:!0})],pe.prototype,"display",void 0),t([mt({type:Boolean})],pe.prototype,"daily",void 0),t([mt()],pe.prototype,"periodText",void 0),t([mt()],pe.prototype,"locale",void 0),t([mt({attribute:"time-zone"})],pe.prototype,"timeZone",void 0),t([mt({type:Boolean,attribute:"hide-units"})],pe.prototype,"hideUnits",void 0),t([mt({type:String,attribute:"period-label"})],pe.prototype,"periodLabel",void 0),customElements.get("mpl-metric-row")||customElements.define("mpl-metric-row",pe);const de=250,ue=(()=>{const t=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M${Array.from({length:180},(t,e)=>{const i=2*e*Math.PI/180,s=50*(.94+.06*Math.cos(9*i));return`${(50+s*Math.cos(i)).toFixed(3)},${(50+s*Math.sin(i)).toFixed(3)}`}).join(" L")} Z" fill="white"/></svg>`;return`url("data:image/svg+xml,${encodeURIComponent(t)}")`})();class me extends ct{constructor(){super(...arguments),this._gaugeCapacity=6,this._statsMap={hourly:{},cumulative:{},fine:{},failedGroups:{hourly:!1,cumulative:!1,fine:!1}},this._statsRequest=0,this._statsAppliedRequest=0,this._statsLastFetch=-1/0,this._statsStarted=-1/0,this._statsPending=!0,this._statsRetryDelay=de,this._statsDataKeys={},this._lastFetch=-1/0,this._fetchStarted=-1/0,this._request=0,this._appliedRequest=0,this._retryDelay=de,this._pending=!1,this._tooltipHovered=!1,this._touchTooltip=!1,this._graphPointerRelease=t=>{const e=this._graphPress;e&&e.id===t.pointerId&&(this._graphPress=void 0,"pointercancel"!==t.type&&"mouse"===t.pointerType&&this._fromGraph(t)||e.tile.classList.remove("graph-active"))},this._hideTooltip=()=>{clearTimeout(this._tooltipShowTimer),clearTimeout(this._tooltipHideTimer),this._tooltipShowTimer=void 0,this._tooltipHideTimer=void 0,this._tooltip=void 0,this._tooltipSource=void 0,this._hoveredGauge=void 0,this._tooltipHovered=!1,this._focusedGauge=void 0,this._touchTooltip=!1,document.removeEventListener("pointerdown",this._dismissTooltip,!0)},this._dismissTooltip=()=>{this._hideTooltip(),this._press=void 0,this._clearClickSuppression()},this._tooltipKeydown=t=>{this._clearClickSuppression(),"Escape"===t.key&&this._dismissTooltip()},this._gaugePointerMove=t=>{const e=this._press;e&&t.pointerId===e.id&&Math.hypot(t.clientX-e.x,t.clientY-e.y)>8&&this._dismissTooltip()},this._gaugePointerUp=t=>{const e=this._press;e&&t.pointerId===e.id&&(clearTimeout(this._tooltipShowTimer),this._tooltipShowTimer=void 0,this._press=void 0,e.long&&this._suppressClick?.id===e.id&&(this._suppressClick.released=!0,this._suppressClickTimer=setTimeout(()=>this._clearClickSuppression(),800)))},this._gaugePointerCancel=t=>{t.pointerId!==this._press?.id&&t.pointerId!==this._suppressClick?.id||this._dismissTooltip()}}get hass(){return this._hass}set hass(t){const e=this._hass;this._hass=t,this.requestUpdate("hass",e);const i=this._config?.entity;!i||!t||e&&e.states[i]?.last_updated===t.states[i]?.last_updated||this._queueFetch()}_fromGraph(t){return t.composedPath().some(t=>t instanceof Element&&"MPL-HISTORY-GRAPH"===t.tagName)}_tilePointerOver(t){const e=t.currentTarget;e.classList.toggle("graph-active",this._fromGraph(t)||this._graphPress?.tile===e)}_tilePointerOut(t){const e=t.currentTarget;this._fromGraph(t)&&this._graphPress?.tile!==e&&e.classList.remove("graph-active")}_tilePointerDown(t){if(!this._fromGraph(t))return;const e=t.currentTarget;this._graphPress={tile:e,id:t.pointerId},e.classList.add("graph-active")}_tilePointerLeave(t){const e=t.currentTarget;e.classList.remove("graph-active"),this._graphPress?.tile===e&&(this._graphPress=void 0)}_clearClickSuppression(){clearTimeout(this._suppressClickTimer),this._suppressClickTimer=void 0,this._suppressClick=void 0}_showTooltip(t,e){clearTimeout(this._tooltipHideTimer),this._tooltipHideTimer=void 0,this._tooltip=t,this._tooltipSource=e,this._touchTooltip="touch"===e,this._touchTooltip&&document.addEventListener("pointerdown",this._dismissTooltip,!0)}_gaugePointerDown(t){if(this._dismissTooltip(),"touch"!==t.pointerType&&"pen"!==t.pointerType)return;const e=t.currentTarget,i={button:e,id:t.pointerId,x:t.clientX,y:t.clientY,long:!1};this._press=i,this._tooltipShowTimer=setTimeout(()=>{this._tooltipShowTimer=void 0,i.long=!0,this._suppressClick={button:e,id:i.id,released:!1},this._showTooltip(e,"touch")},450)}_gaugePointerEnter(t){if("mouse"!==t.pointerType)return;const e=t.currentTarget;if(this._tooltip===e)return this._hoveredGauge=e,clearTimeout(this._tooltipHideTimer),void(this._tooltipHideTimer=void 0);this._focusedGauge||this._touchTooltip||(this._dismissTooltip(),this._hoveredGauge=e,this._tooltipShowTimer=setTimeout(()=>{this._tooltipShowTimer=void 0,this._showTooltip(e,"mouse")},500))}_gaugePointerLeave(t){"mouse"===t.pointerType&&(this._hoveredGauge===t.currentTarget&&(this._hoveredGauge=void 0),clearTimeout(this._tooltipShowTimer),this._tooltipShowTimer=void 0,this._scheduleTooltipHide())}_scheduleTooltipHide(){clearTimeout(this._tooltipHideTimer),this._tooltip&&!this._touchTooltip&&(this._tooltipHideTimer=setTimeout(()=>{this._tooltipHideTimer=void 0,this._hoveredGauge||this._tooltipHovered||this._focusedGauge||this._hideTooltip()},150))}_tooltipPointerEnter(){this._tooltipHovered=!0,clearTimeout(this._tooltipHideTimer),this._tooltipHideTimer=void 0}_tooltipPointerLeave(){this._tooltipHovered=!1,this._scheduleTooltipHide()}_gaugeBlur(){this._focusedGauge=void 0,this._hoveredGauge||this._tooltipHovered||this._touchTooltip||this._hideTooltip()}_gaugeFocus(t){const e=t.currentTarget;e.matches(":focus-visible")&&(this._tooltip!==e&&this._dismissTooltip(),this._focusedGauge=e,this._showTooltip(e,"focus"))}_gaugeClick(t,e){const i=this._suppressClick;if(0===t.detail&&this._clearClickSuppression(),t.detail>0&&i?.released&&t.currentTarget===i.button&&(!(t instanceof PointerEvent)||t.pointerId===i.id))return this._clearClickSuppression(),t.preventDefault(),void t.stopPropagation();this._moreInfo(e)}updated(){this._positionTooltip(),this._syncStats()}_isCumulative(t){const e=t?this.hass?.states[t]?.attributes.state_class:void 0;return"total"===e||"total_increasing"===e}_statsSensors(t){const e="string"==typeof this.hass?.config?.time_zone?this.hass.config.time_zone:void 0,i=new Set,s=new Set,r=new Set;let o=t,a=t,n=1;const l=[];if(this.hass&&this._config&&this.hass.states[this._config.entity]){const h=Pt(this._config);for(const c of Ot(this._info,h.map(t=>t.type),this.hass.states)){if(!c.sensor)continue;const p=Tt(h.find(t=>t.type===c.key)),d=this._isCumulative(c.sensor);if(d)s.add(c.sensor),n=Math.max(n,p.days);else{const s=St(p.period,t,e);o=Math.min(o,s);const n="illuminance"===c.key&&p.daylightOnly&&Number.isFinite(this.hass.config?.latitude)&&Number.isFinite(this.hass.config?.longitude)&&p.periodMs<=6048e5||"graph"===p.display&&("today"===p.period||"24h"===p.period);n&&(r.add(c.sensor),a=Math.min(a,s)),n&&"graph"!==p.display||i.add(c.sensor)}l.push([c.key,c.sensor,d,p.period,p.days,p.daylightOnly,p.daylightOffset,p.display,"today"!==p.period||d?null:St(p.period,t,e)])}}return{fetch:{hourly:[...i],hourlyStart:o,fine:[...r],fineStart:a,cumulative:[...s],cumulativeStart:wt(t,n-1,e)},key:JSON.stringify([this._config?.entity,l,this.hass?.config?.latitude,this.hass?.config?.longitude,e])}}_stopStats(t=!1){clearTimeout(this._statsTimer),this._statsTimer=void 0,t&&(this._statsAppliedRequest=++this._statsRequest,this._statsInFlight=void 0,this._statsRetryAt=void 0,this._statsRetryDelay=de,this._statsDataKeys={},this._statsKey=void 0,this._statsPending=!0,(Object.keys(this._statsMap.hourly).length||Object.keys(this._statsMap.cumulative).length||Object.keys(this._statsMap.fine).length)&&(this._statsMap={hourly:{},cumulative:{},fine:{},failedGroups:{hourly:!1,cumulative:!1,fine:!1}}))}_syncStats(){if("compact"===this._config?.display_type)return void this._stopStats(!0);if(!(this.isConnected&&this.hass&&this._info&&this._config))return;const{fetch:t,key:e}=this._statsSensors(Date.now());if(e!==this._statsKey&&(this._statsRetryAt=void 0,this._statsRetryDelay=de,this._statsDataKeys={},this._statsKey=e,this._statsAppliedRequest=++this._statsRequest,this._statsPending=!0),!t.hourly.length&&!t.cumulative.length&&!t.fine.length)return clearTimeout(this._statsTimer),void(this._statsTimer=void 0);const i=Date.now()-Math.max(this._statsLastFetch,this._statsStarted),s=void 0!==this._statsRetryAt?Math.max(0,this._statsRetryAt-Date.now()):this._statsPending?Math.max(0,6e4-i):Math.max(0,6e5-i);clearTimeout(this._statsTimer),this._statsTimer=void 0,0===s?this._fetchStats(t):this._statsTimer=setTimeout(()=>{this._statsTimer=void 0,this._statsPending=!0,this._syncStats()},s)}async _fetchStats(t){const e=this.hass,i=this._statsKey;this._statsRetryAt=void 0;const s=++this._statsRequest;this._statsInFlight=s,this._statsPending=!1,this._statsStarted=Date.now(),this._syncStats();const r=await async function(t,e,i=Date.now()){const s={hourly:{},cumulative:{},fine:{},failedGroups:{hourly:!1,cumulative:!1,fine:!1}};return await Promise.all(["hourly","cumulative","fine"].map(async r=>{try{const o=[...new Set(e[r])];if(0===o.length)return;s[r]=await t.callWS({type:"recorder/statistics_during_period",start_time:new Date(e[`${r}Start`]).toISOString(),end_time:new Date(i).toISOString(),statistic_ids:o,period:"fine"===r?"5minute":"hour",types:"cumulative"===r?["state"]:["min","max","mean"]})}catch{s.failedGroups[r]=!0}})),s}({callWS:t=>e.callWS(t)},t,this._statsStarted);if(s>this._statsAppliedRequest&&i===this._statsKey){this._statsLastFetch=Date.now();const t=["hourly","cumulative","fine"];for(const e of t)r.failedGroups[e]||(this._statsDataKeys[e]=Object.values(r[e]).some(t=>t.length>0)?i:void 0);t.some(t=>r.failedGroups[t]&&this._statsDataKeys[t]!==i)?(this._statsPending=!0,this._statsRetryAt=Date.now()+this._statsRetryDelay,this._statsRetryDelay=Math.min(4e3,2*this._statsRetryDelay)):(this._statsRetryAt=void 0,this._statsRetryDelay=de),this._statsMap={...r,hourly:r.failedGroups.hourly?this._statsMap.hourly:r.hourly,cumulative:r.failedGroups.cumulative?this._statsMap.cumulative:r.cumulative,fine:r.failedGroups.fine?this._statsMap.fine:r.fine},this._statsAppliedRequest=s}this._statsInFlight===s&&(this._statsInFlight=void 0),this._syncStats()}_positionTooltip(){const t=this.shadowRoot?.querySelector(".tooltip"),e=this.shadowRoot?.querySelector("ha-card"),i=this._tooltip;if(!t||!e||!i)return;if(!i.isConnected)return void this._dismissTooltip();const s=e.getBoundingClientRect(),r=i.getBoundingClientRect(),o=getComputedStyle(t),a=parseFloat(o.width),n=parseFloat(o.height),l=r.left+r.width/2-s.left-e.clientLeft,h=Math.max(8,Math.min(l-a/2,e.clientWidth-8-a));t.style.left=`${h}px`,t.style.top=r.top-s.top-e.clientTop-n-4+"px"}setConfig(t){if(!t||"string"!=typeof t.entity||!t.entity.startsWith("plant."))throw new Error("Specify a plant entity");const e=this._config?.entity!==t.entity;this._config={...t,show_bars:t.show_bars?[...t.show_bars]:void 0,metrics:Pt(t).map(t=>({...t}))},void 0!==this._gaugesInnerWidth&&(this._gaugeCapacity=this._capacityForWidth(this._gaugesInnerWidth)),this._dismissTooltip(),this._statsPending=!0,(e||"compact"===t.display_type)&&this._stopStats(!0),e&&(this._retryAt=void 0,this._retryDelay=de,clearTimeout(this._timer),this._timer=void 0,this._info=void 0,this._appliedRequest=++this._request,this._queueFetch()),this._syncStats()}getCardSize(){if("compact"===this._config?.display_type)return this._gaugeSize<=52?4:5;const t=this.hass&&this._config&&this.hass.states[this._config.entity]?Ot(this._info,Pt(this._config).map(t=>t.type),this.hass.states).length:0;return Math.ceil((100+86*t)/50)}getGridOptions(){return"compact"===this._config?.display_type?{columns:6,min_columns:6,rows:"auto"}:{columns:12,min_columns:9,rows:"auto"}}static async getConfigElement(){return await Promise.resolve().then(function(){return Te}),document.createElement("material-plant-card-editor")}static getStubConfig(t){return{type:`custom:${vt}`,entity:Object.keys(t.states).find(t=>t.startsWith("plant."))??"plant.my_plant",metrics:_t.map(t=>({type:t}))}}_queueFetch(){if(this._pending=!0,!this.isConnected||!this.hass||!this._config)return;if(!this._info&&void 0!==this._inFlight)return;const t=void 0!==this._retryAt?Math.max(0,this._retryAt-Date.now()):Math.max(0,5e3-(Date.now()-Math.max(this._lastFetch,this._fetchStarted)));0===t?(void 0!==this._timer&&clearTimeout(this._timer),this._timer=void 0,this._fetchInfo()):void 0===this._timer&&(this._timer=setTimeout(()=>{this._timer=void 0,this._fetchInfo()},t))}async _fetchInfo(){const t=this.hass,e=this._config?.entity;if(!this.isConnected||!t||!e)return;this._pending=!1,this._retryAt=void 0,this._fetchStarted=Date.now();const i=++this._request;this._inFlight=i;try{const s=await t.callWS({type:"plant/get_info",entity_id:e});if(!s?.result||"object"!=typeof s.result)throw new Error("Missing plant info");i>this._appliedRequest&&e===this._config?.entity&&(this._info=s.result,this._appliedRequest=i,void 0!==this._retryAt&&(clearTimeout(this._timer),this._timer=void 0,this._retryAt=void 0,this._pending=!1),this._retryDelay=de)}catch{i>this._appliedRequest&&e===this._config?.entity&&void 0===this._info&&(this._retryAt=Date.now()+this._retryDelay,this._retryDelay=Math.min(4e3,2*this._retryDelay),clearTimeout(this._timer),this._timer=void 0,this._queueFetch())}finally{i>=this._appliedRequest&&e===this._config?.entity&&(this._lastFetch=Date.now()),this._inFlight===i&&(this._inFlight=void 0),this._pending&&(clearTimeout(this._timer),this._timer=void 0,this._queueFetch())}}connectedCallback(){super.connectedCallback(),this._info||void 0!==this._inFlight||(this._lastFetch=this._fetchStarted=-1/0,this._pending=!0),void 0!==this._statsInFlight||Object.values(this._statsDataKeys).includes(this._statsSensors(Date.now()).key)||(this._statsLastFetch=this._statsStarted=-1/0),this._pending&&this._queueFetch(),this._syncStats(),this._observeGauges(),window.addEventListener("pointermove",this._gaugePointerMove,!0),window.addEventListener("pointerup",this._gaugePointerUp,!0),window.addEventListener("pointercancel",this._gaugePointerCancel,!0),window.addEventListener("pointerup",this._graphPointerRelease,!0),window.addEventListener("pointercancel",this._graphPointerRelease,!0),window.addEventListener("scroll",this._dismissTooltip,!0),this.addEventListener("scroll",this._dismissTooltip,!0),window.addEventListener("keydown",this._tooltipKeydown,!0)}disconnectedCallback(){super.disconnectedCallback(),this._stopStats(),this._dismissTooltip(),window.removeEventListener("pointermove",this._gaugePointerMove,!0),window.removeEventListener("pointerup",this._gaugePointerUp,!0),window.removeEventListener("pointercancel",this._gaugePointerCancel,!0),window.removeEventListener("pointerup",this._graphPointerRelease,!0),window.removeEventListener("pointercancel",this._graphPointerRelease,!0),this._graphPress=void 0,this.shadowRoot?.querySelectorAll(".graph-active").forEach(t=>t.classList.remove("graph-active")),window.removeEventListener("scroll",this._dismissTooltip,!0),this.removeEventListener("scroll",this._dismissTooltip,!0),window.removeEventListener("keydown",this._tooltipKeydown,!0),this._gaugesObserver?.disconnect(),this._gaugesObserver=void 0,void 0!==this._gaugesFrame&&cancelAnimationFrame(this._gaugesFrame),this._gaugesFrame=void 0,void 0!==this._timer&&clearTimeout(this._timer),this._timer=void 0}get _gaugeSize(){const t=this._config?.gauge_size;return"number"==typeof t&&Number.isFinite(t)?Math.max(32,Math.min(96,t)):44}_capacityForWidth(t){return Math.max(1,Math.floor((t+4)/(this._gaugeSize+4)))}_observeGauges(){this.isConnected&&!this._gaugesObserver&&(this._gaugesObserver=new ResizeObserver(t=>{for(const e of t)this.isConnected&&e.target===this&&(void 0!==this._gaugesFrame&&cancelAnimationFrame(this._gaugesFrame),this._gaugesFrame=void 0,this._gaugesInnerWidth=e.contentRect.width-32,this._gaugesFrame=requestAnimationFrame(()=>{if(this._gaugesFrame=void 0,!this.isConnected)return;const t=this._capacityForWidth(this._gaugesInnerWidth);t!==this._gaugeCapacity&&(this._gaugeCapacity=t),this._tooltip&&this._positionTooltip()}))}),this._gaugesObserver.observe(this))}shouldUpdate(t){if(t.has("_statsMap")||t.has("_tooltip")||t.has("_tooltipSource")||t.has("_config")||t.has("_info")||t.has("_failedSrc")||t.has("_gaugeCapacity"))return!0;if(!this._config||!this.hass||!t.has("hass"))return!1;const e=t.get("hass");if(!e)return!0;if(e.config?.latitude!==this.hass.config?.latitude||e.config?.longitude!==this.hass.config?.longitude||e.config?.time_zone!==this.hass.config?.time_zone||e.locale?.language!==this.hass.locale?.language||e.language!==this.hass.language)return!0;const i=new Set([this._config.entity]);this._config.battery_sensor&&i.add(this._config.battery_sensor);for(const{type:t}of Pt(this._config)){const e=this._info?.[t]?.sensor;e&&i.add(e)}return[...i].some(t=>e.states[t]!==this.hass.states[t])}_moreInfo(t){this.dispatchEvent(new CustomEvent("hass-more-info",{detail:{entityId:t},bubbles:!0,composed:!0}))}render(){if(!this._config||!this.hass)return Z;const t=this._config,e="string"==typeof this.hass.config?.time_zone?this.hass.config.time_zone:void 0,i=this.hass.states[t.entity];if(!i)return G`<ha-card><div class="warning">Entity not available: ${t.entity}</div></ha-card>`;const s="compact"===t.display_type,r=t.hide_units??!1,o=Pt(t),a=Object.fromEntries(o.map(t=>[t.type,Tt(t).icon??""])),n=Ot(this._info,o.map(t=>t.type),this.hass.states,a),l=n[this._tooltip?Array.from(this.shadowRoot.querySelectorAll(".gauge-btn")).indexOf(this._tooltip):-1],h=l?function(t){const e=t=>{const e=Math.abs(t);return String(zt(t,e>=100?0:e>=10?1:2))},i=t.unit?` ${t.unit}`:"",s="low"===t.status?" · too low":"high"===t.status?" · too high":"",r=null===t.value?"—":e(t.value),o=null===t.min||null===t.max?"":` · ideal ${e(t.min)}–${e(t.max)}${i}`;return[t.label+s,`${r}${i}${o}`]}(l):void 0,c=n.length,p=Math.ceil(c/this._gaugeCapacity),d=t.gauges_per_row,u="number"==typeof d&&Number.isInteger(d)&&d>=1&&d<=12?Math.min(d,c):void 0,m=c?void 0!==u&&u<=this._gaugeCapacity?u:Math.ceil(c/p):1,g=function(t,e,i){const s=[],r=new Set,o=Pt(i),a=t?.attributes.problems,n=new Map;if(Array.isArray(a))for(const t of a){if(!t||"object"!=typeof t)continue;const{sensor_type:e,status:i}=t;if("string"!=typeof e||n.has(e))continue;const s="string"==typeof i?i:"";n.set(e,{key:e,label:At(e),status:/low/i.test(s)?"low":/high/i.test(s)?"high":"problem"})}for(const t of e){if(r.has(t.key))continue;const e=Tt(o.find(e=>e.type===t.key)??{type:t.key}).trigger;if("plant"===e){const e=n.get(t.key);if(!e)continue;s.push({...e,label:t.label})}else{if("low"!==t.status&&"high"!==t.status)continue;if("out_of_range"!==e&&e!==t.status)continue;s.push({key:t.key,label:t.label,status:t.status})}r.add(t.key)}return Array.isArray(a)||"problem"!==t?.state||0!==s.length||s.push({key:"plant",label:"Needs attention",status:"problem"}),s}(i,n,t),v=t.name||i.attributes.friendly_name||t.entity,y=g.length?g.map(t=>"problem"===t.status?t.label:`${t.label} ${t.status}`).join(" · "):t.hide_species?void 0:i.attributes.species,f=t.image??i.attributes.entity_picture,_="string"==typeof f&&f?f:void 0;_!==this._imageSrc&&(this._imageSrc=_,this._failedSrc=void 0);const b=t.battery_sensor?this.hass.states[t.battery_sensor]:void 0,$=function(t,e=10){const i=Et(t?.state),s=null===i?null:Math.max(0,Math.min(100,Math.round(i))),r=Number.isFinite(e)?e:10;return{level:s,tone:null===s?"unknown":s<r?"low":"ok"}}(b,t.battery_warn_level);return G`
      <ha-card class=${s?"compact":"full"}>
        <div class=${"header "+(t.hide_image?"no-image":"")}>
          ${t.hide_image?Z:G`
            <button class="image-btn" type="button" aria-label=${`More information about ${v}`} @click=${()=>this._moreInfo(t.entity)}>
              ${_&&_!==this._failedSrc?G`<img class="photo" src=${_} alt="" @error=${()=>{this._failedSrc=_}}>`:G`<span class="photo placeholder"><ha-icon icon="mdi:flower-outline" aria-hidden="true"></ha-icon></span>`}
              ${g.length?G`<span class="problem-badge" aria-label="Needs attention">
                <svg viewBox="0 0 18 18" aria-hidden="true" focusable="false">
                  <rect x="8" y="4" width="2" height="6.5" rx="1"></rect>
                  <circle cx="9" cy="13.25" r="1.25"></circle>
                </svg>
              </span>`:Z}
            </button>`}
          <button class="text-btn" type="button" aria-label=${`More information about ${v}`} @click=${()=>this._moreInfo(t.entity)}>
            <span class="name" title=${v}>${v}</span>
            ${y?G`<span class=${"subtitle "+(g.length?"problems":"")} title=${y}>${y}</span>`:Z}
          </button>
          ${b?G`
            <button class="battery" type="button" aria-label=${`Battery: ${null===$.level?"unknown":`${$.level}%`}. More information`}
              @click=${e=>{e.stopPropagation(),this._moreInfo(t.battery_sensor)}}>
              <mpl-battery .level=${$.level} .tone=${$.tone}></mpl-battery>
            </button>`:Z}
        </div>
        ${!s&&n.length?G`<div class="tiles">${n.map(i=>{const s=Tt(o.find(t=>t.type===i.key)),a=Date.now(),n=this._isCumulative(i.sensor),l=this.hass.config?.latitude,h=this.hass.config?.longitude,c=St(s.period,a,e),p="illuminance"===i.key&&!n&&s.daylightOnly&&Number.isFinite(l)&&Number.isFinite(h),d=p&&a-c<=2592e5?function(t,e,i,s,r=0){const o=[],a=r*Xt;for(let r=t-Vt;r<=e+Vt;r+=Vt){const n=te(r,i,s);if("string"!=typeof n&&!(n.sunrise+a>=n.sunset-a))for(const i of["sunrise","sunset"]){const s=n[i]+("sunrise"===i?a:-a);t<=s&&s<=e&&o.push({t:s,kind:i})}}return o.sort((t,e)=>t.t-e.t),o.filter((t,e)=>0===e||t.t-o[e-1].t>Xt)}(c,a,l,h,s.daylightOffset).map(t=>({t:t.t,icon:"sunrise"===t.kind?"mdi:weather-sunset-up":"mdi:weather-sunset-down"})):[],u=p?(t,e)=>ee(t,e,l,h,s.daylightOffset):void 0,m=!u||u(a,a),v=p&&s.periodMs<=6048e5,y=n?function(t,e){const i=Math.max(1,Math.min(30,Math.round(e.days))),s={stats:null,series:[],minPoint:null,maxPoint:null};let r=0,o=0;for(let a=i-1;a>=0;a--){const n=wt(e.now,a,e.timeZone),l=wt(e.now,a-1,e.timeZone),h=(t??[]).filter(t=>n<=t.start&&t.start<l).sort((t,e)=>t.start-e.start);let c=null;for(const t of h){const e="number"==typeof t.state&&Number.isFinite(t.state)?t.state:null;null!==e&&(c=null===c?e:Math.max(c,e)),1===i&&s.series.push({t:(t.start+t.end)/2,v:e})}if(0===a&&null!==e.current&&(c=null===c?e.current:Math.max(c,e.current),1===i&&s.series.push({t:e.now,v:e.current})),1===i)return s.stats=null===c?null:{min:c,max:c,mean:c},s;const p=n+432e5;s.series.push({t:p,v:c}),null!==c&&((null===s.minPoint||c<s.minPoint.v)&&(s.minPoint={t:p,v:c}),(null===s.maxPoint||c>s.maxPoint.v)&&(s.maxPoint={t:p,v:c}),r+=c,o++)}return null!==s.minPoint&&null!==s.maxPoint&&(s.stats={min:s.minPoint.v,max:s.maxPoint.v,mean:r/o}),s}(i.sensor?this._statsMap.cumulative[i.sensor]:void 0,{days:s.days,now:a,current:i.value,timeZone:e}):kt(i.sensor?(v?this._statsMap.fine:this._statsMap.hourly)[i.sensor]:void 0,{start:c,now:a,current:m?i.value:null,keep:u});let f=y;if(y&&"graph"===s.display){const t="today"===s.period||"24h"===s.period,e=n?y.series:kt(i.sensor?(t?this._statsMap.fine:this._statsMap.hourly)[i.sensor]:void 0,{start:c,now:a,current:i.value}).series,r=p?t=>ee(t,t,l,h,s.daylightOffset):void 0;f={...y,series:e,...xt(e,r)}}const _=Rt(i,g),b=n||!m||"low"!==i.status&&"high"!==i.status?_:"problem",$="24h"===s.period?"24 h":`${parseInt(s.period)} d`,x="24h"===s.period?"24 h":`${parseInt(s.period)} days`,w=n?1===s.days?"Today":`Daily max · ${s.days} d`:"today"===s.period?p?"Daylight · today":"Today":`${p?"Daylight ·":"Last"} ${$}`,k=n?1===s.days?"today":`daily maximum, last ${s.days} days`:`${p?"daylight, ":""}${"today"===s.period?"today":`last ${x}`}`;return G`<div class=${"tile"+("problem"===_?" problem":"")} role="button" tabindex="0" aria-label=${ce(i,f?.stats??null,k)}
            @pointerover=${this._tilePointerOver} @pointerout=${this._tilePointerOut} @pointerleave=${this._tilePointerLeave}
            @pointerdown=${{handleEvent:t=>this._tilePointerDown(t),capture:!0}}
            @click=${()=>this._moreInfo(i.sensor??t.entity)}
            @keydown=${e=>{e.target!==e.currentTarget||"Enter"!==e.key&&" "!==e.key||(" "===e.key&&e.preventDefault(),this._moreInfo(i.sensor??t.entity))}}>
            <mpl-metric-row .measurement=${i} .tone=${b} .display=${s.display} .history=${f} .events=${d}
              .graphStart=${n?void 0:c} .graphEnd=${n?void 0:a}
              .periodLabel=${w} .periodText=${k} .daily=${n&&s.days>1}
               .locale=${this.hass.locale?.language??this.hass.language} .timeZone=${e} .hideUnits=${r}></mpl-metric-row>
          </div>`})}</div>`:Z}
        ${s&&n.length?G`<div class="gauges" style=${`--mpl-cols: ${m}; --mpl-gauge-size: ${this._gaugeSize}px`}>${n.map(e=>G`
          <button class="gauge-btn" type="button" aria-label=${Ht(e)}
            @pointerdown=${this._gaugePointerDown} @pointerenter=${this._gaugePointerEnter} @pointerleave=${this._gaugePointerLeave}
            @focus=${this._gaugeFocus} @blur=${this._gaugeBlur}
            @contextmenu=${t=>t.preventDefault()}
            @click=${i=>this._gaugeClick(i,e.sensor??t.entity)}>
            <mpl-gauge .embedded=${!0} .fraction=${e.fraction} .tone=${Rt(e,g)} .icon=${e.icon}
              .value=${r?"":Dt(e.value,e.unit,r)} .label=${Ht(e)}></mpl-gauge>
          </button>`)}</div>`:Z}
        ${s&&this._tooltip&&h?G`<div class="tooltip" role="tooltip" id="mpl-tooltip" data-source=${this._tooltipSource}
          @pointerenter=${this._tooltipPointerEnter} @pointerleave=${this._tooltipPointerLeave}>
          <span class="tooltip-title">${h[0]}</span>
          <span class="tooltip-body">${h[1]}</span>
        </div>`:Z}
      </ha-card>`}}me.styles=[Ft,n`
    :host { display: block; container-type: inline-size; container-name: mpl-card; --mpl-tile-gap: 2px; --mpl-tile-margin: 12px; --mpl-tile-padding: 8px 12px; --mpl-tile-corner: 4px; --mpl-tile-outer-corner: 16px; }
    ha-card { position: relative; display: block; box-sizing: border-box; padding: 16px; background: var(--mpl-surface-bg); color: var(--mpl-on-surface); border-radius: var(--ha-card-border-radius, var(--mpl-shape-card)); }
    .tooltip { position: absolute; background: var(--mpl-inverse-surface); color: var(--mpl-inverse-on-surface); font-size: var(--md-sys-typescale-body-small-size, 12px); line-height: 16px; font-weight: 400; padding: 4px 8px; min-height: 24px; box-sizing: border-box; border-radius: var(--md-sys-shape-corner-extra-small, 4px); max-width: calc(100% - 16px); width: max-content; pointer-events: none; z-index: 2; animation: tooltip-enter 150ms cubic-bezier(0.2,0,0,1); transform-origin: bottom center; }
    .tooltip[data-source='mouse'] { pointer-events: auto; }
    .tooltip-title, .tooltip-body { display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .tooltip-title { font-weight: 500; }
    @keyframes tooltip-enter { from { opacity: 0; transform: scale(.8); } to { opacity: 1; transform: scale(1); } }
    @media (prefers-reduced-motion: reduce) { .tooltip { animation: none; } }
    .header { display: grid; grid-template-columns: auto minmax(0, 1fr) auto; gap: 12px; align-items: center; }
    .header.no-image { grid-template-columns: minmax(0, 1fr) auto; }
    @container mpl-card (width < 224px) {
      .header:not(.no-image) { grid-template-columns: minmax(0, 1fr) auto; grid-template-areas: 'image battery' 'text text'; row-gap: 8px; reading-flow: grid-rows; }
      .header:not(.no-image) .image-btn { grid-area: image; }
      .header:not(.no-image) .text-btn { grid-area: text; }
      .header:not(.no-image) .battery { grid-area: battery; }
    }
    button { appearance: none; border: 0; margin: 0; padding: 0; background: none; color: inherit; font: inherit; cursor: pointer; }
    button:focus-visible, .tile:focus-visible { outline: 2px solid var(--mpl-primary); outline-offset: 2px; }
    .image-btn { position: relative; width: 56px; height: 56px; border-radius: var(--mpl-shape-full); }
    .photo { display: block; width: 100%; height: 100%; object-fit: cover; mask-image: ${a(ue)}; -webkit-mask-image: ${a(ue)}; mask-size: 100% 100%; -webkit-mask-size: 100% 100%; }
    .placeholder { display: grid; place-items: center; background: var(--mpl-secondary-container); color: var(--mpl-on-secondary-container); }
    .problem-badge { position: absolute; bottom: 0; right: 0; display: grid; place-items: center; width: 18px; height: 18px; border-radius: var(--mpl-shape-full); background: var(--mpl-error); box-shadow: 0 0 0 2px var(--mpl-surface-bg); }
    .problem-badge svg { display: block; width: 18px; height: 18px; fill: var(--mpl-on-error); }
    .text-btn { min-width: 0; min-height: 44px; padding: 6px 6px; margin: -6px -6px -6px -6px; text-align: left; border-radius: 12px; }
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
    .tile { position: relative; box-sizing: border-box; width: 100%; text-align: left; cursor: pointer; padding: var(--mpl-tile-padding); background: var(--mpl-surface-container-high); border-radius: var(--mpl-tile-corner); --mpl-range-bar-ring: var(--mpl-surface-container-high); }
    .tile::after { content: ''; position: absolute; inset: 0; border-radius: inherit; background: var(--mpl-on-surface); opacity: 0; pointer-events: none; transition: opacity 150ms; }
    .tile.problem { background: linear-gradient(to right, var(--mpl-surface-container-high) 45%, color-mix(in srgb, var(--mpl-error-container) 40%, var(--mpl-surface-container-high))); }
    .tile:first-child { border-top-left-radius: var(--mpl-tile-outer-corner); border-top-right-radius: var(--mpl-tile-outer-corner); }
    .tile:last-child { border-bottom-left-radius: var(--mpl-tile-outer-corner); border-bottom-right-radius: var(--mpl-tile-outer-corner); }
    /* Touch can leave a sticky :hover after scrubbing; only hover-capable inputs get this layer. */
    @media (hover: hover) {
      .tile:hover:not(.graph-active)::after { opacity: 0.08; }
    }
    .tile:active:not(.graph-active)::after { opacity: 0.12; }
    @media (prefers-reduced-motion: reduce) { .tile::after { transition: none; } }
    .warning { color: var(--mpl-error); }
  `],t([mt({attribute:!1,noAccessor:!0})],me.prototype,"hass",null),t([gt()],me.prototype,"_config",void 0),t([gt()],me.prototype,"_info",void 0),t([gt()],me.prototype,"_failedSrc",void 0),t([gt()],me.prototype,"_gaugeCapacity",void 0),t([gt()],me.prototype,"_statsMap",void 0),t([gt()],me.prototype,"_tooltip",void 0),t([gt()],me.prototype,"_tooltipSource",void 0),customElements.get(vt)||customElements.define(vt,me);const ge=window;let ve;ge.customCards??=[],ge.customCards.some(t=>t.type===vt)||ge.customCards.push({type:vt,name:yt,description:"A Material 3 Expressive plant card with circular range gauges, problem states and a battery indicator.",preview:!0,documentationURL:"https://github.com/lageorgem/ha-material-plant-card"}),console.info(`${yt} v0.1.0`);const ye=t=>({select:{mode:"dropdown",options:t}}),fe=[{value:"today",label:"Today"},{value:"24h",label:"Last 24 hours"},{value:"3d",label:"Last 3 days"},{value:"7d",label:"Last 7 days"},{value:"14d",label:"Last 14 days"},{value:"30d",label:"Last 30 days"}],_e=[{name:"entity",required:!0,selector:{entity:{domain:"plant"}}},{name:"name",selector:{text:{}}},{name:"battery_sensor",selector:{entity:{domain:"sensor",device_class:"battery"}}},{name:"display_type",selector:ye([{value:"full",label:"Full"},{value:"compact",label:"Compact"}])},{name:"",type:"expandable",title:"Appearance",icon:"mdi:palette-outline",flatten:!0,schema:[...["hide_species","hide_image","hide_units"].map(t=>({name:t,selector:{boolean:{}}})),{name:"image",selector:{text:{}}},{name:"battery_warn_level",selector:{number:{min:0,max:100,step:1,mode:"box",unit_of_measurement:"%"}}}]}],be={name:"",type:"expandable",title:"Compact layout",icon:"mdi:view-grid-outline",flatten:!0,schema:[{name:"gauges_per_row",selector:{number:{min:1,max:12,step:1,mode:"box"}}},{name:"gauge_size",selector:{number:{min:32,max:96,step:4,mode:"slider",unit_of_measurement:"px"}}}]},$e={entity:"Plant entity",name:"Name",battery_sensor:"Battery sensor",display_type:"Display type",hide_species:"Hide species",hide_image:"Hide image",hide_units:"Hide units",image:"Image",battery_warn_level:"Battery low below",icon:"Icon",display:"Display",problem_trigger:"Problem trigger",days:"Days (1 = today)",period:"History window",daylight_only:"Daylight only (sunrise/sunset)",daylight_offset:"Ignore after sunrise / before sunset",gauges_per_row:"Gauges per row",gauge_size:"Gauge size"},xe={hide_units:"Hides units next to values.",image:"Overrides the plant picture.",battery_warn_level:"Battery turns red below this level (default 10%).",problem_trigger:"Independent of the plant monitor unless set to Follow plant monitor.",days:"DLI uses the maximum value of each day.",daylight_offset:"Minutes after sunrise and before sunset to ignore (default 30).",gauges_per_row:"Leave empty to balance rows automatically.",gauge_size:"Default 44 px."},we={icon:"",display:"summary",problem_trigger:"plant",period:"today",days:7,daylight_only:!0,daylight_offset:30},ke=bt,Me=$t;function Se(t){return[{name:"icon",selector:{icon:{}}},{name:"display",selector:ye([{value:"summary",label:"Summary"},{value:"graph",label:"Graph"}])},{name:"problem_trigger",selector:ye([{value:"plant",label:"Follow plant monitor"},{value:"out_of_range",label:"Outside ideal range"},{value:"low",label:"Too low only"},{value:"high",label:"Too high only"},{value:"never",label:"Never"}])},"dli"===t?{name:"days",selector:{number:{min:1,max:30,step:1,mode:"slider",unit_of_measurement:"days"}}}:{name:"period",selector:ye(fe)},..."illuminance"===t?[{name:"daylight_only",selector:{boolean:{}}},{name:"daylight_offset",selector:{number:{min:0,max:180,step:5,mode:"box",unit_of_measurement:"min"}}}]:[]]}class Pe extends ct{constructor(){super(...arguments),this._editingIndex=null,this._addOpen=!1,this._computeLabel=t=>$e[t.name]??t.title??t.name,this._computeHelper=t=>xe[t.name]??""}connectedCallback(){super.connectedCallback(),(ve||(ve=(async()=>{if(customElements.get("ha-form")&&customElements.get("ha-entity-picker")&&customElements.get("ha-icon-picker"))return;const t=window.loadCardHelpers;if(t)try{const e=await t(),i=(await e.createCardElement({type:"entities",entities:[]})).constructor;await(i.getConfigElement?.())}catch{}})(),ve)).then(()=>this.requestUpdate())}setConfig(t){this._config=t}_emit(t){this._config=t,this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:t},bubbles:!0,composed:!0}))}get _schema(){return"compact"===this._config.display_type?[..._e,be]:_e}_formChanged(t){t.stopPropagation();const e={...this._config},i=e,s=this._schema.flatMap(t=>t.schema??[t]);for(const{name:e}of s){if(!Object.prototype.hasOwnProperty.call(t.detail.value,e))continue;const s=t.detail.value[e];""===s||null==s?delete i[e]:i[e]=s}this._emit(e)}get _metrics(){return Pt(this._config)}_setMetrics(t){const e={...this._config,metrics:t};delete e.show_bars,this._emit(e)}_pickMetric(t){this._metrics.some(e=>e.type===t)||(this._editingIndex=this._metrics.length,this._addOpen=!1,this._setMetrics([...this._metrics,{type:t}]))}_removeMetric(t){this._editingIndex=null,this._setMetrics(this._metrics.filter((e,i)=>i!==t))}_moveMetric(t){t.stopPropagation();const{oldIndex:e,newIndex:i}=t.detail,s=[...this._metrics];if(!Number.isInteger(e)||!Number.isInteger(i)||e<0||i<0||e>=s.length||i>=s.length||e===i)return;const[r]=s.splice(e,1);s.splice(i,0,r),this._editingIndex=null,this._setMetrics(s)}_handleKey(t,e){if("ArrowUp"!==e.key&&"ArrowDown"!==e.key)return;e.preventDefault(),e.stopPropagation();const i=t+("ArrowUp"===e.key?-1:1);this._moveMetric(new CustomEvent("item-moved",{detail:{oldIndex:t,newIndex:i}})),this.updateComplete.then(()=>{this.shadowRoot?.querySelectorAll(".handle")[Math.max(0,Math.min(i,this._metrics.length-1))]?.focus()})}_metricChanged(t,e){e.stopPropagation();const i=[...this._metrics],s={...i[t]},r=s;for(const{name:t}of Se(s.type)){if(!Object.prototype.hasOwnProperty.call(e.detail.value,t))continue;const i=e.detail.value[t];""===i||null==i||i===we[t]?delete r[t]:r[t]=i}for(const[t,e]of Object.entries(we))r[t]===e&&delete r[t];i[t]=s,this._setMetrics(i)}_summary(t){const e=Tt(t);return["graph"===e.display?"Graph":"Summary",..."illuminance"===t.type&&e.daylightOnly?["Daylight"]:[],"dli"===t.type?`Daily max ${e.days} d`:fe.find(t=>t.value===e.period).label].join(" · ")}_renderMetric(t,e){const i=this._editingIndex===e,s=Tt(t),r=ke[t.type]??t.type,o={icon:s.icon??"",display:s.display,problem_trigger:s.trigger,period:s.period,days:s.days,daylight_only:s.daylightOnly,daylight_offset:s.daylightOffset};return G`<div class="metric">
      <div class="metric-head">
        <div class="handle" tabindex="0" role="button" aria-label=${`Reorder ${r}. Use up and down arrow keys.`}
          @keydown=${t=>this._handleKey(e,t)}><ha-icon icon="mdi:drag"></ha-icon></div>
        <ha-icon icon=${t.icon??Me[t.type]??"mdi:leaf"}></ha-icon>
        <div class="metric-title"><div>${r}</div><div class="hint">${this._summary(t)}</div></div>
        <button type="button" class="icon-btn" aria-label="Edit metric" title=${`Edit ${r}`} aria-expanded=${String(i)}
          @click=${()=>this._editingIndex=i?null:e}><ha-icon icon="mdi:pencil"></ha-icon></button>
        <button type="button" class="icon-btn" aria-label="Delete metric" title=${`Delete ${r}`}
          @click=${()=>this._removeMetric(e)}><ha-icon icon="mdi:delete"></ha-icon></button>
      </div>
      ${i?G`<div class="metric-editor"><ha-form .hass=${this.hass} .schema=${Se(t.type)}
        .data=${o} .computeLabel=${this._computeLabel} .computeHelper=${this._computeHelper}
        @value-changed=${t=>this._metricChanged(e,t)}></ha-form></div>`:Z}
    </div>`}render(){if(!this._config||!this.hass)return G``;const t=this._config,e=this._metrics,i=ft.filter(t=>!e.some(e=>e.type===t));return G`<div class="editor">
      <ha-form .hass=${this.hass} .schema=${this._schema} .data=${{entity:t.entity,name:t.name,battery_sensor:t.battery_sensor,display_type:t.display_type??"full",hide_species:t.hide_species??!1,hide_image:t.hide_image??!1,hide_units:t.hide_units??!1,image:t.image,battery_warn_level:t.battery_warn_level??10,..."compact"===t.display_type?{gauges_per_row:t.gauges_per_row,gauge_size:t.gauge_size??44}:{}}} .computeLabel=${this._computeLabel} .computeHelper=${this._computeHelper} @value-changed=${this._formChanged}></ha-form>
      <div class="metrics-header">Metrics</div>
      ${e.length?Z:G`<p class="hint">No metrics yet. Add a metric below.</p>`}
      <ha-sortable handle-selector=".handle" @item-moved=${this._moveMetric}>
        <div class="metrics">${e.map((t,e)=>this._renderMetric(t,e))}</div>
      </ha-sortable>
      ${i.length?G`<div class="add">
        <button type="button" class="add-btn" aria-expanded=${String(this._addOpen)}
          @click=${()=>this._addOpen=!this._addOpen}><ha-icon icon="mdi:plus"></ha-icon>Add metric</button>
        ${this._addOpen?G`<div class="add-menu" @keydown=${t=>{"Escape"===t.key&&(this._addOpen=!1,this.shadowRoot?.querySelector(".add-btn")?.focus())}}>${i.map(t=>G`<button type="button" class="add-opt" data-type=${t}
          @click=${()=>this._pickMetric(t)}><ha-icon icon=${Me[t]}></ha-icon>${ke[t]}</button>`)}</div>`:Z}
      </div>`:Z}
    </div>`}}Pe.styles=[Ft,n`
    :host { display: block; }
    .editor, .metrics, .add-menu { display: flex; flex-direction: column; gap: 16px; }
    .metrics { gap: 8px; }
    .metrics-header { font-weight: 500; color: var(--mpl-on-surface); }
    .metric { border: 1px solid var(--mpl-outline-variant); border-radius: var(--mpl-shape-card); background: var(--mpl-surface-container); }
    .metric-head { display: flex; align-items: center; gap: 8px; padding: 8px; }
    .handle { cursor: grab; display: grid; place-items: center; color: var(--mpl-on-surface-variant); min-width: 44px; min-height: 44px; }
    .metric-title { flex: 1; min-width: 0; color: var(--mpl-on-surface); overflow-wrap: anywhere; }
    button { font: inherit; cursor: pointer; border: none; }
    .icon-btn { flex-shrink: 0; width: 44px; height: 44px; border-radius: var(--mpl-shape-full); background: transparent; color: var(--mpl-on-surface-variant); }
    button:hover, button:active { background: var(--mpl-surface-container-highest); }
    button:focus-visible, .handle:focus-visible { outline: 2px solid var(--mpl-primary); outline-offset: 2px; }
    .metric-editor { padding: 8px 12px 12px; border-top: 1px solid var(--mpl-outline-variant); }
    .hint { color: var(--mpl-on-surface-variant); font-size: 13px; margin: 0; overflow-wrap: anywhere; }
    .add-btn { display: inline-flex; align-items: center; gap: 8px; min-height: 44px; padding: 10px 18px; border-radius: var(--mpl-shape-full); background: var(--mpl-primary); color: var(--mpl-on-primary); }
    .add-btn:hover, .add-btn:active { background: var(--mpl-primary); filter: brightness(0.95); }
    .add-menu { margin-top: 8px; gap: 0; background: var(--mpl-surface); border: 1px solid var(--mpl-outline-variant); border-radius: var(--mpl-shape-card); overflow: hidden; }
    .add-opt { display: flex; align-items: center; gap: 8px; text-align: left; min-height: 44px; padding: 12px 16px; background: transparent; color: var(--mpl-on-surface); }
  `],t([mt({attribute:!1})],Pe.prototype,"hass",void 0),t([gt()],Pe.prototype,"_config",void 0),t([gt()],Pe.prototype,"_editingIndex",void 0),t([gt()],Pe.prototype,"_addOpen",void 0),customElements.get("material-plant-card-editor")||customElements.define("material-plant-card-editor",Pe);var Te=Object.freeze({__proto__:null,MaterialPlantCardEditor:Pe});export{me as MaterialPlantCard};
