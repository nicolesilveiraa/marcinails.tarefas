document.addEventListener("DOMContentLoaded", async () => {
    const { data: sessionData } = await window.supabaseClient.auth.getSession();

    if (!sessionData.session) {
        alert("Você precisa estar logado para acessar o painel.");
        window.location.href = "index.html";
        return;
    }

    const { data: userData, error: userError } = await window.supabaseClient.auth.getUser();

    if (userError || !userData.user) {
        alert("Você precisa estar logado para acessar o painel.");
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

    const dashboardNameElement = document.getElementById("dashboard-user-name");
    if (dashboardNameElement) {
        dashboardNameElement.textContent = savedName;
    }

    const modal = document.getElementById("task-modal");
    const openModalBtn = document.getElementById("open-modal-btn");
    const closeModalBtn = document.getElementById("close-modal-btn");
    const cancelTaskBtn = document.getElementById("cancel-task-btn");
    const saveTaskBtn = document.getElementById("save-task-btn");

    const tasksContainer = document.getElementById("tasks-container");
    const counterNumber = document.getElementById("counter-number");
    const taskDescInput = document.getElementById("task-desc");
    const catButtons = document.querySelectorAll(".cat-select-btn");
    const filterButtons = document.querySelectorAll(".cat-filter");

    const detailsModal = document.getElementById("card-details-modal");
    const closeDetailsBtn = document.getElementById("close-details-btn");
    const saveDetailsBtn = document.getElementById("save-details-btn");
    const detailsCardTitle = document.getElementById("details-card-title");
    const detailsCardCategory = document.getElementById("details-card-category");
    const detailsDescInput = document.getElementById("details-desc-input");
    const detailsStartDate = document.getElementById("details-start-date");
    const detailsEndDate = document.getElementById("details-end-date");

    const triggerUploadBtn = document.getElementById("trigger-file-upload");
    const cardFileInput = document.getElementById("trello-card-file");
    const attachmentsListContainer = document.getElementById("attachments-list-container");

    let tasksData = [];
    let selectedCategory = "";
    let currentFilter = "";
    let activeEditingTaskId = null;
    let tempAttachmentBase64 = null;

    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

    async function loadTasks() {
        const { data, error } = await window.supabaseClient
            .from("tarefas")
            .select("*")
            .eq("user_id", currentUser.id)
            .order("created_at", { ascending: false });

        if (error) {
            alert("Erro ao carregar tarefas: " + error.message);
            return;
        }

        tasksData = data.map(task => ({
            id: task.id,
            description: task.description,
            category: task.category,
            completed: task.completed,
            date: task.date,
            detailedDescription: task.detailed_description || "",
            startDate: task.start_date || todayStr,
            endDate: task.end_date || todayStr,
            attachmentPhoto: task.attachment_photo || null
        }));

        renderTasks();
        updateCounter();
    }

    function updateCounter() {
        if (counterNumber) {
            const pendingCount = tasksData.filter(t => !t.completed).length;
            counterNumber.textContent = pendingCount;
        }
    }

    function openModal() {
        modal.classList.add("active");
        taskDescInput.value = "";
        selectedCategory = "";
        catButtons.forEach(b => b.classList.remove("selected"));
    }

    function closeModal() {
        modal.classList.remove("active");
    }

    if (openModalBtn) openModalBtn.addEventListener("click", openModal);
    if (closeModalBtn) closeModalBtn.addEventListener("click", closeModal);
    if (cancelTaskBtn) cancelTaskBtn.addEventListener("click", closeModal);

    catButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            catButtons.forEach(b => b.classList.remove("selected"));
            btn.classList.add("selected");
            selectedCategory = btn.getAttribute("data-category");
        });
    });

    if (triggerUploadBtn && cardFileInput) {
        triggerUploadBtn.addEventListener("click", () => cardFileInput.click());

        cardFileInput.addEventListener("change", function () {
            const file = this.files[0];

            if (file) {
                const reader = new FileReader();

                reader.onload = function (e) {
                    tempAttachmentBase64 = e.target.result;
                    renderAttachmentPreview(tempAttachmentBase64);
                };

                reader.readAsDataURL(file);
            }
        });
    }

    function renderAttachmentPreview(base64Uri) {
        attachmentsListContainer.innerHTML = `
            <div style="display:flex; align-items:center; justify-content:space-between; background:#242121; padding:10px; border-radius:10px; border:1px solid #3a3636; margin-top:8px;">
                <div style="display:flex; align-items:center; gap:10px;">
                    <img src="${base64Uri}" style="width:40px; height:40px; object-fit:cover; border-radius:6px; border:1px solid #555;">
                    <span style="font-size:12px; color:#fff; font-family:var(--font-sans);">Foto Anexada</span>
                </div>
                <button id="remove-attachment-btn" style="background:none; border:none; color:var(--accent-pink); cursor:pointer; font-size:12px; font-weight:600; font-family:var(--font-sans);">Remover</button>
            </div>
        `;

        document.getElementById("remove-attachment-btn").addEventListener("click", () => {
            tempAttachmentBase64 = null;
            attachmentsListContainer.innerHTML = "";
            if (cardFileInput) cardFileInput.value = "";
        });
    }

    function renderTasks() {
        tasksContainer.innerHTML = "";

        const filteredTasks = currentFilter
            ? tasksData.filter(t => t.category === currentFilter)
            : tasksData;

        if (filteredTasks.length === 0) {
            tasksContainer.innerHTML = `<p class="empty-state" style="color: #555; text-align: center; font-size: 14px; margin-top: 40px;">Nenhuma tarefa encontrada. Clique no + para adicionar!</p>`;
            return;
        }

        filteredTasks.forEach(task => {
            const taskItem = document.createElement("div");
            taskItem.className = `task-card-item ${task.completed ? "completed" : ""}`;

            let catClass = task.category.toLowerCase().replace("çã", "ca");

            taskItem.innerHTML = `
                <div class="task-left">
                    <input type="checkbox" class="task-checkbox" ${task.completed ? "checked" : ""}>
                    <span class="task-text-content" style="cursor:pointer; font-weight:500;">${task.description}</span>
                </div>
                <div class="task-right-box">
                    <span class="task-tag tag-${catClass}">${task.category}</span>
                    <button class="delete-task-btn" title="Excluir" style="color:var(--gray-text); display:flex; align-items:center; background:none; border:none; cursor:pointer;">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            <line x1="10" y1="11" x2="10" y2="17"></line>
                            <line x1="14" y1="11" x2="14" y2="17"></line>
                        </svg>
                    </button>
                </div>
            `;

            const textClickZone = taskItem.querySelector(".task-text-content");
            textClickZone.addEventListener("click", () => {
                activeEditingTaskId = task.id;

                detailsCardTitle.textContent = task.description;
                detailsCardCategory.textContent = task.category;

                detailsDescInput.value = task.detailedDescription || "";
                detailsStartDate.value = task.startDate || todayStr;
                detailsEndDate.value = task.endDate || todayStr;

                tempAttachmentBase64 = task.attachmentPhoto || null;

                if (tempAttachmentBase64) {
                    renderAttachmentPreview(tempAttachmentBase64);
                } else {
                    attachmentsListContainer.innerHTML = "";
                }

                detailsModal.classList.add("active");
            });

            const checkbox = taskItem.querySelector(".task-checkbox");
            checkbox.addEventListener("change", async () => {
                const newStatus = checkbox.checked;

                const { error } = await window.supabaseClient
                    .from("tarefas")
                    .update({ completed: newStatus })
                    .eq("id", task.id)
                    .eq("user_id", currentUser.id);

                if (error) {
                    alert("Erro ao atualizar tarefa: " + error.message);
                    checkbox.checked = !newStatus;
                    return;
                }

                task.completed = newStatus;
                renderTasks();
                updateCounter();
            });

            const deleteBtn = taskItem.querySelector(".delete-task-btn");
            deleteBtn.addEventListener("click", async () => {
                const { error } = await window.supabaseClient
                    .from("tarefas")
                    .delete()
                    .eq("id", task.id)
                    .eq("user_id", currentUser.id);

                if (error) {
                    alert("Erro ao excluir tarefa: " + error.message);
                    return;
                }

                tasksData = tasksData.filter(t => t.id !== task.id);
                renderTasks();
                updateCounter();
            });

            tasksContainer.appendChild(taskItem);
        });
    }

    if (saveDetailsBtn) {
        saveDetailsBtn.addEventListener("click", async () => {
            const targetTask = tasksData.find(t => t.id === activeEditingTaskId);

            if (targetTask) {
                const updatedData = {
                    detailed_description: detailsDescInput.value,
                    start_date: detailsStartDate.value,
                    end_date: detailsEndDate.value,
                    attachment_photo: tempAttachmentBase64
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
                targetTask.attachmentPhoto = tempAttachmentBase64;

                detailsModal.classList.remove("active");
                renderTasks();
            }
        });
    }

    if (closeDetailsBtn) {
        closeDetailsBtn.addEventListener("click", () => {
            detailsModal.classList.remove("active");
        });
    }

    if (saveTaskBtn) {
        saveTaskBtn.addEventListener("click", async () => {
            const desc = taskDescInput.value.trim();

            if (!desc || !selectedCategory) {
                alert("Preencha os campos!");
                return;
            }

            const newTask = {
                user_id: currentUser.id,
                description: desc,
                category: selectedCategory,
                completed: false,
                date: todayStr,
                detailed_description: "",
                start_date: todayStr,
                end_date: todayStr,
                attachment_photo: null
            };

            const { data, error } = await window.supabaseClient
                .from("tarefas")
                .insert(newTask)
                .select()
                .single();

            if (error) {
                alert("Erro ao salvar tarefa: " + error.message);
                return;
            }

            tasksData.unshift({
                id: data.id,
                description: data.description,
                category: data.category,
                completed: data.completed,
                date: data.date,
                detailedDescription: data.detailed_description || "",
                startDate: data.start_date || todayStr,
                endDate: data.end_date || todayStr,
                attachmentPhoto: data.attachment_photo || null
            });

            renderTasks();
            updateCounter();
            closeModal();
        });
    }

    filterButtons.forEach(button => {
        button.addEventListener("click", () => {
            const filterVal = button.getAttribute("data-filter");

            if (currentFilter === filterVal) {
                currentFilter = "";
                button.classList.remove("active");
            } else {
                filterButtons.forEach(b => b.classList.remove("active"));
                currentFilter = filterVal;
                button.classList.add("active");
            }

            renderTasks();
        });
    });

    await loadTasks();
});