//one varaint is selectedDoc.get('variants').items[0]
//variant key is selectedDoc.get('variants').items[0].get('variant').items[0].key.value
//variant val is selectedDoc.get('variants').items[0].get('variant').items[0].value.value









//// --------------------------------------------------------------------------------------------------------------------
//// ---------------------------------------------------   Variants   ---------------------------------------------------
//// --------------------------------------------------------------------------------------------------------------------


function UpdateVariantData(element) {
	let variantItem = selectedDoc.get('variants').items[selectedVariantIdx];
	let variantInfo = selectedDoc.get('variantInfo');
	let assetItem;
	let variantKey;
	let variantValue;
	let vInfoItem;
	if (selectedVariantIdx !== null) {
		variantKey = variantItem.get('variant').items[0].key.value;
		variantValue = variantItem.get('variant').items[0].value.value
	}
	if (selectedVariantAssetIdx !== null) {
		assetItem = variantItem.get('assets').items[selectedVariantAssetIdx];
	}
	if (variantInfo !== undefined) {
		vInfoItem = variantInfo.items.find(i => i.get('variantId') === variantKey);
	}

	if (element.id.startsWith('VariantName')) {
		let idx = element.id.substring(element.id.length - 1);

		//Note that this event is triggered after the input has changed, so we no longer know what the original key is. Find the one that most closely matches this and use it.
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
		if (element.value !== '') {
			if (variantItem.get('dependencies') === undefined) {
				const newSeq = selectedDoc.createNode([element.value]);
				newSeq.type = 'SEQ';
				variantItem.set('dependencies', newSeq);
			} else {
				variantItem.get('dependencies').items = [];
				variantDependencySelect.getValue().split(',').forEach(dep => {
					variantItem.get('dependencies').add(dep);
				});
			}

		} else if (element.value === '' && variantItem.has('dependencies')) {
			variantItem.delete('dependencies');
		}
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
			document.getElementById('CurrentVariantAssetId').innerHTML = 'Editing asset: ' + variantItem.get('assets').items[selectedVariantAssetIdx].get('assetId')
		} else {
			assetItem.set('assetId', element.value);
		}
	}
	else if (element.id === 'VariantAssetInclude') {
		if (element.value !== '') {
			if (assetItem.get('include') === undefined) {
				const newSeq = selectedDoc.createNode([element.value]);
				newSeq.type = 'SEQ';
				assetItem.set('include', newSeq);
			} else {
				assetItem.get('include').items = [];
				variantIncludeSelect.getValue().split(',').forEach(item => {
					assetItem.get('include').add(item);
				});
			}

		} else if (element.value === '' && assetItem.has('include')) {
			assetItem.delete('include');
		}
	}
	else if (element.id === 'VariantAssetExclude') {
		if (element.value !== '') {
			if (assetItem.get('exclude') === undefined) {
				const newSeq = selectedDoc.createNode([element.value]);
				newSeq.type = 'SEQ';
				assetItem.set('exclude', newSeq);
			} else {
				assetItem.get('exclude').items = [];
				variantExcludeSelect.getValue().split(',').forEach(item => {
					assetItem.get('exclude').add(item);
				});
			}

		} else if (element.value === '' && assetItem.has('exclude')) {
			assetItem.delete('exclude');
		}
	}
	else if (element.id === 'VariantDescription') {
		if (element.value !== '') {
			if (variantInfo !== undefined) {
				vInfoItem.set('description', element.value);
			} else {
				const newSeq = selectedDoc.createNode([{ variantId: variantKey, description: element.value }]);
				newSeq.type = 'SEQ';
				selectedDoc.set('variantInfo', newSeq);
			}
		} else if (element.value === '' && selectedDoc.has('variantInfo')) {
			selectedDoc.delete('variantInfo');
		}
	}
	else if (element.id === 'VariantValueDescription') {
		if (element.value !== '') {
			if (vInfoItem.get('values') === undefined) {
				const newSeq = selectedDoc.createNode([])
				newSeq.type = 'SEQ';
				vInfoItem.set('values', newSeq);
			}

			const valueItem = vInfoItem.get('values').items.find(i => i.get('value') === variantValue);
			if (valueItem !== undefined) {
				valueItem.set('description', element.value);
			} else {
				if (variantInfo === undefined) {
					const newSeq = selectedDoc.createNode([{ variantId: variantKey, description: element.value }]);
					newSeq.type = 'SEQ';
					selectedDoc.set('variantInfo', newSeq);
				}
				
				const newItem = selectedDoc.createNode({ value: variantValue, description: element.value });
				vInfoItem.get('values').add(newItem);
			}
		} else if (element.value === '' && selectedDoc) {
			const valueIdx = vInfoItem.get('values').items.findIndex(i => i.get('value') === variantValue);
			vInfoItem.deleteIn(['values', valueIdx]);
			if (vInfoItem.get('values').items.length === 0) {
				vInfoItem.delete('values');
			}
		}
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
	nameLabel.htmlFor = 'VariantName' + idx;
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
	valueLabel.htmlFor = 'VariantValue' + idx;
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
 * Toggle between a local variant (where the package name is prepended to the variant name) and a global variant.
 */
function ToggleLocalVariant() {
	if (selectedDoc === null) { return; }
	let nameInput = document.getElementById('VariantName');
	let pkg = selectedDoc.get('group') + ':' + selectedDoc.get('name');
	if (document.getElementById('IsLocalVariant').checked) {
		nameInput.value = pkg + ':' + nameInput.value;
	} else {
		nameInput.value =  nameInput.value.replace(pkg + ':', '')
	}

	nameInput.focus();
}


/**
 * Add a new key value set to the currently selected variant.
 * 
 * If `selectedPkgVariantIdx` is null then the key value set will be added to a new variant. 
 * @param {string} key Variant key (name)
 * @param {string} value Variant value
 */
function AddVariantKeyValueSet(key, value) {
	if (selectedVariantIdx === null) {
		const newMap = selectedDoc.createNode({
			variant: {
				[key]: value
			},
		});
		newMap.get('variant').flow = true; // Use inline array brace style
		if (selectedDoc.get('variants') === undefined) {
			const newSeq = selectedDoc.createNode([newMap]);
			newSeq.type = 'SEQ';
			selectedDoc.set('variants', newSeq);
		} else {
			selectedDoc.get('variants').add(newMap);
		}
		selectedVariantIdx = selectedDoc.get('variants').items.length - 1;
	}
	else {
		let variantItem = selectedDoc.get('variants').items[selectedVariantIdx];
		variantItem.addIn(['variant', key], value);
	}
	UpdateData();
}

/**
 * Removes the key value set at the specified index from the currently selected variant.
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
	document.querySelectorAll('.VariantKVItem').forEach(e => e.remove());
	document.getElementById('IsLocalVariant').checked = false;
	document.getElementById('VariantName').value = '';
	document.getElementById('VariantValue').value = '';
	document.getElementById('VariantDescription').value = '';
	document.getElementById('VariantValueDescription').value = '';
	variantDependencySelect.clear(true);
	document.getElementById('CurrentVariantId').innerHTML = '[new variant]';
	document.getElementById('CurrentVariantId2').innerHTML = '[new variant]';
	selectedVariantIdx = null;
	//UpdateVariantTree();
}
/**
 * Fill the variant form fields (key-value sets, dependencies, and descriptions).
 */
function FillVariantForm() {
	let variant = selectedDoc.get('variants').items[selectedVariantIdx];
	let variantKVsets = variant.get('variant').items; // a variant can have one or more key-value pairs

	for (var idx = 0; idx < variantKVsets.length; idx++) {
		let kvset = variantKVsets[idx];
		CreateVariantKeyValueElements(idx, kvset.key.value, kvset.value.value);
	}

	if (variant.get('dependencies') !== undefined) {
		let deps = variant.get('dependencies').items;
		deps.forEach(dep => {
			variantDependencySelect.addItem(dep.value, true);
		});
	}

	let vInfo = selectedDoc.get('variantInfo').items
	if (vInfo !== undefined) {
		let vKey = variantKVsets[0].key.value;
		let vItem = vInfo.find(i => i.get('variantId') === vKey);
		document.getElementById('VariantDescription').value = vItem.get('description');

		let vValue = variantKVsets[0].value.value
		let vValueItem = vItem.get('values').items.find(i => i.get('value') === vValue);
		if (vValueItem !== undefined) {
			document.getElementById('VariantValueDescription').value = vValueItem.get('description');
		}
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
 * Fill the variant input form fields with values from the specified variant.
 */
function FillVariantAssetForm() {
	let variant = selectedDoc.get('variants').items[selectedVariantIdx];
	let asset = variant.get('assets').items[selectedVariantAssetIdx];

	variantAssetSelect.addItem(asset.get('assetId'), true);

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