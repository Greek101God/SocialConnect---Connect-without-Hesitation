import { getAllPosts, createPost } from "../../action/postAction";
import { createSlice } from "@reduxjs/toolkit";
import { getAllComments, deleteComment, likeComment, replyToComment } from "../../action/postAction";
const initialState = {
  posts: [],
  isError: false,
  postFetched: false,
  isLoading: false,
  loggedIn: false,
  message: "",
  comments: [],
  postId: "",
};

const postSlice = createSlice({
  name: "post",
  initialState,
  reducers: {
    reset: () => initialState,
    resetPostId: (state) => {
      state.postId = "";
    },
  },
  extraReducers: (builder) => {
    builder
      // ==================== GET ALL POSTS ====================
      .addCase(getAllPosts.pending, (state) => {
        state.isLoading = true;
        state.message = "Fetching all the posts...";
      })
      .addCase(getAllPosts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.postFetched = true;
        console.log(action.payload.posts)
        state.posts=action.payload.posts.reverse();
        console.log(`HERE`,state.posts)

    
        
      })
      .addCase(getAllPosts.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload || "Failed to fetch posts";
      })

      // ==================== CREATE POST ====================
      .addCase(createPost.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createPost.fulfilled, (state) => {
        state.isLoading = false;
        state.postFetched = false; 
      })
      .addCase(createPost.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload || "Failed to create post";
      })

      // ==================== GET ALL COMMENTS ====================
      .addCase(getAllComments.fulfilled,(state,action)=>{
        state.postId= action.payload.post_id
        state.comments=action.payload.comments 
      })
      .addCase(getAllComments.rejected, (state, action) => {
        state.isError = true;
        state.message = action.payload || "Failed to fetch comments";
      })

      // ==================== DELETE COMMENT ====================
      .addCase(deleteComment.fulfilled, (state, action) => {
        state.comments = state.comments.filter(
          (comment) => comment._id !== action.payload.comment_id
        );
      })
      .addCase(deleteComment.rejected, (state, action) => {
        state.isError = true;
        state.message = action.payload || "Failed to delete comment";
      })

      // ==================== LIKE COMMENT ====================
      .addCase(likeComment.fulfilled, (state, action) => {
        const comment = state.comments.find(
          (c) => c._id === action.payload.comment_id
        );
        if (comment) {
          comment.likes = action.payload.data?.likes ?? (comment.likes || 0) + 1;
        }
      })
      .addCase(likeComment.rejected, (state, action) => {
        state.isError = true;
        state.message = action.payload || "Failed to like comment";
      })

      // ==================== REPLY TO COMMENT ====================
      .addCase(replyToComment.fulfilled, (state, action) => {
        const comment = state.comments.find(
          (c) => c._id === action.payload.comment_id
        );
        if (comment) {
          if (!comment.replies) comment.replies = [];
          comment.replies.push(action.payload.reply);
        }
      })
      .addCase(replyToComment.rejected, (state, action) => {
        state.isError = true;
        state.message = action.payload || "Failed to post reply";
      })
  },
});

export const { reset, resetPostId } = postSlice.actions;
export default postSlice.reducer;