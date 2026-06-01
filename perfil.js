document.addEventListener("DOMContentLoaded", async () => {
    const { data: sessionData } = await window.supabaseClient.auth.getSession();

    if (!sessionData.session) {
        alert("Você precisa estar logado para acessar o perfil.");
        window.location.href = "index.html";
        return;
    }

    const { data: userData, error: userError } = await window.supabaseClient.auth.getUser();

    if (userError || !userData.user) {
        alert("Você precisa estar logado para acessar o perfil.");
        window.location.href = "index.html";
        return;
    }

    const currentUser = userData.user;
    const currentUserEmail = currentUser.email;

    const PROFILE_NAME_KEY = `user_profile_name_${currentUserEmail}`;
    const PROFILE_PHOTO_KEY = `user_profile_photo_${currentUserEmail}`;

    const welcomeName = document.getElementById("profile-welcome-name");
    const displayName = document.getElementById("profile-display-name");
    const displayEmail = document.getElementById("profile-display-email");

    const avatarContainer = document.getElementById("profile-avatar-container");
    const avatarClickZone = document.getElementById("avatar-clickable-zone");
    const fileInput = document.getElementById("profile-file-input");

    const editModal = document.getElementById("edit-profile-modal");
    const editBtn = document.getElementById("edit-profile-btn");
    const closeBtn = document.getElementById("close-profile-modal");
    const cancelBtn = document.getElementById("cancel-profile-edit");
    const saveBtn = document.getElementById("save-profile-edit");
    const nameInput = document.getElementById("edit-name-input");

    const logoutBtn = document.querySelector(".btn-primary-logout");

    function getSavedName() {
        return (
            currentUser.user_metadata?.nome ||
            localStorage.getItem(PROFILE_NAME_KEY) ||
            localStorage.getItem("user_profile_name") ||
            currentUserEmail.split("@")[0]
        );
    }

    function loadData() {
        const savedName = getSavedName();
        const savedPhoto = localStorage.getItem(PROFILE_PHOTO_KEY);

        localStorage.setItem("user_profile_email", currentUserEmail);
        localStorage.setItem("user_profile_name", savedName);
        localStorage.setItem(PROFILE_NAME_KEY, savedName);

        if (welcomeName) welcomeName.textContent = savedName;
        if (displayName) displayName.textContent = savedName;
        if (displayEmail) displayEmail.textContent = currentUserEmail;
        if (nameInput) nameInput.value = savedName;

        if (savedPhoto && avatarContainer) {
            avatarContainer.innerHTML = `
                <img src="${savedPhoto}" style="width:100%; height:100%; border-radius:50%; object-fit:cover;">
            `;
        } else if (avatarContainer) {
            avatarContainer.innerHTML = savedName.trim().charAt(0).toUpperCase();
        }
    }

    if (avatarClickZone && fileInput) {
        avatarClickZone.addEventListener("click", () => fileInput.click());

        fileInput.addEventListener("change", function () {
            const file = this.files[0];

            if (file) {
                const reader = new FileReader();

                reader.onload = function (e) {
                    localStorage.setItem(PROFILE_PHOTO_KEY, e.target.result);
                    loadData();
                };

                reader.readAsDataURL(file);
            }
        });
    }

    const toggles = ["toggle-estoque", "toggle-agenda", "toggle-atendimentos", "toggle-share"];

    toggles.forEach(id => {
        const toggleElement = document.getElementById(id);

        if (toggleElement) {
            const toggleUserKey = `${id}_${currentUserEmail}`;
            const savedState = localStorage.getItem(toggleUserKey);

            if (savedState !== null) {
                toggleElement.checked = savedState === "true";
            }

            toggleElement.addEventListener("change", () => {
                localStorage.setItem(toggleUserKey, toggleElement.checked);
            });
        }
    });

    if (editBtn && editModal) {
        editBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            editModal.classList.add("active");
        });
    }

    if (closeBtn) {
        closeBtn.addEventListener("click", () => {
            editModal.classList.remove("active");
        });
    }

    if (cancelBtn) {
        cancelBtn.addEventListener("click", () => {
            editModal.classList.remove("active");
        });
    }

    if (saveBtn) {
        saveBtn.addEventListener("click", async () => {
            const newName = nameInput.value.trim();

            if (!newName) {
                alert("Digite um nome válido.");
                return;
            }

            const { error } = await window.supabaseClient.auth.updateUser({
                data: {
                    nome: newName
                }
            });

            if (error) {
                alert("Erro ao atualizar perfil: " + error.message);
                return;
            }

            localStorage.setItem(PROFILE_NAME_KEY, newName);
            localStorage.setItem("user_profile_name", newName);

            loadData();
            editModal.classList.remove("active");

            alert("Perfil atualizado com sucesso!");
        });
    }

    const menuItems = document.querySelectorAll(".profile-menu-item");

    menuItems.forEach(item => {
        const btn = item.querySelector(".profile-nav-trigger");

        if (btn && btn.id !== "edit-profile-btn") {
            btn.addEventListener("click", () => {
                const isActive = item.classList.contains("active-item");

                menuItems.forEach(i => i.classList.remove("active-item"));

                if (!isActive) {
                    item.classList.add("active-item");
                }
            });
        }
    });

    if (logoutBtn) {
        logoutBtn.addEventListener("click", async (e) => {
            e.preventDefault();

            const { error } = await window.supabaseClient.auth.signOut();

            if (error) {
                alert("Erro ao sair: " + error.message);
                return;
            }

            localStorage.removeItem("user_profile_email");
            localStorage.removeItem("user_profile_name");

            window.location.href = "index.html";
        });
    }

    loadData();
});