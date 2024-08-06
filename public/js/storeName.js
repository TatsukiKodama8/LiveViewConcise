/* branch fix_display */

const initilizeChild = (element) => {
    while(element.firstChild) {
        element.removeChild(element.firstChild);
    }
}

// @{path}  : image path
// @{id}    : id got from getElemtnById 
const displayImage = (path, id) => {
    const GOLDEN_RATIO = (1 + Math.sqrt(5))/2;
    const img = document.createElement('img');
    img.src = path;
    img.height = 200; 
    img.width = img.height * GOLDEN_RATIO;
    id.appendChild(img);
}

document.addEventListener('DOMContentLoaded', () => {
    const selectElement = document.getElementById('selectStoreName');
    const btnas = document.getElementById('buttonAllSelect');
    const btnac = document.getElementById('buttonAllCancellation');
    const categoryForm = document.getElementById('categoryForm');
    const IMAGE_MAX_NUM = 6;
    const SEC_TO_MSEC = 1000;
    const GOLDEN_RATIO = (1 + Math.sqrt(5))/2;
    let globalStopInterval = 0;

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
        })
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('Failed to update selection');
            }
        })
        .then(data => {
            const imageContainer = document.getElementById('image-container');

            // 画像の初期化
            initilizeChild(imageContainer);

            // カテゴリ名・店舗名の表示
            document.getElementById('displayedStore')
                .textContent = data['store'];
            document.getElementById('displayedCategory')
                .textContent = data['category'];

            // ここで画像の表示
            dataArray = data['path'];   // pathの入った配列
            imgPath = dataArray[0];     // path
            imgPathNum = dataArray.length;  // 配列の要素数
            dataArray.forEach((path) => displayImage(path, imageContainer)); // 全部表示
        })
    }

    // post selected store name to server 
    function displaySelectedOptions() {
        const selectedOptions = getSelectedStoreName();
        document.getElementById('selectedStoreName').textContent = selectedOptions.join(', ');
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

});
