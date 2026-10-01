import { Link } from "react-router-dom";
import DemoLoginButton from "../components/DemoLoginButton";
import "./Home.css";

const Home = () => {
  return (
    <div className="home">
      <h1 className="home-title">Welcome to SprintBoard</h1>
      <Link to="/signup" className="get-started">GET STARTED</Link>
      <DemoLoginButton className="home-demo" />
    </div>
  );
};
export default Home;