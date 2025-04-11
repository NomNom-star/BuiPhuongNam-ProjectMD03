// Khởi tạo biến
let monthlyCategories = JSON.parse(localStorage.getItem('monthlyCategories')) || []; 
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
let currentMonth = ""; 
let editingCategoryId = null;
let deleteCategoryId = null;
let deleteCategoryMonth = null;
let deleteTransactionId = null;
let isDeleteCategory = false;
let currentPage = 1;
const itemsPerPage = 5;
let totalCatAmout = JSON.parse(localStorage.getItem('totalCatAmout')) || null;

document.getElementById('logoutBtn').addEventListener('click', function() {
    document.getElementById('logoutNotification').style.display = 'block';
});

document.getElementById('confirmLogout').addEventListener('click', function() {
    localStorage.removeItem('isLoggedIn');
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

// Hàm để lưu dữ liệu vào localStorage
function saveToLocalStorage() {
    localStorage.setItem('monthlyCategories', JSON.stringify(monthlyCategories));
}

//Lưu ngân sách
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
        monthlyCategories.push({id: Date.now() + Math.floor(Math.random() * 1000), month: monthInput, categories: [], amount: currentBudget }); 
    }

    document.getElementById('remainingAmount').textContent = currentBudget.toLocaleString() + ' VND';
    saveToLocalStorage(); 
});

// Sự kiện khi chọn tháng
document.getElementById('monthSelect').addEventListener('change', function() {
    totalBudgetError.style.display = 'none'; 
    const selectedMonth = this.value;
    currentMonth = selectedMonth;
    displayCategoriesByMonth(selectedMonth);

    const monthData = monthlyCategories.find(item => item.month === selectedMonth);
    if (monthData) {
        document.getElementById('remainingAmount').textContent = monthData.amount.toLocaleString() + ' VND';
    } else {
        document.getElementById('remainingAmount').textContent = '0 VND';
    }
});
// Sự kiện thêm danh mục
document.getElementById('addCategoryBtn').addEventListener('click', function() {
    const categoryName = document.getElementById('categoryName').value;
    const categoryAmount = document.getElementById('categoryLimit').value;
    const monthData = monthlyCategories.find(item => item.month === currentMonth); 

    // Kiểm tra xem tên danh mục và số tiền có được nhập hay không
    if (!categoryName || !categoryAmount) {
        alert('Chưa nhập tên danh mục hoặc mức tiền chi tiêu!');
        return;
    }

    // Kiểm tra tính hợp lệ của số tiền
    const amount = parseFloat(categoryAmount);
    if (isNaN(amount) || amount <= 0 || amount % 1 !== 0) {
        alert("Số tiền không hợp lệ. Vui lòng nhập số nguyên dương.");
        return; 
    }
   
    // Tạo đối tượng danh mục mới
    const category = { id: Date.now() + Math.floor(Math.random() * 1000) + Math.floor(Math.random() * 1000), name: categoryName, amount: amount };

    // Cập nhật danh mục cho tháng hiện tại
    if (monthData) {
        monthData.categories.push(category); 
    } else {
        monthlyCategories.push({
            id: Date.now() + Math.floor(Math.random() * 1000), 
            month: currentMonth,
            categories: [category], 
            amount: 0
        });
    }

    // Hiển thị danh sách danh mục
    updateCategoryList(currentMonth);
    saveToLocalStorage(); 
    populateCategorySelect();

    document.getElementById('categoryName').value = '';
    document.getElementById('categoryLimit').value = '';
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
            document.getElementById('editCategoryName').value = category.name;
            document.getElementById('editCategoryLimit').value = category.amount;
            editingCategoryId = id;
            document.querySelector('.edit-category-container').style.display = 'block';
        }
    }
}

