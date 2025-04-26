<?php
require_once __DIR__ . '/../../includes/db.php';
session_start();

if (!isset($_SESSION['user'])) {
    header("Location: ../../public/index.php?page=login");
    exit();
}
$user = $_SESSION['user'];
?>

<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>ConnectSphere – Messagerie</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">
    <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
    <style>
        .chat-container {
            display: flex;
            gap: 1rem;
        }
        .contacts {
            width: 25%;
            border-right: 1px solid #ddd;
        }
        .chat-box {
            flex-grow: 1;
            height: 500px;
            overflow-y: auto;
            padding: 1rem;
            background-color: #f8f9fa;
            border-radius: 10px;
        }
        .message.you {
            text-align: right;
        }
    </style>
</head>
<body>
<div class="container mt-5">
    <h3 class="mb-4 text-center">📩 Messagerie ConnectSphere</h3>

    <div class="chat-container">
        <!-- Contacts -->
        <div class="contacts">
            <h5>🧑‍🤝‍🧑 Contacts</h5>
            <div id="contacts"></div>
        </div>

        <!-- Chat -->
        <div class="flex-grow-1">
            <div id="chat-box" class="chat-box mb-3">Sélectionnez un contact pour démarrer une conversation.</div>
            <form id="sendMessageForm" class="d-none">
                <input type="hidden" name="receiver_id" id="receiver_id">
                <div class="input-group">
                    <input type="text" name="content" class="form-control" placeholder="Message..." required>
                    <button type="submit" class="btn btn-primary">Envoyer</button>
                </div>
            </form>
        </div>
    </div>
</div>

<script>
let currentReceiver = null;

// Affiche la liste des contacts
function loadContacts() {
    $.get("fetch_contacts.php", function(data) {
        $("#contacts").html(data);
    });
}

// Charge les messages
function loadMessages() {
    if (!currentReceiver) return;
    $.get("fetch_messages.php?receiver_id=" + currentReceiver, function(data) {
        $("#chat-box").html(data);
        $('#chat-box').scrollTop($('#chat-box')[0].scrollHeight);
    });
}

// Lorsqu'on clique sur un contact
$(document).on("click", ".contact-item", function() {
    currentReceiver = $(this).data("id");
    $("#receiver_id").val(currentReceiver);
    $("#sendMessageForm").removeClass("d-none");
    loadMessages();
});

// Envoi de message
$("#sendMessageForm").on("submit", function(e) {
    e.preventDefault();
    $.post("send_message.php", $(this).serialize(), function() {
        $("input[name='content']").val('');
        loadMessages();
    });
});

// Rafraîchissement automatique
setInterval(loadMessages, 1500);
setInterval(loadContacts, 10000); // recharge contacts toutes les 10s

// Chargement initial
loadContacts();
</script>
</body>
</html>
