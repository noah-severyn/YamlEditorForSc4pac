// --------------------------------------------------------------------------------------------------------------------
// -----------------------------------------------   Helper Functions   -----------------------------------------------
// --------------------------------------------------------------------------------------------------------------------
/**
 * Determine whether the specified object contains the properties of a sc4pac Asset. A unique asset is determined by its `assetId` property.
 * @param {YAML.Document} doc The Document to analyze
 * @returns TRUE if the object represents an Asset; FALSE otherwise
 */
function IsAsset(doc) {
	if (doc === null || doc === undefined) {
		return false;
	}
	return doc.has('assetId');
}


/**
 * Determine whether the specified object contains the properties of a sc4pac Package. A unique package is determined by it's `group` and `name` property combination.
 * @param {YAML.Document} doc The Document to analyze
 * @returns TRUE if the object represents a Package; FALSE otherwise
 */
function IsPackage(doc) {
	if (doc === null || doc === undefined) {
		return false;
	}
	return doc.has('group') && doc.has('name');
}