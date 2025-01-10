/**
 * CodeMirror editor component
 */
const cm = CodeMirror.fromTextArea(document.getElementById('editor'), {
	lineNumbers: true,
	tabSize: 2,
	lineWrapping: true,
	mode: 'yaml'
});
cm.on('change', editor => {
	console.log('yaml changed');
	
	yamlData = jsyaml.loadAll(cm.getValue());
	console.log(yamlData);
	UpdateData(false);
});
/**
 * Array of packages and assets in this YAML file. The primary data object.
 */
var yamlData = [];


//var sc4pacAssets = new Array();
//var sc4pacPackages = new Array();
//var sc4pacData = FetchSc4pacData().then(result => {
//	sc4pacData = result.contents;
//	sc4pacAssets = result.contents.filter((item) => item.group === 'sc4pacAsset');
//	sc4pacPackages = result.contents.filter((item) => item.group !== 'sc4pacAsset');
//});
//async function FetchSc4pacData() {
//	const request = new Request('https://memo33.github.io/sc4pac/channel/sc4pac-channel-contents.json');
//	const response = await fetch(request);
//	return await response.json();
//}
//async function FetchSc4EvermoreData() {
//	const request = new Request('https://www.sc4evermore.com/latest-modified-downloads.php');
//	const response = await fetch(request);
//	return await response.json();
//}
//fetch('/config.json').then(function (config) {
//    console.log('API key:', config.apiKey);
//});


/**
 * Load From Dialog element
 */
const loadFileDialog = document.getElementById('LoadFromChannelDialog');
/**
 * Main Tree View element
 */
var mtv;
/**
 * Asset Tree View element
 */
var atv;
/**
 * Variant Tree View element
 */
var vtv;
/**
 * Currently selected document type - 'p' for package, 'a' for asset, 'null' for no selection or unknown.
 */
var currDocType = null;
/**
 * Index of the currently selected document within `yamlData`.
 */
var currDocIdx = null;
/**
 * Currently selected document in the main tree - may be a package or an asset.
 */
var selectedDoc = null;

//var currPackageIdx = null;
//var currAssetIdx = null;
var countOfPackages = 0;
var countOfAssets = 0;
var listOfAssets = new Array();
var listOfPackages = new Array();
var listOfGroups = new Array();



var pkgTomSelect = new TomSelect('#PacPackageList', {
	valueField: 'id',
	labelField: 'id',
	searchField: ['id'],
	maxItems: 1,
	optgroups: [
		{value: 'default', label: 'Default channel'},
		{value: 'zasco', label: 'Zasco\'s channel'},
	],
	optgroupField: 'optGroup',

	// fetch remote data
	load: async function (query, callback) {
		var self = this;
		if (self.loading > 1) {
			callback();
			return;
		}

		var defaultChannelURL = 'https://memo33.github.io/sc4pac/channel/sc4pac-channel-contents.json'
		var zascoChannelURL = 'https://zasco.github.io/sc4pac-channel/channel/sc4pac-channel-contents.json'
		allPackages = []

		function handleResponse(jsonResponse, channel) {
			// Add a new field combining the group and name.
			return jsonResponse.packages.map(i => ({ id: i.group + ":" + i.name, optGroup: channel, ...i }))
		}
		
		await fetch(defaultChannelURL)
			.then(response => response.json())
			.then(json => {
				allPackages = allPackages.concat(handleResponse(json, 'default'))
				defaultFailed = false
			})
			.catch(() => {
				defaultFailed = true
			});
		
		await fetch(zascoChannelURL)
			.then(response => response.json())
			.then(json => {
				allPackages = allPackages.concat(handleResponse(json, 'zasco'))
				zascoFailed = false
			})
			.catch(() => {
				zascoFailed = true
			});
		
		if (!defaultFailed || !zascoFailed) {
			callback(allPackages);
			self.settings.load = null;
		}
		else callback();
	},
	// custom rendering function for options
	render: {
		option: function (item, escape) {
			return '<div class="py-2 d-flex">' + escape(item.group + ":" + item.name/*  +"["+ item.optGroup +" channel]" */) + '</div>';
		},
		optgroup_header: function(data, escape) {
			return '<div class="optgroup-label">' + escape(data.label) + '</span></div>';
		}
	},
});

