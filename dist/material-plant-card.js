function t(t,e,i,s){var r,o=arguments.length,n=o<3?e:null===s?s=Object.getOwnPropertyDescriptor(e,i):s;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)n=Reflect.decorate(t,e,i,s);else for(var a=t.length-1;a>=0;a--)(r=t[a])&&(n=(o<3?r(n):o>3?r(e,i,n):r(e,i))||n);return o>3&&n&&Object.defineProperty(e,i,n),n}"function"==typeof SuppressedError&&SuppressedError;const e=globalThis,i=e.ShadowRoot&&(void 0===e.ShadyCSS||e.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,s=Symbol(),r=new WeakMap;let o=class{constructor(t,e,i){if(this._$cssResult$=!0,i!==s)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e}get styleSheet(){let t=this.o;const e=this.t;if(i&&void 0===t){const i=void 0!==e&&1===e.length;i&&(t=r.get(e)),void 0===t&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),i&&r.set(e,t))}return t}toString(){return this.cssText}};const n=t=>new o("string"==typeof t?t:t+"",void 0,s),a=(t,...e)=>{const i=1===t.length?t[0]:e.reduce((e,i,s)=>e+(t=>{if(!0===t._$cssResult$)return t.cssText;if("number"==typeof t)return t;throw Error("Value passed to 'css' function must be a 'css' function result: "+t+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+t[s+1],t[0]);return new o(i,t,s)},l=i?t=>t:t=>t instanceof CSSStyleSheet?(t=>{let e="";for(const i of t.cssRules)e+=i.cssText;return n(e)})(t):t,{is:c,defineProperty:h,getOwnPropertyDescriptor:p,getOwnPropertyNames:d,getOwnPropertySymbols:u,getPrototypeOf:m}=Object,g=globalThis,f=g.trustedTypes,y=f?f.emptyScript:"",v=g.reactiveElementPolyfillSupport,_=(t,e)=>t,b={toAttribute(t,e){switch(e){case Boolean:t=t?y:null;break;case Object:case Array:t=null==t?t:JSON.stringify(t)}return t},fromAttribute(t,e){let i=t;switch(e){case Boolean:i=null!==t;break;case Number:i=null===t?null:Number(t);break;case Object:case Array:try{i=JSON.parse(t)}catch(t){i=null}}return i}},$=(t,e)=>!c(t,e),w={attribute:!0,type:String,converter:b,reflect:!1,useDefault:!1,hasChanged:$};Symbol.metadata??=Symbol("metadata"),g.litPropertyMetadata??=new WeakMap;let A=class extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,e=w){if(e.state&&(e.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(t)&&((e=Object.create(e)).wrapped=!0),this.elementProperties.set(t,e),!e.noAccessor){const i=Symbol(),s=this.getPropertyDescriptor(t,i,e);void 0!==s&&h(this.prototype,t,s)}}static getPropertyDescriptor(t,e,i){const{get:s,set:r}=p(this.prototype,t)??{get(){return this[e]},set(t){this[e]=t}};return{get:s,set(e){const o=s?.call(this);r?.call(this,e),this.requestUpdate(t,o,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??w}static _$Ei(){if(this.hasOwnProperty(_("elementProperties")))return;const t=m(this);t.finalize(),void 0!==t.l&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty(_("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(_("properties"))){const t=this.properties,e=[...d(t),...u(t)];for(const i of e)this.createProperty(i,t[i])}const t=this[Symbol.metadata];if(null!==t){const e=litPropertyMetadata.get(t);if(void 0!==e)for(const[t,i]of e)this.elementProperties.set(t,i)}this._$Eh=new Map;for(const[t,e]of this.elementProperties){const i=this._$Eu(t,e);void 0!==i&&this._$Eh.set(i,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){const e=[];if(Array.isArray(t)){const i=new Set(t.flat(1/0).reverse());for(const t of i)e.unshift(l(t))}else void 0!==t&&e.push(l(t));return e}static _$Eu(t,e){const i=e.attribute;return!1===i?void 0:"string"==typeof i?i:"string"==typeof t?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this))}addController(t){(this._$EO??=new Set).add(t),void 0!==this.renderRoot&&this.isConnected&&t.hostConnected?.()}removeController(t){this._$EO?.delete(t)}_$E_(){const t=new Map,e=this.constructor.elementProperties;for(const i of e.keys())this.hasOwnProperty(i)&&(t.set(i,this[i]),delete this[i]);t.size>0&&(this._$Ep=t)}createRenderRoot(){const t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return((t,s)=>{if(i)t.adoptedStyleSheets=s.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(const i of s){const s=document.createElement("style"),r=e.litNonce;void 0!==r&&s.setAttribute("nonce",r),s.textContent=i.cssText,t.appendChild(s)}})(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(t=>t.hostConnected?.())}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach(t=>t.hostDisconnected?.())}attributeChangedCallback(t,e,i){this._$AK(t,i)}_$ET(t,e){const i=this.constructor.elementProperties.get(t),s=this.constructor._$Eu(t,i);if(void 0!==s&&!0===i.reflect){const r=(void 0!==i.converter?.toAttribute?i.converter:b).toAttribute(e,i.type);this._$Em=t,null==r?this.removeAttribute(s):this.setAttribute(s,r),this._$Em=null}}_$AK(t,e){const i=this.constructor,s=i._$Eh.get(t);if(void 0!==s&&this._$Em!==s){const t=i.getPropertyOptions(s),r="function"==typeof t.converter?{fromAttribute:t.converter}:void 0!==t.converter?.fromAttribute?t.converter:b;this._$Em=s;const o=r.fromAttribute(e,t.type);this[s]=o??this._$Ej?.get(s)??o,this._$Em=null}}requestUpdate(t,e,i,s=!1,r){if(void 0!==t){const o=this.constructor;if(!1===s&&(r=this[t]),i??=o.getPropertyOptions(t),!((i.hasChanged??$)(r,e)||i.useDefault&&i.reflect&&r===this._$Ej?.get(t)&&!this.hasAttribute(o._$Eu(t,i))))return;this.C(t,e,i)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(t,e,{useDefault:i,reflect:s,wrapped:r},o){i&&!(this._$Ej??=new Map).has(t)&&(this._$Ej.set(t,o??e??this[t]),!0!==r||void 0!==o)||(this._$AL.has(t)||(this.hasUpdated||i||(e=void 0),this._$AL.set(t,e)),!0===s&&this._$Em!==t&&(this._$Eq??=new Set).add(t))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(t){Promise.reject(t)}const t=this.scheduleUpdate();return null!=t&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[t,e]of this._$Ep)this[t]=e;this._$Ep=void 0}const t=this.constructor.elementProperties;if(t.size>0)for(const[e,i]of t){const{wrapped:t}=i,s=this[e];!0!==t||this._$AL.has(e)||void 0===s||this.C(e,void 0,i,s)}}let t=!1;const e=this._$AL;try{t=this.shouldUpdate(e),t?(this.willUpdate(e),this._$EO?.forEach(t=>t.hostUpdate?.()),this.update(e)):this._$EM()}catch(e){throw t=!1,this._$EM(),e}t&&this._$AE(e)}willUpdate(t){}_$AE(t){this._$EO?.forEach(t=>t.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return!0}update(t){this._$Eq&&=this._$Eq.forEach(t=>this._$ET(t,this[t])),this._$EM()}updated(t){}firstUpdated(t){}};A.elementStyles=[],A.shadowRootOptions={mode:"open"},A[_("elementProperties")]=new Map,A[_("finalized")]=new Map,v?.({ReactiveElement:A}),(g.reactiveElementVersions??=[]).push("2.1.2");const x=globalThis,S=t=>t,k=x.trustedTypes,E=k?k.createPolicy("lit-html",{createHTML:t=>t}):void 0,C="$lit$",P=`lit$${Math.random().toFixed(9).slice(2)}$`,M="?"+P,O=`<${M}>`,U=document,N=()=>U.createComment(""),H=t=>null===t||"object"!=typeof t&&"function"!=typeof t,T=Array.isArray,z="[ \t\n\f\r]",R=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,j=/-->/g,I=/>/g,D=RegExp(`>|${z}(?:([^\\s"'>=/]+)(${z}*=${z}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),L=/'/g,q=/"/g,B=/^(?:script|style|textarea|title)$/i,F=t=>(e,...i)=>({_$litType$:t,strings:e,values:i}),W=F(1),V=F(2),G=Symbol.for("lit-noChange"),K=Symbol.for("lit-nothing"),Z=new WeakMap,J=U.createTreeWalker(U,129);function Q(t,e){if(!T(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==E?E.createHTML(e):e}const X=(t,e)=>{const i=t.length-1,s=[];let r,o=2===e?"<svg>":3===e?"<math>":"",n=R;for(let e=0;e<i;e++){const i=t[e];let a,l,c=-1,h=0;for(;h<i.length&&(n.lastIndex=h,l=n.exec(i),null!==l);)h=n.lastIndex,n===R?"!--"===l[1]?n=j:void 0!==l[1]?n=I:void 0!==l[2]?(B.test(l[2])&&(r=RegExp("</"+l[2],"g")),n=D):void 0!==l[3]&&(n=D):n===D?">"===l[0]?(n=r??R,c=-1):void 0===l[1]?c=-2:(c=n.lastIndex-l[2].length,a=l[1],n=void 0===l[3]?D:'"'===l[3]?q:L):n===q||n===L?n=D:n===j||n===I?n=R:(n=D,r=void 0);const p=n===D&&t[e+1].startsWith("/>")?" ":"";o+=n===R?i+O:c>=0?(s.push(a),i.slice(0,c)+C+i.slice(c)+P+p):i+P+(-2===c?e:p)}return[Q(t,o+(t[i]||"<?>")+(2===e?"</svg>":3===e?"</math>":"")),s]};class Y{constructor({strings:t,_$litType$:e},i){let s;this.parts=[];let r=0,o=0;const n=t.length-1,a=this.parts,[l,c]=X(t,e);if(this.el=Y.createElement(l,i),J.currentNode=this.el.content,2===e||3===e){const t=this.el.content.firstChild;t.replaceWith(...t.childNodes)}for(;null!==(s=J.nextNode())&&a.length<n;){if(1===s.nodeType){if(s.hasAttributes())for(const t of s.getAttributeNames())if(t.endsWith(C)){const e=c[o++],i=s.getAttribute(t).split(P),n=/([.?@])?(.*)/.exec(e);a.push({type:1,index:r,name:n[2],strings:i,ctor:"."===n[1]?rt:"?"===n[1]?ot:"@"===n[1]?nt:st}),s.removeAttribute(t)}else t.startsWith(P)&&(a.push({type:6,index:r}),s.removeAttribute(t));if(B.test(s.tagName)){const t=s.textContent.split(P),e=t.length-1;if(e>0){s.textContent=k?k.emptyScript:"";for(let i=0;i<e;i++)s.append(t[i],N()),J.nextNode(),a.push({type:2,index:++r});s.append(t[e],N())}}}else if(8===s.nodeType)if(s.data===M)a.push({type:2,index:r});else{let t=-1;for(;-1!==(t=s.data.indexOf(P,t+1));)a.push({type:7,index:r}),t+=P.length-1}r++}}static createElement(t,e){const i=U.createElement("template");return i.innerHTML=t,i}}function tt(t,e,i=t,s){if(e===G)return e;let r=void 0!==s?i._$Co?.[s]:i._$Cl;const o=H(e)?void 0:e._$litDirective$;return r?.constructor!==o&&(r?._$AO?.(!1),void 0===o?r=void 0:(r=new o(t),r._$AT(t,i,s)),void 0!==s?(i._$Co??=[])[s]=r:i._$Cl=r),void 0!==r&&(e=tt(t,r._$AS(t,e.values),r,s)),e}class et{constructor(t,e){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){const{el:{content:e},parts:i}=this._$AD,s=(t?.creationScope??U).importNode(e,!0);J.currentNode=s;let r=J.nextNode(),o=0,n=0,a=i[0];for(;void 0!==a;){if(o===a.index){let e;2===a.type?e=new it(r,r.nextSibling,this,t):1===a.type?e=new a.ctor(r,a.name,a.strings,this,t):6===a.type&&(e=new at(r,this,t)),this._$AV.push(e),a=i[++n]}o!==a?.index&&(r=J.nextNode(),o++)}return J.currentNode=U,s}p(t){let e=0;for(const i of this._$AV)void 0!==i&&(void 0!==i.strings?(i._$AI(t,i,e),e+=i.strings.length-2):i._$AI(t[e])),e++}}class it{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,e,i,s){this.type=2,this._$AH=K,this._$AN=void 0,this._$AA=t,this._$AB=e,this._$AM=i,this.options=s,this._$Cv=s?.isConnected??!0}get parentNode(){let t=this._$AA.parentNode;const e=this._$AM;return void 0!==e&&11===t?.nodeType&&(t=e.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,e=this){t=tt(this,t,e),H(t)?t===K||null==t||""===t?(this._$AH!==K&&this._$AR(),this._$AH=K):t!==this._$AH&&t!==G&&this._(t):void 0!==t._$litType$?this.$(t):void 0!==t.nodeType?this.T(t):(t=>T(t)||"function"==typeof t?.[Symbol.iterator])(t)?this.k(t):this._(t)}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}_(t){this._$AH!==K&&H(this._$AH)?this._$AA.nextSibling.data=t:this.T(U.createTextNode(t)),this._$AH=t}$(t){const{values:e,_$litType$:i}=t,s="number"==typeof i?this._$AC(t):(void 0===i.el&&(i.el=Y.createElement(Q(i.h,i.h[0]),this.options)),i);if(this._$AH?._$AD===s)this._$AH.p(e);else{const t=new et(s,this),i=t.u(this.options);t.p(e),this.T(i),this._$AH=t}}_$AC(t){let e=Z.get(t.strings);return void 0===e&&Z.set(t.strings,e=new Y(t)),e}k(t){T(this._$AH)||(this._$AH=[],this._$AR());const e=this._$AH;let i,s=0;for(const r of t)s===e.length?e.push(i=new it(this.O(N()),this.O(N()),this,this.options)):i=e[s],i._$AI(r),s++;s<e.length&&(this._$AR(i&&i._$AB.nextSibling,s),e.length=s)}_$AR(t=this._$AA.nextSibling,e){for(this._$AP?.(!1,!0,e);t!==this._$AB;){const e=S(t).nextSibling;S(t).remove(),t=e}}setConnected(t){void 0===this._$AM&&(this._$Cv=t,this._$AP?.(t))}}class st{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,e,i,s,r){this.type=1,this._$AH=K,this._$AN=void 0,this.element=t,this.name=e,this._$AM=s,this.options=r,i.length>2||""!==i[0]||""!==i[1]?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=K}_$AI(t,e=this,i,s){const r=this.strings;let o=!1;if(void 0===r)t=tt(this,t,e,0),o=!H(t)||t!==this._$AH&&t!==G,o&&(this._$AH=t);else{const s=t;let n,a;for(t=r[0],n=0;n<r.length-1;n++)a=tt(this,s[i+n],e,n),a===G&&(a=this._$AH[n]),o||=!H(a)||a!==this._$AH[n],a===K?t=K:t!==K&&(t+=(a??"")+r[n+1]),this._$AH[n]=a}o&&!s&&this.j(t)}j(t){t===K?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}}class rt extends st{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===K?void 0:t}}class ot extends st{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==K)}}class nt extends st{constructor(t,e,i,s,r){super(t,e,i,s,r),this.type=5}_$AI(t,e=this){if((t=tt(this,t,e,0)??K)===G)return;const i=this._$AH,s=t===K&&i!==K||t.capture!==i.capture||t.once!==i.once||t.passive!==i.passive,r=t!==K&&(i===K||s);s&&this.element.removeEventListener(this.name,this,i),r&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t)}}class at{constructor(t,e,i){this.element=t,this.type=6,this._$AN=void 0,this._$AM=e,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(t){tt(this,t)}}const lt=x.litHtmlPolyfillSupport;lt?.(Y,it),(x.litHtmlVersions??=[]).push("3.3.3");const ct=globalThis;class ht extends A{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){const e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=((t,e,i)=>{const s=i?.renderBefore??e;let r=s._$litPart$;if(void 0===r){const t=i?.renderBefore??null;s._$litPart$=r=new it(e.insertBefore(N(),t),t,void 0,i??{})}return r._$AI(t),r})(e,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return G}}ht._$litElement$=!0,ht.finalized=!0,ct.litElementHydrateSupport?.({LitElement:ht});const pt=ct.litElementPolyfillSupport;pt?.({LitElement:ht}),(ct.litElementVersions??=[]).push("4.2.2");const dt={attribute:!0,type:String,converter:b,reflect:!1,hasChanged:$},ut=(t=dt,e,i)=>{const{kind:s,metadata:r}=i;let o=globalThis.litPropertyMetadata.get(r);if(void 0===o&&globalThis.litPropertyMetadata.set(r,o=new Map),"setter"===s&&((t=Object.create(t)).wrapped=!0),o.set(i.name,t),"accessor"===s){const{name:s}=i;return{set(i){const r=e.get.call(this);e.set.call(this,i),this.requestUpdate(s,r,t,!0,i)},init(e){return void 0!==e&&this.C(s,void 0,t,e),e}}}if("setter"===s){const{name:s}=i;return function(i){const r=this[s];e.call(this,i),this.requestUpdate(s,r,t,!0,i)}}throw Error("Unsupported decorator location: "+s)};function mt(t){return(e,i)=>"object"==typeof i?ut(t,e,i):((t,e,i)=>{const s=e.hasOwnProperty(i);return e.constructor.createProperty(i,t),s?Object.getOwnPropertyDescriptor(e,i):void 0})(t,e,i)}function gt(t){return mt({...t,state:!0,attribute:!1})}const ft="material-plant-card",yt="Material Plant Card",vt=["moisture","conductivity","temperature","illuminance","humidity","dli","dli_24h","co2","soil_temperature","vpd"],_t=["moisture","conductivity","temperature","illuminance","humidity","dli"],bt={moisture:"Moisture",conductivity:"Conductivity",temperature:"Temperature",illuminance:"Illuminance",humidity:"Air humidity",dli:"DLI",dli_24h:"DLI (24h)",co2:"CO₂",soil_temperature:"Soil temperature",vpd:"VPD"},$t={moisture:"mdi:water",conductivity:"mdi:spa-outline",temperature:"mdi:thermometer",illuminance:"mdi:brightness-6",humidity:"mdi:water-percent",dli:"mdi:counter",dli_24h:"mdi:counter",co2:"mdi:molecule-co2",soil_temperature:"mdi:thermometer-probe",vpd:"mdi:water-thermometer-outline"};function wt(t){if(Object.prototype.hasOwnProperty.call(bt,t))return bt[t];const e=t.replace(/_/g," ");return e.charAt(0).toUpperCase()+e.slice(1)}function At(t){if("number"!=typeof t&&"string"!=typeof t)return null;if("string"==typeof t&&""===t.trim())return null;const e=Number(t);return Number.isFinite(e)?e:null}function xt(t,e,i){return null===t||null===e||null===i||e>=i?"unknown":t<e?"low":t>i?"high":"ok"}function St(t,e,i,s){if(null===t||null===e||null===i||e>=i)return null;let r=(t-e)/(i-e);return"lx"===s&&e>0&&(r=t<=0?-1/0:(Math.log(t)-Math.log(e))/(Math.log(i)-Math.log(e))),Math.max(0,Math.min(1,.2+.6*r))}function kt(t,e){const[i,s="0"]=String(Math.abs(t)).split("e"),r=Number(`${i}e${Number(s)+e}`);return Math.sign(t)*Math.round(r)/10**e}function Et(t){const e=t.unit?` ${t.unit}`:"",i=null===t.value?"—":String(t.value),s=null===t.min||null===t.max?"":` (${String(t.min)}–${String(t.max)}${e})`,r="low"===t.status||"high"===t.status?` · ${t.status}`:"";return`${t.label}: ${i}${e}${s}${r}`.replace(/ {2,}/g," ")}const Ct=()=>vt.map(t=>({value:t,label:bt[t]})),Pt=t=>({name:t,selector:{number:{min:0,max:100,step:1,mode:"box",unit_of_measurement:"%"}}}),Mt={entity:"Plant entity",name:"Name",battery_sensor:"Battery sensor",display_type:"Display type",show_bars:"Gauges",hide_units:"Hide units",problem_source:"Problem source",problem_sensors:"Problem sensors",hide_species:"Hide species",hide_image:"Hide image",image:"Image",battery_warn_level:"Battery warning below",battery_ok_level:"Battery OK from"},Ot={show_bars:`Default: ${_t.map(t=>bt[t]).join(", ")}.`,problem_source:"Plant monitor follows the integration's problem triggers; Gauges flags any out-of-range value.",problem_sensors:"Leave empty to allow every sensor.",image:"Overrides the plant picture."},Ut={schema:[{name:"entity",required:!0,selector:{entity:{domain:"plant"}}},{name:"name",selector:{text:{}}},{name:"battery_sensor",selector:{entity:{domain:"sensor",device_class:"battery"}}},{name:"display_type",selector:{select:{mode:"dropdown",options:[{value:"full",label:"Full"},{value:"compact",label:"Compact"}]}}},{type:"expandable",name:"",title:"Gauges",icon:"mdi:gauge",flatten:!0,schema:[{name:"show_bars",selector:{select:{multiple:!0,reorder:!0,mode:"list",options:Ct()}}},{name:"hide_units",selector:{boolean:{}}}]},{type:"expandable",name:"",title:"Problems",icon:"mdi:alert-circle-outline",flatten:!0,schema:[{name:"problem_source",selector:{select:{mode:"dropdown",options:[{value:"plant",label:"Plant monitor (integration problem triggers)"},{value:"gauges",label:"Gauges (any out-of-range value)"}]}}},{name:"problem_sensors",selector:{select:{multiple:!0,mode:"list",options:Ct()}}}]},{type:"expandable",name:"",title:"Appearance",icon:"mdi:palette-outline",flatten:!0,schema:[{name:"hide_species",selector:{boolean:{}}},{name:"hide_image",selector:{boolean:{}}},{name:"image",selector:{text:{}}},{type:"grid",name:"",schema:[Pt("battery_warn_level"),Pt("battery_ok_level")]}]}],computeLabel:t=>Object.prototype.hasOwnProperty.call(Mt,t.name)?Mt[t.name]:void 0,computeHelper:t=>Object.prototype.hasOwnProperty.call(Ot,t.name)?Ot[t.name]:void 0,assertConfig:t=>{if(null!=t.entity&&("string"!=typeof t.entity||!t.entity.startsWith("plant.")))throw new Error("Specify a plant entity")}},Nt=a`
  :host {
    --mpl-primary: var(--md-sys-color-primary, var(--primary-color, #6750a4));
    --mpl-on-primary: var(--md-sys-color-on-primary, #ffffff);
    --mpl-primary-container: var(--md-sys-color-primary-container, rgba(103, 80, 164, 0.16));
    --mpl-on-primary-container: var(--md-sys-color-on-primary-container, var(--primary-text-color, #21005d));
    --mpl-secondary-container: var(--md-sys-color-secondary-container, rgba(103, 80, 164, 0.14));
    --mpl-on-secondary-container: var(--md-sys-color-on-secondary-container, var(--primary-text-color, #1d192b));
    --mpl-tertiary: var(--md-sys-color-tertiary, #7d5260);
    --mpl-error: var(--md-sys-color-error, var(--error-color, #b3261e));
    --mpl-error-container: var(--md-sys-color-error-container, #f9dedc);
    --mpl-on-error-container: var(--md-sys-color-on-error-container, #410e0b);
    --mpl-surface: var(--md-sys-color-surface, var(--card-background-color, #fef7ff));
    --mpl-surface-bg: var(--ha-card-background, var(--card-background-color, #f3edf7));
    --mpl-surface-container: var(--md-sys-color-surface-container, color-mix(in srgb, var(--mpl-on-surface) 8%, var(--mpl-surface-bg)));
    --mpl-surface-container-high: var(--md-sys-color-surface-container-high, color-mix(in srgb, var(--mpl-on-surface) 11%, var(--mpl-surface-bg)));
    --mpl-surface-container-highest: var(--md-sys-color-surface-container-highest, color-mix(in srgb, var(--mpl-on-surface) 14%, var(--mpl-surface-bg)));
    --mpl-on-surface: var(--md-sys-color-on-surface, var(--primary-text-color, #1c1b1f));
    --mpl-on-surface-variant: var(--md-sys-color-on-surface-variant, var(--secondary-text-color, #49454f));
    --mpl-outline: var(--md-sys-color-outline, var(--divider-color, #79747e));
    --mpl-outline-variant: var(--md-sys-color-outline-variant, var(--divider-color, #cac4d0));
    --mpl-shape-card: var(--md-sys-shape-corner-extra-large, 28px);
    --mpl-shape-full: var(--md-sys-shape-corner-full, 9999px);
  }
`,Ht=24;function Tt(t,e,i,s){const r=s*Math.PI/180;return{x:t+i*Math.cos(r),y:e+i*Math.sin(r)}}function zt(t,e,i,s,r){const o=Tt(t,e,i,s),n=Tt(t,e,i,r),a=r-s>180?1:0;return`M ${o.x} ${o.y} A ${i} ${i} 0 ${a} 1 ${n.x} ${n.y}`}class Rt extends ht{constructor(){super(...arguments),this.fraction=null,this.tone="unknown",this.icon="",this.value="",this.label="",this.embedded=!1}render(){const t=this.fraction,e=null!==t&&"unknown"!==this.tone,i=135+270*(t??0),s=Tt(Ht,Ht,20,i),r=zt(Ht,Ht,20,135,i);return W`
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
            ${V`
              <path class="track-low" d=${zt(Ht,Ht,20,135,185)}></path>
              <path class="track-ok" d=${zt(Ht,Ht,20,193,347)}></path>
              <path class="track-high" d=${zt(Ht,Ht,20,355,405)}></path>
              ${e&&0!==t?V`
                <path class="active" d=${r} style=${`d: path('${r}')`}></path>
              `:K}
              ${e?V`
                <circle class="dot" cx=${s.x} cy=${s.y} r="3.5"
                  style=${`cx: ${s.x}px; cy: ${s.y}px;`}></circle>
              `:K}
            `}
          </svg>
          <ha-icon icon=${this.icon} aria-hidden="true"></ha-icon>
        </div>
        ${""!==this.value?W`<div class="value">${this.value}</div>`:K}
      </div>
    `}}Rt.styles=[Nt,a`
      :host {
        --mpl-gauge-size: 44px;
        --mpl-gauge-icon-size: 18px;
        --mpl-gauge-value-size: 12px;
        --mpl-gauge-value-line: 16px;
        --mpl-gauge-track-width: 4;
        --mpl-gauge-outer-track-width: 2;
        --mpl-gauge-dot-stroke: 2;
        --mpl-gauge-tone: var(--mpl-primary);
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
        --mpl-gauge-tone: var(--mpl-tertiary);
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
      .track-high {
        stroke-width: var(--mpl-gauge-outer-track-width);
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
        width: var(--mpl-gauge-icon-size);
        height: var(--mpl-gauge-icon-size);
        color: var(--mpl-on-surface-variant);
      }
      .value {
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
      @media (prefers-reduced-motion: reduce) {
        .active,
        .dot {
          transition: none;
        }
      }
    `],t([mt({type:Number})],Rt.prototype,"fraction",void 0),t([mt({reflect:!0})],Rt.prototype,"tone",void 0),t([mt()],Rt.prototype,"icon",void 0),t([mt()],Rt.prototype,"value",void 0),t([mt()],Rt.prototype,"label",void 0),t([mt({type:Boolean,attribute:"embedded"})],Rt.prototype,"embedded",void 0),customElements.get("mpl-gauge")||customElements.define("mpl-gauge",Rt);const jt=(()=>{const t=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M${Array.from({length:180},(t,e)=>{const i=2*e*Math.PI/180,s=50*(.94+.06*Math.cos(9*i));return`${(50+s*Math.cos(i)).toFixed(3)},${(50+s*Math.sin(i)).toFixed(3)}`}).join(" L")} Z" fill="white"/></svg>`;return`url("data:image/svg+xml,${encodeURIComponent(t)}")`})();class It extends ht{constructor(){super(...arguments),this._lastFetch=-1/0,this._request=0,this._pending=!1}get hass(){return this._hass}set hass(t){const e=this._hass;this._hass=t,this.requestUpdate("hass",e);const i=this._config?.entity;!i||!t||e&&e.states[i]?.last_updated===t.states[i]?.last_updated||this._queueFetch()}setConfig(t){if(!t||"string"!=typeof t.entity||!t.entity.startsWith("plant."))throw new Error("Specify a plant entity");const e=this._config?.entity!==t.entity;this._config={...t,show_bars:t.show_bars?[...t.show_bars]:void 0},e&&(this._info=void 0,this._request++,this._queueFetch())}getCardSize(){return"compact"===this._config?.display_type?3:4}getGridOptions(){return{columns:6,min_columns:4,rows:"auto"}}static getConfigForm(){return Ut}static getStubConfig(t){return{type:`custom:${ft}`,entity:Object.keys(t.states).find(t=>t.startsWith("plant."))??"plant.my_plant",show_bars:[..._t]}}_queueFetch(){if(this._request++,this._pending=!0,!this.isConnected||!this.hass||!this._config)return;const t=Math.max(0,5e3-(Date.now()-this._lastFetch));0===t?(void 0!==this._timer&&clearTimeout(this._timer),this._timer=void 0,this._fetchInfo()):void 0===this._timer&&(this._timer=setTimeout(()=>{this._timer=void 0,this._fetchInfo()},t))}async _fetchInfo(){const t=this.hass,e=this._config?.entity;if(!this.isConnected||!t||!e)return;this._pending=!1,this._lastFetch=Date.now();const i=++this._request;this._inFlight=i;try{const s=await t.callWS({type:"plant/get_info",entity_id:e});i===this._request&&e===this._config?.entity&&s?.result&&(this._info=s.result)}catch{}finally{this._inFlight===i&&(this._inFlight=void 0)}}connectedCallback(){super.connectedCallback(),this._pending&&this._queueFetch()}disconnectedCallback(){super.disconnectedCallback(),void 0!==this._timer&&clearTimeout(this._timer),this._timer=void 0,this._pending||=void 0!==this._inFlight,this._inFlight=void 0,this._request++}shouldUpdate(t){if(t.has("_config")||t.has("_info")||t.has("_failedSrc"))return!0;if(!this._config||!this.hass||!t.has("hass"))return!1;const e=t.get("hass");if(!e)return!0;const i=new Set([this._config.entity]);this._config.battery_sensor&&i.add(this._config.battery_sensor);for(const t of this._config.show_bars??_t){const e=this._info?.[t]?.sensor;e&&i.add(e)}return[...i].some(t=>e.states[t]!==this.hass.states[t])}_moreInfo(t){this.dispatchEvent(new CustomEvent("hass-more-info",{detail:{entityId:t},bubbles:!0,composed:!0}))}render(){if(!this._config||!this.hass)return K;const t=this._config,e=this.hass.states[t.entity];if(!e)return W`<ha-card><div class="warning">Entity not available: ${t.entity}</div></ha-card>`;const i="compact"===t.display_type,s=t.hide_units??i,r=function(t,e,i){const s=[];for(const r of new Set(e)){if(!t||!Object.prototype.hasOwnProperty.call(t,r))continue;const e=t[r];if(!e)continue;const o=e.sensor||void 0,n=o?i[o]:void 0;if(o&&!n)continue;const a=At(n?n.state:e.current),l=At(e.min),c=At(e.max),h=String(n?.attributes.unit_of_measurement??e.unit_of_measurement??""),p=Object.prototype.hasOwnProperty.call($t,r)?$t[r]:"mdi:help-circle-outline",d="string"==typeof e.icon&&e.icon.length>0?e.icon:p;s.push({key:r,label:wt(r),sensor:o,icon:d,unit:h,value:a,min:l,max:c,status:xt(a,l,c),fraction:St(a,l,c,h)})}return s}(this._info,t.show_bars??_t,this.hass.states),o=r.length,n=o<=6?o:Math.ceil(o/Math.ceil(o/6)),a=function(t,e,i){const s=Array.isArray(i.problem_sensors)&&i.problem_sensors.length>0?new Set(i.problem_sensors):void 0,r=[],o=new Set;if("gauges"===i.problem_source)for(const t of e)"low"!==t.status&&"high"!==t.status||s&&!s.has(t.key)||o.has(t.key)||(r.push({key:t.key,label:t.label,status:t.status}),o.add(t.key));else{const e=t?.attributes.problems;if(Array.isArray(e))for(const t of e){if(!t||"object"!=typeof t)continue;const{sensor_type:e,status:i}=t;if("string"!=typeof e||s&&!s.has(e)||o.has(e))continue;const n="string"==typeof i?i:"";r.push({key:e,label:wt(e),status:/low/i.test(n)?"low":/high/i.test(n)?"high":"problem"}),o.add(e)}else"problem"===t?.state&&r.push({key:"plant",label:"Needs attention",status:"problem"})}return r}(e,r,t),l=t.name||e.attributes.friendly_name||t.entity,c=a.length?a.map(t=>"problem"===t.status?t.label:`${t.label} ${t.status}`).join(" · "):i||t.hide_species?void 0:e.attributes.species,h=t.image??e.attributes.entity_picture,p="string"==typeof h&&h?h:void 0;p!==this._imageSrc&&(this._imageSrc=p,this._failedSrc=void 0);const d=t.battery_sensor?this.hass.states[t.battery_sensor]:void 0,u=function(t,e=20,i=40){const s=At(t?.state),r=null===s?null:Math.max(0,Math.min(100,Math.round(s)));return{level:r,icon:null===r?"mdi:battery-unknown":r>=95?"mdi:battery":r<=5?"mdi:battery-outline":"mdi:battery-"+10*Math.round(r/10),tone:null===r?"unknown":r>=i?"ok":r>=e?"warn":"low"}}(d,t.battery_warn_level,t.battery_ok_level);return W`
      <ha-card class=${i?"compact":"full"}>
        <div class=${"header "+(t.hide_image?"no-image":"")}>
          ${t.hide_image?K:W`
            <button class="image-btn" type="button" aria-label=${`More information about ${l}`} @click=${()=>this._moreInfo(t.entity)}>
              ${p&&p!==this._failedSrc?W`<img class="photo" src=${p} alt="" @error=${()=>{this._failedSrc=p}}>`:W`<span class="photo placeholder"><ha-icon icon="mdi:flower-outline" aria-hidden="true"></ha-icon></span>`}
              ${a.length?W`<span class="problem-badge" aria-label="Needs attention"><ha-icon icon="mdi:alert-circle" aria-hidden="true"></ha-icon></span>`:K}
            </button>`}
          <button class="text-btn" type="button" aria-label=${`More information about ${l}`} @click=${()=>this._moreInfo(t.entity)}>
            <span class="name" title=${l}>${l}</span>
            ${c?W`<span class=${"subtitle "+(a.length?"problems":"")} title=${c}>${c}</span>`:K}
          </button>
          ${d?W`
            <button class="battery" type="button" data-tone=${u.tone} aria-label=${`Battery: ${null===u.level?"unknown":`${u.level}%`}. More information`}
              @click=${e=>{e.stopPropagation(),this._moreInfo(t.battery_sensor)}}>
              <ha-icon icon=${u.icon} aria-hidden="true"></ha-icon><span>${null===u.level?"—":`${u.level}%`}</span>
            </button>`:K}
        </div>
        ${r.length?W`<div class="gauges" style=${`--mpl-cols: ${n}`}>${r.map(e=>W`
          <button class="gauge-btn" type="button" title=${Et(e)} aria-label=${Et(e)} @click=${()=>this._moreInfo(e.sensor??t.entity)}>
            <mpl-gauge .embedded=${!0} .fraction=${e.fraction} .tone=${function(t,e){return"unknown"===t.status?"unknown":"ok"===t.status?"ok":e.some(e=>e.key===t.key)?"problem":"advisory"}(e,a)} .icon=${e.icon}
              .value=${s?"":function(t,e,i=!1){if(null===t)return"—";const s=Math.abs(t);let r;return r=s>=1e4?`${kt(t/1e3,0)}k`:s>=1e3?`${kt(t/1e3,1)}k`:String(kt(t,s>=100?0:s>=10?1:2)),r+(i?"":"%"===e?"%":["°C","°F","°"].includes(e)?"°":"")}(e.value,e.unit,s)} .label=${Et(e)}></mpl-gauge>
          </button>`)}</div>`:K}
      </ha-card>`}}It.styles=[Nt,a`
    :host { display: block; }
    ha-card { display: block; box-sizing: border-box; padding: 16px; background: var(--mpl-surface-bg); color: var(--mpl-on-surface); border-radius: var(--ha-card-border-radius, var(--mpl-shape-card)); }
    .header { display: grid; grid-template-columns: auto minmax(0, 1fr) auto; gap: 12px; align-items: center; }
    .header.no-image { grid-template-columns: minmax(0, 1fr) auto; }
    button { appearance: none; border: 0; margin: 0; padding: 0; background: none; color: inherit; font: inherit; cursor: pointer; }
    button:focus-visible { outline: 2px solid var(--mpl-primary); outline-offset: 2px; }
    .image-btn { position: relative; width: 56px; height: 56px; border-radius: var(--mpl-shape-full); }
    .photo { display: block; width: 100%; height: 100%; object-fit: cover; mask-image: ${n(jt)}; -webkit-mask-image: ${n(jt)}; mask-size: 100% 100%; -webkit-mask-size: 100% 100%; }
    .placeholder { display: grid; place-items: center; background: var(--mpl-secondary-container); color: var(--mpl-on-secondary-container); }
    .problem-badge { position: absolute; bottom: 0; right: 0; display: grid; place-items: center; width: 20px; height: 20px; border-radius: var(--mpl-shape-full); background: var(--mpl-error-container); color: var(--mpl-on-error-container); }
    .problem-badge ha-icon { --mdc-icon-size: 16px; }
    .text-btn { min-width: 0; min-height: 44px; text-align: left; border-radius: 12px; }
    .name, .subtitle { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .name { font-size: 16px; font-weight: 500; line-height: 24px; color: var(--mpl-on-surface); }
    .subtitle { font-size: 14px; line-height: 20px; color: var(--mpl-on-surface-variant); }
    .problems { color: var(--mpl-error); }
    .battery { position: relative; display: inline-flex; gap: 4px; align-items: center; height: 28px; padding: 0 10px; border-radius: var(--mpl-shape-full); background: var(--mpl-surface-container-high); font-size: 12px; font-weight: 500; color: var(--mpl-on-surface-variant); white-space: nowrap; }
    /* Preserve the specified 28px visual chip and give it a 44px touch target. */
    .battery::before { content: ''; position: absolute; inset: -8px 0; }
    .battery ha-icon { --mdc-icon-size: 18px; }
    .battery[data-tone='warn'] { color: var(--mpl-tertiary); }
    .battery[data-tone='low'] { color: var(--mpl-error); }
    .battery[data-tone='unknown'] { color: var(--mpl-outline); }
    .gauges { display: grid; grid-template-columns: repeat(auto-fit, minmax(max(44px, calc(100% / var(--mpl-cols, 6) - 4px)), 1fr)); gap: 4px; margin-top: 12px; }
    .gauge-btn { display: grid; justify-items: center; min-width: 0; min-height: 44px; border-radius: 12px; }
    .gauge-btn:hover, .text-btn:hover { background: color-mix(in srgb, var(--mpl-on-surface) 8%, transparent); }
    .gauge-btn:active, .text-btn:active { background: color-mix(in srgb, var(--mpl-on-surface) 12%, transparent); }
    .compact .image-btn { width: 40px; height: 40px; }
    .compact .gauges { margin-top: 8px; }
    .warning { color: var(--mpl-error); }
  `],t([mt({attribute:!1,noAccessor:!0})],It.prototype,"hass",null),t([gt()],It.prototype,"_config",void 0),t([gt()],It.prototype,"_info",void 0),t([gt()],It.prototype,"_failedSrc",void 0),customElements.get(ft)||customElements.define(ft,It);const Dt=window;Dt.customCards??=[],Dt.customCards.some(t=>t.type===ft)||Dt.customCards.push({type:ft,name:yt,description:"A Material 3 Expressive plant card with circular range gauges, problem states and a battery indicator.",preview:!0,documentationURL:"https://github.com/lageorgem/ha-material-plant-card"}),console.info(`${yt} v0.1.0`);export{It as MaterialPlantCard};
