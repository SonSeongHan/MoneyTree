import React, { useEffect, useState } from 'react';
import { fetchHobbyCommunity } from '../../api/CommunityApi';

const HobbyCommunity = () => {
  const [data,setData] = useState([]);
  const [loading,setLoading] = useState(true);

  useEffect(()=>{
    const fetchData = async () =>{
      try{
        const result = await fetchHobbyCommunity();
        setData(result.content);
        setLoading(false);
      }catch(error){
        console.error('취미 관련 커뮤니티 글을 불러올 수 없습니다:',error);
        setLoading(false);
      }
    };

    fetchData();
  },[]);

  if(loading) return <div>Loading...</div>

  return (
    <div>
      <h2>취미 커뮤니티</h2>
      <ul>
        {data.map((item) => (
          <li key={item.id}>
            <h2>{item.title}</h2>
            <p>{item.content}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default HobbyCommunity;