var variantPackageSelect = new TomSelect('#VariantsPacPackageList', {
	valueField: 'id',
	labelField: 'id',
	searchField: ['id'],
	maxItems: 1,

	// fetch remote data
	load: function (query, callback) {
		var self = this;
		if (self.loading > 1) {
			callback();
			return;
		}

		var url = 'https://memo33.github.io/sc4pac/channel/sc4pac-channel-contents.json'
		fetch(url)
			.then(response => response.json())
			.then(json => {
				// Add a new field combining the group and name.
				callback(json.packages.map(i => ({ id: i.group + ":" + i.name, ...i })));
				//console.log(json.contents
				//	.filter((item) => item.group !== 'sc4pacAsset')
				//	.map(i => ({ id: i.group + ":" + i.name, ...i }))
				//);
				self.settings.load = null;
			}).catch(() => {
				callback();
			});
	},
	// custom rendering function for options
	render: {
		option: function (item, escape) {
			return '<div class="py-2 d-flex">' + escape(item.group + ":" + item.name) + '</div>';
		}
	},
});

var variantAssetSelect = new TomSelect('#VariantsPacAssetList', {
	valueField: 'name',
	labelField: 'name',
	searchField: ['name'],
	maxItems: 1,

	// fetch remote data
	load: function (query, callback) {
		var self = this;
		if (self.loading > 1) {
			callback();
			return;
		}

		var url = 'https://memo33.github.io/sc4pac/channel/sc4pac-channel-contents.json'
		fetch(url)
			.then(response => response.json())
			.then(json => {
				callback(json.assets);
				//console.log(json.contents.filter((item) => item.group === 'sc4pacAsset'));
				//console.log(sc4pacAssets.map(i => ({ id: i.name, ...i })));
				self.settings.load = null;
			}).catch(() => {
				callback();
			});
	},
	//options: sc4pacAssets.map(i => ({ id: i.name, ...i})),
	// custom rendering function for options
	render: {
		option: function (item, escape) {
			return '<div class="py-2 d-flex">' + escape(item.name) + '</div>';
		}
	},
});

var pkgSubfolderSelect = new TomSelect('#PackageSubfolder', {
	valueField: 'name',
	labelField: 'name',
	searchField: ['name'],
	maxItems: 1,
	preload: true,
	maxOptions: null,

	// fetch remote data
	load: function (query, callback) {
		var self = this;
		if (self.loading > 1) {
			callback();
			return;
		}

		var url = 'https://raw.githubusercontent.com/memo33/sc4pac/45fc116576044e73ff50b257fc1fcef381f96714/.github/sc4pac-yaml-schema.py' // Use data @ commit 45fc11 to prevent any failure if file is ever changed.
		fetch(url)
			.then(response => response.text())
			.then(responseText => {
				subfolders = responseText
					.split('### [subfolders-docsify]')[1] // Keep content between delimiters.
					.split('\n') // Split by line return.
					.filter(n => n) // Remove empty entries (first and last).
					.map(i => ({name: i}))
				;
				callback(subfolders);
				//console.log(subfolders)
				self.settings.load = null;
			}).catch(() => {
				callback();
			});
	},
	// custom rendering function for options
	render: {
		option: function (item, escape) {
			return '<div class="py-2 d-flex">' + escape(item.name)+ '</div>';
		}
	},
});

var pkgGroupSelect = new TomSelect('#PackageGroup', {
    valueField: 'group',
    labelField: 'group',
    searchField: ['group'],
	maxItems: 1,
	create: true,
	preload: true,
	persist: false,
	maxOptions: null,

    // fetch remote data
    load: function (query, callback) {
        var self = this;
        if (self.loading > 1) {
            callback();
            return;
        }

        var url = 'https://memo33.github.io/sc4pac/channel/sc4pac-channel-contents.json'
		fetch(url)
            .then(response => response.json())
            .then(json => {
                callback(json.packages);
                self.settings.load = null;
            }).catch(() => {
                callback();
            });
    },
    // custom rendering function for options
    render: {
        option: function (item, escape) {
            return '<div class="py-2 d-flex">' + escape(item.group)+ '</div>';
        }
    },
});



