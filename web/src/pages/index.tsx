import { withUrqlClient } from "next-urql";
import { usePostsQuery } from "../generated/graphql";

import Navbar from "../components/Navbar";

import { createUrqlClient } from "../utils/createUrqlClient";

function Index(): JSX.Element {
  const [{ data }] = usePostsQuery();
  return (
    <>
      <Navbar />
      <div>안녕하세요</div>
      <br />
      {!data ? (
        <div>loading...</div>
      ) : (
        data.posts.map((p) => <div key={p.id}>{p.title}</div>)
      )}
    </>
  );
}

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
