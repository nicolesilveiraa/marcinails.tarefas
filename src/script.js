function entrar() {
    alert("Login realizado com sucesso!");
    document.getElementById('tela-login').classList.add('escondido');
    document.getElementById('app').classList.remove('escondido');
    atualizarResumo();
}

function irParaCadastro() {
    document.getElementById('tela-login').classList.add('escondido');
    document.getElementById('tela-cadastro').classList.remove('escondido');
}

function irParaLogin() {
    document.getElementById('tela-cadastro').classList.add('escondido');
    document.getElementById('tela-login').classList.remove('escondido');
}

function confirmarCadastro() {
    alert("Cadastro realizado com sucesso!");
    irParaLogin();
}

function mudarTela(id) {
    document.querySelectorAll('.secao-app').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(id).classList.add('active');
}

function abrirModal() {
    document.getElementById('modal-add').classList.remove('escondido');
}

function fecharModal() {
    document.getElementById('modal-add').classList.add('escondido');
}

function atualizarResumo() {
    const tarefas = document.querySelectorAll('#tela-tasks .task-row');
    let pendentes = 0;
    tarefas.forEach(t => {
        const cb = t.querySelector('input[type="checkbox"]');
        if (cb && !cb.checked) pendentes++;
    });
    const subtitulo = document.getElementById('subtitulo');
    if (subtitulo) {
        subtitulo.innerText = pendentes + " tarefas restantes";
    }
}

document.querySelectorAll('input[type="checkbox"]').forEach(cb => {
    cb.addEventListener('change', atualizarResumo);
});
