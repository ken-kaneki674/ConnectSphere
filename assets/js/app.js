/**
 * ConnectSphere - Main Application Scripts
 */
document.addEventListener('DOMContentLoaded', () => {
    // Auto-dismiss alerts after 4 seconds
    const alerts = document.querySelectorAll('.alert');
    alerts.forEach(alert => {
        setTimeout(() => {
            alert.style.transition = 'opacity 0.5s ease';
            alert.style.opacity = '0';
            setTimeout(() => alert.remove(), 500);
        }, 4000);
    });

    // Image preview for post file input
    const imageInput = document.querySelector('input[type="file"][name="post_image"]');
    const previewContainer = document.querySelector('#imagePreviewContainer');
    if (imageInput && previewContainer) {
        imageInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(evt) {
                    previewContainer.innerHTML = `<img src="${evt.target.result}" class="img-fluid rounded mt-2" style="max-height: 250px;">`;
                };
                reader.readAsDataURL(file);
            }
        });
    }

    console.log('ConnectSphere app initialized.');
});
