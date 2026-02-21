# 우리 체중계 (Supabase 친구연결 + 실시간)

목표: 서로 친구처럼 연결해서, 각자 입력한 체중을 같이 보고 비교하기.

## 0) 먼저 한 번만 할 설정 (Supabase)
1. Supabase 프로젝트 열기
2. `Authentication > Providers > Email` 활성화
3. `Authentication > Sign In / Providers`에서 이메일+비밀번호 로그인 허용
4. `Authentication > Settings`에서 (원하면) 이메일 확인(Confirm email) 끄기
5. `SQL Editor`에서 `supabase_friend.sql` 파일 내용 전체 실행

## 1) 로컬 실행
```bash
cd /Users/corvern/Documents/project-u/woori-weight-pwa
npm install
cp .env.example .env.local
npm run dev
```
브라우저: `http://localhost:3000`

## 2) .env.local 값
```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
OPENAI_API_KEY=test
OPENAI_MODEL=gpt-5.2
```

- URL: Supabase `Project URL`
- KEY: Supabase `API Keys > Publishable(anon)`

## 3) 사용 순서 (2명)
1. 각자 앱 접속 후 회원가입/로그인
2. 한 명이 `내 초대코드 만들기`
3. 다른 한 명이 그 코드로 참여
4. 이후 서로 입력한 체중이 같은 그래프에 표시됨
5. 실시간 반영(새로고침 없이 업데이트)

## 4) 주의
- 이 버전은 친구 연결/비교 목적에 맞춰 구현됨
- RLS 적용되어 자기 household 데이터만 접근 가능
- 날짜 기준은 `Asia/Seoul`
