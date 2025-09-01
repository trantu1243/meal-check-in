// Dữ liệu mặc định
const defaultPeople = [
    "Nguễyn Văn Điền",
    "Trần Văn Hoàng",
    "Nguyễn Thế Quân",
    "Nguyễn Trọng Đại",
    "Nguyễn Công Đức",
    "Phạm Quang Trung",
    "Nguyễn Văn Cần",
    "Võ Duy Cầu",
    "Nguyễn Văn Linh",
    "Nguyễn Đức Việt",
    "Trần Văn Khương",
    "Thái Thăng Long",
    "Trần Văn Hải",
    "Nguyễn Hà Anh",
    "Lê Minh Vương",
    "Nguyễn Trọng Nhàn",
    "Nguyễn Văn Huy",
    "Trịnh Xuân Trường",
    "Tăng Xuân Thắng",
    "Nguyễn Anh Tuấn",
    "Đoàn Văn Kỳ",
    "Nguyễn Công Phúc",
];

let currentMeal = "lunch";
let currentDate = new Date().toISOString().split("T")[0];

// Khởi tạo ứng dụng
function initApp() {
    // Khởi tạo dữ liệu nếu chưa có
    if (!localStorage.getItem("people")) {
        localStorage.setItem("people", JSON.stringify(defaultPeople));
    }
    if (!localStorage.getItem("lunchPrice")) {
        localStorage.setItem("lunchPrice", "25000");
    }
    if (!localStorage.getItem("dinnerPrice")) {
        localStorage.setItem("dinnerPrice", "30000");
    }

    // Thiết lập ngày hiện tại
    document.getElementById("attendanceDate").value = currentDate;

    // Tự động chọn bữa ăn theo thời gian
    autoSelectMeal();

    // Cập nhật thời gian hiện tại
    updateCurrentTime();
    setInterval(updateCurrentTime, 1000);

    // Tạo danh sách tháng
    createMonthOptions();

    // Tải dữ liệu
    loadAttendance();
    loadSettings();
    loadPeopleManager();
    updateStatistics();
}

function autoSelectMeal() {
    const now = new Date();
    const hour = now.getHours();

    // 6h sáng đến 4h chiều = bữa trưa, còn lại = bữa tối
    if (hour >= 6 && hour < 16) {
        selectMeal("lunch");
        // document.getElementById("autoMealInfo").textContent =
        //     "🌅 Hiện tại là giờ bữa trưa";
    } else {
        selectMeal("dinner");
        // document.getElementById("autoMealInfo").textContent =
        //     "🌙 Hiện tại là giờ bữa tối";
    }
}

