#!/usr/bin/env python3
"""npm 실행 경로 해석 — Windows 호환 계층.

Windows 에서 npm 은 실행 파일이 아니라 `npm.cmd` 배치 스크립트다. 그래서
subprocess.run(["npm", ...]) 은 셸 없이 "npm" 이라는 실행 파일을 찾다가
FileNotFoundError 로 죽는다. shutil.which 는 PATHEXT 를 고려해 실제 파일
(`npm.cmd`)의 전체 경로를 돌려주므로, 그 경로를 그대로 넘기면 세 OS 에서
동일하게 동작한다.
"""
import shutil
import subprocess


def npm_root_global() -> str:
    """`npm root -g` 의 결과 경로.

    전역 playwright 를 해석하기 위한 NODE_PATH 값이다 — 빌드는 프로젝트 로컬
    설치가 아니라 전역 설치를 쓴다(SKILL.md 실행 전 점검 참조).
    """
    npm = shutil.which("npm")
    if not npm:
        raise SystemExit(
            "npm 을 찾을 수 없습니다. Node.js 설치 후 PATH 에 npm 이 잡히는지 확인하세요.\n"
            "  (HTML 트랙 insight·magazine 과 도해 프리렌더는 전역 playwright 를 "
            "`npm root -g` 로 해석합니다)"
        )
    r = subprocess.run([npm, "root", "-g"], capture_output=True, text=True)
    root = r.stdout.strip()
    if r.returncode != 0 or not root:
        raise SystemExit("npm root -g 실패:\n" + (r.stderr or r.stdout or "(빈 출력)"))
    return root
