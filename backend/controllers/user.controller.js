import Profile from "../models/profile.model.js";
import User from "../models/user.model.js";
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import PDFDocument from 'pdfkit';
import ConnectionRequest from "../models/connections.model.js";
import Post from "../models/posts.model.js";
import Comment from "../models/comments.model.js";




// =========================================================================
// REGISTER USER
// =========================================================================
export const register = async (req, res) => {
    try {
        const { name, email, password, username } = req.body;
        if (!name || !email || !password || !username) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: "User already exists" });

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ name, email, password: hashedPassword, username });
        await newUser.save();

        const profile = new Profile({ userId: newUser._id, bio: "", currentPost: "", pastWork: [] });
        await profile.save();

        return res.json({ message: "User Created" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};


// =========================================================================
// LOGIN USER
// =========================================================================
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "User does not exist" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid Credentials" });

        const token = crypto.randomBytes(32).toString("hex");
        await User.updateOne({ _id: user._id }, { token });

        return res.json({ token });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};


// =========================================================================
// UPLOAD PROFILE PICTURE
// =========================================================================
export const uploadProfilePicture = async (req, res) => {
    const { token } = req.body;
    try {
        if (!req.file) return res.status(400).json({ message: "No file uploaded" });

        const user = await User.findOne({ token });
        if (!user) return res.status(404).json({ message: "User not found" });

        user.profilePicture = req.file.path;
        await user.save();

        return res.json({ message: "Profile Picture updated" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
// =========================================================================
// UPDATE USER PROFILE
// =========================================================================
export const updateUserProfile = async (req, res) => {
    try {
        const { token, ...newUserData } = req.body;

        const user = await User.findOne({ token });
        if (!user) return res.status(404).json({ message: "User not found" });

        const { username, email } = newUserData;
        const existingUser = await User.findOne({ $or: [{ username }, { email }] });

        if (existingUser && String(existingUser._id) !== String(user._id)) {
            return res.status(400).json({ message: "User already exists" });
        }

        Object.assign(user, newUserData);
        await user.save();
        return res.json({ message: "User updated" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};


// =========================================================================
// GET USER AND PROFILE
// =========================================================================
export const getUserAndProfile = async (req, res) => {
    try {
        const { token } = req.query;
        const user = await User.findOne({ token });
        if (!user) return res.status(404).json({ message: "User not found" });

        const userProfile = await Profile.findOne({ userId: user._id })
            .populate('userId', 'name email username profilePicture');

        return res.json(userProfile);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};


// =========================================================================
// UPDATE PROFILE DATA
// =========================================================================
export const updateProfileData = async (req, res) => {
    try {
        const { token, ...newProfileData } = req.body;

        const userProfile = await User.findOne({ token });
        if (!userProfile) return res.status(404).json({ message: "User not found" });

        const profile_to_update = await Profile.findOne({ userId: userProfile._id });
        if (!profile_to_update) return res.status(404).json({ message: "Profile not found" });

        Object.assign(profile_to_update, newProfileData);
        await profile_to_update.save();
        return res.json({ message: "Profile Updated" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};


// =========================================================================
// GET ALL USER PROFILES (e.g. "Top Profiles" list)
// FIX: Filters out profiles whose linked user no longer exists (orphaned
// documents caused populate('userId', ...) to return null, which crashed
// the frontend and showed "Anonymous User" as a fallback).
// =========================================================================
export const getAllUserProfile = async (req, res) => {
    try {
        const profiles = await Profile.find()
            .populate('userId', 'name username email profilePicture');

        // Drop any profile whose referenced user no longer exists
        const validProfiles = profiles.filter(profile => profile.userId !== null);

        return res.json({ profiles: validProfiles });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};


// =========================================================================
// DOWNLOAD PROFILE (PDF RESUME)
// =========================================================================
export const downloadProfile = async (req, res) => {
    try {
        const user_id = req.query.id;
        if (!user_id) return res.status(400).json({ message: "User ID parameter is required" });

        const userProfile = await Profile.findOne({ userId: user_id })
            .populate('userId', 'name username email profilePicture');

        if (!userProfile || !userProfile.userId) {
            return res.status(404).json({ message: "Profile or user data not found" });
        }

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'inline; filename="resume.pdf"');

            const doc = new PDFDocument();
            doc.pipe(res);

                    if (userProfile.userId.profilePicture) {
                try {
            const response = await fetch(userProfile.userId.profilePicture);
            const arrayBuffer = await response.arrayBuffer();
            const imgBuffer = Buffer.from(arrayBuffer);
            doc.image(imgBuffer, { align: "center", width: 100 });
            doc.moveDown();
            } catch (err) {
            doc.fontSize(12).text("[Profile Image Error]", { align: "center" });
        }
    }
        

        doc.fontSize(18).text("User Profile Document", { align: "center" }).moveDown();
        doc.fontSize(14).text(`Name : ${userProfile.userId.name || 'N/A'}`);
        doc.fontSize(14).text(`Username: ${userProfile.userId.username || 'N/A'}`);
        doc.fontSize(14).text(`Email : ${userProfile.userId.email || 'N/A'}`);
        doc.fontSize(14).text(`Bio : ${userProfile.bio || 'No bio filled out yet.'}`);
        doc.fontSize(14).text(`Current Position: ${userProfile.currentPost || 'N/A'}`);
        doc.moveDown();

        doc.fontSize(16).text("Past Work Experience:", { underline: true }).moveDown(0.5);
        if (userProfile.pastWork && userProfile.pastWork.length > 0) {
            userProfile.pastWork.forEach((work) => {
                doc.fontSize(14).text(`• Position: ${work.position || 'N/A'} (${work.years || '0'} Years)`);
            });
        } else {
            doc.fontSize(14).text("No history provided.");
        }

        doc.end();

    } catch (error) {
        console.error("Resume generation error:", error);
        if (!res.headersSent) {
            return res.status(500).json({ message: "Failed to generate resume document." });
        }
    }
};


// =========================================================================
// SEND CONNECTION REQUEST
// FIX: Removed stray "a" typo in the catch block declaration.
// =========================================================================
export const sendConnectionRequest = async (req, res) => {
    const { token, connectionId } = req.body;

    try {
        const user = await User.findOne({ token });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const connectionUser = await User.findOne({ _id: connectionId });
        if (!connectionUser) {
            return res.status(404).json({ message: "Connection User not found" });
        }

        const existingRequest = await ConnectionRequest.findOne({
          $or: [
                { userId: user._id, connectionId: connectionUser._id },
                { userId: connectionUser._id, connectionId: user._id }
            ]
        });

        if (existingRequest) {
            return res.status(400).json({ message: "Request already sent" });
        }

        const request = new ConnectionRequest({
            userId: user._id,
            connectionId: connectionUser._id
        });
        await request.save();

        return res.json({ message: "Request Sent" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};


// =========================================================================
// GET MY SENT CONNECTION REQUESTS
// =========================================================================
export const getMyConnectionsRequests = async (req, res) => {
    const { token } = req.query;

    try {
        const user = await User.findOne({ token });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const connections = await ConnectionRequest.find({ userId: user._id })
            .populate('connectionId', 'name username email profilePicture');

        return res.json(connections);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};


// =========================================================================
// GET INCOMING CONNECTION REQUESTS (who wants to connect with me)
// =========================================================================
export const whatAreMyConnections = async (req, res) => {
    const { token } = req.query;

    try {
        const user = await User.findOne({ token });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const connections = await ConnectionRequest.find({ connectionId: user._id })
            .populate('userId', 'name username email profilePicture');

        return res.json(connections);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};


// =========================================================================
// ACCEPT / REJECT CONNECTION REQUEST
// =========================================================================
export const acceptConnectionRequest = async (req, res) => {
    const { token, requestId, action_type } = req.body;

    try {
        const user = await User.findOne({ token });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const connection = await ConnectionRequest.findOne({ _id: requestId });
        if (!connection) {
            return res.status(404).json({ message: "Connection not found" });
        }

        if (action_type === "accept") {
            connection.status_accepted = true;
        } else if (action_type === "reject") {
            connection.status_accepted = false;
        } else {
            return res.status(400).json({ message: "Invalid action_type" });
        }

        await connection.save();
        return res.json({ message: "Request Updated" });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};


// =========================================================================
// COMMENT ON POST
// =========================================================================
export const commentPost = async (req, res) => {
    const { token, post_id, commentBody } = req.body;

    try {
        const user = await User.findOne({ token: token }).select("_id");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const post = await Post.findOne({
            _id: post_id
        });

        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        const comment = new Comment({
            userId: user._id,
            postId: post._id,
            body: commentBody
        });

        await comment.save();
        return res.status(200).json({ message: "Comment saved" });
    }
    catch (error) {
        return res.status(500).json({ message: error.message });
    }
}


// =========================================================================
// GET COMMENTS BY POST
// =========================================================================
export const get_comments_by_post = async (req, res) => {
    const { post_id } = req.query;
    try {
        if (!post_id) {
            return res.status(400).json({ message: "post_id is required" });
        }

        const post = await Post.findOne({ _id: post_id });
        if (!post) {
            return res.status(404).json({ message: "post not found" });
        }

        const comments = await Comment.find({ postId: post_id })
            .populate('userId', 'name username profilePicture')
            .populate('replies.userId', 'name username profilePicture');

        return res.json({ comments });
    }
    catch (error) {
        return res.status(500).json({ message: error.message });
    }
}


// =========================================================================
// DELETE COMMENT (OWN COMMENTS ONLY)
// =========================================================================
export const delete_comment_of_user = async (req, res) => {
    const { token, comment_id } = req.body;
    try {

        const user = await User.findOne({ token: token }).select("_id");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const comment = await Comment.findOne({ "_id": comment_id });

        if (!comment) {
            return res.status(404).json({ message: "Comment not found" });
        }

        if (comment.userId.toString() !== user._id.toString()) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        await Comment.deleteOne({ "_id": comment_id });

        return res.json({ message: "Comment deleted" });

    }
    catch (error) {
        return res.status(500).json({ message: error.message });
    }
}


// =========================================================================
// INCREMENT POST LIKES
// =========================================================================
export const incremenet_likes = async (req, res) => {

    const { post_id } = req.body;
    try {

        const post = await Post.findOne({ _id: post_id });

        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }
        post.likes = post.likes + 1;

        await post.save();

        return res.json({ message: "Likes Incremented" });

    }
    catch (error) {
        return res.status(500).json({ message: error.message });
    }
}


// =========================================================================
// INCREMENT COMMENT LIKES
// =========================================================================
export const incrementCommentLike = async (req, res) => {

    const { comment_id } = req.body;
    try {

        const comment = await Comment.findOne({ _id: comment_id });

        if (!comment) {
            return res.status(404).json({ message: "Comment not found" });
        }

        comment.likes = comment.likes + 1;
        await comment.save();

        return res.json({ message: "Comment like incremented", likes: comment.likes });

    }
    catch (error) {
        return res.status(500).json({ message: error.message });
    }
}


// =========================================================================
// REPLY TO COMMENT
// =========================================================================
export const replyToComment = async (req, res) => {

    const { token, comment_id, body } = req.body;
    try {

        if (!body || body.trim() === "") {
            return res.status(400).json({ message: "Reply body is required" });
        }

        const user = await User.findOne({ token: token }).select("_id");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const comment = await Comment.findOne({ _id: comment_id });
        if (!comment) {
            return res.status(404).json({ message: "Comment not found" });
        }

        comment.replies.push({
            userId: user._id,
            body: body
        });

        await comment.save();

        const updatedComment = await Comment.findOne({ _id: comment_id })
            .populate('replies.userId', 'name username profilePicture');

        const newReply = updatedComment.replies[updatedComment.replies.length - 1];

        return res.json({ message: "Reply added", reply: newReply });

    }
    catch (error) {
        return res.status(500).json({ message: error.message });
    }
}


// =========================================================================
// GET USER PROFILE BASED ON USERNAME
// =========================================================================
export const getUserProfileAndUserBasedOnUsernme = async (req, res) => {
    const { username } = req.query;

    try {
        const user = await User.findOne({
            username
        });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const userProfile = await Profile.findOne({ userId: user._id })
            .populate('userId', 'name username email profilePicture');

        return res.json({ "profile": userProfile })
    }
    catch (err) {
        return res.status(500).json({ message: err.message })
    }
}


// =========================================================================
// DELETE USER (NEW)
// Cascades deletion to the user's profile, connection requests, and
// comments so no orphaned documents are left behind (this is what caused
// the "Anonymous User" bug — profiles were left behind after a user was
// deleted directly from the database).
// =========================================================================
export const deleteUser = async (req, res) => {
    const { token } = req.body;

    try {
        const user = await User.findOne({ token });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        await Profile.deleteOne({ userId: user._id });

        await ConnectionRequest.deleteMany({
            $or: [{ userId: user._id }, { connectionId: user._id }]
        });

        await Comment.deleteMany({ userId: user._id });


        await User.deleteOne({ _id: user._id });

        return res.json({ message: "User and related data deleted" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};