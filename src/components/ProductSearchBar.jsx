import React from 'react';

function ProductSearchBar({ keyword, onSearchChange, onSearchClick, onKeyDown }) {
    return (
        <div className="input-group">
            <input 
                onChange={onSearchChange} 
                value={keyword} 
                type="text" 
                name="keyword" 
                className="form-control" 
                placeholder="검색어 입력..."
                onKeyDown={onKeyDown}
            />
            <button onClick={onSearchClick} type="button" className="btn btn-primary">
                <i className="bi bi-search me-1" />
                검색
            </button> 
        </div>
    );
}

export default ProductSearchBar;