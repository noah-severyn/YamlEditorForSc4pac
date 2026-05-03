//// --------------------------------------------------------------------------------------------------------------------
//// ------------------------------------------------   Conditions   ---------------------------------------------------
//// --------------------------------------------------------------------------------------------------------------------

/**
 * Updates the YAML for the currently selected condition when Include or Exclude changes.
 * @param {HTMLElement} element The input element that changed
 */
function UpdateConditionData(element) {
	if (selectedPkgAssetIdx === null || selectedConditionIdx === null) { return; }
	let condItem = selectedDoc.get('assets').items[selectedPkgAssetIdx].get('withConditions').items[selectedConditionIdx];

	if (element.id === 'ConditionInclude') {
		UpdateYamlSeqField(condItem, 'include', conditionIncludeSelect.getValue());
	}
	else if (element.id === 'ConditionExclude') {
		UpdateYamlSeqField(condItem, 'exclude', conditionExcludeSelect.getValue());
	}
	UpdateData();
}

/**
 * Creates a table row for a condition ifVariant key-value pair and appends it to ConditionKVTableBody.
 * @param {number} idx The 0-based index of this key-value pair
 * @param {string} key The ifVariant key
 * @param {string} value The ifVariant value
 */
function CreateConditionKVElement(idx, key, value) {
	const tr = document.createElement('tr');
	tr.id = 'ConditionKVSet' + idx;

	const tdKey = document.createElement('td');
	const keyInput = document.createElement('input');
	keyInput.id = 'ConditionKey' + idx;
	keyInput.className = 'form-control form-control-sm font-monospace';
	keyInput.type = 'text';
	keyInput.value = key;
	keyInput.addEventListener('input', function (event) {
		UpdateConditionKVKey(idx, event.target.value);
	});
	tdKey.appendChild(keyInput);
	tr.appendChild(tdKey);

	const tdValue = document.createElement('td');
	const valueInput = document.createElement('input');
	valueInput.id = 'ConditionValue' + idx;
	valueInput.className = 'form-control form-control-sm font-monospace';
	valueInput.type = 'text';
	valueInput.value = value;
	valueInput.addEventListener('input', function (event) {
		UpdateConditionKVValue(idx, event.target.value);
	});
	tdValue.appendChild(valueInput);
	tr.appendChild(tdValue);

	const tdBtn = document.createElement('td');
	const removeBtn = document.createElement('button');
	removeBtn.className = 'btn btn-outline-danger btn-sm';
	removeBtn.type = 'button';
	removeBtn.textContent = '×';
	removeBtn.addEventListener('click', (function (capturedIdx) {
		return function () { RemoveConditionKV(capturedIdx); };
	})(idx));
	tdBtn.appendChild(removeBtn);
	tr.appendChild(tdBtn);

	document.getElementById('ConditionKVTableBody').appendChild(tr);
	document.getElementById('ConditionVariantKey').value = '';
	document.getElementById('ConditionVariantValue').value = '';
}

/**
 * Updates the key of an existing ifVariant entry in the YAML.
 * Uses string similarity to find the old key (mirrors UpdateVariantData key rename logic).
 */
function UpdateConditionKVKey(idx, newKey) {
	if (selectedConditionIdx === null) { return; }
	let condItem = selectedDoc.get('assets').items[selectedPkgAssetIdx].get('withConditions').items[selectedConditionIdx];
	let ifVariant = condItem.get('ifVariant');
	let keys = ifVariant.items.map(k => k.key.value);
	let maxSS = 0, maxIdx = 0;
	for (let i = 0; i < keys.length; i++) {
		let ss = StringSimilarity(newKey, keys[i]);
		if (ss > maxSS) { maxSS = ss; maxIdx = i; }
	}
	let oldKey = keys[maxIdx];
	let existingVal = ifVariant.get(oldKey);
	ifVariant.delete(oldKey);
	ifVariant.add(selectedDoc.createPair(newKey, existingVal));
	UpdateData();
}

/**
 * Updates the value of an existing ifVariant entry in the YAML.
 */