ResetAllInputs();



//TODO - validate YAML in code pane for valid yaml syntax
//TODO - validate YAML in code pane for valid sc4pac schema



/**
 * Update the `yamlData` object with the current state of the inputs and dump the resulting YAML to the codepane
 * @param {boolean} dumpData Specify FALSE to skip updating the code pane. Default is TRUE.
 */
function UpdateData(dumpData = true) {
	//When updating a text input, the input event occurs immediately, but the change event doesn't occur until you commit the change by lose focus or submit the form.

	//form.onchange() { input.validate(); metadata.update() }
	//codemirror.onchange() { metadata.update() }
	//metadata.update() { treeview.update(); form.update(); codemirror.update() }



	//Update the counts of packages and assets
	countOfAssets = 0;
	countOfPackages = 0;
	listOfAssets.length = 0;
	listOfPackages.length = 0;

	if (yamlData !== null) {
		yamlData.forEach((item) => {
			if (IsAsset(item)) {
				countOfAssets++;
				listOfAssets.push(item);
			} else if (IsPackage(item)) {
				countOfPackages++;
				listOfPackages.push(item);
			}
		});
	}
	document.getElementById('CurrentItemCount').innerHTML = `This file contains: ${countOfPackages} package${(countOfPackages !== 1 ? 's' : '')}, ${countOfAssets} asset${(countOfAssets !== 1 ? 's' : '')}`;


	UpdateLocalDropdowns();

	UpdateMainTree();
	UpdateIncludedAssetTree();
	UpdateVariantTree();

	SetSelectedDoc(currDocIdx);
	if (IsPackage(selectedDoc)) {
		FillPackageForm();
	} else {
		FillAssetForm();
	}
	

	if (dumpData) {
		cm.setValue(DumpYaml());
	}


	/**
	 * Count the number of Packages and Assets in the code pane and update the UI with this new result.
	 */
	function UpdateLocalDropdowns() {
		//TODO - this UpdateLocalDropdowns function should disappear when PR #45 is implemented

		//Fill local dependency selection options
		var packageDependencies = document.getElementById('LocalPackageList');
		var variantDependencies = document.getElementById('VariantsLocalPackageList');
		packageDependencies.replaceChildren();
		packageDependencies.appendChild(new Option('', ''));
		variantDependencies.replaceChildren();
		variantDependencies.appendChild(new Option('', ''));
		for (var idx = 0; idx < listOfPackages.length; idx++) {
			var pkgName = listOfPackages[idx].group + ":" + listOfPackages[idx].name;
			packageDependencies.add(new Option(pkgName, pkgName));
			variantDependencies.add(new Option(pkgName, pkgName));
		}

		//Package:asset selection for local assets
		var localAssetList = document.getElementById('SelectLocalPackageAssets');
		var variantAssets = document.getElementById('VariantsLocalAssetList');
		localAssetList.replaceChildren();
		localAssetList.appendChild(new Option('', ''));
		variantAssets.replaceChildren();
		variantAssets.appendChild(new Option('', ''));
		listOfAssets.forEach(i => localAssetList.add(new Option(i.assetId, i.assetId)));
		listOfAssets.forEach(i => variantAssets.add(new Option(i.assetId, i.assetId)));
	}

	function DumpYaml() {
		var newYaml = '';
		var docu = '';
		//TODO - figure out how to retain comments

		for (var idx = 0; idx < yamlData.length; idx++) {
			if (yamlData[idx] === null) {
				continue;
			}
			docu = jsyaml.dump(yamlData[idx], {
				'lineWidth': -1,
				'quotingType': '"',
				'noArrayIndent': true,
				'forceQuotes': true
			});
			//The parser blows away the multiline context so we need to rebuild it :(
			if (docu.indexOf('description: ') > 0) {
				var rgx = new RegExp('description: \"(.*?)\"');
				var oldText = docu.match(rgx)[0];
				var newText = oldText.replace('description: "', "description: |\n    ").replaceAll('\\n', '\n    ').replaceAll('\n    \n', '\n\n').replace('"', '');
				docu = docu.replace(oldText, newText);
			}

			newYaml = newYaml + docu;
			if (idx !== yamlData.length - 1) {
				newYaml = newYaml + '\n---\n';
			}
		}
		return newYaml;
	}
}

