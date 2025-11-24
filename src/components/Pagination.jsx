function Pagination({ page, totalPage, onPageChange }) {
  const startPage = Math.floor((page - 1) / 5) * 5 + 1;
  const endPage = Math.min(startPage + 4, totalPage);

  const handlePageClick = (p) => {
    if (p >= 1 && p <= totalPage) onPageChange(p);
  };

  return (
    <div className="d-flex justify-content-center mt-4">
      <nav>
        <ul className="pagination">
          {/* << 그룹 단위 이동 */}
          <li className={`page-item ${page <= 5 ? "disabled" : ""}`}>
            <button className="page-link" onClick={() => handlePageClick(startPage - 5)}>
              &laquo;
            </button>
          </li>

          {/* < 이전 페이지 */}
          <li className={`page-item ${page === 1 ? "disabled" : ""}`}>
            <button className="page-link" onClick={() => handlePageClick(page - 1)}>
              &lt;
            </button>
          </li>

          {/* 페이지 숫자 */}
          {Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i).map((p) => (
            <li key={p} className={`page-item ${p === page ? "active" : ""}`}>
              <button className="page-link" onClick={() => handlePageClick(p)}>
                {p}
              </button>
            </li>
          ))}

          {/* > 다음 페이지 */}
          <li className={`page-item ${page === totalPage ? "disabled" : ""}`}>
            <button className="page-link" onClick={() => handlePageClick(page + 1)}>
              &gt;
            </button>
          </li>

          {/* >> 다음 그룹 이동 */}
          <li className={`page-item ${endPage >= totalPage ? "disabled" : ""}`}>
            <button className="page-link" onClick={() => handlePageClick(startPage + 5)}>
              &raquo;
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
}

export default Pagination;
