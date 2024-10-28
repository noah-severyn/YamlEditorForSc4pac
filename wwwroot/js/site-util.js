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
 * Determine whether the specified object contains the properties of a sc4pac Asset.
 * @param {Object} obj The object to analyze
 * @returns TRUE if the object represents an Asset; FALSE otherwise
 */
function IsAsset(obj) {
	if (obj === null || obj === undefined) {
		return false;
	}
	return Object.hasOwn(obj, 'assetId') && Object.hasOwn(obj, 'lastModified') && Object.hasOwn(obj, 'url') && Object.hasOwn(obj, 'version');
}


/**
 * Determine whether the specified object contains the properties of a sc4pac Package.
 * @param {Object} obj The object to analyze
 * @returns TRUE if the object represents a Package; FALSE otherwise
 */
function IsPackage(obj) {
	if (obj === null || obj === undefined) {
		return false;
	}
	return Object.hasOwn(obj, 'group') && Object.hasOwn(obj, 'name') && Object.hasOwn(obj, 'version') && Object.hasOwn(obj, 'subfolder');
}


/**
 * Return the currently selected package or asset document object from the YAML data.
 * @param {string} type The type of document to return. 'p' for packages and 'a' for assets.
 * @returns The currently selected document object of the specified type
 */
function GetCurrentDocument(type) {
	if (type.toLowerCase().charAt(0) === 'p') {
		if (currPackageIdx !== '0') {
			return yamlData.filter((doc) => IsPackage(doc))[currPackageIdx - 1];
		}
	} else {
		if (currAssetIdx !== '0') {
			return yamlData.filter((doc) => IsAsset(doc))[currAssetIdx - 1];
		}
	}
	return null;
}