/**
 * Parse the YAML input and update the UI accordingly based on the count of packages and assets.
 */
//function ParseYaml() {
//	yamlData = jsyaml.loadAll(cm.getValue());
//	if (yamlData.length > 0 && (selectedDoc == null || selectedDoc == undefined)) {
//		selectedDoc = yamlData[0];
//		//if (IsPackage(selectedDoc)) {
//		//	FillPackageForm();
//		//} else {
//		//	FillAssetForm();
//		//}
//	}
//	CountItems();
//	UpdateMainTree();
//	UpdateVariantTree();
//}


//https://github.com/justinchmura/js-treeview
function UpdateMainTree() {
	function getAssetTreeName(id, asset) {
		return id + ' - ' + asset.assetId;
	}
	
	function getPackageTreeName(id, package) {
		return id + ' - ' + package.group + ":" + package.name;
	}
	
	var idx = 1;
	var astList = [];
	listOfAssets.forEach((asset) => {
		astList.push({ name: getAssetTreeName(idx, asset), children: [] });
		idx++;
	});

	idx = 1;
	var pkgList = [];
	listOfPackages.forEach((pkg) => {
		pkgList.push({ name: getPackageTreeName(idx, pkg), children: [] });
		idx++;
	});

	var mainTreeData = [
		{ name: 'Packages (' + pkgList.length + ')', expanded: true, children: pkgList },
		{ name: 'Assets (' + astList.length + ')', expanded: true, children: astList }
	];
	mtv = new TreeView(mainTreeData, document.getElementById('MainTreeView'));
	leaves = mtv.node.querySelectorAll('.tree-leaf');
	if (selectedDoc) {
		leaves.forEach(function(leaf) {
			let selectedDocTreeName;
			if (IsPackage(selectedDoc)) selectedDocTreeName = getPackageTreeName('', selectedDoc);
			else if (IsAsset(selectedDoc)) selectedDocTreeName = getAssetTreeName('', selectedDoc);
			else return;
			if (leaf.querySelectorAll('.tree-leaf-text')[0].innerHTML.includes(selectedDocTreeName)) leaf.classList.add('selected');
		})
	}
	
	mtv.on("select", function (t) {
		leaves.forEach(function(leaf) {
			if (!(leaf instanceof HTMLElement)) return;
			leaf.classList.remove('selected');
		})
		leaf = t.target.target.closest('.tree-leaf');
		leaf.classList.add('selected');
		
		if (t.data.name.indexOf('(') > 0) { //A heading category was selected
			return;
		} else if (t.data.name.indexOf(':') > 0) { //Packages have a colon in their name - assets do not
			var selectedIdx = t.data.name.slice(0, t.data.name.indexOf(' '));
			if (document.querySelector(".nav-link.active").id === 'AssetPropertiesTab') {
				SelectTab('PackagePropertiesTab', true);
			}

			SetSelectedDoc(selectedIdx - 1, 'p');
			FillPackageForm();
			//UpdateData();
			//UpdateIncludedAssetTree();
			//UpdateVariantTree();
		} else {
			var selectedIdx = t.data.name.slice(0, t.data.name.indexOf(' '));
			SelectTab('AssetPropertiesTab', true);

			SetSelectedDoc(selectedIdx - 1, 'a');
			FillAssetForm();
		}

	});
}

function UpdateIncludedAssetTree() {
	var pkgAssets;
	if (selectedDoc == null || selectedDoc.assets == null) {
		pkgAssets = [];
	} else {
		pkgAssets = selectedDoc.assets.map((i) => ({ name: i.assetId, children: [] }));
	}

	var pkgAssetData = [{ name: 'Assets (' + pkgAssets.length + ')', expanded: true, children: pkgAssets }]
	atv = new TreeView(pkgAssetData, 'AssetTreeView');
	atv.on("select", function (t) {
		FillIncludedAssetForm(t.data.name);
	});
}