function UpdateConditionKVValue(idx, newValue) {
	if (selectedConditionIdx === null) { return; }
	let condItem = selectedDoc.get('assets').items[selectedPkgAssetIdx].get('withConditions').items[selectedConditionIdx];
	let key = document.getElementById('ConditionKey' + idx).value;
	condItem.setIn(['ifVariant', key], newValue);
	UpdateData();
}

/**
 * Removes an ifVariant key-value pair at the given index from the currently selected condition.
 */
function RemoveConditionKV(idx) {
	let condItem = selectedDoc.get('assets').items[selectedPkgAssetIdx].get('withConditions').items[selectedConditionIdx];
	let key = condItem.get('ifVariant').items[idx].key.value;
	condItem.get('ifVariant').delete(key);
	document.getElementById('ConditionKVSet' + idx).remove();
	UpdateData();
}

/**
 * Adds a new ifVariant key-value pair to the currently selected condition.
 * If no condition is currently selected, creates a new condition first.
 */
function AddConditionKeyValuePair(key, value) {
	if (selectedPkgAssetIdx === null) { return; }
	let assetItem = selectedDoc.get('assets').items[selectedPkgAssetIdx];

	if (selectedConditionIdx === null) {
		const newCond = selectedDoc.createNode({ ifVariant: { [key]: value } });
		newCond.get('ifVariant').flow = true;
		if (assetItem.get('withConditions') === undefined) {
			const newSeq = selectedDoc.createNode([]);
			newSeq.type = 'SEQ';
			assetItem.set('withConditions', newSeq);
		}
		assetItem.get('withConditions').add(newCond);
		selectedConditionIdx = assetItem.get('withConditions').items.length - 1;
	} else {
		let condItem = assetItem.get('withConditions').items[selectedConditionIdx];
		condItem.get('ifVariant').add(selectedDoc.createPair(key, value));
	}
	UpdateData();
}

/**
 * Removes the currently selected condition from the asset's withConditions list.
 * Removes the withConditions key entirely if it becomes empty.
 */
function RemoveCondition() {
	if (selectedPkgAssetIdx === null || selectedConditionIdx === null) { return; }
	let assetItem = selectedDoc.get('assets').items[selectedPkgAssetIdx];
	assetItem.deleteIn(['withConditions', selectedConditionIdx]);
	if (assetItem.has('withConditions') && assetItem.get('withConditions').items.length === 0) {
		assetItem.delete('withConditions');
	}
	ResetConditionForm();
	UpdateData();
}

/**
 * Resets the condition form to its empty/default state.
 */
function ResetConditionForm() {
	selectedConditionIdx = null;
	document.getElementById('ConditionKVTableBody').innerHTML = '';
	document.getElementById('ConditionVariantKey').value = '';
	document.getElementById('ConditionVariantValue').value = '';
	conditionIncludeSelect.clear(true);
	conditionIncludeSelect.clearOptions();
	conditionExcludeSelect.clear(true);
	conditionExcludeSelect.clearOptions();
	document.getElementById('CurrentConditionId').innerHTML = '[new condition]';
}

/**
 * Fills the condition form from the currently selected condition in the YAML.
 */
function FillConditionForm() {
	if (selectedConditionIdx === null) { return; }
	let condItem = selectedDoc.get('assets').items[selectedPkgAssetIdx].get('withConditions').items[selectedConditionIdx];

	let kvPairs = condItem.get('ifVariant').items;
	for (let i = 0; i < kvPairs.length; i++) {
		CreateConditionKVElement(i, kvPairs[i].key.value, kvPairs[i].value.value);
	}

	FillTomSelectFromYamlSeq(condItem, 'include', conditionIncludeSelect);
	FillTomSelectFromYamlSeq(condItem, 'exclude', conditionExcludeSelect);

	let kvLabel = kvPairs.map(kv => kv.key.value.split(':').slice(-1)[0] + ':' + kv.value.value).join(', ');
	document.getElementById('CurrentConditionId').innerHTML = kvLabel || '[condition ' + selectedConditionIdx + ']';
}
