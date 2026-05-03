// --------------------------------------------------------------------------------------------------------------------
// -----------------------------------------------   Variant Info   ---------------------------------------------------
// --------------------------------------------------------------------------------------------------------------------

/**
 * Populates the Variant Info tab with one card per unique variant key found in the selected document's variants.
 * Each card contains a description input for the key and a table of its values with description and default inputs.
 */
function FillVariantInfoTab() {
    const noVariantsText = '<p class="text-muted fst-italic">No variants defined. Add variants in the Variants tab first.</p>';
    const noLocalVariantsText = '<p class="text-muted fst-italic">No local variants defined. Only local variants (e.g. <code>group:name:variant-name</code>) appear here.</p>';
	const container = document.getElementById('VariantInfoContainer');
	container.innerHTML = '';

	if (!selectedDoc) {
		container.innerHTML = noVariantsText;
		return;
	}

	// Collect unique local variant keys and their values (preserving insertion order).
    // Local variants use the format `group:package-name:variant-name` (2+ colons), as opposed to global variants with no colons.
	const variantMap = new Map(); // key -> string[]

	function CollectVariantKeyValues(key, value) {
		if ((key.match(/:/g) || []).length < 2) {
			return; // skip global variants
		} 
		if (!variantMap.has(key)) {
			variantMap.set(key, []);
		}
		if (!variantMap.get(key).includes(value)) {
			variantMap.get(key).push(value);
		}
	}

	if (selectedDoc.has('variants')) {
		const variants = selectedDoc.get('variants').items;
		if (variants) {
			variants.forEach(variantItem => {
				const kvPairs = variantItem.get('variant').items;
				kvPairs.forEach(pair => {
					CollectVariantKeyValues(pair.key.value, pair.value.value);
				});
			});
		}
	}

	// Also collect variants referenced in withConditions:ifVariant blocks
	if (selectedDoc.has('assets')) {
		selectedDoc.get('assets').items.forEach(assetItem => {
			if (!assetItem.has('withConditions')) return;
			assetItem.get('withConditions').items.forEach(condItem => {
				if (!condItem.has('ifVariant')) return;
				condItem.get('ifVariant').items.forEach(pair => {
					CollectVariantKeyValues(pair.key.value, pair.value.value);
				});
			});
		});
	}

	if (variantMap.size === 0) {
		container.innerHTML = noLocalVariantsText;
		return;
	}

	const existingInfo = ReadVariantInfoFromDoc();

	variantMap.forEach((values, key) => {
		const keyInfo = existingInfo[key] || { description: '', values: {} };

		const card = document.createElement('div');
		card.className = 'card mb-3';
		card.dataset.variantKey = key;

		const cardHdr = document.createElement('div');
		cardHdr.className = 'card-header';
		cardHdr.innerHTML = `<code class="fs-6">${key}</code>`;
		card.appendChild(cardHdr);

		const cardBody = document.createElement('div');
		cardBody.className = 'card-body';

		// Description input for the variant key
		const descGroup = document.createElement('div');
		descGroup.className = 'input-group mb-3';
		const descLabel = document.createElement('label');
		descLabel.className = 'input-group-text';
		descLabel.textContent = 'Description';
		const descInput = document.createElement('input');
		descInput.type = 'text';
		descInput.className = 'form-control';
		descInput.placeholder = 'Describe this variant...';
		descInput.value = keyInfo.description;
		descInput.addEventListener('input', (function (capturedKey) {
			return function () { WriteVariantKeyDescription(capturedKey, this.value); };
		})(key));
		descGroup.appendChild(descLabel);
		descGroup.appendChild(descInput);
		cardBody.appendChild(descGroup);

		// Table of values
		const table = document.createElement('table');
		table.className = 'table table-sm table-bordered align-middle mb-0';
		const thead = document.createElement('thead');
		thead.className = 'table-light';
		thead.innerHTML = '<tr><th style="width:10%" class="text-center">Value</th><th>Description</th><th style="width:10%" class="text-center">Default</th></tr>';
		table.appendChild(thead);

		const tbody = document.createElement('tbody');
		values.forEach(value => {
			const valInfo = keyInfo.values[value] || { description: '', default: false };
			const tr = document.createElement('tr');

			const tdValue = document.createElement('td');
			tdValue.className = 'text-center';
			tdValue.innerHTML = `<code>${value}</code>`;
			tr.appendChild(tdValue);

			const tdDesc = document.createElement('td');
			const valueDescInput = document.createElement('input');
			valueDescInput.type = 'text';
			valueDescInput.className = 'form-control form-control-sm';
			valueDescInput.placeholder = 'Describe this value...';
			valueDescInput.value = valInfo.description;
			valueDescInput.addEventListener('input', (function (capturedKey, capturedValue) {
				return function () { WriteVariantValueDescription(capturedKey, capturedValue, this.value); };
			})(key, value));
			tdDesc.appendChild(valueDescInput);
			tr.appendChild(tdDesc);

			const tdDefault = document.createElement('td');
			tdDefault.className = 'text-center';
			const defaultCheck = document.createElement('input');
			defaultCheck.type = 'checkbox';
			defaultCheck.className = 'form-check-input';
			defaultCheck.checked = valInfo.default === true;
			defaultCheck.addEventListener('change', (function (capturedKey, capturedValue, capturedCheckbox) {
				return function () {
					// Uncheck all other default checkboxes in this card
					if (this.checked) {
						const card = capturedCheckbox.closest('[data-variant-key]');
						if (card) {
							card.querySelectorAll('input[type="checkbox"]').forEach(cb => {
								if (cb !== capturedCheckbox) cb.checked = false;
							});
						}
					}
                    
					WriteVariantValueDefault(capturedKey, capturedValue, this.checked);
				};
			})(key, value, defaultCheck));
			tdDefault.appendChild(defaultCheck);
			tr.appendChild(tdDefault);

			tbody.appendChild(tr);
		});
		table.appendChild(tbody);
		cardBody.appendChild(table);

		card.appendChild(cardBody);
		container.appendChild(card);
	});
}

