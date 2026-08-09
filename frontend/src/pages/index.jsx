import Head from "next/head";
import { useRouter } from "next/router";
import Image from "next/image";
import { Inter } from "next/font/google";
import styles from "@/styles/Home.module.css"; 
import UserLayout from "@/layout/Userlayout";


const inter = Inter({ subsets: ["latin"] });


export default function Home() {

    const router = useRouter();
  return (
    <UserLayout>
    
        <div className={styles.container}>

            <div className={styles.mainContainer}>

                     <div className={styles.mainContainer__left}>
                     <p>Connect with friends without Exaggeration</p>
                     <p>A True Social media plateform, with stories no blufs!</p>
                    <div onClick={()=>{
                    router.push("/login");
                    }}className={styles.buttonJoin}>
                    <p>Join Now</p>
                </div>
                </div>        

                <div className={styles.mainContainer__right}>
                    <img src="/images/homemain_connection.png" alt="Connection Graphic" />
                </div>
            </div>
        </div>

    </UserLayout>
  ) 
}