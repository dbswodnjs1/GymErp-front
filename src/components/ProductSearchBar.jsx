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
                <i className="bi bi-search"></i>
                <span className="visually-hidden">검색</span>
            </button> 
        </div>
    );
}

export default ProductSearchBar;