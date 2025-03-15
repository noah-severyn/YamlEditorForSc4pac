import * as YAML from 'https://cdn.skypack.dev/yaml';
window.YAML = YAML;

/**
 * List of assets from all channels
 */
let AllAssets = new Array();
/**
 * List of package ids from all channels
 */
let AllPackages = new Array();
/**
 * List of package groups from all channels
 */
let AllGroups = new Array();
/**
 * List of subfolders inside the Plugins folder into which a package is installed
 */
let PackageSubfolders = new Array();

const ChannelInfo = [
	{ name: 'default', url: 'https://memo33.github.io/sc4pac/channel/sc4pac-channel-contents.json', label: 'Default channel' },
    { name: 'zasco', url: 'https://zasco.github.io/sc4pac-channel/channel/sc4pac-channel-contents.json', label: 'Zasco\'s channel' },
    { name: 'simtrop', url: 'https://sc4pac.simtropolis.com/sc4pac-channel-contents.json', label: 'Simtropolis channel' },
    { name: 'local', url: null, label: 'This file' }
];
for (const channel of ChannelInfo) {
    if (channel.url !== null) {
        await fetch(channel.url)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok ' + response.statusText);
                }
                return response.json();
            })
            .then(data => {
                if (channel.name === 'default') {
                    PackageSubfolders.push(data.stats.categories.map(item => item.category));
                }
                AllAssets = AllAssets.concat(data.assets.map(item => channel.name + '|' + item.name));
                AllPackages = AllPackages.concat(data.packages.map(item => channel.name + '|' + item.group + ':' + item.name));
                AllGroups = AllGroups.concat(data.packages.map(item => channel.name + '|' + item.group));
            })
            .catch(error => {
                console.error('There was a problem fetching data from ' + channel.url + ':', error);
            });
	}
};

AllGroups = [...new Set(AllGroups)]; // returns unique values
console.log(PackageSubfolders);

new TomSelect('#PackageGroup', {
	maxItems: 1,
	create: true,
	preload: true,
	persist: false,
	maxOptions: null,

	options: AllGroups.map(g => ({ value: g.split("|")[1], text: g.split("|")[1] })),
	render: {
		option: function (item, escape) {
			return '<div class="py-2 d-flex">' + escape(item.text) + '</div>';
		}
	},
});

new TomSelect('#PackageSubfolder', {
	maxItems: 1,
	options: PackageSubfolders.map(folder => ({ value: folder, text: folder })),
	render: {
		option: function (item, escape) {
			return '<div class="py-2 d-flex">' + escape(item.text) + '</div>';
		}
	},
});

new TomSelect("#PackageDependencies", {
	create: false,
	valueField: 'id',
	labelField: 'id',
	searchField: ['id'],
	optgroups: ChannelInfo,
	optgroupValueField: 'name',
	optgroupField: 'channel',

	options: AllPackages.map(pkg => ({ id: pkg.split("|")[1], channel: pkg.split("|")[0] })),

	render: {
		option: function (item, escape) {
			return '<div class="py-2 d-flex">' + escape(item.id) + '</div>';
		},
		optgroup_header: function (data, escape) {
			return '<div class="optgroup-label">' + escape(data.label) + '</span></div>';
		}
	}
});

new TomSelect("#PackageImages", {
	persist: false,
	createOnBlur: true,
	create: true
});

new TomSelect("#PackageAssetId", {
	create: false,
	valueField: 'id',
	labelField: 'id',
	searchField: ['id'],
	optgroups: ChannelInfo,
	optgroupValueField: 'name',
	optgroupField: 'channel',

	options: AllAssets.map(pkg => ({ id: pkg.split("|")[1], channel: pkg.split("|")[0] })),

	render: {
		option: function (item, escape) {
			return '<div class="py-2 d-flex">' + escape(item.id) + '</div>';
		},
		optgroup_header: function (data, escape) {
			return '<div class="optgroup-label">' + escape(data.label) + '</span></div>';
		}
	}
});

new TomSelect("#VariantDependencies", {
	create: false,
	valueField: 'id',
	labelField: 'id',
	searchField: ['id'],
	optgroups: ChannelInfo,
	optgroupValueField: 'name',
	optgroupField: 'channel',

	options: AllPackages.map(pkg => ({ id: pkg.split("|")[1], channel: pkg.split("|")[0] })),

	render: {
		option: function (item, escape) {
			return '<div class="py-2 d-flex">' + escape(item.id) + '</div>';
		},
		optgroup_header: function (data, escape) {
			return '<div class="optgroup-label">' + escape(data.label) + '</span></div>';
		}
	}
});


new TomSelect("#VariantAssetId", {
	create: false,
	valueField: 'id',
	labelField: 'id',
	searchField: ['id'],
	optgroups: ChannelInfo,
	optgroupValueField: 'name',
	optgroupField: 'channel',

	options: AllAssets.map(pkg => ({ id: pkg.split("|")[1], channel: pkg.split("|")[0] })),

	render: {
		option: function (item, escape) {
			return '<div class="py-2 d-flex">' + escape(item.id) + '</div>';
		},
		optgroup_header: function (data, escape) {
			return '<div class="optgroup-label">' + escape(data.label) + '</span></div>';
		}
	}
});

//window.ChannelInfo = ChannelInfo;
//window.PackageSubfolders = PackageSubfolders;
//window.AllAssets = AllAssets;
//window.AllPackages = AllPackages;
//window.AllGroups = [...new Set(AllGroups)];
window.pkgSubfolderSelect = document.getElementById("PackageSubfolder").tomselect;
window.pkgGroupSelect = document.getElementById('PackageGroup').tomselect;
window.pkgDependencySelect = document.getElementById("PackageDependencies").tomselect;
window.pkgImageSelect = document.getElementById("PackageImages").tomselect;
window.pkgAssetSelect = document.getElementById("PackageAssetId").tomselect;
window.variantAssetSelect = document.getElementById("VariantAssetId").tomselect;
window.variantPackageSelect = document.getElementById("VariantDependencies").tomselect;