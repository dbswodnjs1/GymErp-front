import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

function StockOutbound() {
    const { productId } = useParams();
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
        axios.post(`/v1/stock/${productId}/adjust`, state);
    };

    return <>
        
        <div>
            <label htmlFor="name">선택된 상품</label>
            <input type="text" value={`${state.codeBName}-${state.name}`} id='name' readOnly/>
        </div>
        <form onSubmit={handleSubmit}>
            <div>
                <label htmlFor="date">차감일자</label>
                <input 
                    onChange={handleChange} 
                    type="datetime-local" 
                    name="date"
                    value={state.date}
                    id='date'
                />
            </div>

            <div>
                <label htmlFor="quantity">수량</label>
                <input 
                    onChange={handleChange} 
                    type="number" 
                    name="quantity"  
                    value={state.quantity} 
                    id='quantity'
                />
            </div>

            <div>
                <label htmlFor="notes">사유</label>
                <input
                    onChange={handleChange}  
                    type="text"
                    name="notes"
                    id='notes'
                />
            </div>
            <button type='submit'>저장</button>
        </form>

        
    </>
}

export default StockOutbound;