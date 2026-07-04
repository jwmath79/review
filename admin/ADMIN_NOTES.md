# JM 수업 관리 관리자 앱 메모

## 작업 원칙
- 기존 복습실 파일은 수정하지 않는다.
- admin/ 폴더 안에서만 작업한다.
- 현재는 localStorage 기반 프로토타입이다.
- 실제 서버 저장은 아직 붙이지 않는다.

## localStorage 키
- jmAdminClasses.v1
- jmAdminStudents.v1
- jmAdminEnrollments.v1
- jmAdminSessions.v1

## 현재 완료 기능
- 수업 관리
- 학생 관리
- 학생-수업 배정
- 회차 관리

## 아직 만들지 않은 기능
- 문항 관리
- 자료 업로드
- 학생 로그인
- 서버 저장
- 과제 관리
- 학습 기록

## 주의
- class.html, session.html, style.css, config.js, jm-admin-7979.html은 건드리지 않는다.
- 새 기능은 먼저 admin/ 안에서 프로토타입으로 검증한다.
- 구현 후에는 기존 수업/학생/배정 기능이 깨지지 않았는지 확인한다.
