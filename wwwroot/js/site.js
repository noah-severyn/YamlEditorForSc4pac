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
	let tabName = 'PackagePropertiesTab';
	let line = cm.getCursor().line;
	let lineContent = cm.getLine(line).trim();
	let baseNode = lineContent.slice(0, lineContent.indexOf(':'));
	if (lineContent === undefined || yamlData.length === 0) {
		return;
	}

	let startLine = line;
	while (startLine > 0) {
		baseNode = lineContent.slice(0, lineContent.indexOf(':'));
		if (baseNode === 'info') {
			tabName = 'PackageInfoTab';
		} else if (baseNode === 'assets') {
			tabName = 'PackageAssetsTab';
		} else if (baseNode === 'variants') {
			tabName = 'VariantsTab';
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

	let endLine = line;
	while (endLine < cm.lineCount() - 1) {
		if (lineContent === '---') {
			break;
		}
		endLine++;
		lineContent = cm.getLine(endLine).trim();
	}

	//TODO - fix the automatic tab activating when editing a part of the code pane. It currently always defaults to the 'PackageProperties' tab because when dumping the data the cursor is set to 0,0
	const currDoc = YAML.parseDocument(cm.getRange({ line: startLine, ch: 0 }, { line: endLine, ch: 0 }));
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
let yamlData = [];
/**
 * Index of the currently selected document within `yamlData`. If this is null, then the `selectedDoc` is new and has not yet been added to `yamlData` OR there are no documents to be selected.
 */
let currDocIdx = null;
/**
 * The currently selected ("active") document being edited - may be a package or an asset.
 */
let selectedDoc = null;
/**
 * Index of the currently selected included asset ("package asset") within this package.
 */
let selectedPkgAssetIdx = null;
/**
 * Index of the currently selected variant within this package.
 */
let selectedVariantIdx = null;
/**
 * Index of the currently selected asset within the currently selected variant.
 */
let selectedVariantAssetIdx = null;
/**
 * Main Tree View element
 */
let mtv;
/**
 * Asset Tree View element
 */
let atv;
/**
 * Variant Tree View element
 */
let vtv;
/**
 * Variant Asset Tree View element
 */
let vatv;
/**
 * Load From ... dialog element
 */
const githubNavDialog = new bootstrap.Modal('#LoadFromChannelDialog');
/**
 * Preferences dialog element
 */
const preferencesDialog = new bootstrap.Modal('#PreferencesDialog');
/**
 * STEX metadata fetch dialog element
 */
const stexFetchDialog = new bootstrap.Modal('#LoadFromStexDialog');
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

const variantDependencySelect = new TomSelect("#VariantDependencies", {
	create: false,
	valueField: 'value',
	labelField: 'id',
	searchField: ['id'],

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
	maxItems: 1,
	create: false,
	valueField: 'value',
	labelField: 'id',
	searchField: ['id'],

	render: {
		option: function (item, escape) {
			return '<div class="py-2 d-flex">' + escape(item.id) + '</div>';
		},
		optgroup_header: function (data, escape) {
			return '<div class="optgroup-label">' + escape(data.label) + '</span></div>';
		}
	}
});
/**
 * Variant Asset Include TomSelect element
 */
const variantIncludeSelect = new TomSelect("#VariantAssetInclude", {
	persist: false,
	createOnBlur: true,
	create: true
});
/**
 * Variant Asset Exclude TomSelect element
 */
const variantExcludeSelect = new TomSelect("#VariantAssetExclude", {
	persist: false,
	createOnBlur: true,
	create: true
});

/**
 * Assets defined in this local file
 * @type {Array<string>}
 */
let localAssets = [];
/**
 * Packages defined in this local file
 * @type {Array<string>}
 */
let localPackages = [];

ClearAll();
SetTabState();

//Initialize all tooltips
const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))



/**
 * Sync changes between the codepane and UI with the current state of the `yamlData` array (UI ←→ yamlData ←→ codepane).
 * 
 * Dumps yamlData to the codepane by default.
 * @param {boolean} [dumpData=true] Whether to update the code pane. Should be disabled if this is called from the codepane (as the codepane would already be up to date). Default is TRUE.
 */