function updateCurrentTime() {
    const now = new Date();
    const timeString = now.toLocaleString("vi-VN", {
        timeZone: "Asia/Ho_Chi_Minh",
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
    document.getElementById("currentTime").textContent = timeString;
}

// Chuyển đổi tab
function switchTab(tabName) {
    // Ẩn tất cả tab
    document.querySelectorAll(".tab-content").forEach((tab) => {
        tab.classList.remove("active");
    });
    document.querySelectorAll(".nav-tab").forEach((btn) => {
        btn.classList.remove("active");
    });

    // Hiển thị tab được chọn
    document.getElementById(tabName).classList.add("active");
    event.target.classList.add("active");

    // Cập nhật dữ liệu nếu cần
    if (tabName === "statistics") {
        updateStatistics();
    } else if (tabName === "settings") {
        loadPeopleManager();
    }
}

// Chọn bữa ăn
function selectMeal(meal) {
    currentMeal = meal;
    document.querySelectorAll(".meal-btn").forEach((btn) => {
        btn.classList.remove("active");
    });
    document.getElementById(meal + "Btn").classList.add("active");
    loadAttendance();
}

function loadAttendance() {
    currentDate = document.getElementById("attendanceDate").value;
    const people = JSON.parse(localStorage.getItem("people"));
    const attendanceKey = `attendance_${currentDate}_${currentMeal}`;
    const attendance = JSON.parse(localStorage.getItem(attendanceKey) || "{}");

    const personList = document.getElementById("personList");
    personList.innerHTML = "";

    let presentCount = 0;
    let absentCount = 0;

    people.forEach((person, index) => {
        const personItem = document.createElement("div");
        personItem.className = "person-item";

        const isPresent = attendance[person] || false;
        if (isPresent) presentCount++;
        else absentCount++;

        personItem.innerHTML = `
            <div class="person-name">${person}</div>
            <div class="attendance-toggle ${isPresent ? "active" : ""}" 
                 onclick="toggleAttendance('${person}')"></div>
        `;

        personList.appendChild(personItem);
    });

    // Cập nhật thống kê tóm tắt
    document.getElementById("presentCount").textContent = presentCount;
    document.getElementById("absentCount").textContent = absentCount;
}

// Chuyển đổi trạng thái có mặt
function toggleAttendance(person) {
    const attendanceKey = `attendance_${currentDate}_${currentMeal}`;
    const attendance = JSON.parse(localStorage.getItem(attendanceKey) || "{}");

    attendance[person] = !attendance[person];
    localStorage.setItem(attendanceKey, JSON.stringify(attendance));

    loadAttendance();
}

function addPerson() {
    const newPersonName = document.getElementById("newPersonName").value.trim();

    if (!newPersonName) {
        alert("Vui lòng nhập tên người mới!");
        return;
    }

    const people = JSON.parse(localStorage.getItem("people"));

    if (people.includes(newPersonName)) {
        alert("Người này đã có trong danh sách!");
        return;
    }

    people.unshift(newPersonName);
    localStorage.setItem("people", JSON.stringify(people));

    document.getElementById("newPersonName").value = "";
    loadPeopleManager();
    loadAttendance();
    updateStatistics();


}

function loadPeopleManager() {
    const people = JSON.parse(localStorage.getItem("people"));
    const peopleManager = document.getElementById("peopleManager");

    peopleManager.innerHTML = "";

    people.forEach((person, index) => {
        const personDiv = document.createElement("div");
        personDiv.className = "person-manager-item";
        personDiv.innerHTML = `
            <div class="person-manager-name">${person}</div>
            <button class="delete-btn" onclick="deletePerson(${index})">Xóa</button>
        `;
        peopleManager.appendChild(personDiv);
    });
}

function deletePerson(index) {
    const people = JSON.parse(localStorage.getItem("people"));
    const personName = people[index];

    if (confirm(`Bạn có chắc muốn xóa "${personName}" khỏi danh sách?`)) {
        people.splice(index, 1);
        localStorage.setItem("people", JSON.stringify(people));

        loadPeopleManager();
        loadAttendance();
        updateStatistics();
    }
}

// Tạo options cho selector tháng
function createMonthOptions() {
    const monthSelector = document.getElementById("monthSelector");
    const currentDate = new Date();

    for (let i = 0; i < 12; i++) {
        const date = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth() - i,
            1
        );
        const option = document.createElement("option");
        option.value = `${date.getFullYear()}-${String(
            date.getMonth() + 1
        ).padStart(2, "0")}`;
        option.textContent = `${date.getMonth() + 1}/${date.getFullYear()}`;
        if (i === 0) option.selected = true;
        monthSelector.appendChild(option);
    }
}

function updateStatistics() {
    const selectedMonth = document.getElementById("monthSelector").value;
    const people = JSON.parse(localStorage.getItem("people"));
    const lunchPrice = Number.parseInt(localStorage.getItem("lunchPrice"));
    const dinnerPrice = Number.parseInt(localStorage.getItem("dinnerPrice"));

    let totalMeals = 0;
    let totalCost = 0;
    const personStats = {};

    // Khởi tạo stats cho từng người
    people.forEach((person) => {
        personStats[person] = { lunch: 0, dinner: 0, cost: 0 };
    });

    // Duyệt qua tất cả các ngày trong tháng
    const [year, month] = selectedMonth.split("-");
    const daysInMonth = new Date(year, month, 0).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${month}-${String(day).padStart(2, "0")}`;

        // Kiểm tra bữa trưa
        const lunchKey = `attendance_${dateStr}_lunch`;
        const lunchAttendance = JSON.parse(
            localStorage.getItem(lunchKey) || "{}"
        );

        // Kiểm tra bữa tối
        const dinnerKey = `attendance_${dateStr}_dinner`;
        const dinnerAttendance = JSON.parse(
            localStorage.getItem(dinnerKey) || "{}"
        );

        people.forEach((person) => {
            if (lunchAttendance[person]) {
                personStats[person].lunch++;
                personStats[person].cost += lunchPrice;
                totalMeals++;
                totalCost += lunchPrice;
            }
            if (dinnerAttendance[person]) {
                personStats[person].dinner++;
                personStats[person].cost += dinnerPrice;
                totalMeals++;
                totalCost += dinnerPrice;
            }
        });
    }

    // Cập nhật UI
    document.getElementById("totalMeals").textContent = totalMeals;
    document.getElementById("totalCost").textContent =
        formatCurrency(totalCost);
    document.getElementById("avgDaily").textContent = Math.round(
        totalMeals / daysInMonth
    );
    document.getElementById("totalPeople").textContent = people.length;
    document.getElementById("monthlyTotal").textContent =
        formatCurrency(totalCost);

    // Cập nhật thống kê từng người
    const personStatsContainer = document.getElementById("personStats");
    personStatsContainer.innerHTML = "";

    people.forEach((person) => {
        const stats = personStats[person];
        const personDiv = document.createElement("div");
        personDiv.className = "person-stat";
        personDiv.innerHTML = `
            <div>
                <div class="person-name">${person}</div>
                <div class="person-meals">Trưa: ${stats.lunch} | Tối: ${
            stats.dinner
        }</div>
            </div>
            <div class="person-cost">${formatCurrency(stats.cost)}</div>
        `;
        personStatsContainer.appendChild(personDiv);
    });
}

// Tải cài đặt
function loadSettings() {
    document.getElementById("lunchPrice").value =
        localStorage.getItem("lunchPrice");
    document.getElementById("dinnerPrice").value =
        localStorage.getItem("dinnerPrice");
}

// Lưu giá bữa ăn
function savePrices() {
    const lunchPrice = document.getElementById("lunchPrice").value;
    const dinnerPrice = document.getElementById("dinnerPrice").value;

    if (lunchPrice) localStorage.setItem("lunchPrice", lunchPrice);
    if (dinnerPrice) localStorage.setItem("dinnerPrice", dinnerPrice);

    alert("Đã lưu cài đặt thành công!");
    updateStatistics();
}

function exportData() {
    const data = {
        people: JSON.parse(localStorage.getItem("people")),
        lunchPrice: localStorage.getItem("lunchPrice"),
        dinnerPrice: localStorage.getItem("dinnerPrice"),
        attendance: {},
    };

    // Xuất tất cả dữ liệu chấm công
    for (const key in localStorage) {
        if (key.startsWith("attendance_")) {
            data.attendance[key] = localStorage.getItem(key);
        }
    }

    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(dataBlob);
    link.download = `meal-data-${new Date().toISOString().split("T")[0]}.json`;
    link.click();
}

function importData(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = JSON.parse(e.target.result);

            // Khôi phục dữ liệu
            localStorage.setItem("people", JSON.stringify(data.people));
            localStorage.setItem("lunchPrice", data.lunchPrice);
            localStorage.setItem("dinnerPrice", data.dinnerPrice);

            // Khôi phục dữ liệu chấm công
            for (const key in data.attendance) {
                localStorage.setItem(key, data.attendance[key]);
            }

            // Tải lại giao diện
            loadAttendance();
            loadSettings();
            loadPeopleManager();
            updateStatistics();

            alert("Đã nhập dữ liệu thành công!");
        } catch (error) {
            alert("Lỗi: File không hợp lệ!");
        }
    };
    reader.readAsText(file);
}

// Format tiền tệ
function formatCurrency(amount) {
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
    }).format(amount);
}

document.addEventListener("DOMContentLoaded", () => {
    initApp();

    // Xử lý phím Enter cho form thêm người
    document
        .getElementById("newPersonName")
        .addEventListener("keypress", (e) => {
            if (e.key === "Enter") {
                addPerson();
            }
        });
});
