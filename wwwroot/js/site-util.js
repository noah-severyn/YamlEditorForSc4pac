// --------------------------------------------------------------------------------------------------------------------
// -----------------------------------------------   Helper Functions   -----------------------------------------------
// --------------------------------------------------------------------------------------------------------------------
/**
 * Convert an array to the format used in input boxes for user input.
 * @param {Array} itemList List to process
 * @returns A single string, each item on a new line, semicolon delineated.
 */
function ArrayToText(itemList) {
	if (itemList === undefined || itemList === null) {
		return '';
	}

	var output = '';
	itemList.forEach((item) => {
		output = output + item + ';\n';
	});
	return output.slice(0, -1); //Remove the final \n
}


/**
 * Convert text to a properly formatted string array.
 * @param {string} text Semicolon delimited string to process
 * @returns An array of strings
 */
function TextToArray(text) {
	if (text === '' || text === null || text === undefined) {
		return null;
	}
	return text.replaceAll('\n', '').replaceAll('"', '').split(';').filter((item) => item !== '');
}


/**
 * Determine whether the specified object contains the properties of a sc4pac Asset. A unique asset is determined by its `assetId` property.
 * @param {Object} obj The object to analyze
 * @returns TRUE if the object represents an Asset; FALSE otherwise
 */
function IsAsset(obj) {
	if (obj === null || obj === undefined) {
		return false;
	}
	return Object.hasOwn(obj, 'assetId');
}


/**
 * Determine whether the specified object contains the properties of a sc4pac Package. A unique package is determined by it's `group` and `name` property combination.
 * @param {Object} obj The object to analyze
 * @returns TRUE if the object represents a Package; FALSE otherwise
 */
function IsPackage(obj) {
	if (obj === null || obj === undefined) {
		return false;
	}
	return Object.hasOwn(obj, 'group') && Object.hasOwn(obj, 'name');
}