document.addEventListener("DOMContentLoaded", async () => {
    const { data: sessionData } = await window.supabaseClient.auth.getSession();

    if (!sessionData.session) {
        alert("Você precisa estar logado para acessar a agenda.");
        window.location.href = "index.html";
        return;
    }

    const { data: userData, error: userError } = await window.supabaseClient.auth.getUser();

    if (userError || !userData.user) {
        alert("Você precisa estar logado para acessar a agenda.");
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

    const agendaNameElement = document.getElementById("agenda-user-name");
    if (agendaNameElement) {
        agendaNameElement.textContent = savedName;
    }

    const monthYearDisplay = document.getElementById("month-year-display");
    const calendarDaysGrid = document.getElementById("calendar-days-grid");
    const prevMonthBtn = document.getElementById("prev-month");
    const nextMonthBtn = document.getElementById("next-month");
    const selectedDateTitle = document.getElementById("selected-date-title");
    const agendaTasksContainer = document.getElementById("agenda-tasks-container");

    const detailsModal = document.getElementById("card-details-modal");
    const closeDetailsBtn = document.getElementById("close-details-btn");
    const saveDetailsBtn = document.getElementById("save-details-btn");
    const detailsCardTitle = document.getElementById("details-card-title");
    const detailsCardCategory = document.getElementById("details-card-category");
    const detailsDescInput = document.getElementById("details-desc-input");
    const detailsStartDate = document.getElementById("details-start-date");
    const detailsEndDate = document.getElementById("details-end-date");
    const attachmentsListContainer = document.getElementById("attachments-list-container");

    let tasksData = [];
    let currentDate = new Date();
    let selectedDateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(currentDate.getDate()).padStart(2, "0")}`;
    let activeEditingTaskId = null;

    const months = [
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
            alert("Erro ao carregar agenda: " + error.message);
            return;
        }

        tasksData = data.map(task => ({
            id: task.id,
            description: task.description,
            category: task.category,
            completed: task.completed,
            date: task.date,
            detailedDescription: task.detailed_description || "",
            startDate: task.start_date || task.date,
            endDate: task.end_date || task.date,
            attachmentPhoto: task.attachment_photo || null
        }));

        renderCalendar();
        renderAgendaTasks();
    }

    function renderCalendar() {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        monthYearDisplay.textContent = `${months[month]} ${year}`;
        calendarDaysGrid.innerHTML = "";

        const firstDayIndex = new Date(year, month, 1).getDay();
        const adjustedFirstDay = firstDayIndex === 0 ? 6 : firstDayIndex - 1;
        const totalDays = new Date(year, month + 1, 0).getDate();

        for (let i = 0; i < adjustedFirstDay; i++) {
            const emptyDiv = document.createElement("div");
            emptyDiv.className = "calendar-day-item empty";
            calendarDaysGrid.appendChild(emptyDiv);
        }

        for (let day = 1; day <= totalDays; day++) {
            const dayCell = document.createElement("div");
            dayCell.className = "calendar-day-item";
            dayCell.textContent = day;

            const thisDateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

            if (thisDateStr === selectedDateStr) {
                dayCell.classList.add("active-day");
            }

            const hasTask = tasksData.some(t =>
                t.startDate === thisDateStr ||
                t.endDate === thisDateStr ||
                t.date === thisDateStr
            );

            if (hasTask) {
                dayCell.classList.add("has-task");
            }

            dayCell.addEventListener("click", () => {
                document.querySelectorAll(".calendar-day-item").forEach(c => c.classList.remove("active-day"));
                dayCell.classList.add("active-day");
                selectedDateStr = thisDateStr;
                renderAgendaTasks();
            });

            calendarDaysGrid.appendChild(dayCell);
        }
    }

    function renderAgendaTasks() {
        const parts = selectedDateStr.split("-");
        selectedDateTitle.textContent = `Tarefas de ${parts[2]}/${parts[1]}/${parts[0]}`;
        agendaTasksContainer.innerHTML = "";

        const dayTasks = tasksData.filter(t =>
            t.startDate === selectedDateStr ||
            t.endDate === selectedDateStr ||
            t.date === selectedDateStr
        );

        if (dayTasks.length === 0) {
            agendaTasksContainer.innerHTML = `
                <p class="empty-state" style="color: #555; text-align: center; margin-top: 20px;">
                    Nenhum atendimento ou tarefa agendada para este dia.
                </p>
            `;
            return;
        }

        dayTasks.forEach(task => {
            const item = document.createElement("div");
            item.className = `task-card-item ${task.completed ? "completed" : ""}`;

            let catClass = task.category.toLowerCase().replace("çã", "ca");

            item.innerHTML = `
                <div class="task-left">
                    <input type="checkbox" class="task-checkbox" ${task.completed ? "checked" : ""}>
                    <span class="task-text-content" style="cursor:pointer; font-weight:500;">${task.description}</span>
                </div>
                <div class="task-right-box">
                    <span class="task-tag tag-${catClass}">${task.category}</span>
                </div>
            `;

            item.querySelector(".task-text-content").addEventListener("click", () => {
                activeEditingTaskId = task.id;

                detailsCardTitle.textContent = task.description;
                detailsCardCategory.textContent = task.category;
                detailsDescInput.value = task.detailedDescription || "";
                detailsStartDate.value = task.startDate || selectedDateStr;
                detailsEndDate.value = task.endDate || selectedDateStr;

                if (task.attachmentPhoto && attachmentsListContainer) {
                    attachmentsListContainer.innerHTML = `
                        <div style="display:flex; align-items:center; gap:10px; background:#242121; padding:10px; border-radius:10px; border:1px solid #3a3636;">
                            <img src="${task.attachmentPhoto}" style="width:40px; height:40px; object-fit:cover; border-radius:6px;">
                            <span style="font-size:12px; color:#fff; font-family:var(--font-sans);">Foto Anexada</span>
                        </div>
                    `;
                } else if (attachmentsListContainer) {
                    attachmentsListContainer.innerHTML = "";
                }

                detailsModal.classList.add("active");
            });

            item.querySelector(".task-checkbox").addEventListener("change", async (e) => {
                const newStatus = e.target.checked;

                const { error } = await window.supabaseClient
                    .from("tarefas")
                    .update({ completed: newStatus })
                    .eq("id", task.id)
                    .eq("user_id", currentUser.id);

                if (error) {
                    alert("Erro ao atualizar tarefa: " + error.message);
                    e.target.checked = !newStatus;
                    return;
                }

                task.completed = newStatus;
                renderAgendaTasks();
            });

            agendaTasksContainer.appendChild(item);
        });
    }

    if (saveDetailsBtn) {
        saveDetailsBtn.addEventListener("click", async () => {
            const targetTask = tasksData.find(t => t.id === activeEditingTaskId);

            if (targetTask) {
                const updatedData = {
                    detailed_description: detailsDescInput.value,
                    start_date: detailsStartDate.value,
                    end_date: detailsEndDate.value
                };

                const { error } = await window.supabaseClient
                    .from("tarefas")
                    .update(updatedData)
                    .eq("id", activeEditingTaskId)
                    .eq("user_id", currentUser.id);

                if (error) {
                    alert("Erro ao salvar detalhes: " + error.message);
                    return;
                }

                targetTask.detailedDescription = detailsDescInput.value;
                targetTask.startDate = detailsStartDate.value;
                targetTask.endDate = detailsEndDate.value;

                detailsModal.classList.remove("active");

                renderCalendar();
                renderAgendaTasks();
            }
        });
    }

    if (closeDetailsBtn) {
        closeDetailsBtn.addEventListener("click", () => {
            detailsModal.classList.remove("active");
        });
    }

    if (prevMonthBtn) {
        prevMonthBtn.addEventListener("click", () => {
            currentDate.setMonth(currentDate.getMonth() - 1);
            renderCalendar();
        });
    }

    if (nextMonthBtn) {
        nextMonthBtn.addEventListener("click", () => {
            currentDate.setMonth(currentDate.getMonth() + 1);
            renderCalendar();
        });
    }

    await loadTasks();
});