
/* constant */
const PASSWORD_LENGTH_MINIMUM = 8;

/* password系の関数 */
// 大文字と小文字が混じっている
function isIncludedUppercaseAndLowercase (password) {
    let strPassword = password.toString();
    if (strPassword.match(/[a-z]/) && strPassword.match(/[A-Z]/)) {
        return true
    } else {
        return false;
    }
}

// 数字が含まれている
function isIncludedNumber (password) {
    let strPassword = password.toString();
    if (strPassword.match(/\d/)) {
        return true
    } else {
        return false;
    }
}

// 特殊文字が含まれている
function isIncludedSpecialCharacter (password) {
    let strPassword = password.toString();
    if (strPassword.match(/[^a-zA-Z\d]/)) {
        return true
    } else {
        return false;
    }
}


// passwordをチェックする関数
function passwordCheck(id, password){
    // 文字数がPASSWORD_LENGTH_MINIMUM以上あることを要請
    if (password.length <= PASSWORD_LENGTH_MINIMUM) {
        console.log(password);
        id.textContent = `Password must be at least ${PASSWORD_LENGTH_MINIMUM} characters long.`;
        return false; // フォーム送信をブロック
    }  
    /*
    // 大文字と小文字を使っている
    if (!isIncludedUppercaseAndLowercase(password)){
        id.textContent = "Password must be included both uppercase and lowercae characters.";
        return false;
    }

    // 数字が含まれている
    if (!isIncludedNumber(password)){
        id.textContent = "Password must be included a number at least.";
        return false;
    }

    // 特殊文字が含まれている
    if (!isIncludedSpecialCharacter(password)){
        id.textContent = "Password must be included a special charactor at least.";
        return false;
    }
    */

    id.textContent = ""; // エラーメッセージをクリア
        return true;
}


// submitを押すと以下が実行される
let formElement         = document.getElementById('form');
let errorMessageElement = document.getElementById('errorMessage');

formElement.onsubmit = function(event) {
    event.preventDefault();
    let password = formElement.password.value;

    // パスワードが規定通りでなければエラーメッセージを表示し、フォーム送信をブロック
    if (!passwordCheck(errorMessageElement, password) === true){
        return;
    } else {
        // パスワードが規定通りならば、改めてsubmit
        formElement.submit();
    }
}

