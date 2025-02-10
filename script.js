let jsonData = null;

function parseJson() {
    const input = document.getElementById('jsonInput').value;
    const errorMsg = document.getElementById('errorMsg');
    const tableContainer = document.getElementById('tableContainer');
    
    try {
        const parsed = JSON.parse(input);
        if (!parsed.csvTags) {
            throw new Error('JSON must contain a csvTags array');
        }
        jsonData = parsed;
        errorMsg.textContent = '';
        tableContainer.style.display = 'block';
        renderTable();
        updateOutput();
    } catch (err) {
        errorMsg.textContent = 'Invalid JSON: ' + err.message;
        tableContainer.style.display = 'none';
        jsonData = null;
    }
}

function renderTable() {
    const tbody = document.getElementById('tableBody');
    tbody.innerHTML = '';

    jsonData.csvTags.forEach((tag, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td><input type="text" value="${tag.code}" onchange="updateField(${index}, 'code', this.value)"></td>
            <td><input type="number" value="${tag.order}" onchange="updateField(${index}, 'order', this.value)"></td>
            <td><input type="text" value="${tag.headName}" onchange="updateField(${index}, 'headName', this.value)"></td>
            <td>
                <select onchange="updateField(${index}, 'isSubject', this.value === 'true')">
                    <option value="true" ${tag.isSubject ? 'selected' : ''}>True</option>
                    <option value="false" ${!tag.isSubject ? 'selected' : ''}>False</option>
                </select>
            </td>
            <td><input type="text" value="${tag.displayName}" onchange="updateField(${index}, 'displayName', this.value)"></td>
        `;
        tbody.appendChild(row);
    });
}

function updateField(index, field, value) {
    if (field === 'order') {
        value = parseInt(value) || 0;
    }
    jsonData.csvTags[index][field] = value;
    updateOutput();
}

function updateOutput() {
    const output = document.getElementById('jsonOutput');
    output.value = JSON.stringify(jsonData, null, 2);
}

function copyToClipboard() {
    const output = document.getElementById('jsonOutput');
    output.select();
    document.execCommand('copy');
    alert('Copied to clipboard!');
}
