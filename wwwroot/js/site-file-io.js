/**
 * Save YAML content to disk.
 */
function SaveAs() {
	const bb = new Blob([cm.getValue()], { type: 'application/yaml' });
	const tmp = document.createElement('a');
	let fileName;

	if (yamlData[0] == null) {
		fileName = "document.yaml";
	}
	//This will be filled in as the file was loaded from GitHub, so fileName is already in compliance with st-channel name (if appropriate)
	else if (document.getElementById('YamlFileName').textContent !== '') {
		fileName = document.getElementById('YamlFileName').textContent;
	}

	else {
		if (localStorage.getItem('use-st-channel-filenames') === 'true') {
			const pkg = GetDocument('p', 0);
			if (Object.hasOwn(pkg.info, 'website')) {
				fileName = pkg.info.website.substring(45, pkg.info.website.indexOf('-'));
			}
			else if (Object.hasOwn(pkg.info, 'websites')) {
				fileName = pkg.info.websites[0].substring(45, pkg.info.websites[0].indexOf('-'));
			}
			fileName = fileName + '-' + pkg.name + pkg.assetId + '.yaml';
		}
		else {
			fileName = (IsPackage(yamlData[0]) ? yamlData[0].name : yamlData[0].assetId) + '.yaml';
		}

	}
	tmp.download = fileName;
	tmp.href = window.URL.createObjectURL(bb);
	tmp.click();
	tmp.remove();
}


/**
 * Load YAML content from a local file.
 */
function LoadFromFile() {
	const tmp = document.createElement("input")
	tmp.type = 'file'
	tmp.style.display = 'none'
	tmp.onchange = function (e) {
		const file = e.target.files[0];
		if (!file) {
			return;
		}
		document.getElementById('YamlFileName').textContent = file.name
		const reader = new FileReader();
		reader.onload = function (e) {
			const contents = e.target.result;
			cm.setValue(contents);
			tmp.remove();
		}
		reader.readAsText(file);
	}
	tmp.click();
}


/**
 * Load YAML content from a GitHub file tree.
 * @param {Element} srcElem Source element this function is being called from.
 *
 * If the element is `a` then this is triggered from the open menu or the breadcrumb menu, and we want to navigate to the base folder of the GitHub files; if the element is `BUTTON` then its being triggered from a button click in the modal dialog, and we want to navigate to a subfolder of the GitHub files. Basically, links go to the root folder level, buttons go to a subfolder level.
 * @param {string} channel Name of the channel to fetch data from, e.g. 'default' or 'zasco' or 'simtropolis'
 */