// Sự kiện lưu sửa danh mục
document.getElementById('saveEditCategoryBtn').addEventListener('click', function() {
    const updatedName = document.getElementById('editCategoryName').value;
    const updatedLimit = document.getElementById('editCategoryLimit').value;
    const errorMessageElement = document.getElementById('error-message');

    errorMessageElement.style.display = 'none';
    errorMessageElement.textContent = '';

    if (!updatedName || !updatedLimit || isNaN(updatedLimit) || parseFloat(updatedLimit) <= 0 || updatedLimit % 1 !== 0) {
        errorMessageElement.textContent = 'Vui lòng nhập số tiền hợp lệ';
        errorMessageElement.style.display = 'block'; 
        return; 
    }

    const amount = parseFloat(updatedLimit);
    const monthData = monthlyCategories.find(item => item.month === currentMonth);
    if (monthData) {
        const category = monthData.categories.find(cat => cat.id === editingCategoryId);
        if (category) {
            category.name = updatedName;
            category.amount = amount;
            updateCategoryList(currentMonth); 
            saveToLocalStorage(); 
            populateCategorySelect();
            document.querySelector('.edit-category-container').style.display = 'none'; 
        }
    }
});

// Sự kiện hủy sửa danh mục
document.getElementById('cancelEditCategoryBtn').addEventListener('click', function() {
    document.querySelector('.edit-category-container').style.display = 'none'; 
});

// Hàm xóa danh mục
function removeCategory(month, id) {
    deleteCategoryId = id;
    deleteCategoryMonth = month;
    isDeleteCategory = true;
    document.getElementById('confirmDeleteContainer').style.display = 'block';
}

// Pop-up xác nhận xóa
document.getElementById('confirmDeleteBtn').addEventListener('click', function() {
    if (isDeleteCategory) {
        // Xóa danh mục
        const monthData = monthlyCategories.find(item => item.month === deleteCategoryMonth);
        if (monthData) {
            monthData.categories = monthData.categories.filter(category => category.id !== deleteCategoryId);
            updateCategoryList(deleteCategoryMonth);
            populateCategorySelect();
            saveToLocalStorage();
        }
    } else {
        // Xóa giao dịch
        const transactionData = transactions.find(item => item.id === deleteTransactionId);

        if (transactionData) {
            transactions = transactions.filter(transaction => transaction.id !== deleteTransactionId);
        
            localStorage.setItem('transactions', JSON.stringify(transactions));
            saveToLocalStorage();
        
            displayTransactionsByMonth(currentMonth); 
        
            updateRemainingAmount(); 
            checkOverBudgetCategory(currentMonth);      
        }
    }

    // Reset popup + biến
    document.getElementById('confirmDeleteContainer').style.display = 'none';
    deleteCategoryId = null;
    deleteCategoryMonth = null;
    deleteTransactionId = null;
});

