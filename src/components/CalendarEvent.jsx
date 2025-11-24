// // src/components/CalendarEvent.jsx
// export default function CalendarEvent({ event, resolveMemberName }) {
//   // 코드 표준화
//   const code =
//     (event?.codeBid || event?.codeBId || event?.code || "").toString().toUpperCase();
//   const isPT = code === "SCHEDULE-PT" || code === "PT";

//   // 공통 후보값
//   const baseTitle = (event?.title ?? "").toString().trim(); // 기존에 조합된 타이틀 유지용
//   const emp =
//     (event?.empName ||
//       event?.employeeName ||
//       event?.emp ||
//       "").toString().trim();

//   // 고객명 후보: 이벤트 → resolver → 공란
//   const customer =
//     (event?.memberName ||
//       event?.memName ||
//       (resolveMemberName ? resolveMemberName(event) : "") ||
//       "").toString().trim();

//   const memo = (event?.memo ?? "").toString().trim();

//   let headText = "";

//   if (isPT) {
//     // PT는 고객명을 최우선, 없으면 title(혹시 기존 조합이 들어온 경우)
//     headText = customer || baseTitle || "";
//   } else {
//     // 비-PT는 title(예: [Vacation] ...)을 최우선 그대로 사용
//     headText = baseTitle || emp || "";
//   }

//   // head 또는 memo가 비어있으면 하이픈 자동 제거
//   const text =
//     headText && memo ? `${headText} - ${memo}` : headText || memo || "일정";

//   return <span title={text}>{text}</span>;
// }
