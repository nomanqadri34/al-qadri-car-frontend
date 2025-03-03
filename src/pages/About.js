import React from "react";
import Layout from "./../components/Layout/Layout";

const About = () => {
  return (
    <Layout title={"About us - Ecommer app"}>
      <div className="row contactus ">
        <div className="col-md-6 ">
          <img
            src="/images/bg.png"
            alt="contactus"
            style={{ width: "50%"  }}
          />
        </div>
        <div className="col-md-4">
          <h1>About Us</h1>
          <p className="text-justify mt-2">
          Welcome to Arouse automation , where creativity meets quality! Founded in 2024, we are passionate about providing you with the means to express yourself through unique, personalized products. Whether you're looking to add a personal touch to your wardrobe or searching for the perfect gift, we've got you covered.
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default About;
