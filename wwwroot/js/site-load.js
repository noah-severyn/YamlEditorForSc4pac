

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
let AllSubfolders = new Array();
/**
 * List of all channels to use to initially load content. Note the order these are listed in is important to establish precedence when searching for a given package or asset id in an unknown channel. If given an id that could appear in multiple channels, we want to prioritize local first, then the default channel, then st-channel and sc4e-channel, then any other channels the user might have added.
 */
const ChannelInfo = [
	{ name: 'local', url: null, label: 'This file' },
	{ name: 'default', url: 'https://memo33.github.io/sc4pac/channel/sc4pac-channel-contents.json', label: 'Default channel' },
	{ name: 'simtrop', url: 'https://sc4pac.simtropolis.com/sc4pac-channel-contents.json', label: 'Simtropolis channel' },
    { name: 'zasco', url: 'https://zasco.github.io/sc4pac-channel/channel/sc4pac-channel-contents.json', label: 'Zasco\'s channel' },
];
LoadData();


async function LoadData() {
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
                        AllSubfolders = data.stats.categories.map(item => item.category);
                    }
                    AllAssets = AllAssets.concat(data.assets.map(item => ({ id: item.name, channel: channel.name })));
                    AllPackages = AllPackages.concat(data.packages.map(item => ({ id: item.group + ':' + item.name, channel: channel.name })));
                    AllGroups = AllGroups.concat(data.packages.map(item => item.group));
                })
                .catch(error => {
                    console.error('There was a problem fetching data from ' + channel.url + ':', error);
                });
        }
    };
    AllGroups = [...new Set(AllGroups)]; // returns unique values

    pkgGroupSelect.addOptions(AllGroups.map(grp => ({ value: grp, text: grp })));
    pkgSubfolderSelect.addOptions(AllSubfolders.map(fldr => ({ value: fldr, text: fldr })));
    pkgDependencySelect.addOptions(AllPackages.map(pkg => ({ value: pkg.id, id: pkg.id, channel: pkg.channel })));
    pkgAssetSelect.addOptions(AllAssets.map(asset => ({ value: asset.id, id: asset.id, channel: asset.channel })));
    variantDependencySelect.addOptions(AllPackages.map(pkg => ({ value: pkg.id, id: pkg.id, channel: pkg.channel })));
    variantAssetSelect.addOptions(AllAssets.map(asset => ({ value: asset.id, id: asset.id, channel: asset.channel })));

    //AllGroups.map(g => ({ value: g.split("|")[1], text: g.split("|")[1] })),
    //AllPackages.map(pkg => ({ value: pkg, id: pkg.split("|")[1], channel: pkg.split("|")[0] })),
    //AllAssets.map(asset => ({ value: asset, id: asset.split("|")[1], channel: asset.split("|")[0] })),
}