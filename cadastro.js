document.addEventListener("DOMContentLoaded", () => {
    const registerForm = document.getElementById("register-form");

    if (registerForm) {
        registerForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const nameValue = document.getElementById("reg-name").value.trim();
            const emailValue = document.getElementById("reg-email").value.trim().toLowerCase();
            const passwordValue = document.getElementById("reg-password").value;
            const confirmPasswordValue = document.getElementById("reg-confirm-password").value;

            if (!nameValue || !emailValue || !passwordValue || !confirmPasswordValue) {
                alert("Preencha todos os campos.");
                return;
            }

            if (passwordValue !== confirmPasswordValue) {
                alert("As senhas não coincidem.");
                return;
            }

            const { data, error } = await window.supabaseClient.auth.signUp({
                email: emailValue,
                password: passwordValue,
                options: {
                    data: {
                        nome: nameValue
                    }
                }
            });

            if (error) {
                alert("Erro ao cadastrar: " + error.message);
                return;
            }

            localStorage.setItem("user_profile_email", emailValue);
            localStorage.setItem("user_profile_name", nameValue);
            localStorage.setItem(`user_profile_name_${emailValue}`, nameValue);

            alert("Cadastro realizado com sucesso! Agora faça login.");

            window.location.href = "index.html";
        });
    }
});