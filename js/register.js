document.getElementById('registerForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    document.querySelectorAll('.error').forEach(error => {
        error.style.display = 'none';
    });
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    let users = localStorage.getItem("users");
    
    let isValid = true;

    if (users.find()) {
        
    }

    if (!email) {
        showError('emailError', 'Email không được để trống');
        isValid = false;
    } else if (!isValidEmail(email)) {
        showError('emailError', 'Email không đúng định dạng');
        isValid = false;
    }
    
    if (!password) {
        showError('passwordError', 'Mật khẩu không được để trống');
        isValid = false;
    } else if (password.length < 6) {
        showError('passwordError', 'Mật khẩu phải có ít nhất 6 ký tự');
        isValid = false;
    }

    if (!confirmPassword) {
        showError('confirmPasswordError', 'Xác nhận mật khẩu không được để trống');
        isValid = false;
    } else if (password !== confirmPassword) {
        showError('confirmPasswordError', 'Mật khẩu xác nhận không khớp');
        isValid = false;
    }
    
    if (isValid) {
        const users = JSON.parse(localStorage.getItem('users')) || [];
        users.push({ email, password });
        localStorage.setItem('users', JSON.stringify(users));
        
        window.location.href = 'login.html';
    }
});

function showError(elementId, message) {
    const element = document.getElementById(elementId);
    element.textContent = message;
    element.style.display = 'block';
}

function isValidEmail(email) {
    return email.includes("@") && (email.endsWith("gmail.com") || email.endsWith("gmail.vn") || email.endsWith("outlook.com") || email.endsWith(".edu"));
}