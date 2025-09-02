const defaultPeople = [
    "Nguyễn Văn Điền",
    "Trần Văn Hoàng",
    "Nguyễn Thế Quân",
    "Nguyễn Trọng Đại",
    "Nguyễn Công Đức",
    "Phạm Quang Trung",
    "Nguyễn Văn Cần",
    "Võ Duy Cầu",
    "Nguyễn Văn Linh",
    "Nguyễn Đức Việt",
    "Trần Văn Khương",
    "Thái Thăng Long",
    "Trần Văn Hải",
    "Nguyễn Hà Anh",
    "Lê Minh Vương",
    "Nguyễn Trọng Nhàn",
    "Nguyễn Văn Huy",
    "Trịnh Xuân Trường",
    "Tăng Xuân Thắng",
    "Nguyễn Anh Tuấn",
    "Đoàn Văn Kỳ",
    "Nguyễn Công Phúc",
];

let currentMeal = "lunch";
let currentDate = new Date().toLocaleDateString("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh",
});

function initApp() {
    if (!localStorage.getItem("people")) {
        localStorage.setItem("people", JSON.stringify(defaultPeople));
    }
    if (!localStorage.getItem("lunchPrice")) {
        localStorage.setItem("lunchPrice", "35000");
    }
    if (!localStorage.getItem("dinnerPrice")) {
        localStorage.setItem("dinnerPrice", "35000");
    }

    currentDate = new Date().toLocaleDateString("en-CA", {
        timeZone: "Asia/Ho_Chi_Minh",
    });
    document.getElementById("attendanceDate").value = currentDate;

    autoSelectMeal();

    updateCurrentTime();
    setInterval(updateCurrentTime, 1000);

    createMonthOptions();

    loadAttendance();
    loadSettings();
    loadPeopleManager();
    updateStatistics();

    initDailyStats();
    initYearlyStats();
}

