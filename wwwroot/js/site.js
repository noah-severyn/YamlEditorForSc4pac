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
var pacAssets = new Array();
var pacPackages = new Array();
var sc4pacdata = FetchSc4pacData().then(result => {
	sc4pacdata = result.contents;
	pacAssets = result.contents.filter((item) => item.group === 'sc4pacAsset');
	pacPackages = result.contents.filter((item) => item.group !== 'sc4pacAsset');
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
const cm = document.querySelector('.CodeMirror').CodeMirror;
var yamlData = null;
var countOfPackages = 0;
var countOfAssets = 0;
var listOfAssets = new Array();
var listOfPackages = new Array();
ParseYaml();
ClearAssetInputs();
ClearPackageInputs();

new TomSelect('#PacPackageList', {
	valueField: 'id',
	labelField: 'id',
	searchField: ['id'],

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
				console.log(json.contents
					.filter((item) => item.group !== 'sc4pacAsset')
					.map(i => ({ id: i.group + ":" + i.name, ...i }))
				);
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

new TomSelect('#PackageSubfolder', {
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
				console.log(subfolders)
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
new TomSelect('#PackageGroup', {
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
				console.log(json.contents
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
	CountItems();
	UpdateMainTree();
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
		if (t.data.name.indexOf(' - ') > 0) {
			if (t.data.name.indexOf(':' > 0)) {
				currPackageIdx = t.data.name.slice(0, t.data.name.indexOf(' '));
				FillPackageForm();
				UpdateAssetTree();
			} else {
				currAssetIdx = t.data.name.slice(0, t.data.name.indexOf(' '));
				FillAssetForm();
			}
		}
	});
}

function UpdateAssetTree() {
	var pkgAssets;
	var doc = GetCurrentDocument('p');
	if (doc == null) {
		pkgAssets = [];
	} else {
		pkgAssets = doc.assets.map((i) => ({ name: i.assetId, children: [] }));
	}

	var pkgAssetData = [{ name: 'Assets (' + pkgAssets.length + ')', expanded: true, children: pkgAssets }]
	atv = new TreeView(pkgAssetData, 'AssetTreeView');
	atv.on("select", function (t) {
		FillPackageAssetForm(t.data.name);
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

	//Pachage dependency selection for local packages
	var localPkgList = document.getElementById('LocalPackageList');
	localPkgList.replaceChildren();
	localPkgList.appendChild(new Option('', ''));
	for (var idx = 0; idx < listOfPackages.length; idx++) {
		var pkgName = listOfPackages[idx].group + ":" + listOfPackages[idx].name;
		localPkgList.add(new Option(pkgName, pkgName));
	}

	//Package:asset selection for local assets
	var localAssetList = document.getElementById('SelectLocalPackageAssets');
	localAssetList.replaceChildren();
	localAssetList.appendChild(new Option('', ''));
	listOfAssets.forEach(i => localAssetList.add(new Option(i.assetId, i.assetId)));

	//Package:asset selection for existing sc4pac assets
	var pacAssetList = document.getElementById('SelectPacPackageAssets');
	pacAssetList.replaceChildren();
	pacAssetList.appendChild(new Option('', ''));
	pacAssets.forEach(i => pacAssetList.add(new Option(i.name, i.name)));


	document.getElementById('CurrentItemCount').innerHTML = 'This file contains: ' + countOfPackages + ' packages, ' + countOfAssets + ' assets'
}


function UpdateCodePane() {
	var newYaml = '';
	var doc = '';
	//TODO - figure out how to retain comments

	for (var idx = 0; idx < yamlData.length; idx++) {
		if (yamlData[idx] === null) {
			continue;
		}
		doc = jsyaml.dump(yamlData[idx], {
			'lineWidth': -1,
			'quotingType': '"',
			'noArrayIndent': true,
			'forceQuotes': true
		});
		//The parser blows away the multiline context so we need to rebuild it :(
		if (doc.indexOf('description: ') > 0) {
			
			var rgx = new RegExp('description: \"(.*?)\"');
			var oldText = doc.match(rgx)[0];
			var newText = oldText.replace('description: "', "description: >\n    ").replaceAll('\\n', '\n    ').replace('"','');
			doc = doc.replace(oldText, newText);
		}

		newYaml = newYaml + doc;
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