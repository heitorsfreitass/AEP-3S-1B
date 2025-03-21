document.addEventListener("DOMContentLoaded", function () {
    atualizarMapa();
});

let bicicletasDisponiveis = [
    { id: 1, x: 100, y: 200, nome: "Praça Central", disponivel: true, status: "available", rentalStartTime:null, problemReport:null},
    { id: 2, x: 250, y: 150, nome: "Shopping Principal", disponivel: true, status: "available", rentalStartTime:null, problemReport:null},
    { id: 3, x: 400, y: 300, nome: "Estádio Municipal", disponivel: true, status: "available", rentalStartTime:null, problemReport:null}
];

function atualizarMapa() {
    let mapa = document.getElementById("mapa");
    mapa.innerHTML = ""; 
    bicicletasDisponiveis.forEach(bike => {
        let ponto = document.createElement("div");
        ponto.classList.add("ponto");
        if (bike.status === "maintenance") {
            ponto.classList.add("manutencao");
        } else if (!bike.disponivel) {
            ponto.classList.add("indisponivel");
        }
        ponto.style.left = bike.x + "px";
        ponto.style.top = bike.y + "px";
        ponto.title = `${bike.nome} - ${bike.status === "maintenance" ? "Em Manutenção" : (bike.disponivel ? "Disponível" : "Indisponível")}`;
        ponto.onclick = () => selecionarBicicleta(bike.id);
        mapa.appendChild(ponto);
    });
}

function exibirBicicletas() {
    let lista = "<h2>Bicicletas</h2><ul>";
    bicicletasDisponiveis.forEach(bike => {
        lista += `<li>Bicicleta ${bike.id} - ${bike.nome} - ${bike.status === "maintenance" ? "<strong>Em Manutenção</strong>" : (bike.disponivel ? "<strong>Disponível</strong>" : "<strong>Indisponível</strong>")}</li>`;
    });
    lista += "</ul>";
    document.getElementById("listaBicicletas").innerHTML = lista;
}

function selecionarBicicleta(id) {
    let bike = bicicletasDisponiveis.find(b => b.id === id);
    if (bike) {
        let isError = bike.status === "maintenance" || !bike.disponivel;
        mostrarNotificacao(`Bicicleta ${bike.id} - ${bike.nome} - ${bike.status === "maintenance" ? "Em Manutenção" : (bike.disponivel ? "Disponível" : "Indisponível")}`, isError);
    }
}

function pegarBicicleta() {
    let id = parseInt(prompt("Digite o ID da bicicleta que deseja pegar:"));
    let bike = bicicletasDisponiveis.find(b => b.id === id && b.disponivel && b.status === "available");
    if (bike) {
        bike.disponivel = false;
        bike.status = "rented";
        bike.rentalStartTime = new Date();
        atualizarMapa();
        exibirBicicletas();
        mostrarNotificacao(`Você pegou a bicicleta ${bike.id} - ${bike.nome}`);
    } else {
        mostrarNotificacao("ID inválido ou bicicleta indisponível.", true);
    }
}

function devolverBicicleta() {
    let id = parseInt(prompt("Digite o ID da bicicleta que deseja devolver:"));
    let bike = bicicletasDisponiveis.find(b => b.id === id && !b.disponivel && b.status === "rented");
    if (bike) {
        let rentalEndTime = new Date();
        let rentalDuration = rentalEndTime - bike.rentalStartTime;
        let problemReport = prompt("Reporte algum problema (deixe em branco se não houver):");
        if (problemReport) {
            bike.problemReport = problemReport;
            bike.status = "maintenance";
            mostrarNotificacao(`Problema reportado: ${problemReport}. Bicicleta ${bike.id} - ${bike.nome} está em manutenção.`, true);
        } else {
            bike.status = "available";
            mostrarNotificacao(`Você devolveu a bicicleta ${bike.id} - ${bike.nome} após ${(rentalDuration / 1000 / 60).toFixed(2)} minutos.`);
        }
        bike.disponivel = true;
        bike.rentalStartTime = null;
        atualizarMapa();
        exibirBicicletas();
    } else {
        mostrarNotificacao("ID inválido ou bicicleta já está disponível.", true);
    }
}

function mostrarNotificacao(mensagem, erro = false) {
    Toastify({
        text: mensagem,
        duration: 3000,
        gravity: erro ? "top" : "bottom", 
        position: "right",
        backgroundColor: erro ? "#dc3545" : "#28a745", 
        stopOnFocus: true, 
        close: true
    }).showToast();
}

atualizarMapa();