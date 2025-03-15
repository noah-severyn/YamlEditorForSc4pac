// --------------------------------------------------------------------------------------------------------------------
// -----------------------------------------------   Helper Functions   -----------------------------------------------
// --------------------------------------------------------------------------------------------------------------------
/**
 * Determine whether the specified document contains the properties of a sc4pac Asset. A unique asset is determined by its `assetId` property.
 * @param {Object} obj A YAML.Document or Object to analyze
 * @returns TRUE if the document represents an Asset; FALSE otherwise
 */
function IsAsset(obj) {
	if (obj === null || obj === undefined) {
		return false;
	} else if (obj.__proto__.constructor.name === 'Document') {
		return obj.has('assetId');
	} else {
		return Object.hasOwn(obj, 'assetId');
	}
}
/**
 * Determine whether the specified item contains the properties of a sc4pac Package. A unique package is determined by it's `group` and `name` property combination.
 * @param {Object} obj A YAML.Document or Object to analyze
 * @returns TRUE if the document represents a Package; FALSE otherwise
 */
function IsPackage(obj) {
	if (obj === null || obj === undefined) {
		return false;
	} else if (obj.__proto__.constructor.name === 'Document') {
		return obj.has('group') && obj.has('name');
	} else {
		return Object.hasOwn(obj, 'group') && Object.hasOwn(obj, 'name');
	}
}
/**
 * Returns a cleaned array representing the currently selected values
 * @param {string} value A comma separated value with the current selections
 * @returns An array of the selected values
 */
function TomSelectValueToArray(value) {
	return value.split(',').map(v => v.split('|')[1]);
}

/**
 * Gets a valid TomSelect value from the specified package or asset id. Runs through each of the available channels in the following order until a match is found: default → st-channel → other channels
 * @param {string} id A package or asset id
 * @returns The id prefixed with the channel name, separated with a pipe
 */
function GetTomSelectValue(id) {
	if (id.indexOf(':') > 0) {
		let idxDefault = AllPackages.indexOf('default|' + id);
		let idxSimtrop = AllPackages.indexOf('simtrop|' + id);

		if (Math.max(idxDefault, idxSimtrop) === -1) {
			return 'local|' + id;
		} else {
			return AllPackages[Math.min(...[idxDefault, idxSimtrop].filter(i => i > 0))];
		}
	}
	
}