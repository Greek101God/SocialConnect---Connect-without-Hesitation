import { clientServer } from '@/config';
import React, { useEffect, useState } from 'react'
import styles from "./index.module.css"
import UserLayout from '@/layout/Userlayout'
import DashBoardLayout from '@/layout/DashboardLayout'
import { BASE_URL } from '@/config';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import { getAllPosts } from '@/config/redux/action/postAction';
import {
  sendConnectionRequest,
  getConnectionsRequest,
  getMyConnectionRequests,
  getAboutUser,
} from '@/config/redux/action/authAction';


const DEFAULT_AVATAR = "https://res.cloudinary.com/h0v4k0lc/image/upload/default.png";

const getProfilePic = (pic) => {
  if (!pic) return DEFAULT_AVATAR;
  if (pic.startsWith("http")) return pic;
  return `${BASE_URL}/uploads/${pic}`;
};

export default function ViewProfilePage({ userProfile, fetchError }) {

  const router = useRouter();
  const postReducer = useSelector((state) => state.posts);
  const dispatch = useDispatch();

  const authState = useSelector((state) => state.auth);

  const [userPosts, setUserPosts] = useState([]);
  const [isConnectionNull, setIsConnectionNull] = useState(true);
  const [isCurrentUserInConnection, setIsCurrentUserInConnection] = useState(false);
  const [isOwnProfile, setIsOwnProfile] = useState(false);

  const getUsersPost = async () => {
    await dispatch(getAllPosts());
    await dispatch(getConnectionsRequest({ token: localStorage.getItem("token") }));
    await dispatch(getMyConnectionRequests({ token: localStorage.getItem("token") }));
    await dispatch(getAboutUser({ token: localStorage.getItem("token") }));
  };

  useEffect(() => {
    getUsersPost();
  }, []);

  useEffect(() => {
    const onFocus = () => {
      dispatch(getConnectionsRequest({ token: localStorage.getItem("token") }));
      dispatch(getMyConnectionRequests({ token: localStorage.getItem("token") }));
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [dispatch]);

  useEffect(() => {
    let post = postReducer.posts.filter((post) => {
      return post.userId.username === router.query.username;
    });
    setUserPosts(post);
  }, [postReducer.posts, router.query.username]);

  useEffect(() => {
    if (!userProfile) return;

    const targetId = userProfile.userId._id;

    const currentUserId = authState.user?.userId?._id;

    if (currentUserId && String(currentUserId) === String(targetId)) {
      setIsOwnProfile(true);
      setIsCurrentUserInConnection(true);
      setIsConnectionNull(false); // renders "Connected"
      return;
    }

    setIsOwnProfile(false);

    const receivedMatch = authState.connections?.find(
      (u) => u.userId._id === targetId
    );

    const sentMatch = authState.connectionRequest?.find(
      (u) => u.connectionId._id === targetId
    );

    const match = receivedMatch || sentMatch;

    if (match) {
      setIsCurrentUserInConnection(true);
      setIsConnectionNull(match.status_accepted !== true);
    } else {
      setIsCurrentUserInConnection(false);
      setIsConnectionNull(true);
    }

  }, [authState.connections, authState.connectionRequest, authState.user, userProfile]);

  useEffect(() => {
    console.log("From View : View Profile");
    console.log("userProfile:", userProfile);
  });

  if (!userProfile) {
    return (
      <UserLayout>
        <DashBoardLayout>
          <div style={{ padding: "2rem" }}>
            <h2>Something went wrong loading this profile.</h2>
            {fetchError && <p style={{ color: "grey" }}>{fetchError}</p>}
          </div>
        </DashBoardLayout>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <DashBoardLayout>
        <div className={styles.container}>
          <div className={styles.backDropContainer}>
            <img
              className={styles.backDrop}
              src={getProfilePic(userProfile.userId.profilePicture)}
              alt="backdrop"
            />
          </div>

          <div className={styles.profileContainer__details}>

            <div className={styles.profileContainer__flex}>

              <div style={{ flex: "0.8" }}>

                <div style={{ display: "flex", width: "fit-content", alignItems: "center", gap: "1.2rem" }}>
                  <h2>{userProfile.userId.name}</h2>
                  <p style={{ color: "grey" }}> @ {userProfile.userId.username}</p>
                </div>

                <div style={{ display: "flex", alignItems: "end", gap: "1.2rem" }}>
                  {isCurrentUserInConnection ? (
                    <button className={styles.connectedButton}>
                      {isOwnProfile ? "Connected" : (isConnectionNull ? "Pending" : "Connected")}
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        dispatch(
                          sendConnectionRequest({
                            token: localStorage.getItem("token"),
                            user_id: userProfile.userId._id,
                          })
                        );
                      }}
                      className={styles.conectionBtn}
                    >
                      Connect
                    </button>
                  )}
                  <div onClick={() => {
                    window.open(`${BASE_URL}/user/download_resume?id=${userProfile.userId._id}`, "_blank");
                  }} style={{ cursor: "pointer" }}>
                    <svg style={{ width: "1.2em" }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                    </svg>
                  </div>
                </div>

                {userProfile.bio && (
                  <p style={{ marginTop: "1rem" }}>{userProfile.bio}</p>
                )}

                <div style={{ display: "flex", flexWrap: "wrap", gap: "2rem", marginTop: "1.5rem" }}>

                  {userProfile.education?.length > 0 && (
                    <div className={styles.workHistory} style={{ flex: "1", minWidth: "200px" }}>
                      <h4>Education</h4>
                      <div className={styles.workHistoryContainer}>
                        {userProfile.education.map((edu, idx) => (
                          <div key={idx} className={styles.workHistoryCard}>
                            <p style={{ fontWeight: "bold", display: "flex", alignItems: "center", gap: "0.8rem" }}>
                              {edu.school}
                            </p>
                            <p>{edu.degree}, {edu.fieldOfStudy}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {userProfile.pastWork?.length > 0 && (
                    <div className={styles.workHistory} style={{ flex: "1", minWidth: "200px" }}>
                      <h4>Work History</h4>
                      <div className={styles.workHistoryContainer}>
                        {userProfile.pastWork.map((work, idx) => (
                          <div key={idx} className={styles.workHistoryCard}>
                            <p style={{ fontWeight: "bold", display: "flex", alignItems: "center", gap: "0.8rem" }}>
                              {work.company}-{work.position}
                            </p>
                            <p>{work.years}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>

              </div>

              <div className={styles.flexSpacer}></div>

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
                })}
              </div>

            </div>
          </div>
        </div>
      </DashBoardLayout>
    </UserLayout>
  );
}


export async function getServerSideProps(context) {
  const { username } = context.query;

  try {
    const request = await clientServer.get("/user/get_profile_based_on_username", {
      params: { username },
    });

    return { props: { userProfile: request.data.profile } };
  } catch (error) {
    console.error("Error fetching profile:", error.message);

    if (error.response?.status === 404) {
      return { notFound: true };
    }

    return { props: { userProfile: null, fetchError: error.message } };
  }
}