# Copy Student Fun Zone images from the WP_1 folder into this Angular project's assets folder.
# Run this script from the project root: `.	ools\copy-studentfunzone-images.ps1` or from the `wp-angular` folder.

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectDir = Resolve-Path (Join-Path $scriptDir '..')
$workspaceRoot = Resolve-Path (Join-Path $projectDir '..')
$src = Join-Path $workspaceRoot 'WP_1_Edna_Ustavdic\slike'
$dst = Join-Path $projectDir 'src\assets\student-fun-zone\slike'

Write-Host "Source: $src"
Write-Host "Destination: $dst"

if(-not (Test-Path $src)){
    Write-Error "Source folder not found: $src. Make sure WP_1_Edna_Ustavdic/slike exists relative to the workspace root."
    exit 1
}

New-Item -ItemType Directory -Force -Path $dst | Out-Null

try{
    Copy-Item -Path (Join-Path $src '*') -Destination $dst -Recurse -Force
    Write-Host "Copied images to $dst"
} catch {
    Write-Error "Failed to copy images: $_"
    exit 2
}

Write-Host "Done. Start the dev server and visit /dashboard/student-fun-zone to verify images load."