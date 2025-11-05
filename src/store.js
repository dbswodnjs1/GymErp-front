// src/store.js
import { createStore } from "redux";

/** Action Types (한곳에서 관리) */
export const ACTIONS = {
  USER_INFO: "USER_INFO",
  USER_LOGOUT: "USER_LOGOUT",
  LOGOUT_TIMER: "LOGOUT_TIMER",
};

/** 초기 상태 */
const initState = { 
  user: null,
  logoutTimer: null,
};

/** 핸들러 맵 */
const handlers = {
  [ACTIONS.USER_INFO]: (state, action) => ({
    ...state,
    user: action.payload, // 로그인 / 사용자 정보 저장
  }),
  [ACTIONS.USER_LOGOUT]: (state) => ({
    ...state,
    user: null,
    logoutTimer: null,
  }),
  [ACTIONS.LOGOUT_TIMER]: (state, action) => ({
    ...state,
    logoutTimer: action.payload,
  }),
};

/** 루트 리듀서 */
function reducer(state = initState, action) {
  const handler = handlers[action.type];
  return handler ? handler(state, action) : state;
}

/** 세션 → Redux 초기 하이드레이션(1회) */
function loadUserFromSession() {
  try {
    const raw = sessionStorage.getItem("user");
    if (!raw) return null;
    const u = JSON.parse(raw);
    return u && u.empNum ? u : null;
  } catch {
    return null;
  }
}

const preloadedState = { ...initState, user: loadUserFromSession() };

/** 스토어 생성 */
const store = createStore(
  reducer,
  preloadedState,
  // DevTools (선택)
  typeof window !== "undefined" && window.__REDUX_DEVTOOLS_EXTENSION__
    ? window.__REDUX_DEVTOOLS_EXTENSION__()
    : undefined
);

/** Redux → 세션 미러링 */
store.subscribe(() => {
  const { user } = store.getState();
  if (user) sessionStorage.setItem("user", JSON.stringify(user));
  else sessionStorage.removeItem("user");
});

/** 셀렉터(선택) */
export const selectUser = (state) => state.user;
export const selectLogoutTimer = (state) => state.logoutTimer;

export default store;
