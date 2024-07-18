document.addEventListener('DOMContentLoaded', () => {
    const selectElement = document.getElementById('selectStoreName');
    const btnas = document.getElementById('buttonAllSelect');
    const btnac = document.getElementById('buttonAllCancellation');

    // if check 青果, 惣菜, then we have an array [青果, 惣菜]
    function getSelectedCategories() {
        const categoryForm = document.getElementById('categoryForm');
        return Array.from(categoryForm.querySelectorAll('input[name="category-name"]:checked'))
                    .map(input => input.value);
    }

    // post categoryNameArray and storeNameArray to server
    function postSelection(options) {
        const selectedOptions = Array.from(options)
                                    .filter(option => option.selected)
                                    .map(option => option.value);
        console.log(selectedOptions);

        fetch('/updateImage', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ selectedStores: selectedOptions, selectedCategories: getSelectedCategories() })
        }).then(response => {
            if (response.ok) {
                console.log('Selection updated');
            } else {
                console.error('Failed to update selection');
            }
        }).catch(error => {
            console.error('Error:', error);
        });
    }

    // post selected store name to server 
    function displaySelectedOptions() {
        const selectedOptions = Array.from(selectElement.options)
            .filter(option => option.selected)
            .map(option => option.value);
        document.getElementById('displayStoreName').textContent = `${(selectedOptions)}`;
    }

    // display selected store name
    selectElement.addEventListener('mousedown', function (e) {
        e.preventDefault();
        const option = e.target;
        if (option.tagName === 'OPTION') {
            option.selected = !option.selected;
            postSelection(selectElement.options);
            displaySelectedOptions();
        }
    });

    // all selection when button is cllicked
    btnas.addEventListener('click', () => {
        Array.from(selectElement.options).forEach(option => option.selected = true);
        postSelection(selectElement.options);
        displaySelectedOptions();
    });

    // all cancellation when button is clicked
    btnac.addEventListener('click', () => {
        Array.from(selectElement.options).forEach(option => option.selected = false);
        postSelection(selectElement.options);
        displaySelectedOptions();
    });
});