/**
 * CodeMirror YAML editor element
 */
const cm = CodeMirror.fromTextArea(document.getElementById('CodeEditor'), {
	lineNumbers: true,
	tabSize: 2,
	lineWrapping: true,
	mode: 'yaml'
});
cm.on('change', CodeMirrorOnChange);

function CodeMirrorOnChange(instance, changeObj) {
	yamlData = YAML.parseAllDocuments(cm.getValue());

	//Figure which document we're editing within the code so it can be set as the selected document
	var tabName = 'PackagePropertiesTab';
	var line = cm.getCursor().line;
	var lineContent = cm.getLine(line).trim();
	var baseNode = lineContent.slice(0, lineContent.indexOf(':'));
	if (lineContent === undefined || yamlData.length === 0) {
		return;
	}

	var startLine = line;
	while (startLine > 0) {
		baseNode = lineContent.slice(0, lineContent.indexOf(':'));
		if (baseNode === 'info') {
			tabName = 'PackageInfoTab';
		} else if (baseNode === 'assets') {
			tabName = 'IncludedAssetsTab';
		} else if (baseNode === 'variants') {
			tabName = 'PackageVariantsTab';
		} else if (['url', 'assetId', 'lastModified', 'checksum', 'nonPersistentUrl', 'archiveType'].includes(baseNode)) {
			tabName = 'AssetPropertiesTab';
		} else {
			tabName = 'PackagePropertiesTab';
		}

		if (lineContent === '---') {
			break;
		}
		startLine--;
		lineContent = cm.getLine(startLine).trim();
	}

	var endLine = line;
	while (endLine < cm.lineCount() - 1) {
		if (lineContent === '---') {
			break;
		}
		endLine++;
		lineContent = cm.getLine(endLine).trim();
	}

	//TODO - fix the automatic tab activating when editing a part of the code pane. It currently always defaults to the 'PackageProperties' tab because when dumping the data the cursor is set to 0,0
	var currDoc = YAML.parseDocument(cm.getRange({ line: startLine, ch: 0 }, { line: endLine, ch: 0 }));
	if (IsPackage(currDoc)) {
		currDocIdx = yamlData.findIndex(item => item.group === currDoc.group && item.name === currDoc.name);
		//SelectTab(tabName);
	}
	else {
		currDocIdx = yamlData.findIndex(item => item.assetId === currDoc.assetId);
		//SelectTab('AssetPropertiesTab');
	}

	console.log(currDocIdx);
	UpdateData(false);
}



/**
 * Array of packages and assets in this YAML file. The primary data object.
 */
var yamlData = [];
/**
 * Index of the currently selected document within `yamlData`. If this is null, then the `selectedDoc` is new and has not yet been added to `yamlData`.
 */
var currDocIdx = null;
/**
 * The currently selected ("active") document being edited - may be a package or an asset.
 */
var selectedDoc = null;

var selectedPkgAssetIdx = null;
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
 * Load From ... dialog element
 */
const loadFileDialog = document.getElementById('LoadFromChannelDialog');
/**
 * Preferences dialog element
 */
const preferencesDialog = new bootstrap.Modal('#PreferencesDialog');
/**
 * Package summary markdown editor
 */
const pkgSummaryEditor = new EasyMDE({
	element: document.getElementById("PackageDescription"),
	forceSync: true,
	previewImagesInEditor: true,
	status: false //hide the status bar
});
pkgSummaryEditor.codemirror.on("change", UpdatePackageData);


const pkgGroupSelect = new TomSelect('#PackageGroup', {
	maxItems: 1,
	create: true,
	preload: true,
	persist: false,
	maxOptions: null,

	render: {
		option: function (item, escape) {
			return '<div class="py-2 d-flex">' + escape(item.text) + '</div>';
		}
	},
});

const pkgSubfolderSelect = new TomSelect('#PackageSubfolder', {
	maxItems: 1,

	render: {
		option: function (item, escape) {
			return '<div class="py-2 d-flex">' + escape(item.text) + '</div>';
		}
	},
});

const pkgDependencySelect = new TomSelect("#PackageDependencies", {
	create: false,
	valueField: 'value',
	labelField: 'id',
	searchField: ['id'],
	//optgroups: ChannelInfo,
	//optgroupValueField: 'name',
	//optgroupField: 'channel',

	render: {
		option: function (item, escape) {
			return '<div class="py-2 d-flex">' + escape(item.id) + '</div>';
		},
		optgroup_header: function (data, escape) {
			return '<div class="optgroup-label">' + escape(data.label) + '</span></div>';
		}
	}
});

const pkgWebsitesSelect = new TomSelect("#PackageWebsite", {
	persist: false,
	createOnBlur: true,
	create: true
});

const pkgImageSelect = new TomSelect("#PackageImages", {
	persist: false,
	createOnBlur: true,
	create: true
});