function autoSelectMeal() {
    const now = new Date();
    const vietnamTime = new Date(
        now.toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" })
    );
    const hour = vietnamTime.getHours();

    if (hour >= 6 && hour < 16) {
        selectMeal("lunch");
    } else {
        selectMeal("dinner");
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

function switchTab(tabName) {
    document.querySelectorAll(".tab-content").forEach((tab) => {
        tab.classList.remove("active");
    });
    document.querySelectorAll(".nav-tab").forEach((btn) => {
        btn.classList.remove("active");
    });

    document.getElementById(tabName).classList.add("active");
    event.target.classList.add("active");

    if (tabName === "statistics") {
        updateStatistics();
    } else if (tabName === "settings") {
        loadPeopleManager();
    }
}

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

    document.getElementById("presentCount").textContent = presentCount;
    document.getElementById("absentCount").textContent = absentCount;
}

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

function createMonthOptions() {
    const monthSelector = document.getElementById("monthSelector");
    const currentDate = new Date(
        new Date().toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" })
    );

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

    people.forEach((person) => {
        personStats[person] = { lunch: 0, dinner: 0, cost: 0 };
    });

    const [year, month] = selectedMonth.split("-");
    const daysInMonth = new Date(year, month, 0).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${month}-${String(day).padStart(2, "0")}`;

        const lunchKey = `attendance_${dateStr}_lunch`;
        const lunchAttendance = JSON.parse(
            localStorage.getItem(lunchKey) || "{}"
        );

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

    document.getElementById("totalMeals").textContent = totalMeals;
    document.getElementById("totalCost").textContent =
        formatCurrency(totalCost);
    document.getElementById("avgDaily").textContent = Math.round(
        totalMeals / daysInMonth
    );
    document.getElementById("totalPeople").textContent = people.length;
    document.getElementById("monthlyTotal").textContent =
        formatCurrency(totalCost);

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

function loadSettings() {
    document.getElementById("lunchPrice").value =
        localStorage.getItem("lunchPrice");
    document.getElementById("dinnerPrice").value =
        localStorage.getItem("dinnerPrice");
}

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

    for (const key in localStorage) {
        if (key.startsWith("attendance_")) {
            data.attendance[key] = localStorage.getItem(key);
        }
    }

    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(dataBlob);
    const vietnamDate = new Date().toLocaleDateString("en-CA", {
        timeZone: "Asia/Ho_Chi_Minh",
    });
    link.download = `meal-data-${vietnamDate}.json`;
    link.click();
}

function importData(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = JSON.parse(e.target.result);

            localStorage.setItem("people", JSON.stringify(data.people));
            localStorage.setItem("lunchPrice", data.lunchPrice);
            localStorage.setItem("dinnerPrice", data.dinnerPrice);

            for (const key in data.attendance) {
                localStorage.setItem(key, data.attendance[key]);
            }

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

function formatCurrency(amount) {
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
    }).format(amount);
}

function switchStatsType(type) {
    document.querySelectorAll(".stats-type-btn").forEach((btn) => {
        btn.classList.remove("active");
    });
    document.querySelectorAll(".stats-section").forEach((section) => {
        section.classList.remove("active");
    });

    event.target.classList.add("active");
    document.getElementById(type + "Stats").classList.add("active");

    if (type === "daily") {
        initDailyStats();
    } else if (type === "yearly") {
        initYearlyStats();
    }
}

function initDailyStats() {
    const dailyDateSelector = document.getElementById("dailyDateSelector");
    if (!dailyDateSelector.value) {
        dailyDateSelector.value = new Date().toLocaleDateString("en-CA", {
            timeZone: "Asia/Ho_Chi_Minh",
        });
    }
    updateDailyStatistics();
}

function initYearlyStats() {
    const yearSelector = document.getElementById("yearSelector");
    if (yearSelector.children.length === 0) {
        createYearOptions();
    }
    updateYearlyStatistics();
}

function createYearOptions() {
    const yearSelector = document.getElementById("yearSelector");
    const currentYear = new Date(
        new Date().toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" })
    ).getFullYear();

    for (let i = 0; i < 5; i++) {
        const year = currentYear - i;
        const option = document.createElement("option");
        option.value = year.toString();
        option.textContent = year.toString();
        if (i === 0) option.selected = true;
        yearSelector.appendChild(option);
    }
}

function updateDailyStatistics() {
    const selectedDate = document.getElementById("dailyDateSelector").value;
    const people = JSON.parse(localStorage.getItem("people"));
    const lunchPrice = Number.parseInt(localStorage.getItem("lunchPrice"));
    const dinnerPrice = Number.parseInt(localStorage.getItem("dinnerPrice"));

    let totalMeals = 0;
    let totalCost = 0;
    let lunchCount = 0;
    let dinnerCount = 0;
    const personStats = {};

    people.forEach((person) => {
        personStats[person] = { lunch: 0, dinner: 0, cost: 0 };
    });

    const lunchKey = `attendance_${selectedDate}_lunch`;
    const lunchAttendance = JSON.parse(localStorage.getItem(lunchKey) || "{}");

    const dinnerKey = `attendance_${selectedDate}_dinner`;
    const dinnerAttendance = JSON.parse(
        localStorage.getItem(dinnerKey) || "{}"
    );

    people.forEach((person) => {
        if (lunchAttendance[person]) {
            personStats[person].lunch = 1;
            personStats[person].cost += lunchPrice;
            totalMeals++;
            totalCost += lunchPrice;
            lunchCount++;
        }
        if (dinnerAttendance[person]) {
            personStats[person].dinner = 1;
            personStats[person].cost += dinnerPrice;
            totalMeals++;
            totalCost += dinnerPrice;
            dinnerCount++;
        }
    });

    document.getElementById("dailyTotalMeals").textContent = totalMeals;
    document.getElementById("dailyTotalCost").textContent =
        formatCurrency(totalCost);
    document.getElementById("dailyLunchCount").textContent = lunchCount;
    document.getElementById("dailyDinnerCount").textContent = dinnerCount;
    document.getElementById("dailyTotal").textContent =
        formatCurrency(totalCost);

    const dailyPersonStatsContainer =
        document.getElementById("dailyPersonStats");
    dailyPersonStatsContainer.innerHTML = "";

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
        dailyPersonStatsContainer.appendChild(personDiv);
    });
}

function updateYearlyStatistics() {
    const selectedYear = document.getElementById("yearSelector").value;
    const people = JSON.parse(localStorage.getItem("people"));
    const lunchPrice = Number.parseInt(localStorage.getItem("lunchPrice"));
    const dinnerPrice = Number.parseInt(localStorage.getItem("dinnerPrice"));

    let totalMeals = 0;
    let totalCost = 0;
    const personStats = {};

    people.forEach((person) => {
        personStats[person] = { months: Array(12).fill(0), cost: 0 };
    });

    for (let month = 1; month <= 12; month++) {
        const monthStr = String(month).padStart(2, "0");
        const daysInMonth = new Date(selectedYear, month, 0).getDate();

        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${selectedYear}-${monthStr}-${String(day).padStart(
                2,
                "0"
            )}`;

            const lunchKey = `attendance_${dateStr}_lunch`;
            const dinnerKey = `attendance_${dateStr}_dinner`;
            const lunchAttendance = JSON.parse(
                localStorage.getItem(lunchKey) || "{}"
            );
            const dinnerAttendance = JSON.parse(
                localStorage.getItem(dinnerKey) || "{}"
            );

            people.forEach((person) => {
                if (lunchAttendance[person]) {
                    personStats[person].months[month - 1]++;
                    personStats[person].cost += lunchPrice;
                    totalMeals++;
                    totalCost += lunchPrice;
                }
                if (dinnerAttendance[person]) {
                    personStats[person].months[month - 1]++;
                    personStats[person].cost += dinnerPrice;
                    totalMeals++;
                    totalCost += dinnerPrice;
                }
            });
        }
    }

    document.getElementById("yearlyTotalMeals").textContent = totalMeals;
    document.getElementById("yearlyTotalCost").textContent =
        formatCurrency(totalCost);
    document.getElementById("yearlyAvgMonthly").textContent = Math.round(
        totalMeals / 12
    );
    document.getElementById("yearlyTotalPeople").textContent = people.length;
    document.getElementById("yearlyTotal").textContent =
        formatCurrency(totalCost);

    const yearlyPersonStatsContainer =
        document.getElementById("yearlyPersonStats");
    yearlyPersonStatsContainer.innerHTML = "";

    people.forEach((person) => {
        const stats = personStats[person];
        const totalPersonMeals = stats.months.reduce(
            (sum, meals) => sum + meals,
            0
        );
        const personDiv = document.createElement("div");
        personDiv.className = "person-stat";
        personDiv.innerHTML = `
            <div>
                <div class="person-name">${person}</div>
                <div class="person-meals">Tổng: ${totalPersonMeals} bữa</div>
            </div>
            <div class="person-cost">${formatCurrency(stats.cost)}</div>
        `;
        yearlyPersonStatsContainer.appendChild(personDiv);
    });
}

