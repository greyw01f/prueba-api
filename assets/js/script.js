const clpAmountInput = document.getElementById('clp-amount');
const currencySelect = document.getElementById('currency-select');
const convertButton = document.getElementById('convert-button');
const resultDiv = document.getElementById('result');
const errorMessageDiv = document.getElementById('error-message');
const chartContainer = document.getElementById('chart-container');
const currencyChartCanvas = document.getElementById('currency-chart');

let myChart = null;

convertButton.addEventListener('click', async () => {
    resultDiv.textContent = '';
    errorMessageDiv.textContent = '';
    chartContainer.classList.add('hidden');
    if (myChart) {
        myChart.destroy();
    }

    const clpAmount = parseFloat(clpAmountInput.value);
    const selectedCurrency = currencySelect.value;

    if (isNaN(clpAmount) || clpAmount <= 0) {
        errorMessageDiv.textContent = 'Por favor, ingrese un monto válido en CLP.';
        return;
    }

    if (!selectedCurrency) {
        errorMessageDiv.textContent = 'Por favor, seleccione una moneda para convertir.';
        return;
    }

    try {
        const apiUrl = `https://mindicador.cl/api/${selectedCurrency}`;
        const response = await fetch(apiUrl);

        if (!response.ok) {
            throw new Error(`Error al obtener datos de la API: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        const exchangeRate = data.serie[0].valor;

        const convertedAmount = clpAmount / exchangeRate;
        resultDiv.textContent = `Resultado: ${convertedAmount.toLocaleString('es-CL', {
            style: 'currency',
            currency: selectedCurrency === 'dolar' ? 'USD' : 'EUR'
        })}`;

        const historicalData = data.serie.slice(0, 10);
        const labels = historicalData.map(item => new Date(item.fecha).toLocaleDateString('es-CL')).reverse();
        const values = historicalData.map(item => item.valor).reverse();

        chartContainer.classList.remove('hidden');

        const ctx = currencyChartCanvas.getContext('2d');
        myChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: `Valor ${selectedCurrency.toUpperCase()} (Últimos 10 días)`,
                    data: values,
                    borderColor: 'rgb(75, 192, 192)',
                    tension: 0.1,
                    fill: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Fecha'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Valor en CLP'
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            color: '#333'
                        }
                    }
                }
            }
        });

    } catch (error) {
        errorMessageDiv.textContent = `Ocurrió un error: ${error.message}`;
        console.error('Error fetching data:', error);
    }
});

clpAmountInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        event.preventDefault();
        convertButton.click();
    }
});
