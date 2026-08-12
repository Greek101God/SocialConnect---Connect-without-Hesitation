import { getAboutUser } from '@/config/redux/action/authAction'
import DashboardLayout from '@/layout/DashboardLayout'
import UserLayout from '@/layout/Userlayout'
import React, { useEffect, useState } from 'react'
import styles from "./index.module.css"
import { BASE_URL, clientServer } from '@/config'
import { useDispatch, useSelector } from 'react-redux'
import { useRouter } from 'next/router'
import { getAllPosts } from '@/config/redux/action/postAction'

const DEFAULT_AVATAR = "https://res.cloudinary.com/h0v4k0lc/image/upload/default.png";

const getProfilePic = (pic) => {
  if (!pic || !pic.startsWith("http")) return DEFAULT_AVATAR;
  return pic;
};


export default function profilePage() {

  const router = useRouter();
  const dispatch = useDispatch();

  const authState = useSelector((state) => state.auth);
  const postReducer = useSelector((state) => state.posts);

  const [userProfile, setUserProfile] = useState({});
  const [originalProfile, setOriginalProfile] = useState({}); // snapshot for dirty-check
  const [userPosts, setUserPosts] = useState([]);

  const [isEditingEducation, setIsEditingEducation] = useState(false);
  const [isEditingWorkHistory, setIsEditingWorkHistory] = useState(false);

  // true only when the logged-in user is viewing their own profile
  const isOwner = authState.user?.userId?.username &&
    userProfile?.userId?.username &&
    authState.user.userId.username === userProfile.userId.username;

  // true only when something has actually changed since load/last save
  const hasChanges = isOwner &&
    JSON.stringify(userProfile) !== JSON.stringify(originalProfile);

  useEffect(() => {
    dispatch(getAboutUser({ token: localStorage.getItem("token") }));
    dispatch(getAllPosts());
  }, []);

  useEffect(() => {
    if (authState.user != undefined) {
      setUserProfile(authState.user || {});
      setOriginalProfile(authState.user || {}); // reset snapshot whenever fresh data loads

      const allPosts = postReducer?.posts || [];
      const filteredPosts = allPosts.filter((post) => {
        return post.userId.username === authState.user.userId.username;
      });
      setUserPosts(filteredPosts);
    }
  }, [authState.user, postReducer?.posts, router.query.username]);


  const updateProfilePicture = async (file) => {
    const formData = new FormData();
    formData.append("profile_picture", file);
    formData.append("token", localStorage.getItem("token"));
    const response = await clientServer.post("/user/update_profile_picture", formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    dispatch(getAboutUser({ token: localStorage.getItem("token") }));
  }


  const updateProfileData = async () => {
    const request = await clientServer.post("/user/user_update", {
      token: localStorage.getItem("token"),
      name: userProfile.userId.name,
    });
    const response = await clientServer.post("/user/update_profile_data", {
      token: localStorage.getItem("token"),
      bio: userProfile.bio,
      currentPost: userProfile.currentPost,
      pastWork: userProfile.pastWork,
      education: userProfile.education
    });
    dispatch(getAboutUser({ token: localStorage.getItem("token") }));
    // originalProfile resets automatically once the dispatch above updates
    // authState.user and the useEffect above fires again.
  }

  // ---- Education helpers ----
  const handleEducationChange = (idx, field, value) => {
    const updated = [...(userProfile.education || [])];
    updated[idx] = { ...updated[idx], [field]: value };
    setUserProfile({ ...userProfile, education: updated });
  };

  const addEducationEntry = () => {
    const updated = [...(userProfile.education || []), { school: "", degree: "", fieldOfStudy: "" }];
    setUserProfile({ ...userProfile, education: updated });
  };

  const removeEducationEntry = (idx) => {
    const updated = [...(userProfile.education || [])];
    updated.splice(idx, 1);
    setUserProfile({ ...userProfile, education: updated });
  };

  // ---- Work History helpers ----
  const handleWorkChange = (idx, field, value) => {
    const updated = [...(userProfile.pastWork || [])];
    updated[idx] = { ...updated[idx], [field]: value };
    setUserProfile({ ...userProfile, pastWork: updated });
  };

  const addWorkEntry = () => {
    const updated = [...(userProfile.pastWork || []), { company: "", position: "", years: "" }];
    setUserProfile({ ...userProfile, pastWork: updated });
  };

  const removeWorkEntry = (idx) => {
    const updated = [...(userProfile.pastWork || [])];
    updated.splice(idx, 1);
    setUserProfile({ ...userProfile, pastWork: updated });
  };

  const saveEducation = async () => {
    await updateProfileData();
    setIsEditingEducation(false);
  };

  const saveWorkHistory = async () => {
    await updateProfileData();
    setIsEditingWorkHistory(false);
  };

  return (
    <UserLayout>
      <DashboardLayout>
        {authState.user && userProfile?.userId &&
          <div className={styles.container}>
            <div className={styles.backDropContainer}>
              <label htmlFor='profilePictureUpload' className={styles.backDrop__overLay}>
                <p>Edit</p>
              </label>
              <input onChange={(e) => {
                updateProfilePicture(e.target.files[0])
              }} hidden type="file" id='profilePictureUpload' />
              <img src={getProfilePic(userProfile.userId.profilePicture)} alt="backdrop" />
            </div>

            <div className={styles.profileContainer__details}>

              <div style={{ display: "flex", gap: "0.7rem" }}>

                <div style={{ flex: "0.8" }}>

                  <div style={{ display: "flex", width: "fit-content", alignItems: "center", gap: "1.2rem" }}>
                    <input
                      className={styles.nameEdit}
                      type="text"
                      value={userProfile.userId.name}
                      readOnly={!isOwner}
                      onChange={(e) => {
                        setUserProfile({ ...userProfile, userId: { ...userProfile.userId, name: e.target.value } })
                      }}
                    />
                    <p style={{ color: "grey" }}> @ {userProfile.userId.username}</p>
                  </div>
                  <div>
                    <textarea
                      value={userProfile.bio}
                      readOnly={!isOwner}
                      onChange={(e) => {
                        setUserProfile({ ...userProfile, bio: e.target.value });
                      }}
                      rows={Math.max(3, Math.ceil((userProfile.bio || "").length / 80))}
                      style={{ width: "100%" }}
                    ></textarea>
                  </div>

                  <div style={{ display: "flex", flexWrap: "wrap", gap: "2rem", marginTop: "1.5rem" }}>

                    {/* ---------------- EDUCATION SECTION ---------------- */}
                    <div className={styles.workHistory} style={{ flex: "1", minWidth: "200px" }}>
                      <div className={styles.sectionHeader}>
                        <h4>Education</h4>
                        {isOwner && (
                          <button
                            type="button"
                            className={`${styles.actionButton} ${styles["actionButton--secondary"]} ${styles["actionButton--sm"]}`}
                            onClick={() => setIsEditingEducation(!isEditingEducation)}
                          >
                            {isEditingEducation ? "Cancel" : "Edit Education"}
                          </button>
                        )}
                      </div>

                      <div className={styles.workHistoryContainer}>
                        {(userProfile.education || []).map((edu, idx) => (
                          <div key={idx} className={styles.workHistoryCard}>
                            {isOwner && isEditingEducation ? (
                              <div className={styles.editEntryForm}>
                                <input
                                  type="text"
                                  placeholder="School"
                                  value={edu.school || ""}
                                  onChange={(e) => handleEducationChange(idx, "school", e.target.value)}
                                />
                                <input
                                  type="text"
                                  placeholder="Degree"
                                  value={edu.degree || ""}
                                  onChange={(e) => handleEducationChange(idx, "degree", e.target.value)}
                                />
                                <input
                                  type="text"
                                  placeholder="Field of Study"
                                  value={edu.fieldOfStudy || ""}
                                  onChange={(e) => handleEducationChange(idx, "fieldOfStudy", e.target.value)}
                                />
                                <button
                                  type="button"
                                  className={`${styles.actionButton} ${styles["actionButton--danger"]}`}
                                  onClick={() => removeEducationEntry(idx)}
                                >
                                  Remove
                                </button>
                              </div>
                            ) : (
                              <>
                                <p style={{ fontWeight: "bold", display: "flex", alignItems: "center", gap: "0.8rem" }}>
                                  {edu.school}
                                </p>
                                <p>{edu.degree}, {edu.fieldOfStudy}</p>
                              </>
                            )}
                          </div>
                        ))}

                        {isOwner && isEditingEducation && (
                          <div className={styles.buttonRow}>
                            <button
                              type="button"
                              className={`${styles.actionButton} ${styles["actionButton--secondary"]}`}
                              onClick={addEducationEntry}
                            >
                              + Add Education
                            </button>
                            <button
                              type="button"
                              className={`${styles.actionButton} ${styles["actionButton--primary"]}`}
                              onClick={saveEducation}
                            >
                              Save Education
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* ---------------- WORK HISTORY SECTION ---------------- */}
                    <div className={styles.workHistory} style={{ flex: "1", minWidth: "200px" }}>
                      <div className={styles.sectionHeader}>
                        <h4>Work History</h4>
                        {isOwner && (
                          <button
                            type="button"
                            className={`${styles.actionButton} ${styles["actionButton--secondary"]} ${styles["actionButton--sm"]}`}
                            onClick={() => setIsEditingWorkHistory(!isEditingWorkHistory)}
                          >
                            {isEditingWorkHistory ? "Cancel" : "Edit Work History"}
                          </button>
                        )}
                      </div>

                      <div className={styles.workHistoryContainer}>
                        {(userProfile.pastWork || []).map((work, idx) => (
                          <div key={idx} className={styles.workHistoryCard}>
                            {isOwner && isEditingWorkHistory ? (
                              <div className={styles.editEntryForm}>
                                <input
                                  type="text"
                                  placeholder="Company"
                                  value={work.company || ""}
                                  onChange={(e) => handleWorkChange(idx, "company", e.target.value)}
                                />
                                <input
                                  type="text"
                                  placeholder="Position"
                                  value={work.position || ""}
                                  onChange={(e) => handleWorkChange(idx, "position", e.target.value)}
                                />
                                <input
                                  type="text"
                                  placeholder="Years (e.g. 2019-2021)"
                                  value={work.years || ""}
                                  onChange={(e) => handleWorkChange(idx, "years", e.target.value)}
                                />
                                <button
                                  type="button"
                                  className={`${styles.actionButton} ${styles["actionButton--danger"]}`}
                                  onClick={() => removeWorkEntry(idx)}
                                >
                                  Remove
                                </button>
                              </div>
                            ) : (
                              <>
                                <p style={{ fontWeight: "bold", display: "flex", alignItems: "center", gap: "0.8rem" }}>
                                  {work.company}-{work.position}
                                </p>
                                <p>{work.years}</p>
                              </>
                            )}
                          </div>
                        ))}

                        {isOwner && isEditingWorkHistory && (
                          <div className={styles.buttonRow}>
                            <button
                              type="button"
                              className={`${styles.actionButton} ${styles["actionButton--secondary"]}`}
                              onClick={addWorkEntry}
                            >
                              + Add Work History
                            </button>
                            <button
                              type="button"
                              className={`${styles.actionButton} ${styles["actionButton--primary"]}`}
                              onClick={saveWorkHistory}
                            >
                              Save Work History
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                  </div>

                </div>
                <div style={{ flex: "0.2" }}></div>

                <div className={styles.activityContainer}>
                  <h3>Recent Activity</h3>
                  {userPosts.map((post) => {
                    return (
                      <div key={post._id} className={styles.postCard}>
                        <div className={styles.card}>
                          <div className={styles.card__profileContainer}>
                            {post.media !== "" ? (
                              <img src={post.media} alt="post_img" />
                            ) : null}
                          </div>
                          <p>{post.body}</p>
                        </div>
                      </div>
                    );
                  })
                  }
                </div>

              </div>

            </div>

            {hasChanges &&
              <button
                type="button"
                onClick={() => { updateProfileData(); }}
                className={styles.updateProfileButton}
              >
                Update Profile
              </button>
            }
          </div>
        }
      </DashboardLayout>
    </UserLayout>
  )
}