function UpdateVariantTree() {
	var pkgVariants;
	
	if (selectedDoc == null || selectedDoc.variants == null) {
		pkgVariants = [];
	} else {
		var pkgId = selectedDoc.group + ':' + selectedDoc.name + ':';
		//let allVariantNames = doc.variants.map((v) => Object.keys(v.variant)[0]);
		//let uniqueVariantNames = [...new Set(allVariantNames)]; //https://stackoverflow.com/a/33121880/10802255
		//console.log(allVariantNames);
		//console.log(uniqueVariantNames);

		//pkgVariants = uniqueVariantNames.map((uName) => ({
		//	name: uName.replace(pkgId, ''),
		//	expanded: true,
		//	//First find all with the current name, then return all the values (options) associated with that variant. Lastly format that list correctly for the tree view.
		//	children: doc.variants
		//		.filter((i) => Object.keys(i.variant)[0] === uName)
		//		.map((i) => Object.values(i.variant)[0])
		//		.map((i) => ({name: i, children: []}))
		//}));
		let allVariantNames = selectedDoc.variants.map((v) => ({ key: Object.keys(v.variant)[0], value: Object.values(v.variant)[0] }));

		pkgVariants = allVariantNames.map((v) => ({
			name: v.key.replace(pkgId, '') + ':' + v.value,
			expanded: true,
			children: [
				{ name: 'Header', children: [] },
				{
					name: 'Assets (' + GetVariant(v.key, v.value).assets.length + ')',
					expanded: false,
					children: GetVariant(v.key, v.value).assets.map((item) => ({ name: item.assetId, children: [] }))
				},
			]
		}));
	}

	var pkgVariantsData = [{ name: 'Variants (' + pkgVariants.length + ')', expanded: true, children: pkgVariants }]
	vtv = new TreeView(pkgVariantsData, 'VariantTreeView');
	vtv.on("select", function (t) {
		var selectedItem = t.data.name;
		var selectedVariant;
		
		if (selectedItem === "Header") {
			selectedVariant = t.target.target.parentElement.parentElement.parentElement.parentElement.firstChild.textContent.substring(1);
		} else {
			selectedVariant = t.target.target.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.firstChild.textContent.substring(1);
		}

		var variantKey = pkgId + selectedVariant.substring(0, selectedVariant.indexOf(':'));
		var variantValue = selectedVariant.substring(selectedVariant.indexOf(':') + 1);
		var activeVariant = GetVariant(variantKey, variantValue);
		FillVariantFormHeader(activeVariant);

		if (selectedItem !== "Header") {
			let selectedAsset = activeVariant.assets.filter(i => i.assetId === selectedItem)[0];
			FillVariantFormAsset(selectedAsset);
		}
	});

	/**
	 * Fill the Varaint input form fields with the specified variant.
	 */
	function FillVariantFormHeader(vData) {
		var key = Object.keys(vData.variant)[0];
		var idx = key.lastIndexOf(':');
		document.getElementById('IsGlobalVariant').checked = (key.substring(0, idx) !== selectedDoc.group + ':' + selectedDoc.name);
		document.getElementById('VariantKey').value = key.substring(idx + 1);
		document.getElementById('VariantValue').value = Object.values(vData.variant)[0];
		document.getElementById('VariantDescription').value = '';
		document.getElementById('VariantDependencies').value = ArrayToText(vData.dependencies);
		document.getElementById('VariantDescription').value = selectedDoc.variantDescriptions[key][Object.values(vData.variant)[0]];
	}


	function FillVariantFormAsset(vAsset) {
		document.getElementById('VariantAssetId').value = vAsset.assetId;
		document.getElementById('VariantInclude').value = ArrayToText(vAsset.include);
		document.getElementById('VariantExclude').value = ArrayToText(vAsset.exclude);
	}
}







function CopyToClipboard() {
	navigator.clipboard.writeText(cm.getValue())
}

function validate() {
	//ensure any manually typed yaml (as opposed to generated yaml) is syntactically valid
}


/**
 * Returns a variant object in the document with the specified key/value set.
 * @param {Object} doc The document (package) containing the desired variant
 * @param {string} key Variant key (name). If the key is for a local package variant and is not found, a global variant with the same key will be returned if found.
 * @param {string} value Variant value
 * @returns The specified variant if found; undefined if not found
 */
