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
 * Determine whether the specified item contains the properties of a sc4pac Package. A unique package is determined by its `group` and `name` property combination.
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
	if (obj === undefined) {
		return 'undefined';
	}
	return obj.__proto__.constructor.name
}
/**
 * Determine whether the specified item is an Object.
 * @param {any} obj An item to analyze
 * @returns TRUE if the item is an object; FALSE otherwise.
 */
function IsObject(obj) {
	return (typeof obj === "object" && !Array.isArray(obj) && obj !== null);
}
/**
 * Update (or delete) a YAML sequence field on `yamlItem` using the current value of a TomSelect control. Handles creating the sequence if it doesn't exist, repopulating it if it does, and deleting it when empty.
 * @param {Object} yamlItem The YAML map item that owns `fieldName`
 * @param {string} fieldName Field name of the sequence to update in `yamlItem`
 * @param {string} value Value to set
 */
function UpdateYamlSeqField(yamlItem, fieldName, value) {
	if (value !== '') {
		if (yamlItem.get(fieldName) === undefined) {
			const seq = selectedDoc.createNode([value]);
			seq.type = 'SEQ';
			yamlItem.set(fieldName, seq);
		} else {
			yamlItem.get(fieldName).items = [];
			value.split(',').forEach(v => yamlItem.get(fieldName).add(v));
		}
	} else if (yamlItem.has(fieldName)) {
		yamlItem.delete(fieldName);
	}
}
/**
 * Populate a creatable TomSelect control from a YAML sequence field. Adds both the option and the selected item for each entry in the sequence.
 * @param {Object} yamlItem The YAML map item that owns `fieldName`
 * @param {string} fieldName The key of the sequence field on `yamlItem`
 * @param {TomSelect} selectControl The TomSelect control to populate
 */
function FillTomSelectFromYamlSeq(yamlItem, fieldName, selectControl) {
	if (yamlItem.has(fieldName)) {
		yamlItem.get(fieldName).items.forEach(item => {
			selectControl.addOption({ value: item.value, text: item.value });
			selectControl.addItem(item.value, true);
		});
	}
}
/**
 * Mark the clicked leaf in the indicated `treeView` as selected. Called at the start of every tree-view `select` event handler.
 * @param {TreeView} treeView The tree view instance
 * @param {Object} t The event object passed to the `select` callback
 */
function SelectTreeLeaf(treeView, t) {
	treeView.node.querySelectorAll('.tree-leaf').forEach(leaf => leaf.classList.remove('selected'));
	t.target.target.closest('.tree-leaf').classList.add('selected');
}
/**
 * Calculate similarity between two strings
 * @license https://github.com/stephenjjbrown/string-similarity-js (MIT)
 * @param {string} str1 First string to match
 * @param {string} str2 Second string to match
 * @param {number} [substringLength=2] Optional. Length of substring to be used in calculating similarity. Default 2.
 * @param {boolean} [caseSensitive=false] Optional. Whether you want to consider case in string matching. Default false;
 * @returns Number between 0 and 1, with 0 being a low match score.
 */
function StringSimilarity(str1, str2, substringLength = 2, caseSensitive = false) {
	if (!caseSensitive) {
		str1 = str1.toLowerCase();
		str2 = str2.toLowerCase();
	}

	if (str1.length < substringLength || str2.length < substringLength)
		return 0;

	const map = new Map();
	for (let i = 0; i < str1.length - (substringLength - 1); i++) {
		const substr1 = str1.substring(i, substringLength);
		map.set(substr1, map.has(substr1) ? map.get(substr1) + 1 : 1);
	}

	let match = 0;
	for (let j = 0; j < str2.length - (substringLength - 1); j++) {
		const substr2 = str2.substring(j, substringLength);
		const count = map.has(substr2) ? map.get(substr2) : 0;
		if (count > 0) {
			map.set(substr2, count - 1);
			match++;
		}
	}

	return (match * 2) / (str1.length + str2.length - ((substringLength - 1) * 2));
}
