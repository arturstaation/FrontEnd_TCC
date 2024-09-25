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

    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }

    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }

    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";
}

document.addEventListener("DOMContentLoaded", function () {
    document.querySelector(".tablinks").click();
});

function updateFileName() {
    const input = document.getElementById('csvFileInput');
    const label = document.getElementById('csvLabel');
    const removeBtn = document.getElementById('removeFile');
    const automaticReviewBtn = document.getElementById('automaticReview');
    const manualReviewBtn = document.getElementById('manualReview');

    if (input.files.length == 1) {
        const nome_arquivo = input.files[0].name.split('.');
        if (nome_arquivo[nome_arquivo.length - 1].toLowerCase() == 'csv') {
            label.innerHTML = input.files[0].name;
            removeBtn.classList.remove('hidden');
            automaticReviewBtn.classList.remove('hidden');
            manualReviewBtn.classList.remove('hidden');
        } else {
            showNotification("O Arquivo deve ser do formato .csv");
        }
    } else {
        showNotification("Escolha 1 arquivo .csv");
        label.innerHTML = "Escolher arquivo .csv";
        removeBtn.classList.add('hidden');
        automaticReviewBtn.classList.add('hidden');
        manualReviewBtn.classList.add('hidden');
    }
}

function removeFile() {
    const input = document.getElementById('csvFileInput');
    const label = document.getElementById('csvLabel');
    const removeBtn = document.getElementById('removeFile');
    const automaticReviewBtn = document.getElementById('automaticReview');
    const manualReviewBtn = document.getElementById('manualReview');

    input.value = "";
    label.innerHTML = "Escolher arquivo .csv";
    removeBtn.classList.add('hidden');
    automaticReviewBtn.classList.add('hidden');
    manualReviewBtn.classList.add('hidden');
    document.getElementById('manualReviewSection').classList.add('hidden');
    table.classList.add('hidden');
    table.innerHTML = '';
}

document.getElementById('automaticReview').addEventListener('click', () => {
    const fileInput = document.getElementById('csvFileInput');
    if (fileInput.files.length > 0) {
        const file = fileInput.files[0];
        showNotification(`Avaliação automática realizada com sucesso para o arquivo: ${file.name}`, "success");
    } else {
        showNotification('Por favor, faça o upload de um arquivo CSV primeiro.');
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
                header: true,
                dynamicTyping: true,
                skipEmptyLines: true
            });

            processCSV(parsedData.data);
        };

        reader.readAsText(file);
    } else {
        showNotification('Por favor, faça o upload de um arquivo CSV primeiro.');
    }
});
function processCSV(parsedData) {

    const rows = parsedData;
    const table = document.getElementById('csvTable');
    table.innerHTML = '';


    const headerRow = Object.keys(rows[0]);
    const header = document.createElement('tr');
    headerRow.forEach(headerText => {
        const th = document.createElement('th');
        th.textContent = headerText;
        header.appendChild(th);
    });


    const thSelecionado = document.createElement('th');
    thSelecionado.textContent = 'Fraude';
    header.appendChild(thSelecionado);
    table.appendChild(header);


    rows.forEach(row => {
        const tr = document.createElement('tr');
        headerRow.forEach(headerText => {
            const td = document.createElement('td');
            td.textContent = row[headerText];
            tr.appendChild(td);
        });


        const tdSelecionado = document.createElement('td');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        tdSelecionado.appendChild(checkbox);
        tr.appendChild(tdSelecionado);

        table.appendChild(tr);
    });

    document.getElementById('manualReviewSection').classList.remove('hidden');
    document.getElementById('saveCsv').classList.remove('hidden');

    document.getElementById('saveCsv').addEventListener('click', () => {
        saveCSV(rows);
    });
}


function saveCSV(rows) {
    const updatedRows = Array.from(document.querySelectorAll('#csvTable tr')).map((tr, index) => {
        const cells = Array.from(tr.children).map(td => td.textContent.trim());
        if (index > 0) {
            const checkbox = tr.querySelector('input[type="checkbox"]');
            cells.push(checkbox.checked ? 'true' : 'false');
        }

        return cells.filter(cell => cell !== '');
    });


    const csvContent = updatedRows.map(row => row.join(',')).join('\n');


    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'avaliacao_resultado.csv';
    link.click();

    showNotification('Avaliações manipuladas com sucesso!', 'success');
}
