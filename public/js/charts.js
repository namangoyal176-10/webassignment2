/**
 * CampusNest - Admin Dashboard Charts
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Block Occupancy Chart
  const blockChartCanvas = document.getElementById('blockOccupancyChart');
  if (blockChartCanvas && window.Chart && window.chartData) {
    const { blockNames, blockCapacities, blockOccupied } = window.chartData;

    new Chart(blockChartCanvas, {
      type: 'bar',
      data: {
        labels: blockNames,
        datasets: [
          {
            label: 'Occupied Beds',
            data: blockOccupied,
            backgroundColor: '#4f46e5',
            borderRadius: 6,
          },
          {
            label: 'Total Capacity',
            data: blockCapacities,
            backgroundColor: '#e2e8f0',
            borderRadius: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              boxWidth: 12,
              font: { family: 'Inter', size: 12 },
            },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: '#f1f5f9' },
            ticks: { font: { family: 'Inter', size: 11 } },
          },
          x: {
            grid: { display: false },
            ticks: { font: { family: 'Inter', size: 11 } },
          },
        },
      },
    });
  }

  // 2. Room Status Distribution Doughnut
  const roomStatusCanvas = document.getElementById('roomStatusChart');
  if (roomStatusCanvas && window.Chart && window.chartData) {
    const { availableRooms, partialRooms, fullRooms, maintenanceRooms } = window.chartData;

    new Chart(roomStatusCanvas, {
      type: 'doughnut',
      data: {
        labels: ['Available', 'Partially Occupied', 'Full', 'Maintenance'],
        datasets: [
          {
            data: [availableRooms, partialRooms, fullRooms, maintenanceRooms],
            backgroundColor: ['#10b981', '#3b82f6', '#ef4444', '#94a3b8'],
            borderWidth: 2,
            borderColor: '#ffffff',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              boxWidth: 10,
              padding: 12,
              font: { family: 'Inter', size: 11 },
            },
          },
        },
      },
    });
  }
});
