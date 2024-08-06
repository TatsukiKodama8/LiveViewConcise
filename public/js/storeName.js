const initilizeChild = (element) => {
    while(element.firstChild) {
        element.removeChild(element.firstChild);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const selectElement = document.getElementById('selectStoreName');
    const btnas = document.getElementById('buttonAllSelect');
    const btnac = document.getElementById('buttonAllCancellation');
    const categoryForm = document.getElementById('categoryForm');
    const IMAGE_MAX_NUM = 6;
    const SEC_TO_MSEC = 1000;
    const GOLDEN_RATIO = (1 + Math.sqrt(5))/2;
    const imageContainer = document.getElementById('image-container'); // 適切なIDに置き換えてください
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
                return response.json(); // JSONに変換
            } else {
                throw new Error('Failed to update selection');
            }
        })
        .then(data => {
            console.log(data);

            // 例: data['上津役']['精肉'][0] にある画像パスを使って画像を表示
            const displayPath = (storeStr, categStr, startNum) => {
                let maxPathLength = data[storeStr][categStr].length;
                let upperBound = (maxPathLength < (startNum+IMAGE_MAX_NUM)) ? maxPathLength : (startNum+IMAGE_MAX_NUM);
                for(let i=startNum; i<upperBound; i++){
                    const imgPath = data[storeStr][categStr][i];
                    const noImgPath = "img/noimage.png";

                    // 画像を表示するためのimg要素を作成
                    const img = document.createElement('img');
                    img.src = (imgPath === null) ? noImgPath : imgPath;

                    // 画像サイズをJavaScriptで指定
                    img.height = 200; 
                    img.width = img.height * GOLDEN_RATIO;
                    
                    imageContainer.appendChild(img);
                }
            }

            const storeNum = Object.keys(data).length;
            const categNum = Object.keys(data[selectedStores[0]]).length;
            function updateDisplay() {
                initilizeChild(imageContainer);
                document.getElementById('displayedStore').textContent = selectedStores[i];
                document.getElementById('displayedCategory').textContent = selectedCategories[j];
                let pathNum = data[selectedStores[i]][selectedCategories[j]].length;
                displayPath(selectedStores[i], selectedCategories[j], k);
                
                // 画像の遷移
                k = k + IMAGE_MAX_NUM;          // 画像を６枚ずつずらす
                if (k >= pathNum) {             // 用意されているよりkが大きくなれば
                    k = 0;                      // kを初期化して
                    j++;                        // 次のカテゴリへ
                    if (j >= categNum) {        // 選択されたカテゴリよりも大きくなれば
                        j = 0;                  // jを初期化して
                        i = (i + 1) % storeNum; // 次の店舗へ
                    }
                }
            }
            
            clearInterval(globalStopInterval);

            let i = 0;
            let j = 0;
            let k = 0;
            globalStopInterval = setInterval(updateDisplay, 1 * SEC_TO_MSEC);

        })
        .catch(error => {
            console.error('Error:', error);
        });
    }

    // post selected store name to server 
    function displaySelectedOptions() {
        const selectedOptions = getSelectedStoreName();
        document.getElementById('selectedStoreName').textContent = selectedOptions.join(', ');
    }

    const displayImageDefault = () => {
            clearInterval(globalStopInterval);
            initilizeChild(imageContainer);
            postSelection();
            displaySelectedOptions();
            consoleSelected();
    }

    // display selected store name
    selectElement.addEventListener('mousedown', (e) => {
        e.preventDefault();
        const option = e.target;
        if (option.tagName === 'OPTION') {
            option.selected = !option.selected;
            displayImageDefault();
        }
    });

    // all selection and is post when button is clicked
    // btnas <= butte all selection
    btnas.addEventListener('click', () => {
        Array.from(selectElement.options).forEach(option => option.selected = true);
        displayImageDefault();
    });

    // all cancellation and is post when button is clicked
    // btnac <= butte all cancellation
    btnac.addEventListener('click', () => {
        Array.from(selectElement.options).forEach(option => option.selected = false);
        displayImageDefault();
    });

    /* =========== Category ========= */
    categoryForm.addEventListener('change', () => {
        displayImageDefault();
    });

    postSelection();
    consoleSelected();

});
