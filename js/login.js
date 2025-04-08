document.getElementById('loginForm').addEventListener('submit', function(e){
    e.preventDefault();

    document.querySelectorAll('.error').forEach(error => {
        error.style.display = 'none';
    });

    let email = document.getElementById('email').value;
    let password = document.getElementById('password').value;

    let users = JSON.parse(localStorage.getItem('users'));
    const user = users.find(user => user.email === email && user.password === password);
    
    if (!user) {
        showError('passwordError', 'Tài khoản hoặc mật khẩu không đúng');
        return;
    }
    
    window.location.href = 'index.html';
    localStorage.setItem('isLoggedIn', true);
});

function showError(elementId, message) {
    const element = document.getElementById(elementId);
    element.textContent = message;
    element.style.display = 'block';
}