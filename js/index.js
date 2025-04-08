// Khởi tạo biến
let monthlyCategories = JSON.parse(localStorage.getItem('monthlyCategories')) || []; 
let currentMonth = ""; 

document.getElementById('logoutBtn').addEventListener('click', function() {
    document.getElementById('logoutNotification').style.display = 'block';
});

document.getElementById('confirmLogout').addEventListener('click', function() {
    window.location.href = 'login.html';
});

document.getElementById('cancelLogout').addEventListener('click', function() {
    document.getElementById('logoutNotification').style.display = 'none';
}); 

function checkLogin() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
        window.location.href = 'login.html';
    }
}
window.addEventListener('beforeunload', function () {
    localStorage.removeItem('isLoggedIn');
});


// Hàm để lưu dữ liệu vào localStorage
function saveToLocalStorage() {
    localStorage.setItem('monthlyCategories', JSON.stringify(monthlyCategories));
}

// Sự kiện lưu ngân sách
document.getElementById('saveBudgetBtn').addEventListener('click', function() {
    const budgetInput = document.getElementById('budgetInput').value;
    const monthInput = document.getElementById('monthSelect').value; 
    const totalBudgetError = document.getElementById('totalBudgetError'); 

    // Ẩn thông báo lỗi trước khi kiểm tra
    totalBudgetError.style.display = 'none';
    document.getElementById("budgetInput").value = "";

    if (!budgetInput || isNaN(budgetInput) || parseFloat(budgetInput) <= 0 || budgetInput %1 != 0) {
        totalBudgetError.textContent = 'Chưa nhập ngân sách tháng hợp lệ!';
        totalBudgetError.style.display = 'block'; 
        return;
    }
    
    const currentBudget = parseFloat(budgetInput);
    currentMonth = monthInput;

    // Cập nhật ngân sách cho tháng đã chọn
    const existingMonth = monthlyCategories.find(item => item.month === monthInput);
    if (existingMonth) {
        existingMonth.amount = currentBudget;
    } else {
        monthlyCategories.push({id: Math.floor((Math.random(Date))*100), month: monthInput, categories: [], amount: currentBudget }); 
    }

    document.getElementById('remainingAmount').textContent = currentBudget.toLocaleString() + ' VND';
    saveToLocalStorage(); 
});

// Sự kiện khi chọn tháng
document.getElementById('monthSelect').addEventListener('change', function() {
    totalBudgetError.style.display = 'none'; 
    const selectedMonth = this.value;
    displayCategoriesByMonth(selectedMonth);
    const monthData = monthlyCategories.find(item => item.month === selectedMonth);
    if (monthData) {
        document.getElementById('remainingAmount').textContent = monthData.amount.toLocaleString() + ' VND';
    }
});

// Sự kiện thêm danh mục
document.getElementById('addCategoryBtn').addEventListener('click', function() {
    const categoryName = document.getElementById('categoryName').value;
    const categoryAmount = document.getElementById('categoryLimit').value;

    if (!categoryName || !categoryAmount) {
        alert('Chưa nhập tên danh mục hoặc mức tiền chi tiêu!');
        return;
    }

    const amount = parseFloat(categoryAmount);
    const category = { id: Math.floor((Math.random(Date))*100), name: categoryName, amount: amount };
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0 || amount %1 != 0) {
        alert("Số tiền không hợp lệ");
    } else {
        // Cập nhật danh mục cho tháng hiện tại
        const monthData = monthlyCategories.find(item => item.month === currentMonth);
        if (monthData) {
            monthData.categories.push(category); 
        }
    
        // hiển thị danh sách danh mục
        updateCategoryList(currentMonth);
        saveToLocalStorage(); 
    
        document.getElementById('categoryName').value = '';
        document.getElementById('categoryLimit').value = '';
    }
 

});

// Hàm cập nhật hiển thị danh sách danh mục
function updateCategoryList(month) {
    const categoriesList = document.getElementById('categoriesList');
    categoriesList.innerHTML = ''; 

    const monthData = monthlyCategories.find(item => item.month === month);
    if (monthData) {
        monthData.categories.forEach(category => {
            const categoryDiv = document.createElement('div');
            categoryDiv.className = 'content2';
            categoryDiv.innerHTML = `
                <div class="item">${category.name} - Chi tiêu: ${category.amount.toLocaleString()} VND</div>
                <div class="item_button">
                    <button onclick="editCategory('${month}', ${category.id})">Sửa</button>
                    <button onclick="removeCategory('${month}', ${category.id})">Xóa</button>
                </div>`;
            categoriesList.appendChild(categoryDiv);
        });
    }
}

// Hàm sửa danh mục
function editCategory(month, id) {
    const monthData = monthlyCategories.find(item => item.month === month);
    if (monthData) {
        const category = monthData.categories.find(cat => cat.id === id);
        if (category) {
            // Điền thông tin vào các trường nhập
            document.getElementById('categoryName').value = category.name;
            document.getElementById('categoryLimit').value = category.amount;

            // Xóa danh mục cũ
            removeCategory(month, id);
        }
    }
}

// Hàm xóa danh mục
function removeCategory(month, id) {
    const monthData = monthlyCategories.find(item => item.month === month);
    if (monthData) {
        monthData.categories = monthData.categories.filter(category => category.id !== id);
        updateCategoryList(month); 
        saveToLocalStorage(); 
    }
}

// Hàm hiển thị danh mục theo tháng
function displayCategoriesByMonth(selectedMonth) {
    const categoriesList = document.getElementById('categoriesList');
    categoriesList.innerHTML = ''; 

    const monthData = monthlyCategories.find(item => item.month === selectedMonth);
    if (monthData) {
        monthData.categories.forEach(category => {
            const categoryDiv = document.createElement('div');
            categoryDiv.className = 'content2';
            categoryDiv.innerHTML = `
                <div class="item">${category.name} - Chi tiêu: ${category.amount.toLocaleString()} VND</div>
                <div class="item_button">
                    <button onclick="editCategory('${selectedMonth}', ${category.id})">Sửa</button>
                    <button onclick="removeCategory('${selectedMonth}', ${category.id})">Xóa</button>
                </div>`;
            categoriesList.appendChild(categoryDiv);
        });
    }
}

// Khôi phục dữ liệu từ localStorage khi trang được tải
window.onload = function() {
    checkLogin(); 
    const monthSelect = document.getElementById('monthSelect');
    monthlyCategories.forEach(monthData => {
        const option = document.createElement('option');
        option.value = monthData.month;
        option.textContent = monthData.month;
        monthSelect.appendChild(option);
    });
    if (monthlyCategories.length > 0) {
        currentMonth = monthlyCategories[0].month; 
        displayCategoriesByMonth(currentMonth); 
    }
};