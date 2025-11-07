import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function PostAdd() {
  const nav = useNavigate();

  // ✅ 로그인 사용자 정보 (sessionStorage에서 읽기)
  const loginUser = useMemo(() => {
    try {
      return JSON.parse(sessionStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  }, []);

  // ✅ 폼 상태
  const [form, setForm] = useState({
    title: "",
    content: "",
    pinned: "N", // 'Y' | 'N'
  });
  const [submitting, setSubmitting] = useState(false);

  // ✅ 입력 변경 처리
  const change = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (checked ? "Y" : "N") : value,
    }));
  };

  // ✅ 등록 처리
  const submit = async () => {
    const title = form.title.trim();
    const content = form.content.trim();

    if (!title || !content) {
      alert("제목과 내용을 입력해주세요.");
      return;
    }

    if (!loginUser?.empName) {
      alert("로그인 정보(이름)가 없습니다. 다시 로그인해주세요.");
      return;
    }

    // ✅ 백엔드가 이름(String)으로 저장하도록 payload 변경
    const payload = {
      postTitle: title,          // mapper: postTitle
      postContent: content,      // mapper: postContent
      postPinned: form.pinned,   // mapper: postPinned
      postWriter: loginUser.empName, // ← 사번 대신 이름 전송
    };

    try {
      setSubmitting(true);
      const res = await axios.post("http://localhost:9000/v1/post", payload, {
        headers: { "Content-Type": "application/json" },
      });

      alert("게시글이 등록되었습니다.");
      const newId = res.data?.postId ?? res.data ?? null;
      nav(newId ? `/post/${newId}` : "/post");
    } catch (err) {
      console.error(err);
      const msg =
        err?.response?.data?.message ||
        err?.response?.data ||
        err?.message ||
        "등록 실패";
      alert(String(msg));
    } finally {
      setSubmitting(false);
    }
  };

  // ✅ 화면 렌더링
  return (
    <div className="container mt-4" style={{ maxWidth: 700 }}>
      <h3 className="mb-4">게시글 등록</h3>

      {/* 제목 */}
      <div className="mb-3">
        <label className="form-label">제목</label>
        <input
          type="text"
          className="form-control"
          name="title"
          value={form.title}
          onChange={change}
          placeholder="제목을 입력하세요"
          disabled={submitting}
        />
      </div>

      {/* 내용 */}
      <div className="mb-3">
        <label className="form-label">내용</label>
        <textarea
          className="form-control"
          name="content"
          value={form.content}
          onChange={change}
          rows={10}
          placeholder="내용을 입력하세요"
          disabled={submitting}
        />
      </div>

      {/* 상단 고정 및 작성자 */}
      <div className="d-flex align-items-center mb-4 gap-3">
        <div className="form-check">
          <input
            className="form-check-input"
            type="checkbox"
            id="pinCheck"
            name="pinned"
            checked={form.pinned === "Y"}
            onChange={change}
            disabled={submitting}
          />
          <label htmlFor="pinCheck" className="form-check-label">
            상단 고정
          </label>
        </div>

        <div className="text-muted ms-auto">
          작성자: {loginUser?.empName || "관리자"}
        </div>
      </div>

      {/* 버튼 */}
      <div className="d-flex justify-content-end gap-2">
        <button
          className="btn btn-success"
          onClick={submit}
          disabled={submitting}
        >
          {submitting ? "등록 중..." : "등록"}
        </button>
        <button
          className="btn btn-outline-secondary"
          onClick={() => nav(-1)}
          disabled={submitting}
        >
          취소
        </button>
      </div>
    </div>
  );
}
