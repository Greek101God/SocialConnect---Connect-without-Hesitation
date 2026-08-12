import { Router } from "express";
import { 
    getAllUserProfile, 
    getUserAndProfile, 
    register,
    login,
    uploadProfilePicture,
    updateUserProfile,
    updateProfileData,
    downloadProfile,
    sendConnectionRequest,
    whatAreMyConnections,
    acceptConnectionRequest,
    getUserProfileAndUserBasedOnUsernme,
    getMyConnectionsRequests
} from "../controllers/user.controller.js";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

const router = Router();

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "social-connect/profiles",
        allowed_formats: ["jpg", "jpeg", "png", "webp", "gif"],
    },
});

const upload = multer({ storage: storage });

router.route("/update_profile_picture").post(upload.single('profile_picture'), uploadProfilePicture);

// Auth Endpoints
router.route("/register").post(register);
router.route("/login").post(login);

// Profile Updates & Gets
router.route("/user_update").post(updateUserProfile);
router.route("/get_user_and_profile").get(getUserAndProfile);
router.route("/update_profile_data").post(updateProfileData);
router.route("/get_all_profiles").get(getAllUserProfile);  

router.route("/send_connection_request").post(sendConnectionRequest);
router.route("/user_connection_request").get(whatAreMyConnections);  
router.route("/accept_connection_request").post(acceptConnectionRequest);  

router.route("/download_resume").get(downloadProfile);    

router.route("/get_profile_based_on_username").get(getUserProfileAndUserBasedOnUsernme);
router.route("/get_my_connections_requests").get(getMyConnectionsRequests);

export default router;