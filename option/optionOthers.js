( () => {
	const API_LANGUAGE_DOWNLOAD = "downloading";
	let othersNode = document.querySelector("#others");
	let sampleLinkListNode = othersNode.querySelector("#"+CSS_PREFIX+"-viewer");
	let linkListStyleNodeList = othersNode.querySelectorAll(".linkListStyle");
	let linkListActionNodeList = othersNode.querySelectorAll(".linkListAction");
	let apiServiceCodeNode = othersNode.querySelector(".linkListApiService");
	let linkListApiLangNode = othersNode.querySelector(".linkListApiLang");
	let apiCutOutNode = othersNode.querySelector(".apiCutOut");
	let apiLangPaneNode = document.querySelector("#apiLangPane");
	let apiLanguageContainerNode = apiLangPaneNode.querySelector("#apiLanguageContainer");
	let apiLangPrefixSelectNode = apiLangPaneNode.querySelector(".apiLangPrefixSelect");
	let apiLanguageCache = {};
	let apiPrefixCache = {};

	Promise.resolve().then(initOthers).then(initStyle).then(initDownloadApiLanguage).catch(unexpectedError);

	function initOthers(){
		initI18n();
		initNode();
		initListener();
	}

	function initI18n(){
		let list = [
			{ "selector": ".linkListStyle", "property": "innerText", "key": "htmlLinkListStyle" },
			{ "selector": ".linkListStyleClassic", "property": "innerText", "key": "htmlLinkListStyleClassic" },
			{ "selector": ".linkListStyleDark", "property": "innerText", "key": "htmlLinkListStyleDark" },
			{ "selector": ".linkListAction", "property": "innerText", "key": "htmlLinkListAction" },
			{ "selector": ".linkListActionNormal", "property": "innerText", "key": "htmlLinkListActionNormal" },
			{ "selector": ".linkListActionMouseover", "property": "innerText", "key": "htmlLinkListActionMouseover" },
			{ "selector": ".linkListActionMouseclick", "property": "innerText", "key": "htmlLinkListActionMouseclick" },
			{ "selector": "."+CSS_PREFIX+"-zoomDown", "property": "title", "key": "htmlZoomDown" },
			{ "selector": "."+CSS_PREFIX+"-zoomUp", "property": "title", "key": "htmlZoomUp" },
			{ "selector": "."+CSS_PREFIX+"-copy", "property": "title", "key": "htmlCopy" },
			{ "selector": "."+CSS_PREFIX+"-resize", "property": "title", "key": "htmlResize" },
			{ "selector": "."+CSS_PREFIX+"-option", "property": "title", "key": "htmlOption" }
		];
		setI18n(list);
	}

	function initNode(){
		for(let i=0; i<linkListStyleNodeList.length; i++) {
			let node = linkListStyleNodeList[i];
			node.addEventListener("click", linkListStyleBehavior);
		}
		for(let i=0; i<linkListActionNodeList.length; i++) {
			let node = linkListActionNodeList[i];
			node.addEventListener("click", linkListActionBehavior);
		}
	}

	function initStyle(){
		let lang = getUiLang();
		if( !API_SERVICE.hasOwnProperty(lang) ) lang = DEFAULT_LOCALE;
		let getter = ponyfill.storage.sync.get({
			"cl": LINK_LIST_STYLE_CLASSIC,
			"ca": LINK_LIST_ACTION_MOUSECLICK,
			"s": lang,
			"co": true
		});
		function onGot(res){
			setLinkListStyle(res["cl"]);
			setLinkListAction(res["ca"]);
			setServiceCode(res["s"]);
			setApiCutOut(res["co"]);
		}
		return getter.then(onGot);
	}

	function initListener(){
		ponyfill.storage.onChanged.addListener(fileChangeBehavior);
		apiServiceCodeNode.addEventListener("change", apiServiceBehavior);
		linkListApiLangNode.addEventListener("focus", apiLanguageBehavior);
		apiCutOutNode.addEventListener("change", apiCutOutBehavior);
		apiLangPaneNode.addEventListener("click", apiLangPaneBehavior);
		apiLangPrefixSelectNode.addEventListener("change", apiLangPrefixSelectBehavior);
	}

	function fileChangeBehavior(e){
		if( !e.hasOwnProperty("w")) return;
		if( e["w"]["newValue"] == windowId ) return;
		if( e.hasOwnProperty("cl") ) setLinkListStyle(e["cl"]["newValue"]);
		else if( e.hasOwnProperty("ca") ) setLinkListAction(e["ca"]["newValue"]);
		else if( e.hasOwnProperty("s") ) setServiceCode(e["s"]["newValue"]);
		else if( e.hasOwnProperty("co") ) setApiCutOut(e["co"]["newValue"]);
	}

	function setLinkListStyle(value){
		let node = othersNode.querySelector(".linkListStyle[value=\""+value+"\"]");
		node.checked = true;
		setSampleLinkListStyle(value);
	}

	function setLinkListAction(value){
		let node = othersNode.querySelector(".linkListAction[value=\""+value+"\"]");
		node.checked = true;
		setSampleLinkListAction(value);
	}

	function setServiceCode(value){
		apiServiceCodeNode.value = value;
	}

	function getServiceCode(){
		return apiServiceCodeNode.value;
	}

	function getApiService(){
		let code = getServiceCode();
		if( !API_SERVICE.hasOwnProperty(code) ) return null;
		return API_SERVICE[code];
	}

	function hasLanguageCache(service=getApiService()){
		if( service == null ) return null;
		return apiLanguageCache.hasOwnProperty( service );
	}

	function getLanguageCache(service=getApiService()){
		if( service == null ) return null;
		if( hasLanguageCache(service) == null) return null;
		return apiLanguageCache[service];
	}

	function setLanguageCache(service=getApiService(), list){
		apiLanguageCache[service] = list;
	}

	function isDownloadingLangage(service=getApiService()){
		if( service == null ) return false;
		if( hasLanguageCache(service) == null) return false;
		return apiLanguageCache[service]==API_LANGUAGE_DOWNLOAD;
	}

	function setPrefixCache(service=getApiService(), hash){
		apiPrefixCache[service] = hash;
	}

	function getPrefixCache(service=getApiService()){
		if( !apiPrefixCache.hasOwnProperty(service) ) return null;
		return apiPrefixCache[service];
	}

	function setApiCutOut(value){
		apiCutOutNode.checked = value;
	}

	function getApiCutOut(){
		return apiCutOutNode.checked;
	}

	function linkListStyleBehavior(e){
		let value = e.target.value;
		setSampleLinkListStyle(value);
		savelinkListStyle(value);
	}

	function linkListActionBehavior(e){
		let value = e.target.value;
		setSampleLinkListAction(value);
		savelinkListAction(value);
	}

	function setSampleLinkListStyle(value){
		sampleLinkListNode.classList.remove(CSS_PREFIX+"-dark");
		if( value == LINK_LIST_STYLE_DARK ) sampleLinkListNode.classList.add(CSS_PREFIX+"-dark");
	}

	function setSampleLinkListAction(value){
		sampleLinkListNode.classList.remove(CSS_PREFIX+"-mouseover");
		sampleLinkListNode.classList.remove(CSS_PREFIX+"-mouseclick");
		removeStopper();
		sampleLinkListNode.removeEventListener("click",removeStopper);
		sampleLinkListNode.removeEventListener("mouseenter", removeStopper);
		sampleLinkListNode.removeEventListener("mouseleave", addStopper);
		if( value == LINK_LIST_ACTION_MOUSEOVER ){
			sampleLinkListNode.classList.add(CSS_PREFIX+"-mouseover");
			addStopper();
			sampleLinkListNode.addEventListener("mouseenter", removeStopper);
			sampleLinkListNode.addEventListener("mouseleave", addStopper);
		}
		else if( value == LINK_LIST_ACTION_MOUSECLICK ){
			sampleLinkListNode.classList.add(CSS_PREFIX+"-mouseclick");
			addStopper();
			sampleLinkListNode.addEventListener("click",removeStopper);
		}
	}

	function addStopper(e){
		sampleLinkListNode.classList.add(CSS_PREFIX+"-stopper");
	}

	function removeStopper(e){
		sampleLinkListNode.classList.remove(CSS_PREFIX+"-stopper");
	}

	function savelinkListStyle(value){
		let data = { "cl": value };
		return saveW(data).catch(onSaveError);
	}

	function savelinkListAction(value){
		let data = { "ca": value };
		return saveW(data).catch(onSaveError);
	}

	function initDownloadApiLanguage() {
		let service = getApiService();
		if( hasLanguageCache(service) != false ) return;
		downloadApiLanguage(service); // Async
		return;
	}

	function apiServiceBehavior(e){
		let serviceCode = e.target.value;
		setServiceCode(serviceCode);
		linkListApiLangNode.value="";
		savelinkListApiService(serviceCode); // Async
		if(hasLanguageCache()!=false) return;
		downloadApiLanguage(getApiService()); // Async
		return;
	}

	function savelinkListApiService(value){
		let data = {
			"s": value,
			"sl": ""
		};
		return saveW(data).catch(onSaveError);
	}

	function downloadApiLanguage(service){
		console.log("service="+service);
		let p = Promise.resolve();
		let obj = { "service": service };
		apiLanguageCache[service] = API_LANGUAGE_DOWNLOAD;
		return p.then(
			prepareAjaxApiLang.bind(obj)
		).then(
			requestAjaxApiLang.bind(obj)
		).then(
			responseAjaxApiLang.bind(obj)
		).then(
			convertResponse.bind(obj)
		).catch(
			downloadApiLanguageError.bind(obj)
		);
	}

	function downloadApiLanguageError(e){
		console.error(e);
		apiLanguageCache[this.service] = undefined;
		return notice("faild download languages."); //TODO kono error ha user ni oshieru
	}

	function prepareAjaxApiLang(){
		let param = [
			{
				"key": "action",
				"value": "query"
			},{
				"key"  :"format",
				"value":"json"
			},{
				"key": "list",
				"value": "categorymembers"
			},{
				"key": "cmprop",
				"value": "title|sortkeyprefix"
			},{
				"key": "cmtitle",
				"value": API_SERVICE_PROPERTY[this.service].langCat,
			},{
				"key": "cmtype",
				"value": "subcat"
			},{
				"key": "cmlimit",
				"value": "500"
			}
		];
		this.param = param;
		this.url = [];
		this.cat = [];
	}

	function requestAjaxApiLang(){
		this.url.push( makeApiURL(this.service+API_SERVICE_PROPERTY[this.service].path, this.param, "") );
		return promiseAjax("GET", this.url[this.url.length-1], "json", API_HEADER);
	}

	function responseAjaxApiLang(e){
		this.status = e.target.status;
		if( this.status == "200" ){
			let res = e.target.response;
			if (res.hasOwnProperty("error")){
				return Promise.reject(res.error);
			}
			this.cat = this.cat.concat(res.query.categorymembers);
			if( !res.hasOwnProperty("continue")) {
				apiLanguageCache[this.service] = this.cat;
				return Promise.resolve(this.cat);
			}
			let keys = Object.keys(res.continue);
			this.param = this.param.filter( obj => !keys.includes(obj.key) );
			for( let i=0; i<keys.length; i++){
				let key = keys[i];
				this.param.push({
					"key": key,
					"value": res.continue[key]
				});
			}
			let p = Promise.resolve().then(
				requestAjaxApiLang.bind(this)
			).then(
				responseAjaxApiLang.bind(this)
			);
			return p;
		}
		return Promise.reject(e.target);
	}

	function convertResponse(list){
		let removeList = [];
		let prefix = {};
		let namespace = API_SERVICE_PROPERTY[this.service].namespace;
		let namespaceRegex = new RegExp("^" + namespace + ":");
		let followed = API_SERVICE_PROPERTY[this.service].followed;
		let followedRegex = new RegExp(followed + "$", "i");
		let obj;
		for(let i=0; i<list.length; i++){
			obj = list[i];
			obj.title = obj.title.replace( namespaceRegex, "");
			obj.shortPrefix = obj.sortkeyprefix;
			if(obj.shortPrefix.length <= 0) obj.shortPrefix = obj.title;
			obj.shortPrefix = obj.shortPrefix.substr(0,1);
			if(obj.shortPrefix==" "||obj.shortPrefix=="*"|| (followed && !obj.title.match(followedRegex) ) ) {
				list.splice(i,1);
				i--;
				continue;
			}
			if( prefix.hasOwnProperty(obj.shortPrefix)){
				prefix[obj.shortPrefix]++;
			}
			else {
				prefix[obj.shortPrefix] = 1;
			}
		}
		setLanguageCache(this.service, list);
		setPrefixCache(this.service, prefix);
	}

	function apiLangMakeOption(prefix){
		while(apiLangPrefixSelectNode.firstChild !==　apiLangPrefixSelectNode.lastChild){
			apiLangPrefixSelectNode.removeChild(apiLangPrefixSelectNode.lastChild);
		}
		let prefixList = Object.keys(prefix);
		for(let i=0; i<prefixList.length; i++){
			let option = document.createElement("option");
			option.value = prefixList[i];
			option.innerText = prefixList[i] + " ("+prefix[prefixList[i]]+")";
			apiLangPrefixSelectNode.appendChild(option);
		}
	}

	function apiLangMakeRadio(service, prefixCode){
		while(apiLanguageContainerNode.lastChild){
			apiLanguageContainerNode.removeChild(apiLanguageContainerNode.lastChild);
		}
		let prototype = document.querySelector("#linkListApiLangInputPrototype");
		let languages = getLanguageCache(service);
		languages = languages.filter( obj => obj.sortkeyprefix.substr(0,1)==prefixCode );
		for(let i=0; i<languages.length; i++){
			let language = languages[i];
			let wrapper = prototype.cloneNode(true);
			wrapper.removeAttribute("id");
			let radioNode = wrapper.querySelector(".languageInputRadio");
			radioNode.setAttribute("value", language.title);
			let labelNode = wrapper.querySelector(".languageInputLabel");
			labelNode.innerText = language.title;
			apiLanguageContainerNode.appendChild(wrapper);
			show(wrapper);
		}
		return;
	}

	function apiLanguageBehavior(e){
		e.target.blur();
		let service = getApiService();
		if(service == null){
			return notice("please select wiktinary.");//TODO
		}
		else if( !hasLanguageCache(service) ){
			notice("please wait for downloading laguages.");//TODO
			return downloadApiLanguage(service);
		}
		else if( isDownloadingLangage(service) ){
			notice("please wait for downloading laguages.");//TODO
			return;
		}
		let prefix = getPrefixCache( service );
		apiLangMakeOption(prefix);
		apiLangMakeRadio( service, Object.keys(prefix)[0] );
		show(apiLangPaneNode);
	}

	function apiLangPrefixSelectBehavior(e){
		let service = getApiService();
		let prefixCode = e.target.value;
		apiLangMakeRadio(service, prefixCode);
	}

	function apiLangPaneBehavior(e){
		let classes = e.target.classList;
		if( classes.contains("removePane") || apiLangPaneNode.isEqualNode(e.target) ){
			hide(apiLangPaneNode);
		}
	}

	function apiCutOutBehavior(e){
		let data = {
			"co": e.target.checked
		};
		return saveW(data).catch(onSaveError);
	}

})();