function GetVariant(key, value) {
	//Variants can be defined globally for the entire Plugins folder (e.g. nightmode, driveside, roadstyle, CAM), or locally on a per-package basis (e.g. group:package:variant)
	var localVariant = selectedDoc.variants.filter((i) =>
		(Object.keys(i.variant)[0] === key) &&
		(Object.values(i.variant)[0] === value)
	)[0];

	if (localVariant === undefined) {
		var globalKey = key.substring(key.lastIndexOf(':') + 1);
		return selectedDoc.variants.filter((i) =>
			(Object.keys(i.variant)[0] === globalKey) &&
			(Object.values(i.variant)[0] === value)
		)[0];
	} else {
		return localVariant;
	}
}

function RemoveSelectedDoc() {
	if (IsPackage(selectedDoc)) {
		yamlData = yamlData.filter((doc) => doc.group + doc.name !== selectedDoc.group + selectedDoc.name);
	} else {
		yamlData = yamlData.filter((doc) => doc.assetId !== selectedDoc.assetId);
	}

	//CountItems();
	//UpdateMainTree();
	//UpdateCodePane();
	UpdateData();
	ResetAssetInputs();
}


/**
 * Returns the specified package or asset
 * @param {string} type Specify 'p' for packages or 'a' for assets.
 * @param {number} index The nth package or asset to return
 * @returns The specified package or asset
 */
function GetDocument(type, index) {
	if (type.toLowerCase() === 'a') {
		return yamlData.filter((doc) => IsAsset(doc))[index];
	} else {
		return yamlData.filter((doc) => IsPackage(doc))[index];
	} 
}

/**
 * Sets `selectedDoc` and `currDocType` to the document at the specified index. Omit the type to return the nth document within the entire dataset
 * @param {number} index The nth document to return, or -1 to clear the selected doc.
 * @param {string} type [Optional] Specify 'p' for package, 'a' for asset, or omit to return either type.
 */
function SetSelectedDoc(index, type) {
	var docs;
	if (arguments.length === 1) {
		selectedDoc = yamlData[index];
		currDocType = IsPackage(selectedDoc) ? 'p' : 'a';
		currDocIdx = index;
		return;
	} else {
		currDocType = type;

		if (type.toLowerCase() === 'p') {
			docs = yamlData.filter((doc) => IsPackage(doc));
		} else if (type.toLowerCase() === 'a') {
			docs = yamlData.filter((doc) => IsAsset(doc));
		} else {
			selectedDoc = null;
			currDocIdx = null;
			return;
		}

		if (index < 0 || index > docs.length) {
			selectedDoc = null;
			currDocIdx = null;
			return;
		} else if (type.toLowerCase() === 'p') {
			selectedDoc = docs[index];
			currDocIdx = yamlData.findIndex(i => i.group === selectedDoc.group && i.name === selectedDoc.name);
		} else if (type.toLowerCase() === 'a') {
			selectedDoc = docs[index];
			currDocIdx = yamlData.findIndex(i => i.assetId === selectedDoc.assetId);
		}
	}
}



document.addEventListener("keydown", function (e) {
	if ((e.metaKey || e.ctrlKey) && e.code === "KeyS") {
		SaveAs();
		e.preventDefault();
	}
}, false);
function SaveAs() {
	var bb = new Blob([DumpYaml()], { type: 'application/yaml' });
	var tmp = document.createElement('a');
	var fileName;
	if (yamlData[0] == null) {
		fileName = "document.yaml";
	} else if (document.getElementById('YamlFileName').textContent !== '') {
		fileName = document.getElementById('YamlFileName').textContent;
	} else {
		fileName = IsPackage(yamlData[0]) ? yamlData[0].name : yamlData[0].assetId + '.yaml';
	}
	tmp.download = fileName;
	tmp.href = window.URL.createObjectURL(bb);
	tmp.click();
	tmp.remove();
}


document.addEventListener("keydown", function (e) {
	if ((e.metaKey || e.ctrlKey) && e.code === "KeyO") {
		LoadFromFile();
		e.preventDefault();
	}
}, false);
function LoadFromFile() {
	var tmp = document.createElement("input")
	tmp.type = 'file'
	tmp.style.display = 'none'
	tmp.onchange = function (e) {
		var file = e.target.files[0];
		if (!file) {
			return;
		}
		document.getElementById('YamlFileName').textContent = file.name
		var reader = new FileReader();
		reader.onload = function (e) {
			var contents = e.target.result;
			cm.setValue(contents);
			//ParseYaml();
			//SetSelectedDoc('p', 0);
			tmp.remove();
		}
		reader.readAsText(file);
	}
	tmp.click();
}


