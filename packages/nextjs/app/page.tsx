import type { NextPage } from "next";
import { ServiceForm } from "~~/components/ServiceForm";

const Home: NextPage = () => {
  return (
    <>
      <div className="flex items-center flex-col grow pt-10">
        <ServiceForm />
      </div>
    </>
  );
};

export default Home;