const pkgAssetSelect = new TomSelect("#PackageAssetId", {
	create: false,
	valueField: 'value',
	labelField: 'id',
	maxItems: 1,
	searchField: ['id'],
	//optgroups: ChannelInfo,
	//optgroupValueField: 'name',
	//optgroupField: 'channel',

	render: {
		option: function (item, escape) {
			return '<div class="py-2 d-flex">' + escape(item.id) + '</div>';
		},
		optgroup_header: function (data, escape) {
			return '<div class="optgroup-label">' + escape(data.label) + '</span></div>';
		}
	}
});

const pkgAssetIncSelect = new TomSelect("#PackageAssetInclude", {
	persist: false,
	createOnBlur: true,
	create: true
});

const pkgAssetExcSelect = new TomSelect("#PackageAssetExclude", {
	persist: false,
	createOnBlur: true,
	create: true
});

const variantPackageSelect = new TomSelect("#VariantDependencies", {
	create: false,
	valueField: 'value',
	labelField: 'id',
	searchField: ['id'],
	//optgroups: ChannelInfo,
	//optgroupValueField: 'name',
	//optgroupField: 'channel',

	render: {
		option: function (item, escape) {
			return '<div class="py-2 d-flex">' + escape(item.id) + '</div>';
		},
		optgroup_header: function (data, escape) {
			return '<div class="optgroup-label">' + escape(data.label) + '</span></div>';
		}
	}
});

const variantAssetSelect = new TomSelect("#VariantAssetId", {
	create: false,
	valueField: 'value',
	labelField: 'id',
	searchField: ['id'],
	//optgroups: ChannelInfo,
	//optgroupValueField: 'name',
	//optgroupField: 'channel',

	render: {
		option: function (item, escape) {
			return '<div class="py-2 d-flex">' + escape(item.id) + '</div>';
		},
		optgroup_header: function (data, escape) {
			return '<div class="optgroup-label">' + escape(data.label) + '</span></div>';
		}
	}
});


let localAssets = [];
let localPackages = [];

ResetAllInputs();
SetTabState();

//Initialize all tooltips
const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))



/**
 * Sync changes between the codepane and UI with the current state of the `yamlData` array (UI ←→ yamlData ←→ codepane).
 * 
 * Dumps yamlData to the codepane by default.
 * @param {boolean} dumpData Whether to update the code pane. Should be disabled if this is called from the codepane (as the codepane would already be up to date). Default is FALSE.
 * 
 * The default *must* be FALSE because setting the code text will re-trigger the change event a second time
 */
function UpdateData(dumpData = true) {
	//When updating a text input, the input event occurs immediately, but the change event doesn't occur until you commit the change by lose focus or submit the form.

	//form.onchange() { input.validate(); metadata.update() }
	//codemirror.onchange() { metadata.update() }
	//metadata.update() { treeview.update(); form.update(); codemirror.update() }

	if (currDocIdx === null) {
		return;
	}

	var countOfAssets = 0;
	var countOfPackages = 0;
	localAssets.length = 0;
	localPackages.length = 0;

	if (yamlData !== null) {
		yamlData.forEach((doc) => {
			if (IsAsset(doc)) {
				countOfAssets++;
				localAssets.push(doc.toJSON().assetId);
			} else if (IsPackage(doc)) {
				countOfPackages++;
				localPackages.push(doc.toJSON().group + ':' + doc.toJSON().name);
			}
		});
	}
	document.getElementById('CurrentItemCount').innerHTML = `This file contains: ${countOfPackages} package${(countOfPackages !== 1 ? 's' : '')}, ${countOfAssets} asset${(countOfAssets !== 1 ? 's' : '')}`;

	SetTabState();

	//Update the Tomselect dropdowns with the local packages and assets
	[pkgDependencySelect, variantPackageSelect, pkgAssetSelect, variantAssetSelect].forEach(tscontrol => {
		let allOpts = tscontrol.options
		for (const key in allOpts) {
			if (allOpts[key].channel === 'local') {
				tscontrol.removeOption(key);
			}
		}
	});
	//pkgDependencySelect.addOptions(localPackages.map(p => ({ value: 'local|' + p, id: p, channel: 'local' })));
	//variantPackageSelect.addOptions(localPackages.map(p => ({ value: 'local|' + p, id: p, channel: 'local' })));
	//pkgAssetSelect.addOptions(localAssets.map(a => ({ value: 'local|' + a, id: a, channel: 'local' })));
	//variantAssetSelect.addOptions(localAssets.map(a => ({ value: 'local|' + a, id: a, channel: 'local' })));
	pkgDependencySelect.addOptions(localPackages.map(p => ({ value: p, id: p, channel: 'local' })));
	variantPackageSelect.addOptions(localPackages.map(p => ({ value: p, id: p, channel: 'local' })));
	pkgAssetSelect.addOptions(localAssets.map(a => ({ value: a, id: a, channel: 'local' })));
	variantAssetSelect.addOptions(localAssets.map(a => ({ value: a, id: a, channel: 'local' })));

	// Update the trees with local assets and packages
	UpdateMainTree();
	UpdateIncludedAssetTree();
	UpdateVariantTree();
	
	if (dumpData) {
		cm.off('change', CodeMirrorOnChange);
		cm.setValue(DumpYaml());
		cm.on('change', CodeMirrorOnChange);
	}
	
	SetSelectedDoc(currDocIdx);

	function DumpYaml() {
		if (yamlData.length === 0) {
			return '';
		} else {
			var newYaml = '';
			var docu = '';
			for (var idx = 0; idx < yamlData.length; idx++) {
				if (yamlData[idx] === null) {
					continue;
				}
				docu = yamlData[idx].toString(options = {
					lineWidth: 0,
					defaultKeyType: 'PLAIN',
					defaultStringType: 'QUOTE_DOUBLE',
					singleQuote: false,
					indentSeq: false
				});

				newYaml = newYaml + docu + '\n';
			}
			return newYaml;
		}
	}
}