/**
 * Load content from a Github file tree
 * @param {any} srcElem Source element this function is being called from.
 * 
 * If the element is `a` then this is triggered from the open menu or the breadcrumb menu and we want to navigate to the base folder of the Github files; if the element is `BUTTON` then its being triggered from a button click in the modal dialog and we want to navigate to a subfolder of the Github files. Basically, links go to the root folder level, buttons go to a subfolder level.
 * @param {any} channel Name of the channel to fetch data from, e.g. 'default' or 'zasco'
 */
async function LoadFromGithub(srcElem, channel) {
	var crumbNav = document.getElementById('ChannelBreadcrumb');
	var level = (srcElem.tagName === 'A') ? 1 : 2;

	//Set the base srcUrl and update the breadcrumb menu.
	if (level === 1) { 
		switch (channel.toLowerCase()) {
			case 'default':
				srcUrl = 'https://api.github.com/repos/memo33/sc4pac/git/trees/2b987426294c3fb8b66b1875d629d5937ad921ac';
				break;
			case 'simtropolis':
				srcUrl = 'https://api.github.com/repos/sebamarynissen/simtropolis-channel/git/trees/04887d7d070e600ea0fb4a7cc22314c5fb0af436';
				break;
			case 'zasco':
				srcUrl = 'https://api.github.com/repos/Zasco/sc4pac-channel/git/trees/ad3f15a09bf296df6ef87be2175542f1ee671407';
				break;
		}
		if (srcElem.textContent !== 'Root') {
			loadFileDialog.querySelector('.modal-title').textContent = srcElem.innerHTML;
		}
		if (crumbNav.children.length > 1) {
			crumbNav.lastElementChild.remove();
			crumbNav.firstElementChild.firstElementChild.remove(); //remove the <a> link
			crumbNav.firstElementChild.textContent = 'Root';
			crumbNav.firstElementChild.className = 'breadcrumb-item active'
		}
	}
	else {
		srcUrl = srcElem.value;

		var prevCrumb = crumbNav.firstElementChild 
		prevCrumb.className = 'breadcrumb-item';
		prevCrumb.textContent = '';

		let newLink = document.createElement('a');
		newLink.href = '#';
		newLink.textContent = 'Root';
		newLink.addEventListener('click', function () { LoadFromGithub(this, channel); });
		prevCrumb.appendChild(newLink);

		let newCrumb = document.createElement('li');
		newCrumb.className = 'breadcrumb-item active';
		newCrumb.textContent = srcElem.textContent;
		crumbNav.appendChild(newCrumb);
	}


	fetch(srcUrl)
		.then(response => response.json())
		.then(data => {
			let listDiv = loadFileDialog.querySelector('.list-group');
			listDiv.textContent = '';
			data.tree
				.filter((obj) => obj.path.charAt(0) !== '.')
				.forEach(obj => {
					let btn = document.createElement('button');
					btn.className = 'list-group-item list-group-item-action';
					btn.textContent = obj.path;
					btn.value = obj.url;
					if (level === 1) {
						btn.addEventListener('click', function () { LoadFromGithub(this, channel); });
					} else {
						btn.addEventListener('click', function () { GetContent(this.value, obj.path); });
					}

					listDiv.appendChild(btn);
				});
		})
		.catch(error => console.error('Error fetching the tree data:', error));
}


function GetContent(url, fileName) {
	fetch(url)
		.then(response => response.json())
		.then(data => {
			document.getElementById('YamlFileName').textContent = fileName;
			cm.setValue(atob(data.content));
			//ParseYaml();
		})
		.catch(error => console.error('Error fetching the tree data:', error));

	//Hide the modal display
	loadFileDialog.classList.remove('show');
	loadFileDialog.style.display = 'none';
	document.body.classList.remove('modal-open');
	var backdrop = document.querySelector('.modal-backdrop');
	if (backdrop) {
		backdrop.parentNode.removeChild(backdrop);
	}
}
