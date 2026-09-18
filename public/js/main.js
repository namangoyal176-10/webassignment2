/**
 * CampusNest - Client-side Interactive Scripts
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Mobile Sidebar Toggle
  const toggleBtn = document.getElementById('sidebarToggleBtn');
  const sidebar = document.getElementById('appSidebar');
  const overlay = document.getElementById('sidebarOverlay');

  if (toggleBtn && sidebar && overlay) {
    toggleBtn.addEventListener('click', () => {
      sidebar.classList.toggle('show');
      overlay.classList.toggle('show');
    });

    overlay.addEventListener('click', () => {
      sidebar.classList.remove('show');
      overlay.classList.remove('show');
    });
  }

  // 2. Alert Dismissal
  const alerts = document.querySelectorAll('.alert');
  alerts.forEach((alert) => {
    const closeBtn = alert.querySelector('.alert-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        alert.style.opacity = '0';
        setTimeout(() => alert.remove(), 250);
      });
    }

    // Auto-dismiss after 6 seconds
    setTimeout(() => {
      if (alert && alert.parentElement) {
        alert.style.opacity = '0';
        setTimeout(() => alert.remove(), 250);
      }
    }, 6000);
  });

  // 3. Modal Handlers
  const modalTriggers = document.querySelectorAll('[data-modal-target]');
  modalTriggers.forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetSelector = btn.getAttribute('data-modal-target');
      const modal = document.querySelector(targetSelector);
      if (modal) {
        modal.classList.add('show');
      }
    });
  });

  const modalCloses = document.querySelectorAll('[data-modal-close]');
  modalCloses.forEach((btn) => {
    btn.addEventListener('click', () => {
      const modal = btn.closest('.modal-backdrop');
      if (modal) {
        modal.classList.remove('show');
      }
    });
  });

  // Close modal when clicking backdrop outside dialog
  const modals = document.querySelectorAll('.modal-backdrop');
  modals.forEach((modal) => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('show');
      }
    });
  });

  // 4. Quick Demo Login Autofill (Helper for Evaluation)
  window.fillAdminDemo = function () {
    const email = document.getElementById('loginEmail');
    const pass = document.getElementById('loginPassword');
    if (email && pass) {
      email.value = 'admin@hostel.com';
      pass.value = 'Admin@1234';
    }
  };

  window.fillStudentDemo = function () {
    const email = document.getElementById('loginEmail');
    const pass = document.getElementById('loginPassword');
    if (email && pass) {
      email.value = 'aarav.sharma@hostel.edu';
      pass.value = 'student123';
    }
  };
});
