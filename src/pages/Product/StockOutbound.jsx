import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

function StockOutbound() {
    const { productId } = useParams();
    const navigate = useNavigate();
    const [state, setState] = useState({
        codeBName: '',
        name: '',
        date: new Date().toISOString().slice(0, 16), // YYYY-MM-DDTHH:mm 형식
        quantity: '',
        action: 'SUBTRACT',
        notes: ''
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

    const handleSubmit = (e)=>{
        e.preventDefault();
        axios.post(`/v1/stock/${productId}/adjust`, state)
            .then(res => {
                alert('출고 처리되었습니다.');
                navigate(-1);
            })
            .catch(err=>{
                console.error('출고 처리 실패:', err);
                alert('오류가 발생했습니다.');
            });
    };

    return (<div className='pt-5 pb-5' style={{backgroundColor: "#f8f9fa"}}>
        <div className="container d-flex align-items-center min-vh-100"> 
            <div className="row justify-content-center w-100">
                <div className="col-md-8 col-lg-6"> 
                    
                    

                    {/* 4. 메인 폼 (와이어프레임 [1]번, [2]번) */}
                    <div className="card shadow-sm border-0">

                        <div className="mb-3 row align-items-center mt-3 me-3 ms-2">
                            <label htmlFor="name" className="col-sm-3 col-form-label text-md-end">
                                <strong>선택된 상품</strong>
                            </label>
                            <div className="col-sm-9 d-flex gap-2">
                                <input 
                                    type="text" 
                                    value={state.codeBName || ''} 
                                    className="form-control" 
                                    readOnly 
                                />
                                <input 
                                    type="text" 
                                    value={state.name || ''} 
                                    id='name' 
                                    className="form-control" 
                                    readOnly 
                                />
                            </div>
                        </div>

                        <div className="card-body p-4">
                            <form onSubmit={handleSubmit}>
                                
                                {/* 차감일자 */}
                                <div className="mb-3 row">
                                    <label htmlFor="date" className="col-sm-3 col-form-label text-md-end">차감일자</label>
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
                                            placeholder="0" 
                                        />
                                    </div>
                                </div>
                                
                                {/* 사유 */}
                                <div className="mb-3 row">
                                    <label htmlFor="notes" className="col-sm-3 col-form-label text-md-end">사유</label>
                                    <div className="col-sm-9">
                                        <input 
                                            onChange={handleChange} 
                                            type="text"
                                            name="notes"
                                            value={state.notes}
                                            id='notes'
                                            className="form-control"
                                            placeholder="예: 파손, 분실"
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
    </div>);
}

export default StockOutbound;