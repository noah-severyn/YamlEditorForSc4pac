// Please see documentation at https://learn.microsoft.com/aspnet/core/client-side/bundling-and-minification
// for details on configuring this project to bundle and minify static web assets.


//Initialize required items (these are run as top-level statements)
CodeMirror(document.querySelector('#editor'), {
	lineNumbers: true,
	tabSize: 2,
	lineWrapping: true,
	value:
		`#Use the inputs on the left to generate YAML or paste an existing script here and parse it to begin modifications.

`,
	mode: 'yaml'
});

var currPackageIdx = '0';
var currAssetIdx = '0';
var sc4pacAssets = new Array();
var sc4pacPackages = new Array();
var sc4pacData = FetchSc4pacData().then(result => {
	sc4pacData = result.contents;
	sc4pacAssets = result.contents.filter((item) => item.group === 'sc4pacAsset');
	sc4pacPackages = result.contents.filter((item) => item.group !== 'sc4pacAsset');
});
//fetch('/config.json').then(function (config) {
//    console.log('API key:', config.apiKey);
//});


/**
 * Main Tree View
 */
var mtv;
/**
 * Asset Tree View
 */
var atv;
/**
 * Variant Tree View
 */
var vtv;
/**
 * Currently selected document in the main tree - may be a package or an asset
 */
var selectedDoc;

const cm = document.querySelector('.CodeMirror').CodeMirror;
var yamlData = null;
var countOfPackages = 0;
var countOfAssets = 0;
var listOfAssets = new Array();
var listOfPackages = new Array();
var listOfGroups = new Array();



new TomSelect('#PacPackageList', {
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
				//Filter the response to remove assets and add a new field combining the group and name
				callback(json.contents
					.filter((item) => item.group !== 'sc4pacAsset')
					.map(i => ({ id: i.group + ":" + i.name, ...i }))
				);
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
			return '<div class="py-2 d-flex">' + escape(item.group + ":" + item.name)+ '</div>';
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
				//Filter the response to remove assets and add a new field combining the group and name
				callback(json.contents
					.filter((item) => item.group !== 'sc4pacAsset')
					.map(i => ({ id: i.group + ":" + i.name, ...i }))
				);
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
				//Filter the response to remove assets and add a new field combining the group and name
				callback(json.contents
					.filter((item) => item.group === 'sc4pacAsset')
				);
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
                //Filter the response to remove assets
				callback(json.contents
					.filter((item) => item.group !== 'sc4pacAsset')
				);
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



ParseYaml();
ResetAssetInputs();
ResetPackageInputs();
ResetVariantInputs();



//TODO - validate YAML in code pane for valid yaml syntax
//TODO - validate YAML in code pane for valid sc4pac schema
//TODO - implement variants for packages


async function FetchSc4pacData() {
	const request = new Request('https://memo33.github.io/sc4pac/channel/sc4pac-channel-contents.json');
	const response = await fetch(request);
	return await response.json();
}
async function FetchSc4EvermoreData() {
	const request = new Request('https://www.sc4evermore.com/latest-modified-downloads.php');
	const response = await fetch(request);
	return await response.json();
}



/**
 * Parse the current YAML input and update the UI accordingly based on the count of packages and assets.
 */
function ParseYaml() {
	yamlData = jsyaml.loadAll(cm.getValue());
	selectedDoc = yamlData.filter((doc) => IsPackage(doc))[0];
	if (selectedDoc !== undefined) {
		FillPackageForm();
	}
	CountItems();
	UpdateMainTree();
	UpdateVariantTree();
}


//https://github.com/justinchmura/js-treeview
function UpdateMainTree() {
	var idx = 1;
	var astList = [];
	listOfAssets.forEach((asset) => {
		astList.push({ name: idx + ' - ' + asset.assetId, children: [] });
		idx++;
	});

	idx = 1;
	var pkgList = [];
	listOfPackages.forEach((pkg) => {
		pkgList.push({ name: idx + ' - ' + pkg.group + ":" + pkg.name, children: [] });
		idx++;
	});

	var mainTreeData = [
		{ name: 'Packages (' + pkgList.length + ')', expanded: true, children: pkgList },
		{ name: 'Assets (' + astList.length + ')', expanded: true, children: astList }
	];
	mtv = new TreeView(mainTreeData, 'MainTreeView');
	
	mtv.on("select", function (t) {
		if (t.data.name.indexOf(':') > 0) { //Packages have a colon in their name - assets do not
			currPackageIdx = t.data.name.slice(0, t.data.name.indexOf(' '));
			if (document.querySelector(".nav-link.active").value === 'Asset Properties') {
				(new bootstrap.Tab(document.getElementById('PackagePropertiesTab'))).show();
			}

			selectedDoc = yamlData.filter((doc) => IsPackage(doc))[currPackageIdx - 1];
			FillPackageForm();
			UpdateIncludedAssetTree();
			UpdateVariantTree();
		} else {
			currAssetIdx = t.data.name.slice(0, t.data.name.indexOf(' '));
			(new bootstrap.Tab(document.getElementById('AssetPropertiesTab'))).show();

			selectedDoc = yamlData.filter((doc) => IsAsset(doc))[currAssetIdx - 1];
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
}



/**
 * Count the number of Packages and Assets in the code pane and update the UI with this new result.
 */
function CountItems() {
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

	document.getElementById('CurrentItemCount').innerHTML = `This file contains: ${countOfPackages} package${(countOfPackages !== 1 ? 's' : '')}, ${countOfAssets} asset${(countOfAssets !== 1 ? 's' : '')}`;
}


function UpdateCodePane() {
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
			var newText = oldText.replace('description: "', "description: |\n    ").replaceAll('\\n', '\n    ').replaceAll('\n    \n', '\n\n').replace('"','');
			docu = docu.replace(oldText, newText);
		}

		newYaml = newYaml + docu;
		if (idx !== yamlData.length - 1) {
			newYaml = newYaml + '\n---\n';
		}
	}
	cm.setValue(newYaml);
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