function UpdateData(dumpData = true) {
	//When updating a text input, the input event occurs immediately, but the change event doesn't occur until you commit the change by lose focus or submit the form.

	//form.onchange() { input.validate(); metadata.update() }
	//codemirror.onchange() { metadata.update() }
	//metadata.update() { treeview.update(); form.update(); codemirror.update() }

	let countOfAssets = 0;
	let countOfPackages = 0;
	localAssets.length = 0;
	localPackages.length = 0;

	yamlData.forEach((doc) => {
		if (IsAsset(doc)) {
			countOfAssets++;
			localAssets.push(doc.toJSON().assetId);
		} else if (IsPackage(doc)) {
			countOfPackages++;
			localPackages.push(doc.toJSON().group + ':' + doc.toJSON().name);
		}
	});
	
	document.getElementById('CurrentItemCount').innerHTML = `This file contains: ${countOfPackages} package${(countOfPackages !== 1 ? 's' : '')}, ${countOfAssets} asset${(countOfAssets !== 1 ? 's' : '')}`;

	SetTabState();

	//Update the TomSelect dropdowns with the local packages and assets.Only remove a local package or asset from the TomSelects if it is not included in the local lists. If it's removed from the TomSelect while still present in the file as a local package or asset, the field in the currently selected node referencing this local package or asset will be set to a blank string. Example, editing an asset include/exclude field would otherwise cause the parent `assetId` field to be cleared if that asset is local. However, this is desired behavior if the parent node references a pkg/asset that has actually been removed from the local file.
	[pkgDependencySelect, variantDependencySelect].forEach(tsControl => {
		let allOpts = tsControl.options
		for (const key in allOpts) {
			if (allOpts[key].channel === 'local' && !localPackages.includes(allOpts[key].id)) {
				tsControl.removeOption(key);
			}
		}
		localPackages.forEach(pkg => {
			if (!Object.hasOwn(allOpts, pkg)) {
				tsControl.addOption({ value: pkg, id: pkg, channel: 'local' });
			}
		});
	});
	[pkgAssetSelect, variantAssetSelect].forEach(tsControl => {
		let allOpts = tsControl.options
		for (const key in allOpts) {
			if (allOpts[key].channel === 'local' && !localAssets.includes(allOpts[key].id)) {
				tsControl.removeOption(key);
			}
		}
		localAssets.forEach(asset => {
			if (!Object.hasOwn(allOpts, asset)) {
				tsControl.addOption({ value: asset, id: asset, channel: 'local' });
			}
		});
	});
	//pkgDependencySelect.addOptions(localPackages.map(p => ({ value: p, id: p, channel: 'local' })));
	//variantDependencySelect.addOptions(localPackages.map(p => ({ value: p, id: p, channel: 'local' })));
	//pkgAssetSelect.addOptions(localAssets.map(a => ({ value: a, id: a, channel: 'local' })));
	//variantAssetSelect.addOptions(localAssets.map(a => ({ value: a, id: a, channel: 'local' })));

	if (dumpData) {
		cm.off('change', CodeMirrorOnChange);
		cm.setValue(DumpYaml());
		cm.on('change', CodeMirrorOnChange);
	}
	
	SetSelectedDoc(currDocIdx);
	UpdateMainTree();
	UpdateVariantTree();
	UpdateVariantAssetTree();

	function DumpYaml() {
		if (yamlData.length === 0) {
			return '';
		} else {
			let newYaml = '';
			let docu = '';
			for (let idx = 0; idx < yamlData.length; idx++) {
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
	let idx = 1;
	let astList = [];
	localAssets.forEach((asset) => {
		astList.push({ name: CreateAssetTreeName(idx, asset), children: [] });
		idx++;
	});

	idx = 1;
	let pkgList = [];
	localPackages.forEach((pkg) => {
		pkgList.push({ name: CreatePackageTreeName(idx, pkg), children: [] });
		idx++;
	});

	const mainTreeData = [
		{ name: 'Packages (' + pkgList.length + ')', expanded: true, children: pkgList },
		{ name: 'Assets (' + astList.length + ')', expanded: true, children: astList }
	];
	mtv = new TreeView(mainTreeData, document.getElementById('MainTreeView'));
	const leaves = mtv.node.querySelectorAll('.tree-leaf');
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

	function CreatePackageTreeName(id, pkg) {
		return id + ' - ' + pkg;
	}

	mtv.on("select", function (t) {
		leaves.forEach(function (leaf) {
			if (!(leaf instanceof HTMLElement)) return;
			leaf.classList.remove('selected');
		})
		leaf = t.target.target.closest('.tree-leaf');
		leaf.classList.add('selected');

		let selectedIdx;
		if (t.data.name.indexOf('(') > 0) { //A heading category was selected
			return;
		} else if (t.data.name.indexOf(':') > 0) { //Packages have a colon in their name - assets do not
			selectedIdx = t.data.name.slice(0, t.data.name.indexOf(' '));
			if (document.querySelector(".nav-link.active").id === 'AssetPropertiesTab') {
				SelectTab('PackagePropertiesTab');
			}

			SetSelectedDoc(selectedIdx - 1, 'p');
			FillPackageForm();
			UpdateIncludedAssetTree();
			UpdateVariantTree();
		} else {
			selectedIdx = t.data.name.slice(0, t.data.name.indexOf(' '));
			SelectTab('AssetPropertiesTab');

			SetSelectedDoc(selectedIdx - 1, 'a');
			FillAssetForm();
		}
		SetTabState();
	});
}

function UpdateIncludedAssetTree() {
	let pkgAssets = [];
	if (selectedDoc !== null && selectedDoc.get('assets') !== undefined) {
		pkgAssets = selectedDoc.get('assets').toJSON().map((i) => ({ name: i.assetId, children: [] }));
	}

	const pkgAssetData = [{ name: 'Assets (' + pkgAssets.length + ')', expanded: true, children: pkgAssets }]
	atv = new TreeView(pkgAssetData, 'AssetTreeView');
	atv.on("select", function (t) {
		FillIncludedAssetForm(t.data.name);
	});
}

function UpdateVariantTree() {
	let pkgVariants = [];
	let variants = [];
	if (selectedDoc !== null && selectedDoc.get('variants') !== undefined) {
		variants = selectedDoc.get('variants').items;
		for (let idx = 0; idx < variants.length; idx++) {
			let variant = variants[idx].get('variant').items; // a variant can have one or more key-value pairs
			let title = idx + ' - ' + variant.map(v => v.value.value).join(' - '); //▸
			pkgVariants.push({ name: title, expanded: false, children: [] })
		}

		if (selectedVariantIdx !== null) {
			let kvSets = variants[selectedVariantIdx].get('variant').items;
			let kvTitle = kvSets.map(kv => kv.key.value + ': ' + kv.value.value).join(', ');
			document.getElementById('CurrentVariantId').innerHTML = kvTitle;
			document.getElementById('CurrentVariantId2').innerHTML = kvTitle;
		}
	}

	const pkgVariantsData = [{ name: 'Variants (' + pkgVariants.length + ')', expanded: true, children: pkgVariants }]
	vtv = new TreeView(pkgVariantsData, 'VariantTreeView');
	vtv.on("select", function (t) {
		ResetVariantForm();
		let selectedItem = t.data.name;
		selectedVariantIdx = Number(selectedItem.substring(0, selectedItem.indexOf(' ')));

		let kvSets = variants[selectedVariantIdx].get('variant').items;
		let kvTitle = kvSets.map(kv => kv.key.value + ': ' + kv.value.value).join(', ');
		document.getElementById('CurrentVariantId').innerHTML = kvTitle;
		document.getElementById('CurrentVariantId2').innerHTML = kvTitle;

		FillVariantForm();
		ResetVariantAssetForm();
		UpdateVariantAssetTree();
	});
}

function UpdateVariantAssetTree() {
	let variantAssets = [];
	if (selectedDoc !== null && selectedDoc.get('variants') !== undefined) {
		let variant = selectedDoc.get('variants').items[selectedVariantIdx];

		//The assets list may be undefined if it's a new variant the user just created
		if (variant !== undefined && variant.get('assets') !== undefined) {
			let assets = variant.get('assets').items;
			for (let idx = 0; idx < assets.length; idx++) {
				let asset = assets[idx];
				let assetId = asset.get('assetId');

				variantAssets.push({ name: idx + ' - ' + assetId, expanded: false, children: [] })
			}
		}
	}

	let variantAssetData = [{ name: 'Assets (' + variantAssets.length + ')', expanded: true, children: variantAssets }]
	vatv = new TreeView(variantAssetData, 'VariantAssetTreeView');
	vatv.on("select", function (t) {
		ResetVariantAssetForm();
		let selectedItem = t.data.name;
		selectedVariantAssetIdx = Number(selectedItem.substring(0, selectedItem.indexOf(' ')));
		let assetName = selectedItem.substring(selectedItem.indexOf(' - ') + 3);
		document.getElementById('CurrentVariantAssetId').innerHTML = assetName;
		
		FillVariantAssetForm();
		console.log(selectedItem + ' clicked');
	});
}





//TODO - validate YAML in code pane for valid yaml syntax
//TODO - validate YAML in code pane for valid sc4pac schema
function validate() {
	//ensure any manually typed yaml (as opposed to generated yaml) is syntactically valid
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
 * @param {string} [type] Specify 'p' for package, 'a' for asset, or omit to return either type. Set to null to clear the currently selected doc.
 */
function SetSelectedDoc(index, type) {
	let docs;
	if (index === undefined) {
		index = 0;
	}
	if (index < 0 || index === null) {
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