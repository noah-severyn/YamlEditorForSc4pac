//one varaint is selectedDoc.get('variants').items[0]
//variant key is selectedDoc.get('variants').items[0].get('variant').items[0].key.value
//variant val is selectedDoc.get('variants').items[0].get('variant').items[0].value.value









//// --------------------------------------------------------------------------------------------------------------------
//// ---------------------------------------------------   Variants   ---------------------------------------------------
//// --------------------------------------------------------------------------------------------------------------------
/**
 * Resets the Varaint input form fields.
 */
function ResetVariantInputs() {
	//document.getElementById('IsLocalVariant').checked = false;
	//document.getElementById('VariantName').value = '';
	//document.getElementById('VariantValue').value = '';
	document.getElementById('VariantDescription').value = '';
	document.getElementById('VariantDependencies').value = '';
	document.getElementById('VariantAssetId').value = '';
	document.getElementById('VariantInclude').value = '';
	document.getElementById('VariantExclude').value = '';
	variantAssetSelect.clear(true);
	variantPackageSelect.clear(true);
}


function AddVariantKeyValueSet(idx, name, value) {
	//<div class="mb-2 input-group">
	//	<label class="input-group-text w1">Name</label>
	//	<input id="VariantName" class="form-control" type="text" />
	//	<label class="input-group-text w1">Value</label>
	//	<input id="VariantValue" class="form-control" type="text" />
	//	<button id="x" class="btn btn-outline-danger" type="button">Remove</button>
	//</div>

	const inputGroupDiv = document.createElement('div');
	inputGroupDiv.className = 'mb-2 input-group';
	inputGroupDiv.id = 'VariantKVSet' + idx;

	const nameLabel = document.createElement('label');
	nameLabel.className = 'input-group-text w1';
	nameLabel.textContent = 'Name';
	inputGroupDiv.appendChild(nameLabel);

	const nameInput = document.createElement('input');
	nameInput.id = 'VariantName';
	nameInput.className = 'form-control';
	nameInput.type = 'text';
	inputGroupDiv.appendChild(nameInput);

	const valueLabel = document.createElement('label');
	valueLabel.className = 'input-group-text w1';
	valueLabel.textContent = 'Value';
	inputGroupDiv.appendChild(valueLabel);

	const valueInput = document.createElement('input');
	valueInput.id = 'VariantValue';
	valueInput.className = 'form-control';
	valueInput.type = 'text';
	inputGroupDiv.appendChild(valueInput);

	const removeBtn = document.createElement('button');
	removeBtn.id = 'x';
	removeBtn.className = 'btn btn-outline-danger';
	removeBtn.type = 'button';
	removeBtn.textContent = 'Remove';
	removeBtn.addEventListener("click", (function (idx) {
		return function () {
			//delete variantData.variant[key];
			//renderVariantForm(index);
			//updateVariantList();
			console.log('deleted ' + idx);
		};
	})(idx));
	inputGroupDiv.appendChild(removeBtn);

	document.getElementById('VariantKeyValuesContainer').insertBefore(inputGroupDiv, document.getElementById('VariantKeyValueInputForm'));
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
///**
// * Fill the Varaint input form fields with the specified variant.
// */
//function FillVariantFormHeader(vData) {
//	var key = Object.keys(vData.variant)[0];
//	var idx = key.lastIndexOf(':');
//	document.getElementById('IsGlobalVariant').checked = (key.substring(0, idx) !== selectedDoc.group + ':' + selectedDoc.name);
//	document.getElementById('VariantKey').value = key.substring(idx + 1);
//	document.getElementById('VariantValue').value = Object.values(vData.variant)[0];
//	document.getElementById('VariantDescription').value = '';
//	document.getElementById('VariantDependencies').value = ArrayToText(vData.dependencies);
//	document.getElementById('VariantDescription').value = selectedDoc.variantDescriptions[key][Object.values(vData.variant)[0]];
//}


//function FillVariantFormAsset(vAsset) {
//	document.getElementById('VariantAssetId').value = vAsset.assetId;
//	document.getElementById('VariantInclude').value = ArrayToText(vAsset.include);
//	document.getElementById('VariantExclude').value = ArrayToText(vAsset.exclude);
//}