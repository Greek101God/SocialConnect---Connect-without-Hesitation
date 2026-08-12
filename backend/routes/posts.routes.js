import { Router } from "express";
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from "../config/cloudinary.js";
import { getAllPosts, deletePost, activeCheck, createPost, incrementPostLike } from "../controllers/posts.controller.js";
import { commentPost, delete_comment_of_user, get_comments_by_post, incremenet_likes, incrementCommentLike, replyToComment } from "../controllers/user.controller.js";


const router = Router();

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "social-connect",
        allowed_formats: ["jpg", "jpeg", "png", "webp", "gif"],
    },
});

const upload = multer({ storage });

router.route('/status').get(activeCheck);


router.route('/')
    .get(getAllPosts)
    .post(upload.single('media'), createPost);


router.route("/delete_post").delete(deletePost);
router.route("/comment").post(commentPost);
router.route("/get_comments").get(get_comments_by_post);
router.route("/delete_comment").delete(delete_comment_of_user);
router.route("/increment_post_like").post(incrementPostLike);
router.route("/increment_comment_like").post(incrementCommentLike);
router.route("/reply_comment").post(replyToComment);

export default router;