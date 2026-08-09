import mongoose from "mongoose";

const replySchema = new mongoose.Schema({
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    body:{
        type: String,
        required: true
    },
    createdAt:{
        type: Date,
        default: Date.now
    }
});

const commentSchema = new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    postId: { 
        type: mongoose.Schema.Types.ObjectId,
        ref:'Post',
    },
    body:{
        type:String,
        required: true
    },
    likes:{
        type: Number,
        default: 0
    },
    replies:{
        type: [replySchema],
        default: []
    }
});

const Comment =mongoose.model("Comment",commentSchema);

export default Comment;