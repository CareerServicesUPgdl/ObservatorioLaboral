export function graficaEmpleabilidad(si, no) {
    const ctx = document.getElementById('empleabilidad').getContext('2d');

    if (window.chartEmpleo) {
        window.chartEmpleo.destroy();
    }

    window.chartEmpleo = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Trabajan', 'No Trabajan'],
            datasets: [{
                label: 'Situación Laboral',
                data: [si, no],
                backgroundColor: ['#88803c', '#710800'],
                borderWidth: 1
            }]
        },
        plugins: [ChartDataLabels],
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                    labels: { color: '#333', font: { size: 14 } }
                },
                title: {
                    display: true,
                    text: 'Índice de empleabilidad',
                    font: { size: 18 },
                    color: '#000000'
                },
                datalabels: {
                    color: '#fff',
                    font: { size: 12 },
                    display: (context) => context.dataset.data[context.dataIndex] > 0,
                    formatter: (value, ctx) => {
                        const total = ctx.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
                        if (total === 0) return "0%"; // Evita división por cero
                        const percentage = ((value * 100) / total).toFixed(1) + "%";
                        return percentage;
                    }
                }
            }
        }
    });
}

const graficasBarras = {};
export function graficaIniciativas(datos) {
    const canvas = document.getElementById(datos.id);
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    if (graficasBarras[datos.id]) {
        graficasBarras[datos.id].destroy();
    }

    graficasBarras[datos.id] = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: datos.etiquetas,
            datasets: datos.datasets
        },
        options: {
            indexAxis: datos.axis,
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                title: {
                    display: true,
                    text: datos.title,
                    font: { size: 18, weight: 'bold' },
                    color: '#000'
                },
                datalabels: {
                    anchor: 'end',
                    align: 'right',
                    formatter: Math.round,
                    font: { weight: 'bold' }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { stepSize: 1 },
                    title: {
                        display: true,
                        text: 'Iniciativas'
                    }
                },
                x: {
                    ticks: {
                        color: '#333',
                        font: { size: 12 }
                    },
                    grid: { display: false }
                }
            }
        }
    });
    
    return graficasBarras[datos.id];
}