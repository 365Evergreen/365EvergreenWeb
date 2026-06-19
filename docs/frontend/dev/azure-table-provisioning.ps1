param(
    [string]$AccountName = 'rgsharepointportal91c7',
    [string]$ResourceGroup = 'rg-sharepointportal',
    [string]$TableName = 'BlogPosts',
    [string]$SubscriptionId = '',
    [ValidateSet('login', 'key')]
    [string]$AuthMode = 'login',
    [string]$AssignPrincipalId = '',
    [switch]$InsertSampleEntity,
    [string]$SamplePartitionKey = (Get-Date -Format 'yyyy'),
    [string]$SampleRowKey = 'my-post-slug',
    [switch]$CreateSas,
    [ValidateRange(1, 365)]
    [int]$SasDays = 30
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Invoke-AzCli {
    param(
        [Parameter(Mandatory = $true)]
        [string[]]$Arguments
    )

    $output = & az @Arguments 2>&1
    if ($LASTEXITCODE -ne 0) {
        $joined = $Arguments -join ' '
        $message = ($output | Out-String).Trim()
        throw "Azure CLI command failed: az $joined`n$message"
    }

    return ($output | Out-String).Trim()
}

function Ensure-AzCli {
    if (-not (Get-Command az -ErrorAction SilentlyContinue)) {
        throw 'Azure CLI (az) is required. Install it from https://aka.ms/azcli.'
    }

    & az account show --only-show-errors *> $null
    if ($LASTEXITCODE -ne 0) {
        throw 'Run `az login` before executing this script.'
    }
}

function Ensure-StoragePreviewExtension {
    & az extension show --name storage-preview --only-show-errors *> $null
    if ($LASTEXITCODE -eq 0) {
        return
    }

    Write-Host "Installing Azure CLI storage-preview extension..."
    Invoke-AzCli -Arguments @('extension', 'add', '--name', 'storage-preview', '--only-show-errors') | Out-Null
}

function Validate-TableName {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Name
    )

    if ($Name -notmatch '^[A-Za-z][A-Za-z0-9]{2,62}$') {
        throw "TableName '$Name' is invalid. Azure Table names must be 3-63 characters, start with a letter, and contain only letters and numbers."
    }
}

function Get-StorageCommandAuthArguments {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Mode,
        [Parameter(Mandatory = $true)]
        [string]$Name,
        [string]$KeyValue = ''
    )

    if ($Mode -eq 'login') {
        return @('--auth-mode', 'login', '--account-name', $Name)
    }

    if (-not $KeyValue) {
        throw 'Storage account key is required when AuthMode is key.'
    }

    return @('--account-name', $Name, '--account-key', $KeyValue)
}

Ensure-AzCli
Ensure-StoragePreviewExtension
Validate-TableName -Name $TableName

if ($SubscriptionId) {
    Write-Host "Selecting subscription: $SubscriptionId"
    Invoke-AzCli -Arguments @('account', 'set', '--subscription', $SubscriptionId, '--only-show-errors') | Out-Null
}

Write-Host "Using storage account: $AccountName"
Write-Host "Resource group: $ResourceGroup"
Write-Host "Target table: $TableName"
Write-Host "Auth mode: $AuthMode"

$accountId = Invoke-AzCli -Arguments @(
    'storage', 'account', 'show',
    '--name', $AccountName,
    '--resource-group', $ResourceGroup,
    '--query', 'id',
    '--output', 'tsv',
    '--only-show-errors'
)

if (-not $accountId) {
    throw "Storage account '$AccountName' was not found in resource group '$ResourceGroup'."
}

$key = ''
if ($AuthMode -eq 'key' -or $CreateSas) {
    $key = Invoke-AzCli -Arguments @(
        'storage', 'account', 'keys', 'list',
        '--account-name', $AccountName,
        '--resource-group', $ResourceGroup,
        '--query', '[0].value',
        '--output', 'tsv',
        '--only-show-errors'
    )

    if (-not $key) {
        throw "Failed to retrieve a key for storage account '$AccountName'."
    }
}

$env:AZURE_STORAGE_ACCOUNT = $AccountName
if ($AuthMode -eq 'login') {
    $env:AZURE_STORAGE_AUTH_MODE = 'login'
    Remove-Item Env:AZURE_STORAGE_KEY -ErrorAction SilentlyContinue
}
else {
    $env:AZURE_STORAGE_KEY = $key
}

