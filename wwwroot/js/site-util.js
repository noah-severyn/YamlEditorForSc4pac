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
	} else if (TypeOf(obj) === 'Document') {
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
	} else if (TypeOf(obj) === 'Document') {
		return obj.has('group') && obj.has('name');
	} else {
		return Object.hasOwn(obj, 'group') && Object.hasOwn(obj, 'name');
	}
}
/**
 * Return the name of the object's constructor. A more precise substitute for the built-in typeof().
 * @param {Object} obj An Object to analyze
 * @returns The name of the object's constructor as a string
 */
function TypeOf(obj) {
	return obj.__proto__.constructor.name
}