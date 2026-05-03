//// --------------------------------------------------------------------------------------------------------------------
//// ---------------------------------------------------   Variants   ---------------------------------------------------
//// --------------------------------------------------------------------------------------------------------------------

function UpdateVariantData(element) {
	if (selectedVariantIdx === null) { return; }
	let variantItem = selectedDoc.get('variants').items[selectedVariantIdx];
	let assetItem;
	if (selectedVariantAssetIdx !== null) {
		assetItem = variantItem.get('assets').items[selectedVariantAssetIdx];
	}

	if (element.id.startsWith('VariantName')) {
		// Note that this event is triggered after the input has changed, so we no longer know what the original key is.
		// Find the one that most closely matches this and use it.
		let keys = variantItem.get('variant').items.map(k => k.key.value);
		let maxSS = 0;
		let maxIdx = 0;
		for (let idx = 0; idx < keys.length; idx++) {
			let ss = StringSimilarity(element.value, keys[idx]);
			if (ss > maxSS) {
				maxSS = ss;
				maxIdx = idx;
			}
		}
		let key = keys[maxIdx];
		let existingVal = variantItem.getIn(['variant', key]);
		variantItem.deleteIn(['variant', key]);
		let newPair = selectedDoc.createPair(element.value, existingVal);
		variantItem.get('variant').items.push(newPair);
	}
	else if (element.id.match(/VariantValue\d{1,2}/g)) {
		let idx = element.id.substring(element.id.length - 1);
		let key = document.getElementById('VariantName' + idx).value;
		variantItem.setIn(['variant', key], element.value);
	}
	else if (element.id === 'VariantDependencies') {
		UpdateYamlSeqField(variantItem, 'dependencies', variantDependencySelect.getValue());
	}
	else if (element.id === 'VariantConflicting') {
		UpdateYamlSeqField(variantItem, 'conflicting', variantConflictingSelect.getValue());
	}
	else if (element.id === 'VariantAssetId') {
		if (selectedVariantAssetIdx === null) {
			if (variantItem.get('assets') === undefined) {
				const newSeq = selectedDoc.createNode([{ assetId: element.value }]);
				newSeq.type = 'SEQ';
				variantItem.set('assets', newSeq);
			} else {
				variantItem.get('assets').add(selectedDoc.createNode({ assetId: element.value }));
			}
			selectedVariantAssetIdx = variantItem.get('assets').items.length - 1;
			document.getElementById('CurrentVariantAssetId').innerHTML = variantItem.get('assets').items[selectedVariantAssetIdx].get('assetId');
		} else {
			assetItem.set('assetId', element.value);
		}
	}
	else if (element.id === 'VariantAssetInclude') {
		UpdateYamlSeqField(assetItem, 'include', variantIncludeSelect.getValue());
	}
	else if (element.id === 'VariantAssetExclude') {
		UpdateYamlSeqField(assetItem, 'exclude', variantExcludeSelect.getValue());
	}
	UpdateData();
}

/**
 * Creates a table row for a variant key-value pair and appends it to VariantKVTableBody.
 * @param {number} idx The 0-based index of this key-value set
 * @param {string} name The variant key
 * @param {string} value The variant value
 */
function CreateVariantKeyValueElements(idx, name, value) {
	const tr = document.createElement('tr');
	tr.id = 'VariantKVSet' + idx;
	tr.className = 'VariantKVItem';

	const tdName = document.createElement('td');
	const nameInput = document.createElement('input');
	nameInput.id = 'VariantName' + idx;
	nameInput.className = 'form-control form-control-sm font-monospace';
	nameInput.type = 'text';
	nameInput.value = name;
	nameInput.addEventListener('input', function (event) {
		ValidateInput(event.target.id);
		UpdateVariantData(event.target);
	});
	tdName.appendChild(nameInput);
	tr.appendChild(tdName);

	const tdValue = document.createElement('td');
	const valueInput = document.createElement('input');
	valueInput.id = 'VariantValue' + idx;
	valueInput.className = 'form-control form-control-sm font-monospace';
	valueInput.type = 'text';
	valueInput.value = value;
	valueInput.addEventListener('input', function (event) {
		ValidateInput(event.target.id);
		UpdateVariantData(event.target);
	});
	tdValue.appendChild(valueInput);
	tr.appendChild(tdValue);

	const tdBtn = document.createElement('td');
	const removeBtn = document.createElement('button');
	removeBtn.id = 'RemoveVariantKVSet' + idx;
	removeBtn.className = 'btn btn-outline-danger btn-sm';
	removeBtn.type = 'button';
	removeBtn.textContent = '×';
	removeBtn.addEventListener('click', (function (capturedIdx) {
		return function () { RemoveVariantKeyValueSet(capturedIdx); };
	})(idx));
	tdBtn.appendChild(removeBtn);
	tr.appendChild(tdBtn);

	document.getElementById('VariantKVTableBody').appendChild(tr);
	document.getElementById('VariantName').value = '';
	document.getElementById('VariantValue').value = '';
}



