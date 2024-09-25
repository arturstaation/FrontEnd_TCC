document.getElementById('buscar_submit').addEventListener('click', async () => {
    const input = document.getElementById('input_lugares').value;
    const loadingElement = document.getElementById('loading');
    const placeh = document.getElementById('sem_resultados');
    loadingElement.classList.remove('hidden');
    if (input) {
        try {

            const response = await fetch(`http://127.0.0.1:5000/GetEstabelecimentos/${input}`);
            const data = await response.json();

            if (!data.hasError) {

                const resultados = document.getElementById('resultados');
                resultados.innerHTML = '';

                if (data.establishments.length > 0) {

                    if (!placeh.classList.contains('hidden'))
                        placeh.classList.add('hidden');

                    data.establishments.forEach(estabelecimento => {

                        const card = document.createElement('div');
                        card.classList.add('card');

                        const titulo = document.createElement('h2');
                        titulo.textContent = estabelecimento.name;
                        card.appendChild(titulo);

                        const subtitulo = document.createElement('p');
                        subtitulo.textContent = estabelecimento.formatted_address;
                        card.appendChild(subtitulo);

                        const numAvaliacoes = document.createElement('p');
                        numAvaliacoes.textContent = `Número de Avaliações: ${estabelecimento.reviews}`;
                        card.appendChild(numAvaliacoes);

                        const avaliacao = document.createElement('span');
                        avaliacao.textContent = `Avaliação: ${estabelecimento.rating}`;
                        avaliacao.style.float = 'right';
                        card.appendChild(avaliacao);


                        const btnAvaliacoes = document.createElement('btn');
                        btnAvaliacoes.textContent = 'Ver Avaliações';
                        btnAvaliacoes.addEventListener('click', async () => {
                            if (estabelecimento.reviews == 0) {
                                showNotification('O estabelecimento não possui reviews.');
                            } else {
                                try {
                                    loadingElement.classList.remove('hidden');

                                    const reviewsResponse = await fetch(`http://127.0.0.1:5000/GetReviewsExcel/${estabelecimento.place_id}`);
                                    const reviewsData = await reviewsResponse.json();

                                    if (!reviewsData.hasError) {
                                        const base64Data = reviewsData.arquivo;
                                        const byteCharacters = atob(base64Data);
                                        const byteArrays = [];

                                        for (let offset = 0; offset < byteCharacters.length; offset += 512) {
                                            const slice = byteCharacters.slice(offset, offset + 512);
                                            const byteNumbers = new Array(slice.length);
                                            for (let i = 0; i < slice.length; i++) {
                                                byteNumbers[i] = slice.charCodeAt(i);
                                            }
                                            const byteArray = new Uint8Array(byteNumbers);
                                            byteArrays.push(byteArray);
                                        }

                                        const blob = new Blob(byteArrays, { type: 'text/csv' });
                                        const link = document.createElement('a');
                                        link.href = URL.createObjectURL(blob);

                                        link.download = `reviews_${estabelecimento.place_id}.csv`;
                                        link.click();

                                        showNotification('Avaliações obtidas com sucesso!', 'success');
                                    }
                                    else {
                                        showNotification('Erro ao carregar avaliações.');
                                    }
                                } catch (error) {
                                    console.error('Erro:', error);
                                    showNotification('Erro ao realizar a busca.');
                                } finally {
                                    loadingElement.classList.add('hidden');
                                }
                            }
                        });

                        card.appendChild(btnAvaliacoes);


                        resultados.appendChild(card);
                    });

                    showNotification('Estabelecimentos obtidos com sucesso!', 'success')
                } else {
                    if (placeh.classList.contains('hidden'))
                        placeh.classList.remove('hidden');
                }
            } else {
                showNotification('Erro ao buscar estabelecimentos.');
            }
        } catch (error) {
            console.error('Erro:', error);
            showNotification('Erro ao realizar a busca.');
        }
    } else {
        showNotification('Digite o nome do restaurante.');
    }
    loadingElement.classList.add('hidden');
});


function showNotification(message, type = 'error') {
    const notification = document.createElement('div');
    notification.classList.add('notification', type);
    notification.textContent = message;

    const container = document.getElementById('notification-container');
    container.appendChild(notification);

    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateY(0)';
    }, 100);

    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(-20px)';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 5000);
}

document.addEventListener('DOMContentLoaded', () => {
    const darkModeToggle = document.getElementById('darkModeToggle');
    const body = document.body;

    function enableDarkMode() {
        body.classList.add('dark-mode');
        darkModeToggle.textContent = '☀️ Modo Claro';
        localStorage.setItem('theme', 'dark');
    }

    function disableDarkMode() {
        body.classList.remove('dark-mode');
        darkModeToggle.textContent = '🌙 Modo Escuro';
        localStorage.setItem('theme', 'light');
    }

    const savedTheme = localStorage.getItem('theme');

    body.classList.add('no-transition');

    if (savedTheme === 'dark') {
        enableDarkMode();
    } else {
        disableDarkMode();
    }

    setTimeout(() => {
        body.classList.remove('no-transition');
    }, 10);

    darkModeToggle.addEventListener('click', () => {
        if (body.classList.contains('dark-mode')) {
            disableDarkMode();
        } else {
            enableDarkMode();
        }
    });
});

