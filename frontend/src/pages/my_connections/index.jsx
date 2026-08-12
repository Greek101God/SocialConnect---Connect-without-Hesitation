import React, { useEffect } from 'react'
import UserLayout from '@/layout/Userlayout'
import DashboardLayout from '@/layout/DashboardLayout'
import { useDispatch } from 'react-redux'
import { acceptConnection, getConnectionsRequest, getMyConnectionRequests } from '@/config/redux/action/authAction';
import { useSelector } from 'react-redux';
import styles from "./index.module.css";
import { BASE_URL } from '@/config';
import { useRouter } from 'next/router';

const DEFAULT_AVATAR = "https://res.cloudinary.com/h0v4k0lc/image/upload/default.png";

const getProfilePic = (pic) => {
  if (!pic || !pic.startsWith("http")) return DEFAULT_AVATAR;
  return pic;
};

export default function MyConnectionsPage() {

  const dispatch = useDispatch();
  const authState = useSelector((state) => state.auth)
  const router = useRouter();

  useEffect(() => {
    dispatch(getMyConnectionRequests({ token: localStorage.getItem("token") })); // requests I sent
    dispatch(getConnectionsRequest({ token: localStorage.getItem("token") }));   // requests sent to me
  }, [])

  // Requests I SENT that are still pending (other person hasn't accepted yet) — no Accept button, just "Pending"
  const sentPending = authState.connectionRequest
    .filter((c) => c.status_accepted === null)
    .map((c) => ({ _id: c._id, user: c.connectionId }));

  // Requests I RECEIVED that are still pending — these get the Accept button
  const receivedPending = authState.connections
    .filter((c) => c.status_accepted === null)
    .map((c) => ({ _id: c._id, user: c.userId }));

  // Accepted connections from both directions, merged into one "My Network" list
  const sentAccepted = authState.connectionRequest
    .filter((c) => c.status_accepted === true)
    .map((c) => ({ _id: c._id, user: c.connectionId }));

  const receivedAccepted = authState.connections
    .filter((c) => c.status_accepted === true)
    .map((c) => ({ _id: c._id, user: c.userId }));

  const myNetwork = [...sentAccepted, ...receivedAccepted];

  return (
    <UserLayout>
      <DashboardLayout>
        <div style={{ display: "flex", flexDirection: "column", gap: "1.7rem" }}>

          <h4>My Connection's</h4>
          {sentPending.length === 0 && receivedPending.length === 0 && <h2>No Connection Requests Pending</h2>}

          {/* Requests sent to me — I can accept these */}
          {receivedPending.map((connection) => (
            <div
              onClick={() => { router.push(`/view_profile/${connection.user.username}`) }}
              className={styles.userCard}
              key={connection._id}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "1.2rem", justifyContent: "space-between" }}>
                <div className={styles.profilePicture}>
                  <img src={getProfilePic(connection.user.profilePicture)} alt="backdrop" />
                </div>
                <div className={styles.userInfo}>
                  <h3>{connection.user.name}</h3>
                  <p>{connection.user.username}</p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    dispatch(acceptConnection({
                      requestId: connection._id,
                      token: localStorage.getItem("token"),
                      action: "accept"
                    }))
                  }}
                  className={styles.connectedButton}
                >
                  Accept
                </button>
              </div>
            </div>
          ))}

          {/* Requests I sent that are still awaiting the other person's response */}
          {sentPending.map((connection) => (
            <div
              onClick={() => { router.push(`/view_profile/${connection.user.username}`) }}
              className={styles.userCard}
              key={connection._id}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "1.2rem", justifyContent: "space-between" }}>
                <div className={styles.profilePicture}>
                  <img src={getProfilePic(connection.user.profilePicture)} alt="backdrop" />
                </div>
                <div className={styles.userInfo}>
                  <h3>{connection.user.name}</h3>
                  <p>{connection.user.username}</p>
                </div>
                <button className={styles.connectedButton} disabled>Pending</button>
              </div>
            </div>
          ))}

          <h4>My Network</h4>
          {myNetwork.length === 0 && <p>No connections yet.</p>}
          {myNetwork.map((entry) => (
            <div
              onClick={() => { router.push(`/view_profile/${entry.user.username}`) }}
              className={styles.userCard}
              key={entry._id}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "1.2rem", justifyContent: "space-between" }}>
                <div className={styles.profilePicture}>
                  <img src={getProfilePic(entry.user.profilePicture)} alt="backdrop" />
                </div>
                <div className={styles.userInfo}>
                  <h3>{entry.user.name}</h3>
                  <p>{entry.user.username}</p>
                </div>
              </div>
            </div>
          ))}

        </div>
      </DashboardLayout>
    </UserLayout>
  )
}