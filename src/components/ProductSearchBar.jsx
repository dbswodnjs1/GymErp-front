import React from 'react';

function ProductSearchBar({ keyword, onSearchChange, onSearchClick }) {
    return (
        <div className="input-group">
            <input 
                onChange={onSearchChange} 
                value={keyword} 
                type="text" 
                name="keyword" 
                className="form-control" 
                placeholder="검색어 입력..."
            />
            <button onClick={onSearchClick} type="button" className="btn btn-outline-secondary">
                검색
            </button> 
        </div>
    );
}

export default ProductSearchBar;