document.addEventListener('DOMContentLoaded', () => {
    const selectElement = document.getElementById('selectStoreName');
    const btnas = document.getElementById('buttonAllSelect');
    const btnac = document.getElementById('buttonAllCancellation');
    const categoryForm = document.getElementById('categoryForm');

    function getSelectedCategories() {
        return Array.from(categoryForm.querySelectorAll('input[name="category-name"]:checked'))
                    .map(input => input.value);
    }

    // POST: => e.g., 
    // Selected stores: ['上津役', '上三緒', '福岡空港', '田川後藤寺']
    // Selected categories: [ '鮮魚・寿司', 'グロサリー', '季節雑貨', '洋日配' ]
    function postSelection() {
        const selectedStores = Array.from(selectElement.options)
                                    .filter(option => option.selected)
                                    .map(option => option.value);
        const selectedCategories = getSelectedCategories();

        fetch('/updateImage', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ selectedStores, selectedCategories })
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
            postSelection();
            displaySelectedOptions();
        }
    });

    // all selection and is post when button is clicked
    btnas.addEventListener('click', () => {
        Array.from(selectElement.options).forEach(option => option.selected = true);
        postSelection();
        displaySelectedOptions();
    });

    // all cancellation and is post when button is clicked
    btnac.addEventListener('click', () => {
        Array.from(selectElement.options).forEach(option => option.selected = false);
        postSelection();
        displaySelectedOptions();
    });

    // is posted when button is clicked
    categoryForm.addEventListener('change', () => {
        postSelection();
    });
});