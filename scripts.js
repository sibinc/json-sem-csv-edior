function loadJSON() {
    const jsonInput = document.getElementById('jsonInput').value;
    let jsonObject;

    try {
        jsonObject = JSON.parse(jsonInput);
    } catch (error) {
        alert('Invalid JSON');
        return;
    }

    populateTable(jsonObject.csvTags);
}

function populateTable(csvTags) {
    const table = document.getElementById('jsonTable');
    const tableHead = document.getElementById('tableHead');
    tableHead.style.display = 'table-header-group';
    table.style.display = 'table';

    const tableBody = table.querySelector('tbody');
    tableBody.innerHTML = '';

    csvTags.forEach(tag => {
        const row = document.createElement('tr');

        for (const key of ['order', 'headName', 'code', 'displayName', 'isSubject']) {
            const cell = document.createElement('td');
            const input = document.createElement('input');
            input.type = key === 'isSubject' ? 'checkbox' : 'text';
            if (key === 'isSubject') {
                input.checked = tag[key];
            } else {
                input.value = tag[key];
                if (key === 'order' || key === 'headName' || key === 'displayName') {
                    input.addEventListener('input', checkForDuplicates);
                }
            }
            cell.appendChild(input);
            row.appendChild(cell);
        }

        tableBody.appendChild(row);
    });

    checkForDuplicates();
}

function exportJSON() {
    const tableBody = document.getElementById('jsonTable').querySelector('tbody');
    const rows = tableBody.querySelectorAll('tr');
    const jsonObject = { csvTags: [] };

    rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        const tag = {
            order: parseInt(cells[0].querySelector('input').value, 10),
            headName: cells[1].querySelector('input').value,
            code: cells[2].querySelector('input').value,
            displayName: cells[3].querySelector('input').value,
            isSubject: cells[4].querySelector('input').checked,
        };
        jsonObject.csvTags.push(tag);
    });

    const jsonString = JSON.stringify(jsonObject, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'modified_json.json';
    a.click();
    URL.revokeObjectURL(url);
}

function loadCSV() {
    const input = document.getElementById('csvInput');
    if (input.files.length === 0) {
        alert('Please select a CSV file');
        return;
    }

    const file = input.files[0];
    const reader = new FileReader();
    reader.onload = function(e) {
        const text = e.target.result;
        const csvTags = parseCSV(text);

        populateTable(csvTags);
        document.getElementById('jsonInput').value = JSON.stringify({ csvTags }, null, 2);
    };
    reader.readAsText(file);
}

function parseCSV(text) {
    const lines = text.split('\n');
    const headersString = lines[0].replace(/\t/g, ',');
    const headers = headersString.split(',').map(header => header.trim());
    const csvTags = [];
    const codeMap = {
        "ORG_NAME": "collegeName",
        "ACADEMIC_COURSE_ID": "degreeName",
        "COURSE_NAME": "degreeName",
        "ADMISSION": "admissionYear",
        "STREAM": "batchNameWithoutYear",
        "SESSION": "sessionName",
        "REGN_NO": "registerNo",
        "RROLL": "registerNo",
        "CNAME": "studentName",
        "GENDER": "genderFirstLetter",
        "DOB": "dob",
        "FNAME": "fatherName",
        "MNAME": "motherName",
        "PHOTO": "studentImageRegNo",
        "MRKS_REC_STATUS": "omcStatus",
        "RESULT": "class",
        "YEAR": "examYear",
        "MONTH": "examMonthNameFull",
        "PERCENT": "semesterPercentage",
        "CERT_NO": "slNo",
        "SEM": "academicTermNameInRoman",
        "TOT": "grandTotalMark",
        "TOT_MRKS": "semesterTotalMarksObtained",
        "TOT_CREDIT": "earnedCreditWithExcludeTotalCondition",
        "TOT_GRADE_POINTS": "totalGradePoint",
        "SGPA": "sgpa",
        "TOT_GRADE": "semesterGrandTotalGrade"
    };
    const secondLine = lines[1].replace(/\t/g, ',');
    const values = secondLine.split(',').map(value => value.trim());
    headers.forEach((header, index) => {
        if ((header.startsWith("SUB1") && !header.startsWith("SUB10")) || !header.startsWith("SUB")) {
            const isSubject = header.startsWith("SUB");
            var code = "";
            if(values[index]){
                 code = isSubject ? header.slice(0, -3).toLowerCase() : (codeMap[header] || header.toLowerCase());
            }else{
                 code = 'blank';
            }
            const order = index + 1;
            let displayName = header;
            let headName = header;
            if (isSubject) {
                headName = header.slice(4);
                displayName = header.slice(0, 3) + header.slice(4);
            }
            csvTags.push({
                code,
                order,
                headName,
                isSubject,
                displayName
            });
        }
    });

    return csvTags;
}

