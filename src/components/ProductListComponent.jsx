import React from 'react';
import Pagination from './Pagination';


function ProductListComponent({ pageInfo, onPageChange, onToggleChange, columns, onRowClick, onSort, sortConfig, selectedRowId, loading }) {

    const getSortIcon = (key) => {
        if (!sortConfig || sortConfig.key !== key) return null; // ' ▲▼' (회색 아이콘)
        if (sortConfig.direction === 'ASC') return ' ▲'; // 오름차순
        return ' ▼'; // 내림차순
    };

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
            <table className="table table-striped table-hover text-center">
                <thead className="table-dark">
                    <tr>
                        {/*부모가 준 'columns' 배열로 <th>를 동적 생성 */}
                        {columns.map((col) => (
                            <th 
                                key={col.key} 
                                // '활성화' 컬럼(isActive)은 정렬하지 않도록 예외 처리
                                onClick={col.key !== 'isActive' ? () => onSort(col.key) : null}
                                // 정렬 가능한 컬럼에만 커서 포인터 표시
                                style={{ 
                                    whiteSpace: 'nowrap',
                                    ...(col.key !== 'isActive' && { cursor: 'pointer' })
                                }}
                            >
                                {col.label}
                                {getSortIcon(col.key)} {/* 4. 아이콘 표시 */}
                            </th> 
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        <tr>
                            <td colSpan={columns.length} className="text-center">
                                Loading...
                            </td>
                        </tr>
                    ) : (
                        pageInfo.list && pageInfo.list.map((item, index) => (
                            <tr key={item.productId || item.serviceId || index} onClick={() => onRowClick && onRowClick(item)} style={{ cursor: 'pointer' }}>
                                {columns.map((col) => (
                                    <td key={col.key}>
                                        {renderCell(item, col)} 
                                    </td>
                                ))}
                            </tr>
                        ))
                    )}
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