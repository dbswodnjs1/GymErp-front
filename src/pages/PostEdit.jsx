import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

export default function PostEdit() {
  const { postId } = useParams();
  const nav = useNavigate();

  const [form, setForm] = useState({
    postTitle: "",
    postContent: "",
    postWriter: "",
    postPinned: "N",
  });

  useEffect(() => {
    axios
      .get(`http://localhost:9000/v1/post/${postId}`, { params: { inc: false } })
      .then((res) => {
        const v = res.data ?? {};
        setForm({
          postTitle: v.postTitle ?? "",
          postContent: v.postContent ?? "",
          postWriter: v.postWriter ?? "관리자",
          postPinned: v.postPinned ?? "N",
        });
      })
      .catch((err) => {
        console.error(err);
        alert("게시글 불러오기 실패");
      });
  }, [postId]);

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
      await axios.put(`http://localhost:9000/v1/post/${postId}`, form);
      alert("게시글이 수정되었습니다.");
      nav(`/post/${postId}`);
    } catch (err) {
      console.error(err);
      alert("수정 실패");
    }
  };

  return (
    <div className="container mt-4" style={{ maxWidth: 700 }}>
      <h3 className="mb-4">게시글 수정</h3>

      <div className="mb-3">
        <label className="form-label">제목</label>
        <input
          type="text"
          className="form-control"
          name="postTitle"
          value={form.postTitle}
          onChange={change}
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
        />
      </div>

      <div className="d-flex align-items-center mb-4 gap-3">
        <div className="form-check">
          <input
            className="form-check-input"
            type="checkbox"
            id="pinEdit"
            name="postPinned"
            checked={form.postPinned === "Y"}
            onChange={change}
          />
          <label htmlFor="pinEdit" className="form-check-label">
            상단 고정
          </label>
        </div>

        <div className="text-muted ms-auto">작성자: {form.postWriter}</div>
      </div>

      <div className="d-flex justify-content-end gap-2">
        <button className="btn btn-success" onClick={submit}>
          수정 완료
        </button>
        <button className="btn btn-outline-secondary" onClick={() => nav(-1)}>
          취소
        </button>
      </div>
    </div>
  );
}
