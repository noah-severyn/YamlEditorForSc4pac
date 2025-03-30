//one varaint is selectedDoc.get('variants').items[0]
//variant key is selectedDoc.get('variants').items[0].get('variant').items[0].key.value
//variant val is selectedDoc.get('variants').items[0].get('variant').items[0].value.value









//// --------------------------------------------------------------------------------------------------------------------
//// ---------------------------------------------------   Variants   ---------------------------------------------------
//// --------------------------------------------------------------------------------------------------------------------
/**
 * Resets the variant header and asset form fields.
 */
function ResetVariantInputs() {
	ResetVariantHeaderForm();
	ResetVariantAssetForm();
}


function UpdateVariantData(element) {
	let variantItem = selectedDoc.get('variants').items[selectedPkgVariantIdx];
	let newVal = element.value;

	if (element.id.startsWith('VariantName')) {
		//let idx = element.id.match(/\d+/g).map(Number)[0];
		let idx = element.id.substring(element.id.length - 1);

		//Note that this event is triggered after the input has changed, so we no longer know what the original key is. Find the one that most closely matches this and use it.
		let keys = variantItem.get('variant').items.map(k => k.key.value);
		let maxSS;
		for (let idx = 0; idx < keys.length; idx++) {
			let ss = StringSimilarity(newVal, keys[idx]);
			if (ss > maxSS) {
				maxSS = ss;
			}
		}

		let keyidx = keys.indexOf(maxSS);
		let key = keys[keyidx];
		let existingVal = variantItem.getIn(['variant', key]);
		variantItem.deleteIn(['variant', key]);
		variantItem.setIn(['varaint', newVal], existingVal);
	}
	else if (element.id.startsWith('VariantValue')) {
		let idx = element.id.substring(element.id.length - 1);
		let key = document.getElementById('VariantName' + idx).value;
		variantItem.setIn(['variant', key], newVal);
	}
	UpdateData();
}

/**
 * Add a new input group element to the variant header container with the specified name-value set.
 * @param {number} idx The 0-based index of this key-value set. Equal to the count of existing key-value sets in this variant plus one. A maximum 10 key-value sets is supported.
 * @param {string} name The variant name (or key)
 * @param {string} value The variant value
 */
function CreateVariantKeyValueElements(idx, name, value) {
	const inputGroupDiv = document.createElement('div');
	inputGroupDiv.className = 'mb-2 input-group input-group-sm VariantKVItem';
	inputGroupDiv.id = 'VariantKVSet' + idx;

	const nameLabel = document.createElement('label');
	nameLabel.className = 'input-group-text';
	nameLabel.textContent = 'Name';
	inputGroupDiv.appendChild(nameLabel);

	const nameInput = document.createElement('input');
	nameInput.id = 'VariantName' + idx;
	nameInput.className = 'form-control';
	nameInput.type = 'text';
	nameInput.value = name;
	nameInput.addEventListener("input", function(event) {
		UpdateVariantData(event.target);
		console.log(event.target.id + ' updated');
	});
	inputGroupDiv.appendChild(nameInput);

	const valueLabel = document.createElement('label');
	valueLabel.className = 'input-group-text';
	valueLabel.textContent = 'Value';
	inputGroupDiv.appendChild(valueLabel);

	const valueInput = document.createElement('input');
	valueInput.id = 'VariantValue' + idx;
	valueInput.className = 'form-control';
	valueInput.type = 'text';
	valueInput.value = value;
	valueInput.addEventListener("input", function (event) {
		UpdateVariantData(event.target);
		console.log(event.target.id + ' updated');
	});
	inputGroupDiv.appendChild(valueInput);

	const removeBtn = document.createElement('button');
	removeBtn.id = 'RemoveVariantKVSet' + idx;
	removeBtn.className = 'btn btn-outline-danger';
	removeBtn.type = 'button';
	removeBtn.textContent = 'Remove';
	removeBtn.addEventListener("click", (function (idx) {
		return function () {
			RemoveVariantKeyValueSet(idx);
			console.log('deleted ' + idx);
		};
	})(idx));
	inputGroupDiv.appendChild(removeBtn);

	document.getElementById('VariantKeyValuesContainer').appendChild(inputGroupDiv);
	document.getElementById('VariantName').value = '';
	document.getElementById('VariantValue').value = '';
}


/**
 * Add a new key value set to the currently selected varaint.
 * @param {string} key Variant key (name)
 * @param {string} value Variant value
 */
