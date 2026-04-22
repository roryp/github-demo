#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Restore the github-app-demo repo to a known-good demo state.

.DESCRIPTION
    Resets main to a named git tag (default: demo-working-04_22), reopens the
    five demo issues if they were closed, and re-stages the OpenAPI
    "ready to merge" PR (default #8) if it was merged or closed.

    Requires: git, gh (authenticated against roryp/github-app-demo).

.PARAMETER Tag
    The restore-point tag to reset main to. Default: demo-working-04_22.

.PARAMETER Repo
    The GitHub repo in owner/name form. Default: roryp/github-app-demo.

.PARAMETER OpenApiBranch
    Branch used for the parked OpenAPI PR. Default: copilot/generate-openapi-spec.

.PARAMETER OpenApiPr
    PR number for the parked OpenAPI PR. Default: 8.

.PARAMETER DryRun
    Print what would happen without making changes.

.EXAMPLE
    ./scripts/restore-demo.ps1

.EXAMPLE
    ./scripts/restore-demo.ps1 -Tag demo-working-04_22 -DryRun
#>

[CmdletBinding()]
param(
    [string]$Tag = 'demo-working-04_22',
    [string]$Repo = 'roryp/github-app-demo',
    [string]$OpenApiBranch = 'copilot/generate-openapi-spec',
    [int]$OpenApiPr = 8,
    [int[]]$Issues = @(1, 2, 3, 4, 5),
    [switch]$DryRun
)

$ErrorActionPreference = 'Stop'
$env:GH_PAGER = ''

function Invoke-Step {
    param([string]$Description, [scriptblock]$Action)
    Write-Host "==> $Description" -ForegroundColor Cyan
    if ($DryRun) {
        Write-Host "    (dry run - skipped)" -ForegroundColor DarkGray
        return
    }
    & $Action
}

function Require-Command($name) {
    if (-not (Get-Command $name -ErrorAction SilentlyContinue)) {
        throw "Required command '$name' not found on PATH."
    }
}

Require-Command git
Require-Command gh

Write-Host ""
Write-Host "Restoring $Repo to tag '$Tag'" -ForegroundColor Green
if ($DryRun) { Write-Host "(dry run mode - no changes will be made)" -ForegroundColor Yellow }
Write-Host ""

# 1. Fetch tags
Invoke-Step "Fetching tags and refs from origin" {
    git fetch --tags --prune origin | Out-Null
}

# 2. Verify tag exists
$tagSha = (git rev-parse --verify "refs/tags/$Tag" 2>$null)
if (-not $tagSha) {
    throw "Tag '$Tag' not found. Create it first with 'git tag -a $Tag -m ...' and push it."
}
Write-Host "    tag $Tag -> $tagSha" -ForegroundColor DarkGray

# 3. Reset main to the tag
Invoke-Step "Resetting local main to $Tag" {
    git checkout main 2>&1 | Out-Null
    git reset --hard $Tag | Out-Null
}

Invoke-Step "Force-pushing main to origin" {
    git push --force-with-lease origin main | Out-Null
}

# 4. Reopen any closed demo issues
foreach ($num in $Issues) {
    $state = gh issue view $num --repo $Repo --json state --jq '.state' 2>$null
    if (-not $state) {
        Write-Host "    issue #$num not found, skipping" -ForegroundColor DarkYellow
        continue
    }
    if ($state -eq 'CLOSED') {
        Invoke-Step "Reopening issue #$num" {
            gh issue reopen $num --repo $Repo | Out-Null
        }
    } else {
        Write-Host "    issue #$num already open" -ForegroundColor DarkGray
    }
}

# 5. Re-stage the parked OpenAPI PR
$prJson = gh pr view $OpenApiPr --repo $Repo --json state,headRefName 2>$null | ConvertFrom-Json
if ($prJson -and $prJson.state -eq 'OPEN') {
    Write-Host "==> PR #$OpenApiPr already open, nothing to do" -ForegroundColor Cyan
} else {
    if ($prJson -and $prJson.state -eq 'CLOSED') {
        Invoke-Step "Reopening PR #$OpenApiPr" {
            gh pr reopen $OpenApiPr --repo $Repo | Out-Null
        }
    } else {
        # Either merged or unknown - recreate from the branch.
        Invoke-Step "Recreating OpenAPI PR from '$OpenApiBranch'" {
            $hasRemote = git ls-remote --exit-code origin "refs/heads/$OpenApiBranch" 2>$null
            if (-not $hasRemote) {
                $hasLocal = git rev-parse --verify "refs/heads/$OpenApiBranch" 2>$null
                if ($hasLocal) {
                    git push origin "$OpenApiBranch" | Out-Null
                } else {
                    throw "Branch '$OpenApiBranch' not found locally or on origin. Recreate PR #$OpenApiPr manually or run a fresh Autopilot session on issue #4."
                }
            }
            gh pr create `
                --repo $Repo `
                --base main `
                --head $OpenApiBranch `
                --title 'Generate OpenAPI spec from route definitions' `
                --body 'Closes #4. Re-staged demo PR for the issue #4 tile.' | Out-Null
        }
    }
}

Write-Host ""
Write-Host "Restore complete." -ForegroundColor Green
Write-Host "Verify with:" -ForegroundColor DarkGray
Write-Host "    gh pr view $OpenApiPr --repo $Repo" -ForegroundColor DarkGray
Write-Host "    gh issue list --repo $Repo --state open" -ForegroundColor DarkGray