/**
 * Add a new key-value set to the currently selected variant.
 * If `selectedVariantIdx` is null the key-value set will be added to a new variant.
 * @param {string} key Variant key (name)
 * @param {string} value Variant value
 */
function AddVariantKeyValueSet(key, value) {
	if (selectedVariantIdx === null) {
		const newMap = selectedDoc.createNode({
			variant: { [key]: value },
		});
		newMap.get('variant').flow = true; // Use inline brace style
		if (selectedDoc.get('variants') === undefined) {
			const newSeq = selectedDoc.createNode([newMap]);
			newSeq.type = 'SEQ';
			selectedDoc.set('variants', newSeq);
		} else {
			selectedDoc.get('variants').add(newMap);
		}
		selectedVariantIdx = selectedDoc.get('variants').items.length - 1;
	} else {
		let variantItem = selectedDoc.get('variants').items[selectedVariantIdx];
		variantItem.get('variant').add(selectedDoc.createPair(key, value));
	}
	UpdateData();
}

/**
 * Removes the key-value set at the specified index from the currently selected variant.
 * @param {number} idx Index of the key-value set to remove
 */
function RemoveVariantKeyValueSet(idx) {
	let variantItem = selectedDoc.get('variants').items[selectedVariantIdx];
	let key = variantItem.get('variant').items[idx].key.value;
	variantItem.deleteIn(['variant', key]);
	document.getElementById('VariantKVSet' + idx).remove();
	UpdateData();
}


/**
 * Removes the currently selected asset from the currently selected variant.
 */
function RemoveAssetFromVariant() {
	selectedDoc.get('variants').items[selectedVariantIdx].deleteIn(['assets', selectedVariantAssetIdx]);
	ResetVariantAssetForm();
	UpdateData();
}

/**
 * Removes the currently selected variant from the currently selected document.
 */
function RemoveVariant() {
	selectedDoc.deleteIn(['variants', selectedVariantIdx]);
	ResetVariantForm();
	ResetVariantAssetForm();
	UpdateData();
}


/**
 * Resets the variant input form fields.
 */
function ResetVariantForm() {
	document.getElementById('VariantKVTableBody').innerHTML = '';
	document.getElementById('VariantName').value = '';
	document.getElementById('VariantValue').value = '';
	variantDependencySelect.clear(true);
	variantConflictingSelect.clear(true);
	document.getElementById('CurrentVariantId').innerHTML = '[new variant]';
	selectedVariantIdx = null;
}

/**
 * Fill the variant form fields (key-value table, dependencies, conflicting).
 */
function FillVariantForm() {
	let variant = selectedDoc.get('variants').items[selectedVariantIdx];
	let variantKVsets = variant.get('variant').items;

	for (let idx = 0; idx < variantKVsets.length; idx++) {
		let kvset = variantKVsets[idx];
		CreateVariantKeyValueElements(idx, kvset.key.value, kvset.value.value);
	}

	if (variant.get('dependencies') !== undefined) {
		variant.get('dependencies').items.forEach(dep => {
			variantDependencySelect.addItem(dep.value, true);
		});
	}

	if (variant.get('conflicting') !== undefined) {
		variant.get('conflicting').items.forEach(c => {
			variantConflictingSelect.addItem(c.value, true);
		});
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
	document.getElementById('CurrentVariantAssetId').innerHTML = '[new asset]';
	selectedVariantAssetIdx = null;
	//UpdateVariantAssetTree();
}
/**
 * Fill the variant asset form fields with values from the currently selected asset.
 */
function FillVariantAssetForm() {
	let variant = selectedDoc.get('variants').items[selectedVariantIdx];
	let asset = variant.get('assets').items[selectedVariantAssetIdx];

	variantAssetSelect.addItem(asset.get('assetId'), true);
	FillTomSelectFromYamlSeq(asset, 'include', variantIncludeSelect);
	FillTomSelectFromYamlSeq(asset, 'exclude', variantExcludeSelect);
}
