<?php require_once '../templates/header.php'; ?>

<div class="container mt-5">
    <div class="row justify-content-center">
        <div class="col-md-8">
            <div class="card">
                <div class="card-header">Créer un nouveau groupe</div>
                <div class="card-body">
                    <form id="createGroupForm" enctype="multipart/form-data">
                        <div class="form-group">
                            <label for="name">Nom du groupe</label>
                            <input type="text" class="form-control" id="name" name="name" required>
                        </div>
                        <div class="form-group">
                            <label for="description">Description</label>
                            <textarea class="form-control" id="description" name="description" rows="3" required></textarea>
                        </div>
                        <div class="form-group">
                            <label for="type">Type de groupe</label>
                            <select class="form-control" id="type" name="type" required>
                                <option value="publication">Groupe de publication</option>
                                <option value="discussion">Groupe de discussion</option>
                            </select>
                        </div>
                        <div class="form-group form-check">
                            <input type="checkbox" class="form-check-input" id="is_private" name="is_private">
                            <label class="form-check-label" for="is_private">Groupe privé</label>
                        </div>
                        <div class="form-group">
                            <label for="cover_image">Image de couverture (optionnelle)</label>
                            <input type="file" class="form-control-file" id="cover_image" name="cover_image">
                        </div>
                        <button type="submit" class="btn btn-primary">Créer le groupe</button>
                    </form>
                </div>
            </div>
        </div>
    </div>
</div>

<script>
$(document).ready(function() {
    $('#createGroupForm').submit(function(e) {
        e.preventDefault();
        
        var formData = new FormData(this);
        
        $.ajax({
            url: '../api/groups/create.php',
            type: 'POST',
            data: formData,
            contentType: false,
            processData: false,
            success: function(response) {
                if (response.success) {
                    window.location.href = 'view.php?id=' + response.group_id;
                } else {
                    alert(response.message);
                }
            },
            error: function() {
                alert('Une erreur est survenue');
            }
        });
    });
});
</script>

<?php require_once '../templates/footer.php'; ?>