function sortTable() {
    const tableBody = document.getElementById('jsonTable').querySelector('tbody');
    const rowsArray = Array.from(tableBody.querySelectorAll('tr'));

    rowsArray.sort((a, b) => {
        const orderA = parseInt(a.querySelector('td:nth-child(1) input').value, 10);
        const orderB = parseInt(b.querySelector('td:nth-child(1) input').value, 10);
        return orderA - orderB;
    });

    tableBody.innerHTML = '';
    rowsArray.forEach(row => tableBody.appendChild(row));

    checkForDuplicates();
}

function correctOrder() {
    const tableBody = document.getElementById('jsonTable').querySelector('tbody');
    const rows = tableBody.querySelectorAll('tr');

    rows.forEach((row, index) => {
        const orderCell = row.querySelector('td:nth-child(1) input');
        orderCell.value = index + 1;
    });

    checkForDuplicates();
}

function addRow() {
    const table = document.getElementById('jsonTable');
    const tableHead = document.getElementById('tableHead');
    tableHead.style.display = 'table-header-group';
    table.style.display = 'table';

    const tableBody = table.querySelector('tbody');
    const row = document.createElement('tr');
    const orderValue = tableBody.querySelectorAll('tr').length + 1;

    for (const key of ['order', 'headName', 'code', 'displayName', 'isSubject']) {
        const cell = document.createElement('td');
        const input = document.createElement('input');
        input.type = key === 'isSubject' ? 'checkbox' : 'text';
        if (key === 'order' || key === 'headName' || key === 'displayName') {
            input.addEventListener('input', checkForDuplicates);
        }
        if (key === 'order') {
            input.value = orderValue;
        }
        cell.appendChild(input);
        row.appendChild(cell);
    }

    tableBody.appendChild(row);

    checkForDuplicates();
}

function checkForDuplicates() {
    const tableBody = document.getElementById('jsonTable').querySelector('tbody');
    const rows = Array.from(tableBody.querySelectorAll('tr'));
    const orderValues = rows.map(row => row.querySelector('td:nth-child(1) input').value);
    const headNameValues = rows.map(row => row.querySelector('td:nth-child(2) input').value);
    const displayNameValues = rows.map(row => row.querySelector('td:nth-child(4) input').value);
    const isSubjectValues = rows.map(row => row.querySelector('td:nth-child(5) input').checked);

    // Reset all inputs
    rows.forEach(row => {
        row.querySelector('td:nth-child(1) input').classList.remove('error');
        row.querySelector('td:nth-child(2) input').classList.remove('error');
        row.querySelector('td:nth-child(4) input').classList.remove('error');
    });

    // Find duplicates in orders
    const duplicateOrders = orderValues.filter((value, index, self) => self.indexOf(value) !== index && value !== "");

    // Highlight duplicate orders
    duplicateOrders.forEach(duplicate => {
        rows.forEach(row => {
            const orderInput = row.querySelector('td:nth-child(1) input');
            if (orderInput.value === duplicate) {
                orderInput.classList.add('error');
            }
        });
    });

    // Find duplicates in headName and isSubject combination
    const uniqueCombinations = new Set();
    const duplicateCombinations = new Set();
    rows.forEach((row, index) => {
        const headName = headNameValues[index];
        const isSubject = isSubjectValues[index];
        const key = `${headName}-${isSubject}`;

        if (uniqueCombinations.has(key)) {
            duplicateCombinations.add(key);
        } else {
            uniqueCombinations.add(key);
        }
    });

    // Highlight duplicate headName and isSubject combinations
    duplicateCombinations.forEach(duplicate => {
        rows.forEach(row => {
            const headNameInput = row.querySelector('td:nth-child(2) input');
            const isSubjectInput = row.querySelector('td:nth-child(5) input');
            const key = `${headNameInput.value}-${isSubjectInput.checked}`;
            if (key === duplicate) {
                headNameInput.classList.add('error');
            }
        });
    });

    // Find duplicates in displayName
    const duplicateDisplayNames = displayNameValues.filter((value, index, self) => self.indexOf(value) !== index && value !== "");

    // Highlight duplicate displayNames
    duplicateDisplayNames.forEach(duplicate => {
        rows.forEach(row => {
            const displayNameInput = row.querySelector('td:nth-child(4) input');
            if (displayNameInput.value === duplicate) {
                displayNameInput.classList.add('error');
            }
        });
    });
}

function resetJSON() {
    document.getElementById('jsonInput').value = '';
    const table = document.getElementById('jsonTable');
    const tableBody = table.querySelector('tbody');
    tableBody.innerHTML = '';
    table.style.display = 'none';
}

function toggleTextareaSize() {
    const textarea = document.getElementById('jsonInput');
    const expandBtn = document.querySelector('.expand-btn i');
    if (textarea.style.height === '400px') {
        textarea.style.height = '150px';
        expandBtn.className = 'fas fa-expand';
    } else {
        textarea.style.height = '400px';
        expandBtn.className = 'fas fa-compress';
    }
}

function formatJSON() {
    const jsonInput = document.getElementById('jsonInput');
    try {
        const jsonObject = JSON.parse(jsonInput.value);
        jsonInput.value = JSON.stringify(jsonObject, null, 2);
    } catch (error) {
        alert('Invalid JSON');
    }
}