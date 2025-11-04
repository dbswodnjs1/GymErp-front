import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function PostAdd() {
  const nav = useNavigate();
  const [form, setForm] = useState({
    postTitle: "",
    postContent: "",
    postWriter: "관리자", // 로그인 사용자 연결 가능
    postPinned: "N",
  });

  const change = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (checked ? "Y" : "N") : value,
    }));
  };

  const submit = async () => {
    if (!form.postTitle || !form.postContent)
      return alert("제목과 내용을 모두 입력해주세요.");

    try {
      const res = await axios.post("http://localhost:9000/v1/post", form);
      alert("게시글이 등록되었습니다.");
      const newId = res.data?.postId ?? res.data ?? null;
      nav(newId ? `/post/${newId}` : "/post");
    } catch (err) {
      console.error(err);
      alert("등록 실패");
    }
  };

  return (
    <div className="container mt-4" style={{ maxWidth: 700 }}>
      <h3 className="mb-4">게시글 등록</h3>

      <div className="mb-3">
        <label className="form-label">제목</label>
        <input
          type="text"
          className="form-control"
          name="postTitle"
          value={form.postTitle}
          onChange={change}
          placeholder="제목을 입력하세요"
        />
      </div>

      <div className="mb-3">
        <label className="form-label">내용</label>
        <textarea
          className="form-control"
          name="postContent"
          value={form.postContent}
          onChange={change}
          rows={10}
          placeholder="내용을 입력하세요"
        />
      </div>

      <div className="d-flex align-items-center mb-4 gap-3">
        <div className="form-check">
          <input
            className="form-check-input"
            type="checkbox"
            id="pinCheck"
            name="postPinned"
            checked={form.postPinned === "Y"}
            onChange={change}
          />
          <label htmlFor="pinCheck" className="form-check-label">
            상단 고정
          </label>
        </div>

        <div className="text-muted ms-auto">작성자: {form.postWriter}</div>
      </div>

      <div className="d-flex justify-content-end gap-2">
        <button className="btn btn-success" onClick={submit}>
          등록
        </button>
        <button className="btn btn-outline-secondary" onClick={() => nav(-1)}>
          취소
        </button>
      </div>
    </div>
  );
}
