# JM 수업 관리 관리자 앱 메모

## 작업 원칙
- 기존 복습실 파일은 수정하지 않는다.
- admin/ 폴더 안에서만 작업한다.
- 현재는 localStorage 기반 프로토타입이다.
- 실제 서버 저장은 아직 붙이지 않는다.
- 관리자 화면 공통 UI 원칙: 상단 요약 → 검색/필터/정렬 → 테이블형 목록 → 선택 상세 → 모달 등록/수정 구조를 기본으로 한다.

## localStorage 키
- jmAdminClasses.v1
- jmAdminStudents.v1
- jmAdminEnrollments.v1
- jmAdminSessions.v1
- jmAdminMaterials.v1

## 현재 완료 기능
- 수업 관리
- 학생 관리
- 학생-수업 배정
- 회차 관리
- 4.5차: 관리자 UI 정리 및 학생/수업/회차 삭제 기능 추가
- 5차: 자료/교재 관리 기본 구조 추가
  - 수업 상세의 자료/교재 관리 탭에서 자료 목록 확인, 등록, 수정, 숨김 처리 가능
  - 자료는 회차 연결 없이도 등록 가능
  - 현재는 localStorage 기반이며 실제 파일 업로드는 연결하지 않음
- 6차: 자료 파일 연결 구조 준비
  - 자료 상세에서 fileRefs, imageRefs 참조 목록 확인, 추가, 수정, 숨김 처리 가능
  - fileRefs는 PDF, 원본 파일, 기타 첨부 파일 참조용으로 사용
  - imageRefs는 페이지 이미지, 문항 이미지, 손풀이 이미지, 기타 이미지 참조용으로 사용
  - questionRefs는 실제 문항 관리 단계 전까지 개수와 안내만 표시
  - 새 localStorage 키 없이 `jmAdminMaterials.v1` 안의 각 material 객체 하위 배열에 저장

## 아직 만들지 않은 기능
- 문항 관리
- 자료 업로드
- PDF 업로드
- PDF 자동 문항 분할
- 이미지 개별 문항 등록
- 손풀이 업로드
- 학생 로그인
- 서버 저장
- 과제 관리
- 학습 기록
- 해설 요청 기능

## 향후 자료/문항 관리 방향
- 문항 관리는 회차 바로 아래에 붙이지 않고, 회차 → 자료/교재 → 문항 구조로 확장한다.
- PDF 문항은 먼저 자료/교재 보관함 또는 문제은행에 저장한 뒤, 필요한 문항만 선택해서 수업 자료실에 등록하는 구조를 고려한다.
- 예정 흐름: PDF 업로드 → 자동 문항 분할 → 문제은행/교재 보관함 저장 → 필요한 문항 선택 → 특정 수업/회차/용도 등록 → 학생은 등록된 문항만 확인.
- 자료/문항 등록은 PDF 일괄 업로드와 이미지 개별 등록을 모두 고려한다.
- PDF 자동 문항 분할, 자동 분할 결과 검수/수정, 기존 문항 이미지 교체/수정 흐름을 고려한다.
- PDF 자동 분할이 최종 목표이지만, 운영 유연성을 위해 이미지 개별 등록과 수정 기능은 유지한다.
- 향후 자료 용도: 수업 복습 자료, 숙제용 부교재, 모의평가/시험지, 추가 프린트.
- 향후 문항별 기능: 문제 이미지, 정답, 손풀이 이미지, 해설 영상 링크, 학생 해설 요청 상태.
- 예정 데이터: Materials, QuestionBank, LessonQuestions, QuestionDrafts, SolutionRequests.
- 수업 자료실 문항 용도: 수업 복습, 숙제, 테스트, 보충.
- sourceType: pdf_crop, image_upload, manual.
- Materials 기본 구조는 `jmAdminMaterials.v1`에 저장한다.
- Materials 기본 필드: materialId, classId, sessionId, materialTitle, materialType, usage, subject, grade, unit, tags, status, sourceType, fileRefs, imageRefs, questionRefs, questionCount, memo, createdAt, updatedAt.
- 자료 상태값은 사용중, 준비중, 보관, 숨김을 사용한다. 학생 공개 여부는 학생 로그인 기능 단계에서 별도 visibility 또는 studentVisible 필드로 검토한다.
- 이번 5차에서는 PDF 업로드, 이미지 업로드, 자동 문항 분할, 실제 문항 관리는 구현하지 않는다.
- 6차 fileRefs 기본 필드: fileRefId, fileName, fileKind, linkMode, status, memo, createdAt, updatedAt.
- 6차 imageRefs 기본 필드: imageRefId, imageName, imageKind, pageNumber, sortOrder, status, memo, createdAt, updatedAt.
- 파일/이미지 참조 상태값은 사용중, 준비중, 보관, 숨김을 사용한다. 숨김 참조는 기본 목록에서 제외하고, 필요하면 이후 숨김 보기 옵션을 추가한다.
- 이번 6차에서는 실제 PDF 업로드, 이미지 업로드, 파일 저장, 문항 연결 구현은 하지 않는다.

## 주의
- class.html, session.html, style.css, config.js, jm-admin-7979.html은 건드리지 않는다.
- 새 기능은 먼저 admin/ 안에서 프로토타입으로 검증한다.
- 구현 후에는 기존 수업/학생/배정 기능이 깨지지 않았는지 확인한다.
