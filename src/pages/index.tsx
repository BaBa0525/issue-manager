import IssueList from "@/components/IssueList";
import { Navbar } from "@/components/Navbar";
import { signIn, signOut, useSession } from "next-auth/react";
import Image from "next/image";

interface IssueApi {
  body: string;
  status: string;
}

export default function CamperVanPage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <p>Hang on there...</p>;
  }

  if (status === "unauthenticated") {
    return (
      <>
        <Navbar />
        <p>Not signed in.</p>
        <button onClick={() => void signIn("github")}>Sign in</button>
      </>
    );
  }

  if (!session) {
    return <>Fail to get session</>;
  }

  const userName = session.user.login;
  const userPicture = session.user.image;

  return (
    <>
      <Navbar />
      <div className="max-h-10"></div>
      <p>Signed in as {userName}</p>
      <Image src={userPicture || ""} alt="you" width={50} height={50} />
      <div>
        <button onClick={() => void signOut()}>Sign out</button>
      </div>
      <IssueList accessToken={session.accessToken} filter="all" />
      {/* <div>
        <button onClick={() => void fetcher()}>Log Token</button>
      </div> */}
    </>
  );
}
