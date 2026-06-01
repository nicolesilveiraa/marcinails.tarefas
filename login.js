document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("login-form");

    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const emailValue = document.getElementById("login-email").value.trim().toLowerCase();
            const passwordValue = document.getElementById("login-password").value;

            if (!emailValue || !passwordValue) {
                alert("Preencha e-mail e senha.");
                return;
            }

            const { data, error } = await window.supabaseClient.auth.signInWithPassword({
                email: emailValue,
                password: passwordValue
            });

            if (error) {
                alert("Erro ao fazer login: " + error.message);
                return;
            }

            if (!data.session) {
                alert("Login não criou sessão. Verifique se o e-mail precisa ser confirmado.");
                return;
            }

            const user = data.user;

            const userName =
                user.user_metadata?.nome ||
                emailValue.split("@")[0];

            localStorage.setItem("user_profile_email", emailValue);
            localStorage.setItem("user_profile_name", userName);
            localStorage.setItem(`user_profile_name_${emailValue}`, userName);

            window.location.href = "dashboard.html";
        });
    }
});