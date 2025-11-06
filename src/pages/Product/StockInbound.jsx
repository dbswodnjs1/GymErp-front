import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

function StockInbound() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [state, setState] = useState({
    codeBName: '',
    name: '',
    date: new Date().toISOString().slice(0, 16), // YYYY-MM-DDTHH:mm 형식
    purchasePrice: '', // 0 대신 빈 문자열이 입력하기 편함
    quantity: '',
    action: 'ADD'
  });

  const handleChange = (e)=>{
      const { name, value } = e.target;
      setState(prevState => ({
          ...prevState,
          [name]: value
      }));
  };

  useEffect(()=>{
    if(productId){
      axios.get(`/v1/product/${productId}`)
      .then(res=>{
        setState(prevState => ({
          ...prevState, 
          codeBName: res.data.codeBName, 
          name: res.data.name           
        }));
      })
      .catch(err=>console.log(err));
    }
  },[productId]);

  // 렌더링할 때 "합계"를 실시간으로 계산!
  // (state의 값이 문자열일 수 있으니 Number()로 변환)
  const purchasePrice = Number(state.purchasePrice || 0);
  const quantity = Number(state.quantity || 0);
  const total = purchasePrice * quantity;

  const handleSubmit = (e)=>{
    e.preventDefault();
    axios.post(`/v1/stock/${productId}/adjust`, state)
      .then(re=>{
        alert('입고 처리되었습니다.');
        navigate(-1);
      })
      .catch(err=>{
        console.error('입고 처리 실패:', err);
        alert('오류가 발생했습니다.');
      });
  };

  return (
        <div className="container mt-4"> {/* 1. 전체 컨테이너 및 상단 여백 */}
            <div className="row justify-content-center">
                <div className="col-md-8 col-lg-6"> {/* 2. 컨텐츠 중앙 정렬 및 너비 제한 */}
                    
                    {/* 3. [선택된 상품] UI (와이어프레임 [3]번) */}
                    <div className="mb-3 row align-items-center">
                        <label htmlFor="name" className="col-sm-3 col-form-label text-md-end">
                            <strong>선택된 상품</strong>
                        </label>
                        <div className="col-sm-9 d-flex gap-2">
                            <input 
                                type="text" 
                                value={state.codeBName} 
                                className="form-control" 
                                readOnly 
                            />
                            <input 
                                type="text" 
                                value={state.name} 
                                id='name' 
                                className="form-control" 
                                readOnly 
                            />
                        </div>
                    </div>

                    {/* 4. 메인 폼 (와이어프레임 [1]번, [2]번) */}
                    <div className="card shadow-sm border-0">
                        <div className="card-body p-4">
                            <form onSubmit={handleSubmit}>
                                
                                {/* 구입일자 */}
                                <div className="mb-3 row">
                                    <label htmlFor="date" className="col-sm-3 col-form-label text-md-end">구입일자</label>
                                    <div className="col-sm-9">
                                        <input 
                                            onChange={handleChange} 
                                            type="datetime-local" 
                                            name="date"
                                            value={state.date}
                                            id='date'
                                            className="form-control" 
                                        />
                                    </div>
                                </div>
                                
                                {/* 매입가 */}
                                <div className="mb-3 row">
                                    <label htmlFor="price" className="col-sm-3 col-form-label text-md-end">매입가</label>
                                    <div className="col-sm-9">
                                        <input 
                                            className="form-control no-spinners"
                                            onChange={handleChange} 
                                            type="number" 
                                            name="purchasePrice"  
                                            value={state.purchasePrice}
                                            id='price'
                                            placeholder="0" // 기본값 0 표시
                                        />
                                    </div>
                                </div>
                                
                                {/* 수량 */}
                                <div className="mb-3 row">
                                    <label htmlFor="quantity" className="col-sm-3 col-form-label text-md-end">수량</label>
                                    <div className="col-sm-9">
                                        <input 
                                            onChange={handleChange} 
                                            type="number" 
                                            name="quantity"  
                                            value={state.quantity} 
                                            id='quantity'
                                            className="form-control"
                                            placeholder="0" // 기본값 0 표시
                                        />
                                    </div>
                                </div>

                                {/* 합계 */}
                                <div className="mb-3 row">
                                    <label htmlFor="sum" className="col-sm-3 col-form-label text-md-end">합계</label>
                                    <div className="col-sm-9">
                                        <input 
                                            type="text" 
                                            value={total.toLocaleString()}
                                            id='sum'
                                            className="form-control-plaintext" 
                                            readOnly
                                        />
                                    </div>
                                </div>
                                
                                {/* 5. 버튼 영역 (와이어프레임 [4], [5]번) */}
                                <hr className="my-4" />
                                <div className="d-flex justify-content-end gap-2">
                                    <button 
                                        type='button' 
                                        className='btn btn-outline-secondary' 
                                        onClick={() => navigate(-1)}
                                    >
                                        뒤로
                                    </button>
                                    <button 
                                        type='submit' 
                                        className='btn btn-primary'
                                    >
                                        저장하기
                                    </button>
                                </div>
                                
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default StockInbound;