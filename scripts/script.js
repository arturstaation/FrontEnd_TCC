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

                                    const blob = new Blob(byteArrays, { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                                    const link = document.createElement('a');
                                    link.href = URL.createObjectURL(blob);
                                    link.download = `reviews_${estabelecimento.place_id}.xlsx`;
                                    link.click();
                                    showNotification('Avaliações obtidas com sucesso!', 'success')
                                } else {
                                    showNotification('Erro ao carregar avaliações.');
                                }
                            } catch (error) {
                                console.error('Erro:', error);
                                showNotification('Erro ao realizar a busca.');
                            } finally {
                                loadingElement.classList.add('hidden');
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

const darkModeToggle = document.getElementById('darkModeToggle');
const body = document.body;

darkModeToggle.addEventListener('click', function () {
    body.classList.toggle('dark-mode');

    if (body.classList.contains('dark-mode')) {
        darkModeToggle.textContent = '☀️ Modo Claro';
    } else {
        darkModeToggle.textContent = '🌙 Modo Escuro';
    }
});