$storageAuthArgs = Get-StorageCommandAuthArguments -Mode $AuthMode -Name $AccountName -KeyValue $key

Write-Host "Creating or confirming table '$TableName'..."
Invoke-AzCli -Arguments (@('storage', 'table', 'create', '--name', $TableName) + $storageAuthArgs + @('--only-show-errors')) | Out-Null

$tableNames = Invoke-AzCli -Arguments (@('storage', 'table', 'list') + $storageAuthArgs + @('--query', '[].name', '--output', 'tsv', '--only-show-errors'))

Write-Host "`nAvailable tables:"
if ($tableNames) {
    $tableNames
}
else {
    Write-Host '(none returned)'
}

if ($InsertSampleEntity) {
    $timestamp = (Get-Date).ToUniversalTime().ToString('o')
    $currentMonth = (Get-Date).ToUniversalTime().ToString('MM')
    $blobPath = "posts/$SamplePartitionKey/$currentMonth/$SampleRowKey.json"

    Write-Host "`nUpserting sample entity into '$TableName'..."
    Invoke-AzCli -Arguments (
        @('storage', 'entity', 'insert', '--table-name', $TableName, '--if-exists', 'replace') +
        $storageAuthArgs +
        @(
            '--entity',
            "PartitionKey=$SamplePartitionKey",
            "RowKey=$SampleRowKey",
            'title=My Post Title',
            "slug=$SampleRowKey",
            "date=$timestamp",
            'excerpt=Sample metadata row created by azure-table-provisioning.ps1',
            'tags=azure,swa',
            'categories=architecture',
            'featuredImage=media/sample.jpg',
            "blobPath=$blobPath",
            'status=published',
            '--only-show-errors'
        )
    ) | Out-Null

    $entity = Invoke-AzCli -Arguments (
        @('storage', 'entity', 'query', '--table-name', $TableName, '--filter', "PartitionKey eq '$SamplePartitionKey' and RowKey eq '$SampleRowKey'") +
        $storageAuthArgs +
        @('--output', 'json', '--only-show-errors')
    )

    Write-Host "Sample entity:"
    Write-Host $entity
}

if ($AssignPrincipalId) {
    $existingAssignmentCount = Invoke-AzCli -Arguments @(
        'role', 'assignment', 'list',
        '--assignee', $AssignPrincipalId,
        '--scope', $accountId,
        '--query', "[?roleDefinitionName=='Storage Table Data Contributor'] | length(@)",
        '--output', 'tsv',
        '--only-show-errors'
    )

    if ($existingAssignmentCount -eq '0') {
        Write-Host "`nAssigning 'Storage Table Data Contributor' to principal $AssignPrincipalId..."
        Invoke-AzCli -Arguments @(
            'role', 'assignment', 'create',
            '--assignee', $AssignPrincipalId,
            '--role', 'Storage Table Data Contributor',
            '--scope', $accountId,
            '--only-show-errors'
        ) | Out-Null
    }
    else {
        Write-Host "`nPrincipal $AssignPrincipalId already has 'Storage Table Data Contributor' on $AccountName."
    }
}

if ($CreateSas) {
    $expiry = (Get-Date).ToUniversalTime().AddDays($SasDays).ToString('yyyy-MM-ddTHH:mmZ')
    Write-Host "`nGenerating account SAS token for the Table service (expires $expiry)..."
    $sas = Invoke-AzCli -Arguments @(
        'storage', 'account', 'generate-sas',
        '--account-name', $AccountName,
        '--services', 't',
        '--resource-types', 'sco',
        '--permissions', 'rwdlacu',
        '--expiry', $expiry,
        '--https-only', 'true',
        '--account-key', $key,
        '--output', 'tsv',
        '--only-show-errors'
    )

    if ($sas) {
        $previewLength = [Math]::Min(80, $sas.Length)
        Write-Host "SAS token (truncated): $($sas.Substring(0, $previewLength))..."
        Write-Host "Table endpoint: https://$AccountName.table.core.windows.net/$TableName`?$sas"
    }
}

Write-Host "`nProvisioning complete."
