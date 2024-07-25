document.addEventListener('DOMContentLoaded', () => {
    const selectElement = document.getElementById('selectStoreName');
    const btnas = document.getElementById('buttonAllSelect');
    const btnac = document.getElementById('buttonAllCancellation');
    const categoryForm = document.getElementById('categoryForm');

    function getSelectedCategories() {
        return Array.from(categoryForm.querySelectorAll('input[name="category-name"]:checked'))
            .map(input => input.value);
    }

    function getSelectedStoreName() {
        return Array.from(selectElement.options)
            .filter(option => option.selected)
            .map(option => option.value);
    }

    function consoleSelected() {
        console.log('Selected storenames:', getSelectedStoreName());
        console.log('Selected categories:', getSelectedCategories());
    }


    /* ========== storename ========== */

    // POST: => e.g., 
    // Selected stores: ['上津役', '上三緒', '福岡空港', '田川後藤寺']
    // Selected categories: [ '鮮魚・寿司', 'グロサリー', '季節雑貨', '洋日配' ]
    function postSelection() {
        const selectedStores = getSelectedStoreName();
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
        const selectedOptions = getSelectedStoreName();
        document.getElementById('displayStoreName').textContent = selectedOptions.join(', ');
    }

    // display selected store name
    selectElement.addEventListener('mousedown', (e) => {
        e.preventDefault();
        const option = e.target;
        if (option.tagName === 'OPTION') {
            option.selected = !option.selected;
            postSelection();
            displaySelectedOptions();
            consoleSelected();
        }
    });

    // all selection and is post when button is clicked
    // btnas <= butte all selection
    btnas.addEventListener('click', () => {
        Array.from(selectElement.options).forEach(option => option.selected = true);
        postSelection();
        displaySelectedOptions();
        consoleSelected();
    });

    // all cancellation and is post when button is clicked
    // btnac <= butte all cancellation
    btnac.addEventListener('click', () => {
        Array.from(selectElement.options).forEach(option => option.selected = false);
        postSelection();
        displaySelectedOptions();
        consoleSelected();
    });

    /* =========== Category ========= */
    categoryForm.addEventListener('change', () => {
        postSelection();
        consoleSelected();
    });

    consoleSelected();


    /* =========== Image ========= */
    /*
    // Pathを取得
    console.log("image", getSelectedCategories());
    console.log("image", getSelectedStoreName());

    // 単一イメージの表示
    const imageDisplay = (path) => {
        let imgElement = document.createElement('img');
        imgElement.src = path;
        imgElement.width = 400;
        imgElement.height = 400;
        let imageArea = document.getElementById("imageArea");
        imageArea.appendChild(imgElement);
    }


    let path1 = 'img/上津役/neko.jpg';
    let path2 = 'img/稲筑/neko.jpg';
    let selectedCategory = getSelectedCategories()[0];
    let selectedStoreName = getSelectedStoreName()[0];
    let path_test = `img/${selectedStoreName}/${selectedCategory}` 
    console.log(path_test);
    imageDisplay(path_test);
    imageDisplay(path2);
    */



});