function openTab(evt, tabName) {
    var i, tabcontent, tablinks;

    // Esconde todos os elementos com a classe "tabcontent"
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }

    // Remove a classe "active" de todos os botões
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }

    // Exibe o conteúdo da aba atual e adiciona a classe "active" ao botão clicado
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";
}

// Mostra a aba "Buscar" por padrão ao carregar a página
document.addEventListener("DOMContentLoaded", function () {
    document.querySelector(".tablinks").click();
});

function updateFileName() {
    const input = document.getElementById('csvFileInput');
    const label = document.getElementById('csvLabel');
    const removeBtn = document.getElementById('removeFile');

    if (input.files.length > 0) {
        label.innerHTML = input.files[0].name; // Mostra o nome do arquivo
        removeBtn.classList.remove('hidden');  // Mostra o botão "Remover"
    } else {
        label.innerHTML = "Escolher arquivo .csv"; // Texto padrão quando não há arquivo
        removeBtn.classList.add('hidden');        // Esconde o botão "Remover"
    }
}

// Função para remover o arquivo do input
function removeFile() {
    const input = document.getElementById('csvFileInput');
    const label = document.getElementById('csvLabel');
    const removeBtn = document.getElementById('removeFile');

    input.value = ""; // Limpa o valor do input de arquivo
    label.innerHTML = "Escolher arquivo .csv"; // Retorna o texto original
    removeBtn.classList.add('hidden'); // Esconde o botão "Remover"
    document.getElementById('manualReviewSection').classList.add('hidden');
    table.classList.add('hidden');
    table.innerHTML = '';

}


document.getElementById('automaticReview').addEventListener('click', () => {
    const fileInput = document.getElementById('csvFileInput');
    if (fileInput.files.length > 0) {
        const file = fileInput.files[0];
        // Simula a chamada do endpoint de avaliação automática
        alert(`Avaliação automática realizada com sucesso para o arquivo: ${file.name}`);
        // Aqui você pode fazer um request para um endpoint de backend, se necessário
    } else {
        alert('Por favor, faça o upload de um arquivo CSV primeiro.');
    }
});

document.getElementById('manualReview').addEventListener('click', () => {
    const fileInput = document.getElementById('csvFileInput');
    if (fileInput.files.length > 0) {
        const file = fileInput.files[0];
        const reader = new FileReader();

        reader.onload = function (e) {
            const csvContent = e.target.result;
            const parsedData = Papa.parse(csvContent, {
                header: true, // Se o CSV tiver cabeçalhos de coluna
                dynamicTyping: true, // Converte automaticamente valores numéricos e booleanos
                skipEmptyLines: true
            });

            // Chama a função para processar o CSV e aplicar a lógica da coluna 3 e 4
            processCSV(parsedData.data);
        };

        reader.readAsText(file);
    } else {
        alert('Por favor, faça o upload de um arquivo CSV primeiro.');
    }
});
function processCSV(parsedData) {
    // parsedData é o array de objetos ou arrays retornado pelo PapaParse
    const rows = parsedData; // Dependendo da configuração do Papa.parse, pode ser um array de arrays ou de objetos
    const table = document.getElementById('csvTable');
    table.innerHTML = '';

    // Cria o cabeçalho da tabela
    const headerRow = Object.keys(rows[0]); // Pegando as chaves do primeiro objeto como cabeçalhos
    const header = document.createElement('tr');
    headerRow.forEach(headerText => {
        const th = document.createElement('th');
        th.textContent = headerText;
        header.appendChild(th);
    });

    // Adiciona a coluna "Selecionado"
    const thSelecionado = document.createElement('th');
    thSelecionado.textContent = 'Fraude';
    header.appendChild(thSelecionado);
    table.appendChild(header);

    // Cria as linhas da tabela
    rows.forEach(row => {
        const tr = document.createElement('tr');
        headerRow.forEach(headerText => {
            const td = document.createElement('td');
            td.textContent = row[headerText]; // Acessa a célula pelo nome da coluna
            tr.appendChild(td);
        });

        // Adiciona checkbox para seleção
        const tdSelecionado = document.createElement('td');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        tdSelecionado.appendChild(checkbox);
        tr.appendChild(tdSelecionado);

        table.appendChild(tr);
    });

    // Mostra o botão para salvar o CSV
    document.getElementById('manualReviewSection').classList.remove('hidden');
    document.getElementById('saveCsv').classList.remove('hidden');

    // Adiciona funcionalidade ao botão de salvar
    document.getElementById('saveCsv').addEventListener('click', () => {
        saveCSV(rows);
    });
}


function saveCSV(rows) {
    // Atualiza a última coluna com base nos checkboxes
    const updatedRows = Array.from(document.querySelectorAll('#csvTable tr')).map((tr, index) => {
        const cells = Array.from(tr.children).map(td => td.textContent.trim()); // Remover espaços em branco
        if (index > 0) {
            const checkbox = tr.querySelector('input[type="checkbox"]');
            cells.push(checkbox.checked ? 'true' : 'false');
        }
        // Filtrar valores vazios antes de retornar
        return cells.filter(cell => cell !== '');
    });

    // Converte o conteúdo atualizado para CSV
    const csvContent = updatedRows.map(row => row.join(',')).join('\n');

    // Baixa o arquivo CSV
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'avaliacao_resultado.csv';
    link.click();
}
