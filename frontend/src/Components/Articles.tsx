import { Box } from '@mui/material'
import api from '../api/api'
import { useEffect, useState } from 'react'
import type { Post } from '../types'
function Articles() {
    const [articles, setArticles] = useState<Post[]>([])
    useEffect(() => {
        const getAllArticles = async () => {
            const response = await api.get('/posts');
            setArticles(response.data);
        };
        getAllArticles();
    }, []);
  return (
    <>
        <Box>
        {articles.map((article) => (
            <Box key={article.id} mb={2} p={2} border={1} borderRadius={4}>
                <h2>{article.title}</h2>
                <p>{article.content}</p>
            </Box>
        ))}
        </Box>
    
    </>
  )
}

export default Articles
