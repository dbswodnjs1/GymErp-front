import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import CategoryCheckbox from '../../components/CategoryCheckbox';
import ProductSearchBar from '../../components/ProductSearchBar';
import ProductListComponent from '../../components/ProductListComponent';
import axios from 'axios';

function StockList() {
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [search, setSearch] = useState({ keyword: "" });
    const [pageInfo, setPageInfo] = useState({
        list: [],
        pageNum: 1,
        startPageNum: 1,
        endPageNum: 1,
        totalPageCount: 1
    });

    const productColumns = [
        { key: 'codeBName', label: '상품 구분' },
        { key: 'name', label: '상품 이름' },
        { key: 'quantity', label: '수량' } // 이 key가 renderCell의 if문과 일치
    ];

    const [params] = useSearchParams();
    const navigate = useNavigate();

    useEffect(()=>{
        const pageNum = params.get("pageNum") || 1;
        const keyword = params.get("keyword") || "";
        const categoryCodes = params.getAll("categoryCodes") || [];

        // URL 파라미터를 state에 동기화
        setSearch({ keyword });
        setSelectedCategories(categoryCodes);

        const qs = new URLSearchParams();
        qs.set("pageNum", pageNum.toString());
        if (keyword) {
            qs.set("keyword", keyword);
        }
        categoryCodes.forEach(cat => {
            qs.append('categoryCodes', cat);
        });

        axios.get(`/v1/product?${qs.toString()}`)
            .then(res=>{
                setPageInfo(res.data);
            })
            .catch(err=>console.log(err));
    },[params]);

    const handleCategoryChange = (newCategories) => {
        const qs = new URLSearchParams();
        qs.set("pageNum", "1");
        if (search.keyword) {
            qs.set("keyword", search.keyword);
        }
        newCategories.forEach(cat => {
            qs.append('categoryCodes', cat);
        });
        navigate(`/stock?${qs.toString()}`);
    };

    const handleSearchChange = (e) => {
        setSearch({ ...search, [e.target.name]: e.target.value });
    };

    const handleSearchClick = () => {
        const qs = new URLSearchParams();
        qs.set("pageNum", "1");
        if (search.keyword) {
            qs.set("keyword", search.keyword);
        }
        selectedCategories.forEach(cat => {
            qs.append('categoryCodes', cat);
        });
        navigate(`/stock?${qs.toString()}`);
    };

    const pageMove = (num) => {
        const qs = new URLSearchParams(params);
        qs.set("pageNum", num.toString());
        navigate(`/stock?${qs.toString()}`);
    };

    return <>
        <CategoryCheckbox
            codeAId={'PRODUCT'}
            checkedList={selectedCategories}
            onChange={handleCategoryChange}
        />
        <ProductSearchBar
            keyword={search.keyword}
            onSearchChange={handleSearchChange}
            onSearchClick={handleSearchClick}
        />
        <ProductListComponent
            pageInfo={pageInfo}
            currentTab={'PRODUCT'}
            onPageChange={pageMove}
            columns={productColumns}
        />

        <button>입고</button>
        <table>
            <thead>
                <tr>
                    <th>날짜</th>
                    <th>수량</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td></td>
                    <td></td>
                </tr>
            </tbody>
        </table>

        <button>출고</button>
        <table>
            <thead>
                <tr>
                    <th>날짜</th>
                    <th>수량</th>
                    <th>사유</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td></td>
                    <td></td>
                    <td></td>
                </tr>
            </tbody>
        </table>
    </>
}

export default StockList;