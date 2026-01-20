import type { NextPage } from "next";
import { ServiceForm } from "~~/components/ServiceForm";

const Home: NextPage = () => {
  return (
    <main className="flex items-center flex-col grow pt-10">
      <ServiceForm />
    </main>
  );
};

export default Home;