/**
 * Reads the variantInfo section from selectedDoc and returns it as a plain JS object.
 * @returns {Object} Map of variantKey → { description, values: { value → { description, default } } }
 */
function ReadVariantInfoFromDoc() {
	const result = {};
	if (!selectedDoc || !selectedDoc.has('variantInfo')) return result;

	selectedDoc.get('variantInfo').items.forEach(item => {
		const vKey = item.get('variantKey');
		if (!vKey) return;
		result[vKey] = { description: item.get('description') ?? '', values: {} };
		if (item.has('values')) {
			item.get('values').items.forEach(valItem => {
				const val = valItem.get('value');
				if (val !== undefined) {
					result[vKey].values[String(val)] = {
						description: valItem.get('description') ?? '',
						default: valItem.get('default') === true
					};
				}
			});
		}
	});
	return result;
}

/**
 * Returns the variantInfo map item for the given key, creating it if necessary.
 * @param {string} variantKey
 * @returns The YAML map item for this key
 */
function GetOrCreateVariantKeyItem(variantKey) {
	if (!selectedDoc.has('variantInfo')) {
		const newSeq = selectedDoc.createNode([]);
		newSeq.type = 'SEQ';
		selectedDoc.set('variantInfo', newSeq);
	}
    
	const items = selectedDoc.get('variantInfo').items;
	let item = items.find(i => i.get('variantKey') === variantKey);
	if (!item) {
		item = selectedDoc.createNode({ variantKey });
		selectedDoc.get('variantInfo').add(item);
	}
	return item;
}

/**
 * Returns the value map item for a given variant key item and value, creating it if necessary.
 * @param {Object} keyItem YAML map item for the variant key
 * @param {string} value
 * @returns The YAML map item for this value
 */
function GetOrCreateVariantValueItem(keyItem, value) {
	if (!keyItem.has('values')) {
		const newSeq = selectedDoc.createNode([]);
		newSeq.type = 'SEQ';
		keyItem.set('values', newSeq);
	}

	const items = keyItem.get('values').items;
	let valItem = items.find(i => String(i.get('value')) === String(value));
	if (!valItem) {
		valItem = selectedDoc.createNode({ value });
		keyItem.get('values').add(valItem);
	}
	return valItem;
}

/**
 * Writes the description for a variant key to selectedDoc and updates data.
 * @param {string} variantKey
 * @param {string} description
 */
function WriteVariantKeyDescription(variantKey, description) {
	const item = GetOrCreateVariantKeyItem(variantKey);
	if (description) {
		item.set('description', description);
	} else {
		item.delete('description');
	}
	UpdateData();
}

/**
 * Writes the description for a specific variant value to selectedDoc and updates data.
 * @param {string} variantKey
 * @param {string} value
 * @param {string} description
 */
function WriteVariantValueDescription(variantKey, value, description) {
	const keyItem = GetOrCreateVariantKeyItem(variantKey);
	if (description) {
		const valItem = GetOrCreateVariantValueItem(keyItem, value);
		valItem.set('description', description);
	} else {
		// Remove the entire value entry when description is cleared
		if (keyItem.has('values')) {
			const items = keyItem.get('values').items;
			const idx = items.findIndex(i => String(i.get('value')) === String(value));
			if (idx !== -1) {
				items.splice(idx, 1);
			}
			if (items.length === 0) {
				keyItem.delete('values');
			}
		}
	}
	UpdateData();
}

/**
 * Writes the default flag for a specific variant value to selectedDoc and updates data.
 * @param {string} variantKey
 * @param {string} value
 * @param {boolean} isDefault
 */
function WriteVariantValueDefault(variantKey, value, isDefault) {
	const keyItem = GetOrCreateVariantKeyItem(variantKey);
	if (isDefault) {
		// Clear the default flag from all other value entries for this key
		if (keyItem.has('values')) {
			keyItem.get('values').items.forEach(valItem => {
				if (String(valItem.get('value')) !== String(value)) {
					valItem.delete('default');
				}
			});
		}
		const valItem = GetOrCreateVariantValueItem(keyItem, value);
		valItem.set('default', true);
	} else {
		if (keyItem.has('values')) {
			const items = keyItem.get('values').items;
			const valItem = items.find(i => String(i.get('value')) === String(value));
			if (valItem) valItem.delete('default');
		}
	}
	UpdateData();
}
