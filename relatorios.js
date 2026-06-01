document.addEventListener("DOMContentLoaded", async () => {
    const { data: sessionData } = await window.supabaseClient.auth.getSession();

    if (!sessionData.session) {
        alert("Você precisa estar logado para acessar os relatórios.");
        window.location.href = "index.html";
        return;
    }

    const { data: userData, error: userError } = await window.supabaseClient.auth.getUser();

    if (userError || !userData.user) {
        alert("Você precisa estar logado para acessar os relatórios.");
        window.location.href = "index.html";
        return;
    }

    const currentUser = userData.user;
    const currentUserEmail = currentUser.email;

    const savedName =
        currentUser.user_metadata?.nome ||
        localStorage.getItem(`user_profile_name_${currentUserEmail}`) ||
        localStorage.getItem("user_profile_name") ||
        currentUserEmail.split("@")[0];

    localStorage.setItem("user_profile_email", currentUserEmail);
    localStorage.setItem("user_profile_name", savedName);
    localStorage.setItem(`user_profile_name_${currentUserEmail}`, savedName);

    const reportNameElement = document.getElementById("report-user-name");
    if (reportNameElement) {
        reportNameElement.textContent = savedName;
    }

    const totalCompletedText = document.getElementById("total-completed");
    const topCategoryText = document.getElementById("top-category");
    const barsContainer = document.getElementById("analytics-bars-container");
    const timeFilters = document.querySelectorAll("#report-time-filters .cat-filter");
    const rangeTitle = document.getElementById("range-title");
    const monthSelectContainer = document.getElementById("month-select-container");
    const reportMonthSelect = document.getElementById("report-month-select");

    let globalTasks = [];

    const monthsNames = [
        "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];

    async function loadTasks() {
        const { data, error } = await window.supabaseClient
            .from("tarefas")
            .select("*")
            .eq("user_id", currentUser.id)
            .order("created_at", { ascending: false });

        if (error) {
            alert("Erro ao carregar relatórios: " + error.message);
            return;
        }

        globalTasks = data.map(task => ({
            id: task.id,
            description: task.description,
            category: task.category,
            completed: task.completed,
            date: task.date,
            startDate: task.start_date,
            endDate: task.end_date,
            createdAt: task.created_at
        }));

        calculateStats("semana");
    }

    function getTaskDate(task) {
        const taskDate = task.date || task.startDate || task.createdAt;

        if (!taskDate) {
            return null;
        }

        return new Date(taskDate);
    }

    function isTaskInRange(task, range) {
        const taskDate = getTaskDate(task);

        if (!taskDate || isNaN(taskDate.getTime())) {
            return false;
        }

        const today = new Date();

        const taskYear = taskDate.getFullYear();
        const taskMonth = taskDate.getMonth();
        const taskDay = taskDate.getDate();

        const todayYear = today.getFullYear();
        const todayMonth = today.getMonth();
        const todayDay = today.getDate();

        if (range === "hoje") {
            return (
                taskYear === todayYear &&
                taskMonth === todayMonth &&
                taskDay === todayDay
            );
        }

        if (range === "semana") {
            const firstDayOfWeek = new Date(today);
            const dayOfWeek = today.getDay();
            const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

            firstDayOfWeek.setDate(today.getDate() + diffToMonday);
            firstDayOfWeek.setHours(0, 0, 0, 0);

            const lastDayOfWeek = new Date(firstDayOfWeek);
            lastDayOfWeek.setDate(firstDayOfWeek.getDate() + 6);
            lastDayOfWeek.setHours(23, 59, 59, 999);

            return taskDate >= firstDayOfWeek && taskDate <= lastDayOfWeek;
        }

        if (range === "mes") {
            const selectedMonthIndex = parseInt(reportMonthSelect.value);

            return (
                taskYear === todayYear &&
                taskMonth === selectedMonthIndex
            );
        }

        return true;
    }

    function calculateStats(range) {
        const categories = {
            "Atendimento": { completed: 0, total: 0 },
            "Esterilização": { completed: 0, total: 0 },
            "Estoque": { completed: 0, total: 0 },
            "Marketing": { completed: 0, total: 0 }
        };

        let totalCompletedGlobal = 0;

        if (range === "hoje") {
            rangeTitle.textContent = "Seu Dia Atual";
        } else if (range === "semana") {
            rangeTitle.textContent = "Sua Semana Atual";
        } else if (range === "mes") {
            const selectedMonthIndex = parseInt(reportMonthSelect.value);
            rangeTitle.textContent = `Mês de ${monthsNames[selectedMonthIndex]}`;
        }

        const filteredTasks = globalTasks.filter(task => isTaskInRange(task, range));

        filteredTasks.forEach(task => {
            if (categories[task.category]) {
                categories[task.category].total++;

                if (task.completed) {
                    categories[task.category].completed++;
                    totalCompletedGlobal++;
                }
            }
        });

        if (totalCompletedText) {
            totalCompletedText.textContent = totalCompletedGlobal;
        }

        let bestCategory = "Nenhuma (0%)";
        let bestRate = -1;

        if (barsContainer) {
            barsContainer.innerHTML = "";
        }

        Object.keys(categories).forEach(cat => {
            const data = categories[cat];

            if (data.total > 0) {
                const percentage = Math.round((data.completed / data.total) * 100);

                if (percentage > bestRate && data.completed > 0) {
                    bestRate = percentage;
                    bestCategory = `${cat} (${percentage}%)`;
                }

                const barItem = document.createElement("div");
                barItem.className = "analytics-bar-item";

                barItem.innerHTML = `
                    <div class="analytics-bar-info">
                        <span>${cat}</span>
                        <span>${data.completed}/${data.total}</span>
                    </div>
                    <div class="analytics-progress-track">
                        <div class="analytics-progress-fill" style="width: ${percentage}%"></div>
                    </div>
                `;

                if (barsContainer) {
                    barsContainer.appendChild(barItem);
                }
            }
        });

        if (barsContainer && barsContainer.innerHTML === "") {
            barsContainer.innerHTML = `
                <p class="empty-state" style="color: #555; text-align: center; margin-top: 20px;">
                    Nenhuma tarefa encontrada neste período.
                </p>
            `;
        }

        if (topCategoryText) {
            topCategoryText.textContent = bestCategory;
        }
    }

    timeFilters.forEach(button => {
        button.addEventListener("click", () => {
            timeFilters.forEach(b => b.classList.remove("active"));
            button.classList.add("active");

            const range = button.getAttribute("data-range");

            if (monthSelectContainer) {
                monthSelectContainer.style.display = range === "mes" ? "block" : "none";
            }

            calculateStats(range);
        });
    });

    if (reportMonthSelect) {
        reportMonthSelect.addEventListener("change", () => calculateStats("mes"));
    }

    await loadTasks();
});