document.getElementById('cancelDeleteBtn').addEventListener('click', function() {
    document.getElementById('confirmDeleteContainer').style.display = 'none';
    deleteCategoryId = null;
    deleteCategoryMonth = null;
    deleteTransactionId = null;
});

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
                <div class="item">${category.name} - Giới hạn: ${category.amount.toLocaleString()} VND</div>
                <div class="item_button">
                    <button onclick="editCategory('${selectedMonth}', ${category.id})">Sửa</button>
                    <button onclick="removeCategory('${selectedMonth}', ${category.id})">Xóa</button>
                </div>`;
            categoriesList.appendChild(categoryDiv);
        });
    } 
}

// Hàm để hiển thị các option trong categorySelect
function populateCategorySelect() {
    const categorySelect = document.getElementById('categorySelect');
    categorySelect.innerHTML = '<option value="">Tiền chi tiêu</option>'; 

    const monthData = monthlyCategories.find(item => item.month === currentMonth);
    if (monthData) {
        monthData.categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id; 
            option.textContent = category.name; 
            categorySelect.appendChild(option); 
        });
    }
}

// Gọi hàm populateCategorySelect khi tháng được chọn
document.getElementById('monthSelect').addEventListener('change', function() {
    currentMonth = this.value; 
    populateCategorySelect(); 
});


// Hàm thêm giao dịch
document.getElementById('addExpenseBtn').addEventListener('click', function() {
    const amount = document.getElementById('expenseAmount').value;
    const categoryId = document.getElementById('categorySelect').value;
    const note = document.getElementById('expenseNote').value;
    const expenseAmount = parseFloat(amount);
    const monthData = monthlyCategories.find(item => item.month === currentMonth);
    const budgetWarning = document.getElementById('budgetWarning');

    if (!amount || !categoryId) {
        alert('Chưa nhập số tiền hoặc danh mục!');
        return;
    }

    if (!note) {
        alert('Vui lòng nhập ghi chú!');
        return;
    }

    if (isNaN(amount) || parseFloat(amount) <= 0 || amount % 1 !== 0) {
        alert("Vui lòng nhập số tiền hợp lệ!");
        return;
    }
  
    if (!monthData) {
        alert('Chưa có ngân sách cho tháng này!');
        return;
    } else{
        const category = monthData.categories.find(cat => cat.id === parseInt(categoryId));
        if (category) {
            const spentAmount = transactions
                .filter(tran => tran.categoryId === category.id && tran.month === currentMonth)
                .reduce((total, tran) => total + tran.amount, 0);

            const remainingAmount = category.amount - spentAmount;

            if (parseFloat(amount) > remainingAmount) {
                budgetWarning.innerHTML = `Danh mục "<b>${category.name}</b>" đã vượt hạn mức! Đã tiêu: ${(spentAmount + parseFloat(amount)).toLocaleString()} / ${category.amount.toLocaleString()} VND`;
            }
        }
    }

    // Tạo đối tượng giao dịch
    const transaction = {
        id: Date.now() + Math.floor(Math.random() * 10000), 
        month: currentMonth, 
        categoryId: parseInt(categoryId),
        amount: expenseAmount,
        date: new Date().toISOString().split('T')[0], 
        note: note
    };

    transactions.push(transaction);

    // Lưu dữ liệu
    localStorage.setItem('transactions', JSON.stringify(transactions));
    saveToLocalStorage(); 

    // Reset form
    document.getElementById('expenseAmount').value = "";
    document.getElementById('categorySelect').value = "";
    document.getElementById('expenseNote').value = "";

    // Cập nhật lại UI
    updateRemainingAmount(); 
    currentPage = 1;
    displayTransactionsByMonth(currentMonth); 
    displayMonthlyStatistics();
});

// Hàm hiển thị số tiền còn lại
function updateRemainingAmount() {
    const monthData = monthlyCategories.find(item => item.month === currentMonth);
    if (monthData) {
        const spentAmount = transactions
            .filter(tran => tran.month === currentMonth)
            .reduce((total, tran) => total + tran.amount, 0);

        const remainingAmount = monthData.amount - spentAmount;
        document.getElementById('remainingAmount').textContent = remainingAmount.toLocaleString() + ' VND';
    }
}

// Hàm hiển thị số tiền còn lại khi chọn tháng
document.getElementById('monthSelect').addEventListener('change', function() {
    currentMonth = this.value;
    updateRemainingAmount();
    const monthData = monthlyCategories.find(item => item.month === currentMonth);
    if (monthData) {
        document.getElementById('remainingAmount').textContent = monthData.amount.toLocaleString() + ' VND';
    } else {
        document.getElementById('remainingAmount').textContent = '0 VND';
    }
});

// Hàm xóa giao dịch
function removeTransaction(id) {
    deleteTransactionId = id;
    isDeleteCategory = false;
    currentPage = 1;
    displayTransactionsByMonth(currentMonth); 
    displayMonthlyStatistics();
    document.getElementById('confirmDeleteContainer').style.display = 'block';
}

// Tìm kiếm giao dịch theo nội dung
document.getElementById('searchBtn').addEventListener('click', function() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const filteredTransactions = transactions.filter(transaction => 
        transaction.note.toLowerCase().includes(searchTerm) || 
        transaction.amount.toString().includes(searchTerm)
    );
    currentPage = 1;
    displayTransactions(filteredTransactions);
});
// Sự kiện thay đổi cho việc sắp xếp giao dịch
document.getElementById('sort').addEventListener('change', function() {
    const sortOrder = this.value; 
    let sortedTransactions;

    if (transactions.length > 0) {
        sortedTransactions =transactions.sort((a, b) => {
    switch (sortOrder) {
        case 'asc':
            return a.amount - b.amount;
        case 'desc':
            return b.amount - a.amount;
        default:
            return 0;
    }
});
    } else {
        sortedTransactions = []; 
    }

    // Hiển thị danh sách giao dịch đã sắp xếp
    displayTransactionsByMonth(currentMonth); 
});
// Hàm hiển thị giao dịch theo tháng
function displayTransactionsByMonth(month) {
    const filteredTransactions = transactions.filter(transaction => transaction.month === month);
    displayTransactions(filteredTransactions);
}

// Sự kiện khi chọn tháng
document.getElementById('monthSelect').addEventListener('change', function() {
    currentMonth = this.value;
    updateRemainingAmount(); 
    checkOverBudgetCategory(currentMonth);
    displayTransactionsByMonth(currentMonth); 
});

// Hàm hiển thị giao dịch
function displayTransactions(transactionsToDisplay) {
    const expensesHistory = document.getElementById('expensesHistory');
    expensesHistory.innerHTML = '';

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedTransactions = transactionsToDisplay.slice(startIndex, endIndex);

    paginatedTransactions.forEach(transaction => {
        const transactionDiv = document.createElement('div');
        transactionDiv.className = 'content2';
        transactionDiv.innerHTML = `
            <div class="item">${transaction.date}: ${transaction.note} - ${transaction.amount.toLocaleString()} VND</div>
            <div class="item_button">
                <button onclick="removeTransaction(${transaction.id})">Xóa</button>
            </div>
        `;
        expensesHistory.appendChild(transactionDiv);
    });

    renderPagination(transactionsToDisplay.length);
}

// Hiển thị nút phân trang
function renderPagination(totalItems) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const pageButtons = document.getElementById('pageButtons');

    pageButtons.innerHTML = '';

    for (let i = 1; i <= totalPages; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.textContent = i;
        pageBtn.className = (i === currentPage) ? 'active' : '';
        pageBtn.addEventListener('click', () => {
            currentPage = i;
            displayTransactionsByMonth(currentMonth); 
        });
        pageButtons.appendChild(pageBtn);
    }

    // Xử lý prev/next
    document.getElementById('prevPageBtn').disabled = currentPage === 1;
    document.getElementById('nextPageBtn').disabled = currentPage === totalPages;
}

// Sự kiện nút prev/next
document.getElementById('prevPageBtn').addEventListener('click', () => { 
    if (currentPage > 1) {
        currentPage--;
        displayTransactionsByMonth(currentMonth); 
    }
});

document.getElementById('nextPageBtn').addEventListener('click', () => {
    const totalPages = Math.ceil(transactions.length / itemsPerPage); 
    if (currentPage < totalPages) {
        currentPage++;
        displayTransactionsByMonth(currentMonth); 
    }
});

// Hàm kiểm tra hạn mức chi tiêu danh mục
function checkOverBudgetCategory(selectedMonth) {
    const monthData = monthlyCategories.find(item => item.month === selectedMonth);
    const budgetWarning = document.getElementById('budgetWarning');

    budgetWarning.innerHTML = '';

    if (monthData) {
        let warningMessages = [];

        monthData.categories.forEach(category => {
            const spentAmount = transactions
                .filter(tran => tran.categoryId === category.id && tran.month === selectedMonth)
                .reduce((total, tran) => total + tran.amount, 0);

            if (spentAmount > category.amount) {
                warningMessages.push(
                    `Danh mục "<b>${category.name}</b>" đã vượt hạn mức! Đã tiêu: ${spentAmount.toLocaleString()} / ${category.amount.toLocaleString()} VND<br>`
                );
            }
        });

        if (warningMessages.length > 0) {
            budgetWarning.innerHTML = warningMessages.join('<br>');
        }
    }
}

function displayMonthlyStatistics() {
    const monthlyStats = document.getElementById('monthlyStats');
    monthlyStats.innerHTML = '';

    monthlyCategories.forEach(monthData => {
        const month = monthData.month;
        const budget = monthData.amount;

        const spent = transactions
            .filter(tran => tran.month === month)
            .reduce((total, tran) => total + tran.amount, 0);

        const status = spent <= budget ? 'Đạt' : 'Không đạt';

        const itemDiv = document.createElement('div');
        itemDiv.className = 'item';
        itemDiv.innerHTML = `
            <span>${month}</span>
            <span>${spent.toLocaleString()} VND</span>
            <span>${budget.toLocaleString()} VND</span>
            <span style="color: ${status === 'Đạt' ? 'green' : 'red'}">${status}</span>
        `;
        monthlyStats.appendChild(itemDiv);
    });
}

// Khôi phục dữ liệu khi trang được tải
window.onload = function() {
    currentMonth = ""; 
    checkLogin();
    displayMonthlyStatistics();
    const monthSelect = document.getElementById('monthSelect');
    monthlyCategories.forEach(monthData => {
        const option = document.createElement('option');
        option.value = monthData.month;
        option.textContent = monthData.month;
        monthSelect.appendChild(option);
    });
};