document.addEventListener('DOMContentLoaded', function() {
    // Gestion des modales de signalement
    const reportButtons = document.querySelectorAll('.report-btn');
    
    reportButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const targetType = this.dataset.targetType;
            const targetId = this.dataset.targetId;
            
            // Mettre à jour le formulaire modal avec les bonnes valeurs
            const modal = document.getElementById('reportModal');
            if (modal) {
                const form = modal.querySelector('form');
                form.querySelector('input[name="target_type"]').value = targetType;
                form.querySelector('input[name="target_id"]').value = targetId;
                
                // Afficher la modale avec Bootstrap
                const bsModal = new bootstrap.Modal(modal);
                bsModal.show();
            }
        });
    });
    
    // Gestion du blocage d'utilisateur
    const blockButtons = document.querySelectorAll('.block-user-btn');
    
    blockButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const userId = this.dataset.userId;
            const userName = this.dataset.userName || 'cet utilisateur';
            
            if (confirm(`Voulez-vous vraiment bloquer ${userName} ? Vous ne pourrez plus voir ses publications ni interagir avec lui.`)) {
                fetch('/moderation/block', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest'
                    },
                    body: JSON.stringify({ 
                        user_id: userId,
                        csrf_token: document.querySelector('meta[name="csrf-token"]').content
                    })
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        showAlert('success', data.message || 'Utilisateur bloqué avec succès');
                        // Optionnel: masquer/mettre à jour le contenu de l'utilisateur bloqué
                        setTimeout(() => window.location.reload(), 1500);
                    } else {
                        showAlert('danger', data.message || 'Erreur lors du blocage');
                    }
                })
                .catch(error => {
                    showAlert('danger', 'Une erreur est survenue');
                    console.error(error);
                });
            }
        });
    });
    
    function showAlert(type, message) {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
        alertDiv.role = 'alert';
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
        
        const container = document.querySelector('.container') || document.body;
        container.prepend(alertDiv);
        
        setTimeout(() => {
            const bsAlert = new bootstrap.Alert(alertDiv);
            bsAlert.close();
        }, 5000);
    }
});