//https://github.com/justinchmura/js-treeview
function UpdateMainTree() {
	var idx = 1;
	var astList = [];
	localAssets.forEach((asset) => {
		astList.push({ name: CreateAssetTreeName(idx, asset), children: [] });
		idx++;
	});

	idx = 1;
	var pkgList = [];
	localPackages.forEach((pkg) => {
		pkgList.push({ name: CreatePackageTreeName(idx, pkg), children: [] });
		idx++;
	});

	var mainTreeData = [
		{ name: 'Packages (' + pkgList.length + ')', expanded: true, children: pkgList },
		{ name: 'Assets (' + astList.length + ')', expanded: true, children: astList }
	];
	mtv = new TreeView(mainTreeData, document.getElementById('MainTreeView'));
	leaves = mtv.node.querySelectorAll('.tree-leaf');
	if (selectedDoc) {
		leaves.forEach(function (leaf) {
			let selectedDocTreeName;
			if (IsPackage(selectedDoc)) {
				selectedDocTreeName = CreatePackageTreeName('', selectedDoc);
			}
			else if (IsAsset(selectedDoc)) {
				selectedDocTreeName = CreateAssetTreeName('', selectedDoc);
			}
			else {
				return;
			}
			if (leaf.querySelectorAll('.tree-leaf-text')[0].innerHTML.includes(selectedDocTreeName)) leaf.classList.add('selected');
		})
	}
	function CreateAssetTreeName(id, asset) {
		return id + ' - ' + asset;
	}

	function CreatePackageTreeName(id, package) {
		return id + ' - ' + package;
	}

	mtv.on("select", function (t) {
		leaves.forEach(function (leaf) {
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
				SelectTab('PackagePropertiesTab');
			}

			SetSelectedDoc(selectedIdx - 1, 'p');
			FillPackageForm();
			UpdateIncludedAssetTree();
		} else {
			var selectedIdx = t.data.name.slice(0, t.data.name.indexOf(' '));
			SelectTab('AssetPropertiesTab');

			SetSelectedDoc(selectedIdx - 1, 'a');
			FillAssetForm();
		}
		SetTabState();
	});
}

function UpdateIncludedAssetTree() {
	var pkgAssets;
	if (selectedDoc == null || selectedDoc.get('assets') == null) {
		pkgAssets = [];
	} else {
		pkgAssets = selectedDoc.get('assets').toJSON().map((i) => ({ name: i.assetId, children: [] }));
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






//TODO - validate YAML in code pane for valid yaml syntax
//TODO - validate YAML in code pane for valid sc4pac schema
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
 * Sets `selectedDoc` and `currDocIdx` to the document at the specified index. Omit the type to return the nth document within the entire dataset
 * @param {number} index The nth document to return, or -1 to clear the selected doc.
 * @param {string} type [Optional] Specify 'p' for package, 'a' for asset, or omit to return either type.
 */
function SetSelectedDoc(index, type) {
	var docs;
	if (index === undefined) {
		index = 0;
	}
	if (index < 0) {
		selectedDoc = null;
		currDocIdx = null;
		return;
	}

	if (arguments.length === 1) {
		selectedDoc = yamlData[index];
		currDocIdx = index;
	}
	else {
		if (type.toLowerCase() === 'p') {
			docs = yamlData.filter((doc) => IsPackage(doc));
		} else if (type.toLowerCase() === 'a') {
			docs = yamlData.filter((doc) => IsAsset(doc));
		} else {
			selectedDoc = null;
			currDocIdx = null;
			return;
		}

		if (index > docs.length) {
			selectedDoc = null;
			currDocIdx = null;
			return;
		} else if (type.toLowerCase() === 'p') {
			selectedDoc = docs[index];
			currDocIdx = yamlData.findIndex(i => i.get('group') === selectedDoc.get('group') && i.get('name') === selectedDoc.get('name'));
		} else if (type.toLowerCase() === 'a') {
			selectedDoc = docs[index];
			currDocIdx = yamlData.findIndex(i => i.get('assetId') === selectedDoc.get('assetId'));
		}
	}
}
/**
 * Clear the `selectedDoc` and `currDocIdx` by setting them to null to indicate no document is selected ("active").
 */
function ClearSelectedDoc() {
	selectedDoc = null;
	currDocIdx = null;
}