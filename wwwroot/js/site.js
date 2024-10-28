// Please see documentation at https://learn.microsoft.com/aspnet/core/client-side/bundling-and-minification
// for details on configuring this project to bundle and minify static web assets.


//Initialize required items (these are run as top-level statements)
CodeMirror(document.querySelector('#editor'), {
	lineNumbers: true,
	tabSize: 2,
	lineWrapping: true,
	value:
		`#Use the inputs on the left to generate YAML or paste an existing script here and parse it to begin modifications.
group: "b62"
name: "sears-grand"
version: "4.1"
subfolder: "300-commercial"
info:
  summary: "Ploppable Sears superstore and shopping center"
  description: >
    Sears Grand is a one-stop home and family solution center that delivers a mix of quality products
    such as Sears' proprietary and national brands that no other store provides.
    Everything busy people need to maintain their family on-the-go can conveniently be found here under one roof.
    Bigger than Wal-Mart Supercenters, Sears Grand help customers navigate through their spacious 165,000 to 210,000 square foot stores easily.
    Sears Grand is a one-level store that carries everything from milk to refrigerators, bathing suits to sun block and car seats to baby food -
    they also are the only store to carry their Craftsman, and Kenmore products.
    Shoppers will also find an array of convenient services at Sears Grand including:
    auto center, custom paint mixing, window blind cutting and key cutting.

    This package contains two variants: one with Diggis ponds (three ploppable CS$/CS$$ lots: 16x13, 19x9, 3x13) and one without (two ploppable CS$$ lots: 14x13, 16x9).
    The lots must be placed side-by-side to form a seamless big megalot.
  author: "Bobbo662, nos.17"
  images:
  - "https://www.simtropolis.com/objects/screens/monthly_2024_08/sears-grand-4.png.cf4c540f9cd0f2ea026cb809f0605da4.png"
  - "https://www.simtropolis.com/objects/screens/monthly_2024_08/sears-grand-1.png.5c1333d82e33a2248ff9e95107093223.png"
  - "https://www.simtropolis.com/objects/screens/monthly_2024_08/sears-grand-2.png.c9f095c40629f2878e93555a3c56d27b.png"
  - "https://www.simtropolis.com/objects/screens/monthly_2024_08/sears-grand-3.png.8262cd6d86fdc6598cee56527da2d92a.png"
  - "https://www.simtropolis.com/objects/screens/monthly_2024_08/sears-grand-5.png.f198b19b84cb4db3910e2bd38ac09126.png"
  - "https://www.simtropolis.com/objects/screens/monthly_2024_08/sears-grand-6.png.1c687ebd3ad8de9e1e04d9998b9eaa73.png"
  - "https://www.simtropolis.com/objects/screens/monthly_2024_08/sears-grand-7.png.fd2db200912f835d1f58a220986e3552.png"
  - "https://www.simtropolis.com/objects/screens/monthly_2024_08/sears-grand-8.png.3cc670a9e38bf2ca9eb5d3a875c7a86b.png"
  - "https://www.simtropolis.com/objects/screens/monthly_2024_08/sears-grand-9.png.ad6e35186e5ab7ce88439463e4f5a5c5.png"
  website: "https://community.simtropolis.com/files/file/30745-b62-remastered-sears-grand/"
dependencies:
- "bsc:mega-props-cp-vol01"
- "bsc:mega-props-cp-vol02"
- "bsc:mega-props-sg-vol01"
- "lbt:mega-prop-pack-vol01"
- "shk:parking-pack"
- "nos17:essentials"
- "supershk:mega-parking-textures"
- "supershk:fa3-parking-textures"
- "mushymushy:na-53ft-trailers-vol1"
- "girafe:berries"
- "girafe:honey-locust"
- "girafe:lupins"
- "girafe:maples-v2"
- "girafe:rowan-trees"
- "blam:zaxbys-model"
variants:
- variant:
    b62:sears-grand:style: "no-pond"
  assets:
  - assetId: "b62-sears-grand"
    include:
    - "/KEEP ONE ... Non-Diggis Version/"
    - "/B62-SearsGrand/B62-SearsGrand/"
- variant:
    b62:sears-grand:style: "pond"
  assets:
  - assetId: "b62-sears-grand"
    include:
    - "/KEEP ONE ... Diggis Version/"
    - "/B62-SearsGrand/B62-SearsGrand/"
  dependencies:
  - "bsc:mega-props-kevdan25-vol01"
  - "bsc:mega-props-diggis-canals-streams-and-ponds"

---
url: "https://community.simtropolis.com/files/file/30745-b62-remastered-sears-grand/?do=download&r=204044"
assetId: "b62-sears-grand"
version: "4.1"
lastModified: "2024-10-23T22:33:23Z"
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

const cm = document.querySelector('.CodeMirror').CodeMirror;
var yamlData = null;
var countOfPackages = 0;
var countOfAssets = 0;
var listOfAssets = new Array();
var listOfPackages = new Array();
var listOfGroups = new Array();
ParseYaml();
ResetAssetInputs();
ResetPackageInputs();



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
				console.log(json.contents.filter((item) => item.group === 'sc4pacAsset'));
				console.log(sc4pacAssets.map(i => ({ id: i.name, ...i })));
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
			if (t.data.name.indexOf(':') > 0) { //Packages have a colon in their name - assets do not
				currPackageIdx = t.data.name.slice(0, t.data.name.indexOf(' '));
				(new bootstrap.Tab(document.getElementById('PackagePropertiesTab'))).show();
				FillPackageForm();
				UpdateIncludedAssetTree();
				UpdateVariantTree();
			} else {
				currAssetIdx = t.data.name.slice(0, t.data.name.indexOf(' '));
				(new bootstrap.Tab(document.getElementById('AssetPropertiesTab'))).show();
				FillAssetForm();
			}
		}
	});
}

function UpdateIncludedAssetTree() {
	var pkgAssets;
	var doc = GetCurrentDocument('p');
	if (doc == null || doc.assets == null) {
		pkgAssets = [];
	} else {
		pkgAssets = doc.assets.map((i) => ({ name: i.assetId, children: [] }));
	}

	var pkgAssetData = [{ name: 'Assets (' + pkgAssets.length + ')', expanded: true, children: pkgAssets }]
	atv = new TreeView(pkgAssetData, 'AssetTreeView');
	atv.on("select", function (t) {
		FillIncludedAssetForm(t.data.name);
	});
}

function UpdateVariantTree() {
	var pkgVariants;
	var doc = GetCurrentDocument('p');
	
	if (doc == null || doc.variants == null) {
		pkgVariants = [];
	} else {
		var pkgId = doc.group + ':' + doc.name + ':';
		let allVariantNames = doc.variants.map((v) => Object.keys(v.variant)[0]);
		let uniqueVariantNames = [...new Set(allVariantNames)]; //https://stackoverflow.com/a/33121880/10802255
		
		pkgVariants =
			uniqueVariantNames.map((uName) => ({
				name: uName.replace(pkgId, ''),
				expanded: true,
				//First find all with the current name, then return all the values (options) associated with that variant. Lastly format that list correctly for the tree view.
				children: doc.variants
					.filter((i) => Object.keys(i.variant)[0] === uName)
					.map((i) => Object.values(i.variant)[0])
					.map((i) => ({name: i, children: []}))
			}));
	}

	var pkgVariantsData = [{ name: 'Variants (' + pkgVariants.length + ')', expanded: true, children: pkgVariants }]
	vtv = new TreeView(pkgVariantsData, 'VariantTreeView');
	vtv.on("select", function (t) {
		let variantValue = t.data.name;
		//Must get the key of the clicked value as there's no guarantee that the value is unique within all of the package variants (e.g. if you click on style:pond, there could be a style2:pond)
		let variantKey = t.target.target.parentElement.parentElement.parentElement.parentElement.firstChild.textContent.substring(1)
		var ret = doc.variants.filter((i) =>
			(Object.keys(i.variant)[0] === pkgId + variantKey) &&
			(Object.values(i.variant)[0] === variantValue)
		)[0];
		FillVariantForm(ret);
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
	localAssetList.replaceChildren();
	localAssetList.appendChild(new Option('', ''));
	listOfAssets.forEach(i => localAssetList.add(new Option(i.assetId, i.assetId)));

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
			var newText = oldText.replace('description: "', "description: |\n    ").replaceAll('\\n', '\n    ').replaceAll('\n    \n', '\n\n').replace('"','');
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