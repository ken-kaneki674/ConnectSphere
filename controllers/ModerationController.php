<?php
class ModerationController {
    private $db;
    private $reportModel;
    
    public function __construct(PDO $db) {
        $this->db = $db;
        $this->reportModel = new Report($db);
    }
    
    public function handleRequest(): void {
        $this->initRoutes();
    }
    
    private function initRoutes(): void {
        if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['action'])) {
            $this->handleGetRequest();
        } elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $this->handlePostRequest();
        } else {
            $this->showDefaultView();
        }
    }
    
    private function handleGetRequest(): void {
        switch ($_GET['action']) {
            case 'report_form':
                $this->showReportForm();
                break;
            case 'admin_dashboard':
                $this->showAdminDashboard();
                break;
            default:
                $this->redirect('/');
        }
    }
    
    private function handlePostRequest(): void {
        if (isset($_POST['report_submit'])) {
            $this->processReport();
        } elseif (isset($_POST['block_user'])) {
            $this->processBlockUser();
        } else {
            $this->redirectBack();
        }
    }
    
    private function showDefaultView(): void {
        $this->render('moderation/default_view.php', [
            'baseUrl' => BASE_URL
        ]);
    }
    
    private function showReportForm(): void {
        $this->requireLogin();
        
        $targetType = $_GET['target_type'] ?? '';
        $targetId = (int)($_GET['target_id'] ?? 0);
        
        if (!in_array($targetType, ['user', 'post'])) {
            $this->redirectWithError('/', 'Type de cible invalide');
        }
        
        $this->render('moderation/report_form.php', [
            'targetType' => $targetType,
            'targetId' => $targetId,
            'baseUrl' => BASE_URL
        ]);
    }
    
    private function processReport(): void {
        $this->requireLogin();
        
        try {
            $success = $this->reportModel->createReport(
                (int)$_SESSION['user_id'],
                $_POST['target_type'],
                (int)$_POST['target_id'],
                $_POST['reason'],
                $_POST['details'] ?? null
            );
            
            if ($success) {
                $_SESSION['flash_success'] = 'Signalement envoyé avec succès';
            } else {
                throw new Exception('Erreur lors de l\'envoi du signalement');
            }
        } catch (Exception $e) {
            $_SESSION['flash_error'] = $e->getMessage();
        }
        
        $this->redirectBack();
    }
    
    private function processBlockUser(): void {
        $this->requireLogin();
        
        try {
            $success = $this->reportModel->blockUser(
                (int)$_SESSION['user_id'],
                (int)$_POST['blocked_id']
            );
            
            if ($success) {
                $_SESSION['flash_success'] = 'Utilisateur bloqué avec succès';
            } else {
                throw new Exception('Erreur lors du blocage');
            }
        } catch (Exception $e) {
            $_SESSION['flash_error'] = $e->getMessage();
        }
        
        $this->redirectBack();
    }
    
    private function showAdminDashboard(): void {
        $this->requireAdmin();
        
        $this->render('moderation/admin_dashboard.php', [
            'reports' => $this->reportModel->getReports(),
            'baseUrl' => BASE_URL
        ]);
    }
    
    // Helper methods
    private function render(string $view, array $data = []): void {
        extract($data);
        require __DIR__.'/../views/layout/header.php';
        require __DIR__.'/../views/'.$view;
        require __DIR__.'/../views/layout/footer.php';
        exit;
    }
    
    private function redirect(string $url): void {
        header("Location: $url");
        exit;
    }
    
    private function redirectBack(): void {
        $this->redirect($_SERVER['HTTP_REFERER'] ?? '/');
    }
    
    private function redirectWithError(string $url, string $message): void {
        $_SESSION['flash_error'] = $message;
        $this->redirect($url);
    }
    
    private function requireLogin(): void {
        if (!isset($_SESSION['user_id'])) {
            $this->redirect('/login.php');
        }
    }
    
    private function requireAdmin(): void {
        $this->requireLogin();
        if (!($_SESSION['is_admin'] ?? false)) {
            $this->redirect('/');
        }
    }
}