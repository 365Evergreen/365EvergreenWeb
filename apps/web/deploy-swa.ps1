param(
    [string]$DeploymentToken = $env:SWA_CLI_DEPLOYMENT_TOKEN
)

$envFile = Join-Path $PSScriptRoot '.env'
if ((-not $DeploymentToken) -and (Test-Path $envFile)) {
    Write-Host "Loading environment variables from $envFile"
    Get-Content $envFile | ForEach-Object {
        if ($_ -and $_ -notmatch '^[\s#]' -and $_ -match '^[^=]+?=') {
            $parts = $_ -split '=', 2
            $key = $parts[0].Trim()
            $value = $parts[1].Trim()
            if ($value.StartsWith('"') -and $value.EndsWith('"')) { $value = $value.Trim('"') }
            if ($value.StartsWith("'") -and $value.EndsWith("'")) { $value = $value.Trim("'") }
            if ($key -and -not ${env:$key}) {
                ${env:$key} = $value
            }
        }
    }
    $DeploymentToken = $env:SWA_CLI_DEPLOYMENT_TOKEN
}

if (-not $DeploymentToken) {
    Write-Host "SWA_CLI_DEPLOYMENT_TOKEN is not set."
    $DeploymentToken = Read-Host "Enter your Static Web Apps deployment token"
    if (-not $DeploymentToken) {
        throw "Deployment token is required to deploy."
    }
}

Write-Host "Building web app..."
pnpm install
pnpm build

Write-Host "Deploying to Azure Static Web Apps..."
$swaArgs = @("deploy", "--config-name", "web", "--deployment-token", $DeploymentToken, "--api-location", "../api")

try {
    swa @swaArgs
} catch {
    Write-Error "Deployment failed: $_"
    exit 1
}
