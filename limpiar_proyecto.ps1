Write-Host "Limpieza final - HERMANOS DEL NORTE" -ForegroundColor Cyan

$oldDb = "backend\src\db.ts"
$appCss = "frontend\src\App.css"

if (Test-Path $oldDb) {
    Remove-Item $oldDb
    Write-Host "Eliminado: $oldDb (archivo viejo no utilizado)" -ForegroundColor Green
} else {
    Write-Host "No existe: $oldDb" -ForegroundColor Yellow
}

if (Test-Path $appCss) {
    Remove-Item $appCss
    Write-Host "Eliminado: $appCss (archivo vacio no utilizado)" -ForegroundColor Green
} else {
    Write-Host "No existe: $appCss" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Limpieza terminada." -ForegroundColor Green
Write-Host "Ahora ejecuta:" -ForegroundColor Cyan
Write-Host "git status"
Write-Host "git add ."
Write-Host 'git commit -m "Limpieza final del proyecto"'
Write-Host "git push"
