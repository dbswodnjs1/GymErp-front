import React from 'react';
import Pagination from './Pagination';

function ProductListComponent({ pageInfo, onPageChange, onToggleChange, columns, onRowClick }) {

    const renderCell = (item, col) => {
        
        // col.key가 'isActive'면, 토글 스위치를 렌더링
        if (col.key === 'isActive') {
            const uniqueId = item.productId || item.serviceId; // 고유 ID 찾기
            return (
                <div className="form-check form-switch d-flex justify-content-center">
                    <input 
                        className="form-check-input" 
                        type="checkbox" 
                        role="switch"
                        id={`switch-${uniqueId}`} // 고유 ID
                        checked={item.isActive} 
                        onChange={onToggleChange ? (e) => onToggleChange(item, e.target.checked) : null}
                        onClick={(e) => e.stopPropagation()}
                        disabled={!onToggleChange} // onToggleChange가 없으면 비활성화
                    />
                </div>
            );
        }
        
        // 'price' 컬럼은 쉼표(,) 추가 (예시)
        if (col.key === 'price' && item[col.key] != null) {
             return item[col.key].toLocaleString(); // 1,000,000
        }

        // 그 외의 경우(name, codeBId...), 그냥 텍스트 출력
        return item[col.key];
    };

    return (
        <>
            <table className="table table-striped text-center">
                <thead className="table-dark">
                    <tr>
                        {/*부모가 준 'columns' 배열로 <th>를 동적 생성 */}
                        {columns.map((col) => (
                            <th key={col.key}>{col.label}</th> 
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {pageInfo.list && pageInfo.list.map((item, index) => {
                        const rowId = item.productId || item.serviceId || index;
                        const clickable = typeof onRowClick === 'function';
                        return (
                        <tr
                            key={rowId}
                            onClick={clickable ? () => onRowClick(item) : undefined}
                            style={clickable ? { cursor: 'pointer' } : undefined}
                        >
                            {/* 부모가 준 'columns' 배열 순서대로 <td>를 동적 생성 */}
                            {columns.map((col) => (
                                <td key={col.key}>
                                    {/* renderCell 함수가 렌더링 담당 */}
                                    {renderCell(item, col)} 
                                </td>
                            ))}
                        </tr>
                    )})}
                </tbody>
            </table>
            <Pagination 
                page={pageInfo.pageNum} 
                totalPage={pageInfo.totalPageCount} 
                onPageChange={onPageChange}
            />
        </>
    );
}

export default ProductListComponent;
