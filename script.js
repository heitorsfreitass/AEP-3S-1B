document.addEventListener("DOMContentLoaded", function () {
    atualizarMapa();
});

let bicicletasDisponiveis = [
    { id: 1, lat: -23.4184, lng: -51.9324, nome: "Shopping Avenida Center", disponivel: true, status: "available", rentalStartTime:null, problemReport:null},
    { id: 2, lat: -23.4266, lng: -51.9380, nome: "Praça da Catedral", disponivel: true, status: "available", rentalStartTime:null, problemReport:null},
    { id: 3, lat: -23.4260, lng: -51.9330, nome: "Parque do Ingá", disponivel: true, status: "available", rentalStartTime:null, problemReport:null}
];

let mapa;

function atualizarMapa() {
    if (!mapa) {
        mapa = L.map('mapa').setView([-23.4273, -51.9375], 14);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(mapa);
    } 

    //remover marcadores antigos
    mapa.eachLayer(layer => {
        if (layer instanceof L.Marker) {
            mapa.removeLayer(layer);
        }
    })

    bicicletasDisponiveis.forEach(bike => {
        // let ponto = document.createElement("div");
        let cor;
        // ponto.classList.add("ponto");
        if (bike.status === "maintenance") {
            cor = "red";
        } else if (!bike.disponivel) {
            cor = "gray";
        } else {
            cor = "green";
        }

        let marcador = L.circleMarker([bike.lat, bike.lng], {
            color: cor,
            radius: 8,
            fillOpacity: 0.8
        }).addTo(mapa);

        marcador.bindPopup(`<strong>${bike.nome}</strong><br>Status: ${bike.status === "maintenance" ? "Em Manutenção" : (bike.disponivel ? "Disponível" : "Indisponível")}`);

        // ponto.style.left = bike.x + "px";
        // ponto.style.top = bike.y + "px";
        // ponto.title = `${bike.nome} - ${bike.status === "maintenance" ? "Em Manutenção" : (bike.disponivel ? "Disponível" : "Indisponível")}`;
        // ponto.onclick = () => selecionarBicicleta(bike.id);
        // mapa.appendChild(ponto);
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