async function LoadFromGithub(srcElem, channel) {
	const crumbNav = document.getElementById('ChannelBreadcrumb');
	const level = (srcElem.tagName === 'A') ? 1 : 2;

	//Set the base srcUrl and update the breadcrumb menu.
	let srcUrl;
	if (level === 1) {
		switch (channel.toLowerCase()) {
			case 'default':
				srcUrl = 'https://api.github.com/repos/memo33/sc4pac/branches/main';
				break;
			case 'simtropolis':
				srcUrl = 'https://api.github.com/repos/sebamarynissen/simtropolis-channel/branches/main';
				break;
			case 'zasco':
				srcUrl = 'https://api.github.com/repos/Zasco/sc4pac-channel/branches/main';
				break;
		}
		if (srcElem.textContent !== 'Root') {
			githubNavDialog._element.querySelector('.modal-title').textContent = srcElem.innerHTML;
		}
		if (crumbNav.children.length > 1) {
			crumbNav.lastElementChild.remove();
			crumbNav.firstElementChild.firstElementChild.remove(); //remove the <a> link
			crumbNav.firstElementChild.textContent = 'Root';
			crumbNav.firstElementChild.className = 'breadcrumb-item active'
		}
	}
	else {
		srcUrl = srcElem.value;

		let prevCrumb = crumbNav.firstElementChild
		prevCrumb.className = 'breadcrumb-item';
		prevCrumb.textContent = '';

		let newLink = document.createElement('a');
		newLink.href = '#';
		newLink.textContent = 'Root';
		newLink.addEventListener('click', function () { LoadFromGithub(this, channel); });
		prevCrumb.appendChild(newLink);

		let newCrumb = document.createElement('li');
		newCrumb.className = 'breadcrumb-item active';
		newCrumb.textContent = srcElem.textContent;
		crumbNav.appendChild(newCrumb);
	}

	if (level === 1) {
		fetch(srcUrl)
			.then(response => response.json())
			.then(data => {
				let mainUrl = data.commit.commit.tree.url;
				return fetch(mainUrl);
			})
			.then(response => response.json())
			.then(data => {
				let srcUrl = data.tree.find(t => t.path === 'src').url;
				return fetch(srcUrl);
			})
			.then(response => response.json())
			.then(data => {
				let yamlUrl = data.tree[0].url;
				return fetch(yamlUrl);
			})
			.then(response => response.json())
			.then(data => {
				CreateButtonList(data, level);
			})
			.catch(error => console.error('Error fetching the tree data:', error));
	}
	else {
		fetch(srcUrl)
			.then(response => response.json())
			.then(data => {
				CreateButtonList(data, level);
			})
			.catch(error => console.error('Error fetching the tree data:', error));
	}

	
	/**
	 * Create a list of linked buttons for the modal dialog representing author folders or YAML files.
	 */
	function CreateButtonList(data, level) {
		const listDiv = githubNavDialog._element.querySelector('.list-group');
		listDiv.textContent = '';
		data.tree
			.filter((obj) => obj.path.charAt(0) !== '.')
			.forEach(obj => {
				const btn = document.createElement('button');
				btn.className = 'list-group-item list-group-item-action';
				btn.textContent = obj.path;
				btn.value = obj.url;
				if (level === 1) {
					btn.addEventListener('click', function () { LoadFromGithub(this, channel); });
				} else {
					btn.addEventListener('click', function () { GetFileContent(this.value, obj.path); });
				}

				listDiv.appendChild(btn);
			});
	}

	/**
	 * Return the text content of a file from a GitHub url.
	 * @param {any} url GitHub folder URL
	 * @param {any} fileName Filename to fetch content in
	 */
	function GetFileContent(url, fileName) {
		fetch(url)
			.then(response => response.json())
			.then(data => {
				document.getElementById('YamlFileName').textContent = fileName;
				cm.setValue(DecodeBase64Unicode(data.content));
			})
			.catch(error => console.error('Error fetching the tree data:', error));

		githubNavDialog.hide();
	}

	function DecodeBase64Unicode(base64) {
		const binaryString = atob(base64);
		return decodeURIComponent(
			binaryString
				.split('')
				.map(char => `%${char.charCodeAt(0).toString(16).padStart(2, '0')}`)
				.join('')
		);
	}
}

/**
 * Fetch details from a given STEX file url and convert it to YAML metadata
 * 
 * May require disabling CORS with an extension like: https://addons.mozilla.org/en-US/firefox/addon/cross-domain-cors/
 * @param {string} stexUrl STEX file url
 * @param {string} apiKey Personal STEX API token
 * 
 */
async function FetchFromStex(stexUrl, apiKey) {
	if (stexUrl === '' || stexUrl === undefined) {
		return;
	}
	if (apiKey === '' || apiKey === undefined || apiKey === null) {
		console.error('Error: No API key has been set');
		return;
	}

	const stexId = stexUrl.match(/\d{2,5}/)[0];
	const queryUrl = `https://community.simtropolis.com/stex/files-api.php?key=${apiKey}&id=${stexId}&desctype=html&images=main`;
	const ts = new TurndownService()

	fetch(queryUrl)
		.then(response => response.json())
		.then(data => {
			const result = data[0];
			const newPkg = new YAML.Document({
				group: result.aliasAuthor,
				name: result.aliasEntry,
				version: result.release,
				subfolder: "",
				info: {
					website: result.fileURL,
					summary: result.title,
					author: result.author,
					description: ts.turndown(result.descHTML),
					images: result.images
				}
			});
			const newAssets = result.files.map(f => new YAML.Document({
					url: result.fileURL + '/?do=download&r=' + f.id,
					assetId: result.aliasAuthor + '-' + f.name.substring(0, f.name.lastIndexOf('.')).replaceAll(' ', '-').normalize('NFKD').replace(/[^\w-:;\n]/g, '').toLowerCase(),
					version: result.release,
					lastModified: result.updated
				})
			);

			let yamlString = YAML.stringify(newPkg, options = { lineWidth: 0}) + '\n---\n';
			yamlString = yamlString + newAssets.map(a => YAML.stringify(a)).join('\n---\n');

			cm.setValue(yamlString);
			document.getElementById('StexUrl').value = '';
			stexFetchDialog.hide();

		})
		.catch(error => console.error('Error fetching from the STEX API:', error));
}