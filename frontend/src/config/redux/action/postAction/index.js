import { clientServer } from "@/config";
import { createAsyncThunk, isRejectedWithValue } from "@reduxjs/toolkit";


export const getAllPosts=createAsyncThunk(
    "post/getAllPosts",
    async(_,thunkAPI)=>{
        try{
  
            const response=await clientServer.get('/posts')
            return thunkAPI.fulfillWithValue(response.data)

        }
        catch(err){
            return thunkAPI.rejectWithValue(err.response.data)
        }
    }
)


export const createPost=createAsyncThunk(
    "post/createPost",
    async(userData,thunkAPI)=>{
        const {file,body}=userData;
        try{

            const formData=new FormData();
            formData.append('token',localStorage.getItem('token'))
            formData.append('body',body)
            formData.append('media',file)

            const response=await clientServer.post("/posts",formData,{
                headers:{
                    'Content-Type':'multipart/form-data'
                }
            });

            if(response.status===200){
                return thunkAPI.fulfillWithValue("Post Uploaded");
            }else{
                return thunkAPI.fulfillWithValue("Post not Uploaded");
            }

        }
        catch(error){
            return thunkAPI.rejectWithValue(error.response.data);
        }
    }
)



export const deletePost=createAsyncThunk(
        "post/deletePost",
        async(post_id,thunkAPI)=>{
            try{
                const response=await clientServer.delete("/posts/delete_post",{   
                    data:{ 
                    token:localStorage.getItem("token"),
                    post_id: post_id.post_id
                    }
                });
                return  thunkAPI.fulfillWithValue(response.data)
            }  catch(error){
                thunkAPI.rejectWithValue("Something went wrong")
            }
        }
)



export const incrementPostLike=createAsyncThunk(
    "post/incrementLike",
    async(post,thunkAPI)=>{
        try{
                const response=await clientServer.post(`/posts/increment_post_like`,{
                    post_id: post.post_id
                })
                return thunkAPI.fulfillWithValue(response.data);
        }
        catch(error){
            return thunkAPI.rejectWithValue(error.response.data.message);
        }
    }
)

export const getAllComments=createAsyncThunk(

    "post/getAllComments",
    async(postData,thunkAPI)=>{
        try{
            const response=await clientServer.get("/posts/get_comments",{
                params:{
                    post_id:postData.post_id
                }
            });
            return thunkAPI.fulfillWithValue({
                comments:response.data.comments,
                post_id:postData.post_id
            })
        }
        catch(error){
            return thunkAPI.rejectWithValue("Something went wrong");
        }
    }
)


export const postComment=createAsyncThunk(
    "post/postComment",
    async(commentData,thunkAPI)=>{
        try{
            console.log({
                post_id:commentData.post_id,
                body:commentData.body
            })
            const response=await clientServer.post("/posts/comment",{
            token:localStorage.getItem("token"),
            post_id:commentData.post_id,
            commentBody:commentData.body
        });
        return thunkAPI.fulfillWithValue(response.data);
    }catch(error){
        return thunkAPI.rejectWithValue("Something went wrong");    
    }
}
)


// ==================== DELETE COMMENT ====================
// Expects backend route: DELETE /posts/delete_comment
// Body: { token, comment_id }
export const deleteComment=createAsyncThunk(
    "post/deleteComment",
    async(commentData,thunkAPI)=>{
        try{
            const response=await clientServer.delete("/posts/delete_comment",{
                data:{
                    token:localStorage.getItem("token"),
                    comment_id:commentData.comment_id
                }
            });
            return thunkAPI.fulfillWithValue({
                comment_id:commentData.comment_id,
                data:response.data
            });
        }
        catch(error){
            return thunkAPI.rejectWithValue(error.response?.data || "Something went wrong");
        }
    }
)


// ==================== LIKE COMMENT ====================

export const likeComment=createAsyncThunk(
    "post/likeComment",
    async(commentData,thunkAPI)=>{
        try{
            const response=await clientServer.post("/posts/increment_comment_like",{
                comment_id:commentData.comment_id
            });
            return thunkAPI.fulfillWithValue({
                comment_id:commentData.comment_id,
                data:response.data
            });
        }
        catch(error){
            return thunkAPI.rejectWithValue(error.response?.data?.message || "Something went wrong");
        }
    }
)


// ==================== REPLY TO COMMENT ====================

export const replyToComment=createAsyncThunk(
    "post/replyToComment",
    async(replyData,thunkAPI)=>{
        try{
            const response=await clientServer.post("/posts/reply_comment",{
                token:localStorage.getItem("token"),
                comment_id:replyData.comment_id,
                body:replyData.body
            });
            return thunkAPI.fulfillWithValue({
                comment_id:replyData.comment_id,
                reply:response.data.reply
            });
        }
        catch(error){
            return thunkAPI.rejectWithValue(error.response?.data || "Something went wrong");
        }
    }
)