function AddVariantKeyValueSet(key, value) {
	let variantItem = selectedDoc.get('variants').items[selectedPkgVariantIdx];
	variantItem.addIn(['variant', key], value);
	UpdateData();
}

/**
 * Removes the key value set at the specified index from the currently selected varaint.
 * @param {number} idx Index of the key-value set to remove
 */
function RemoveVariantKeyValueSet(idx) {
	let variantItem = selectedDoc.get('variants').items[selectedPkgVariantIdx];
	let key = variantItem.get('variant').items[idx].key.value;
	variantItem.deleteIn(['variant', key]);
	document.getElementById('VariantKVSet' + idx).remove();
	UpdateData();
}



//function VariantAddDependency(input) {
//	var currentDependencies = document.getElementById('VariantDependencies').value;
//	if (currentDependencies === '') {
//		document.getElementById('VariantDependencies').value = input.value + ';\n'
//	} else {
//		document.getElementById('VariantDependencies').value = currentDependencies + input.value + ';\n';
//	}
//	variantPackageSelect.clear(true);
//}
//function UpdateVariantData(elem) {
//	//Prevent adding a variant if any required fields are blank
//	if (document.getElementById('VariantKey').value === '' || document.getElementById('VariantValue').value === '') {
//		document.getElementById('AddVariantButton').disabled = true
//		document.getElementById('RemoveVariantButton').disabled = true;
//	} else {
//		document.getElementById('AddVariantButton').disabled = false;
//		document.getElementById('RemoveVariantButton').disabled = false;
//	}

//	if (elem.id === 'VariantsPacAssetList' || elem.id === 'VariantsLocalAssetList') {
//		document.getElementById('VariantAssetId').value = elem.value;
//		if (variantPackageSelect = document.getElementById('VariantsPacAssetList').tomselect) variantPackageSelect.clear(true);
//		elem.value = '';
//	} else if (elem.id === 'VariantsPacPackageList' || elem.id === 'VariantsLocalPackageList') {
//		document.getElementById('VariantDependencies').value = document.getElementById('VariantDependencies').value + elem.value + ';\n';
//		if (variantPackageSelect = document.getElementById('VariantsPacPackageList').tomselect) variantPackageSelect.clear(true);
//		elem.value = '';
//	} else {
//		ValidateInput(elem.id);
//		//TODO - update variant data
//		//Not going to bother implementing all of the onchange stuff here because I want to redesign how this works (see pr #43)
//		//Also it's a convoluted process where once the variant key name is changed the current setup will not be able to find the named variant any more

//	}
//	UpdateData();
//}
//function AddAssetToVariant() {
//	var variant = GetVariant(selectedDoc.group + ':' + selectedDoc.name + ':' + document.getElementById('VariantKey').value, document.getElementById('VariantValue').value);

//	var newAsset = {
//		assetId: document.getElementById('VariantAssetId').value,
//		include: TextToArray(document.getElementById('VariantInclude').value),
//		exclude: TextToArray(document.getElementById('VariantExclude').value),
//	};
//	variant.assets.push(newAsset);


//	document.getElementById('VariantAssetId').value = '';
//	document.getElementById('VariantInclude').value = '';
//	document.getElementById('VariantExclude').value = '';
//	if (variantPackageSelect = document.getElementById('VariantsPacAssetList').tomselect) variantPackageSelect.clear(true);
//	document.getElementById('VariantsLocalAssetList').value = '';
//	UpdateData();
//}
//function RemoveAssetFromVariant() {
//	var variant = GetVariant(selectedDoc.group + ':' + selectedDoc.name + ':' + document.getElementById('VariantKey').value, document.getElementById('VariantValue').value);
//	variant.assets = variant.assets.filter((i) => i.assetId !== document.getElementById('VariantAssetId').value);
//}
//function RemoveVariant() {
//	selectedDoc.variants = selectedDoc.variants.filter((i) =>
//		(Object.keys(i.variant)[0] !== document.getElementById('VariantKey').value) &&
//		(Object.values(i.variant)[0] !== document.getElementById('VariantValue').value)
//	);
//	UpdateData();
//	ResetVariantInputs();
//}