function exportDailyStats() {
    const selectedDate = document.getElementById("dailyDateSelector").value;
    const people = JSON.parse(localStorage.getItem("people"));
    const lunchPrice = Number.parseInt(localStorage.getItem("lunchPrice"));
    const dinnerPrice = Number.parseInt(localStorage.getItem("dinnerPrice"));

    const wb = window.XLSX.utils.book_new();

    const headers = [
        "STT",
        "Họ và Tên",
        "Bữa Trưa",
        "Bữa Tối",
        "Tổng",
        "Thành Tiền",
    ];
    const data = [
        [`Chấm cơm ngày ${new Date(selectedDate).toLocaleDateString("vi-VN")}`],
        [],
        headers,
    ];

    const lunchKey = `attendance_${selectedDate}_lunch`;
    const dinnerKey = `attendance_${selectedDate}_dinner`;
    const lunchAttendance = JSON.parse(localStorage.getItem(lunchKey) || "{}");
    const dinnerAttendance = JSON.parse(
        localStorage.getItem(dinnerKey) || "{}"
    );

    let totalLunch = 0,
        totalDinner = 0,
        totalMeals = 0,
        totalCost = 0;

    people.forEach((person, index) => {
        const lunch = lunchAttendance[person] ? 1 : 0;
        const dinner = dinnerAttendance[person] ? 1 : 0;
        const personTotal = lunch + dinner;
        const personCost = lunch * lunchPrice + dinner * dinnerPrice;

        data.push([index + 1, person, lunch, dinner, personTotal, personCost]);

        totalLunch += lunch;
        totalDinner += dinner;
        totalMeals += personTotal;
        totalCost += personCost;
    });

    data.push([
        "",
        "TỔNG CỘNG",
        totalLunch,
        totalDinner,
        totalMeals,
        totalCost,
    ]);

    const ws = window.XLSX.utils.aoa_to_sheet(data);

    const range = window.XLSX.utils.decode_range(ws["!ref"]);

    ws["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 5 } }];

    ws["!cols"] = [
        { wch: 5 },
        { wch: 20 },
        { wch: 12 },
        { wch: 12 },
        { wch: 8 },
        { wch: 15 },
    ];

    window.XLSX.utils.book_append_sheet(wb, ws, "Thống kê ngày");

    const vietnamDate = new Date().toLocaleDateString("en-CA", {
        timeZone: "Asia/Ho_Chi_Minh",
    });
    window.XLSX.writeFile(
        wb,
        `thong-ke-ngay-${selectedDate}-${vietnamDate}.xlsx`
    );
}

function exportYearlyStats() {
    const selectedYear = document.getElementById("yearSelector").value;
    const people = JSON.parse(localStorage.getItem("people"));
    const lunchPrice = Number.parseInt(localStorage.getItem("lunchPrice"));
    const dinnerPrice = Number.parseInt(localStorage.getItem("dinnerPrice"));

    const wb = window.XLSX.utils.book_new();

    const headers = ["STT", "Họ và Tên"];
    for (let month = 1; month <= 12; month++) {
        headers.push(`Tháng ${month}`);
    }
    headers.push("Tổng", "Thành Tiền");

    const data = [[`Chấm cơm năm ${selectedYear}`], [], headers];

    const personStats = {};
    people.forEach((person) => {
        personStats[person] = { months: Array(12).fill(0), cost: 0 };
    });

    for (let month = 1; month <= 12; month++) {
        const monthStr = String(month).padStart(2, "0");
        const daysInMonth = new Date(selectedYear, month, 0).getDate();

        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${selectedYear}-${monthStr}-${String(day).padStart(
                2,
                "0"
            )}`;

            const lunchKey = `attendance_${dateStr}_lunch`;
            const dinnerKey = `attendance_${dateStr}_dinner`;
            const lunchAttendance = JSON.parse(
                localStorage.getItem(lunchKey) || "{}"
            );
            const dinnerAttendance = JSON.parse(
                localStorage.getItem(dinnerKey) || "{}"
            );

            people.forEach((person) => {
                if (lunchAttendance[person]) {
                    personStats[person].months[month - 1]++;
                    personStats[person].cost += lunchPrice;
                }
                if (dinnerAttendance[person]) {
                    personStats[person].months[month - 1]++;
                    personStats[person].cost += dinnerPrice;
                }
            });
        }
    }

    const monthTotals = Array(12).fill(0);
    let totalMeals = 0,
        totalCost = 0;

    people.forEach((person, index) => {
        const stats = personStats[person];
        const personTotal = stats.months.reduce((sum, meals) => sum + meals, 0);
        const row = [
            index + 1,
            person,
            ...stats.months,
            personTotal,
            stats.cost,
        ];
        data.push(row);

        stats.months.forEach((meals, monthIndex) => {
            monthTotals[monthIndex] += meals;
        });
        totalMeals += personTotal;
        totalCost += stats.cost;
    });

    const totalRow = ["", "TỔNG CỘNG", ...monthTotals, totalMeals, totalCost];
    data.push(totalRow);

    const ws = window.XLSX.utils.aoa_to_sheet(data);

    ws["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 13 } }];

    const colWidths = [{ wch: 5 }, { wch: 20 }];
    for (let i = 0; i < 12; i++) {
        colWidths.push({ wch: 8 });
    }
    colWidths.push({ wch: 8 });
    colWidths.push({ wch: 15 });

    ws["!cols"] = colWidths;

    window.XLSX.utils.book_append_sheet(wb, ws, "Thống kê năm");

    const vietnamDate = new Date().toLocaleDateString("en-CA", {
        timeZone: "Asia/Ho_Chi_Minh",
    });
    window.XLSX.writeFile(
        wb,
        `thong-ke-nam-${selectedYear}-${vietnamDate}.xlsx`
    );
}

document.addEventListener("DOMContentLoaded", () => {
    initApp();

    document
        .getElementById("newPersonName")
        .addEventListener("keypress", (e) => {
            if (e.key === "Enter") {
                addPerson();
            }
        });
});
