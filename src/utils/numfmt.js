// src/utils/numfmt.js
export const fmtInt = (n) => Number(n ?? 0).toLocaleString();
export const fmtKRW = (n) =>
  new Intl.NumberFormat("ko-KR", { style: "currency", currency: "KRW", maximumFractionDigits: 0 }).format(Number(n ?? 0));