//function AddNewVariant() {
//	//The `variants` property of a document is an array of variant objects. The variant object has three properties:
//	//	- variant: an object with one key value pair, with the key as the name of the variant, and the value its value
//	//	- assets: an array of asset objects. Each aset object has three properties:
//	//		- assetId: unique Id of the asset
//	//		- include: array of items in the asset to include
//	//		- exclude: array of items in the asset to exclude
//	//	- dependencies: an array of strings
//	var newKey;
//	if (document.getElementById('IsGlobalVariant').checked) {
//		newKey = document.getElementById('VariantKey').value;
//	} else {
//		newKey = `${selectedDoc.group}:${selectedDoc.name}:${document.getElementById('VariantKey').value}`;
//	}
//	var newValue = document.getElementById('VariantValue').value;
//	var newVariant = {
//		variant: { [newKey]: newValue },
//		assets: new Array()
//	}

//	//To avoid writing null properties, only add the property if the input is not blank
//	var newAsset = new Object();
//	if (document.getElementById('VariantAssetId').value !== '') {
//		newAsset.assetId = document.getElementById('VariantAssetId').value;
//	}
//	if (document.getElementById('VariantInclude').value !== '') {
//		newAsset.include = TextToArray(document.getElementById('VariantInclude').value);
//	}
//	if (document.getElementById('VariantExclude').value !== '') {
//		newAsset.exclude = TextToArray(document.getElementById('VariantExclude').value);
//	}
//	if (document.getElementById('VariantDependencies').value !== '') {
//		newVariant.dependencies = TextToArray(document.getElementById('VariantDependencies').value);
//	}

//	newVariant.assets.push(newAsset);
//	if (selectedDoc.variants === undefined) {
//		selectedDoc.variants = new Array(newVariant);
//	} else {
//		selectedDoc.variants.push(newVariant);
//	}

//	//Add variant descriptions (if any)
//	if (document.getElementById('VariantDescription').value !== '') {
//		selectedDoc.variantDescriptions = newPackage = {
//			[newKey]: {
//				[newValue]: document.getElementById('VariantDescription').value
//			}
//		};
//	}

//	UpdateData();
//	ResetVariantInputs();
//}

/**
 * Resets the Varaint input form fields.
 */
function ResetVariantHeaderForm() {
	document.querySelectorAll('.VariantKVItem').forEach(e => e.remove());
	document.getElementById('IsLocalVariant').checked = false;
	document.getElementById('VariantName').value = '';
	document.getElementById('VariantValue').value = '';
	variantDependencySelect.clear(true);
	//UpdateVariantTree();
}
/**
 * Fill the Varaint header fields (key-value sets/dependencies) with values from the specified variant.
 * @param {number} variantIdx Index of the target variant within the selected document
 */
function FillVariantHeaderForm(variantIdx) {
	ResetVariantHeaderForm();
	let variant = selectedDoc.get('variants').items[variantIdx];
	let variantKVsets = variant.get('variant').items; // a variant can have one or more key-value pairs

	for (var idx = 0; idx < variantKVsets.length; idx++) {
		let kvset = variantKVsets[idx];
		CreateVariantKeyValueElements(idx, kvset.key.value, kvset.value.value);
	}
}





/**
 * Resets the AssetId/Include/Exclude fields on the variant form
 */
function ResetVariantAssetForm() {
	variantAssetSelect.clear(true);
	variantIncludeSelect.clear(true);
	variantIncludeSelect.clearOptions();
	variantExcludeSelect.clear(true);
	variantExcludeSelect.clearOptions();
	//UpdateVariantAssetTree();
}
/**
 * Fill the Varaint input form fields with values from the specified variant.
 * @param {number} variantIdx Index of the target variant within the selected document
 * @param {number} variantAssetIdx Index of the target asset within the targeted variant
 */
function FillVariantAssetForm(variantIdx, variantAssetIdx) {
	ResetVariantAssetForm();
	let variant = selectedDoc.get('variants').items[variantIdx];
	let asset = variant.get('assets').items[variantAssetIdx];

	(variantAssetSelect.createItem(asset.get('assetId')) || variantAssetSelect.addItem(asset.get('assetId'), true));

	if (asset.has('include')) {
		let includes = asset.get('include').items;
		includes.forEach(incl => {
			variantIncludeSelect.addOption({ value: incl.value, text: incl.value });
			variantIncludeSelect.addItem(incl.value, true);
		}); 
	}
	if (asset.has('exclude')) {
		let excludes = asset.get('exclude').items;
		excludes.forEach(excl => {
			variantExcludeSelect.addOption({ value: excl.value, text: excl.value });
			variantExcludeSelect.addItem(excl.value, true);
		});
	}
}