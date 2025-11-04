// src/pages/PostView.jsx
import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import axios from "axios";

export default function PostView() {
  const { postId } = useParams();
  const nav = useNavigate();
  const [dto, setDto] = useState(null);
  const [loading, setLoading] = useState(false);

  // 상세 로드 (조회수 증가 inc=true)
  useEffect(() => {
    if (!postId) return;
    setLoading(true);
    axios
      .get(`http://localhost:9000/v1/post/${postId}`, { params: { inc: true } })
      .then((res) => setDto(res.data))
      .catch(() => alert("상세 조회 실패"))
      .finally(() => setLoading(false));
  }, [postId]);

  const del = async () => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    try {
      await axios.delete(`http://localhost:9000/v1/post/${postId}`);
      alert("삭제되었습니다.");
      nav("/post");
    } catch (e) {
      console.error(e);
      alert("삭제 실패");
    }
  };

  if (!postId) return <div className="container py-4">잘못된 접근입니다.</div>;
  if (loading || !dto) return <div className="container py-4">로딩중...</div>;

  return (
    <div className="container py-4" style={{ maxWidth: 900 }}>
      <div className="d-flex justify-content-between align-items-start mb-3">
        <h3 className="m-0">
          {dto.postPinned === "Y" && <span className="me-1">📌</span>}
          {dto.postTitle}
        </h3>
        <div className="text-muted">조회 {dto.postViewCnt ?? 0}</div>
      </div>

      <div className="mb-3 text-muted">
        작성자: {dto.postWriter} · 작성일: {(dto.postCreatedAt || "").slice(0, 16)}
      </div>

      <div className="border rounded p-3 mb-4" style={{ whiteSpace: "pre-wrap" }}>
        {dto.postContent}
      </div>

      <div className="d-flex justify-content-end gap-2">
        <Link to="/post" className="btn btn-outline-secondary">목록</Link>
        <button
          type="button"
          className="btn btn-success"
          onClick={() => nav(`/post/edit/${postId}`)} // ✅ 수정으로 이동(절대경로)
        >
          수정
        </button>
        <button type="button" className="btn btn-danger" onClick={del}>
          삭제
        </button>
      </div>
    </div>
  );
}
