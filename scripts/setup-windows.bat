@echo off
chcp 65001 >nul 2>&1
setlocal

rem bookforge Windows 설치 — 저장소를 확인하고 에이전트 스킬 폴더에 정션을 건다.
rem 사용: 이 파일을 더블클릭하거나 cmd 에서 실행. 관리자 권한 불필요.

set "SRC=%USERPROFILE%\Documents\bookforge"
set "REPO=https://github.com/growdaily860-cell/bookforge.git"

echo.
echo ========================================
echo  bookforge Windows setup
echo ========================================
echo.
echo [1/3] 저장소 확인 : %SRC%

if exist "%SRC%\SKILL.md" (
    echo       OK - 이미 있습니다.
) else (
    echo       없습니다. 새로 받습니다...
    if not exist "%USERPROFILE%\Documents" mkdir "%USERPROFILE%\Documents"
    pushd "%USERPROFILE%\Documents"
    git clone "%REPO%"
    popd
)

if not exist "%SRC%\SKILL.md" (
    echo.
    echo       실패 - 저장소를 준비하지 못했습니다.
    echo       git 이 설치돼 있는지 확인하세요 ^(git --version^).
    goto :end
)

echo.
echo [2/3] 스킬 폴더 연결
call :link "%USERPROFILE%\.claude\skills" "Claude Code"
call :link "%USERPROFILE%\.codex\skills"  "Codex"
call :link "%USERPROFILE%\.agents\skills" "기타 에이전트"

echo.
echo [3/3] 확인
call :verify "%USERPROFILE%\.claude\skills\bookforge"
call :verify "%USERPROFILE%\.codex\skills\bookforge"
call :verify "%USERPROFILE%\.agents\skills\bookforge"

echo.
echo 끝났습니다. 앞으로는 %SRC% 에서 git pull 한 번이면
echo 연결된 모든 에이전트가 동시에 최신이 됩니다.

:end
echo.
pause
exit /b

rem ---------------------------------------------------------------
:link
set "BASE=%~1"
set "NAME=%~2"
set "DEST=%~1\bookforge"

if not exist "%BASE%" mkdir "%BASE%"

if exist "%DEST%" (
    rem /S 없이 지운다 - 정션이나 빈 폴더만 지워지고,
    rem 내용이 있는 진짜 폴더면 실패한다 (실수로 파일을 지우지 않기 위해서다)
    rmdir "%DEST%" >nul 2>&1
    if exist "%DEST%" (
        echo       [건너뜀] %NAME% - 비어있지 않은 실제 폴더가 있습니다.
        echo                %DEST%
        echo                내용을 확인한 뒤 직접 지우고 이 스크립트를 다시 실행하세요.
        exit /b
    )
)

mklink /J "%DEST%" "%SRC%" >nul 2>&1
if errorlevel 1 (
    echo       [실패] %NAME%
) else (
    echo       [연결] %NAME%
)
exit /b

rem ---------------------------------------------------------------
:verify
if exist "%~1\SKILL.md" (
    echo       OK  %~1
) else (
    echo       --  %~1  ^(연결 안 됨^)
)
exit /b
