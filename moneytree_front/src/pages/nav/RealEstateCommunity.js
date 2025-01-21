import React, { useEffect, useState } from 'react';
import { fetchRealEstateCommunity } from '../../api/CommunityApi';

const Community1=()=> {
  const [data,setData] = useState([])
  const [loading,setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () =>{
      try{
        const result = await fetchRealEstateCommunity();
        setData(result.content);
        setLoading(false);
      }catch(error){
        console.error('부동산 관련 커뮤니티 글을 불러올 수 없습니다:',error);
        setLoading(false);
      }
    }

    fetchData();
  }, []);

if(loading) return <div>Loading...</div>

  return (
    <div>
      <h2>부동산 커뮤니티</h2>
      <ul>
        {data.map((item)=>(
          <li key={item.id}>
            <h2>{item.title}</h2>
            <p>{item.content}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Community1;
