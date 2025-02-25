let chartInstance = null;

document.getElementById('loan-form').addEventListener('submit', function(e) {
  e.preventDefault();

  const loanAmount = parseFloat(document.getElementById('loan-amount').value);
  const loanTerm = parseInt(document.getElementById('loan-term').value);
  const interestRate = parseFloat(document.getElementById('interest-rate').value);
  const interestPeriod = document.querySelector('input[name="interest-period"]:checked').value;

  const monthlyRate = interestPeriod === 'annual' ? interestRate / 12 / 100 : interestRate / 100;
  const numberOfPayments = loanTerm;
  const monthlyPayment = (loanAmount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -numberOfPayments));
  const totalPayment = monthlyPayment * numberOfPayments;
  const totalInterest = totalPayment - loanAmount;

  document.getElementById('monthly-payment').innerText = `₺${formatNumber(monthlyPayment.toFixed(2))}`;
  document.getElementById('total-repayment').innerText = `₺${formatNumber(totalPayment.toFixed(2))}`;
  document.getElementById('total-interest').innerText = `₺${formatNumber(totalInterest.toFixed(2))}`;

  generateAmortizationTable(loanAmount, monthlyRate, numberOfPayments, monthlyPayment);
  plotChart(loanAmount, monthlyRate, numberOfPayments, monthlyPayment);
});

function generateAmortizationTable(principal, monthlyRate, numberOfPayments, monthlyPayment) {
  const tableBody = document.getElementById('amortization-table-body');
  tableBody.innerHTML = '';

  let remainingBalance = principal;
  for (let i = 1; i <= numberOfPayments; i++) {
    const interestPayment = remainingBalance * monthlyRate;
    const principalPayment = monthlyPayment - interestPayment;
    remainingBalance -= principalPayment;

    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${i}</td>
      <td>₺${formatNumber(monthlyPayment.toFixed(2))}</td>
      <td>₺${formatNumber(principalPayment.toFixed(2))}</td>
      <td>₺${formatNumber(interestPayment.toFixed(2))}</td>
      <td>₺${formatNumber(remainingBalance.toFixed(2))}</td>
    `;
    tableBody.appendChild(row);
  }
}

function plotChart(principal, monthlyRate, numberOfPayments, monthlyPayment) {
  const labels = [];
  const principalData = [];
  const interestData = [];

  let remainingBalance = principal;
  for (let i = 1; i <= numberOfPayments; i++) {
    const interestPayment = remainingBalance * monthlyRate;
    const principalPayment = monthlyPayment - interestPayment;
    remainingBalance -= principalPayment;

    labels.push(`Ay ${i}`);
    principalData.push(principalPayment.toFixed(2));
    interestData.push(interestPayment.toFixed(2));
  }

  const ctx = document.getElementById('payment-chart').getContext('2d');

  // Destroy existing chart instance if it exists
  if (chartInstance) {
    chartInstance.destroy();
  }

  chartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Anapara Ödemesi',
          data: principalData,
          borderColor: 'rgba(75, 192, 192, 1)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          fill: false,
        },
        {
          label: 'Faiz Ödemesi',
          data: interestData,
          borderColor: 'rgba(255, 99, 132, 1)',
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          fill: false,
        },
      ],
    },
    options: {
      responsive: true,
      scales: {
        x: {
          display: true,
          title: {
            display: true,
            text: 'Ay',
          },
        },
        y: {
          display: true,
          title: {
            display: true,
            text: 'Tutar (₺)',
          },
        },
      },
    },
  });
}

function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}