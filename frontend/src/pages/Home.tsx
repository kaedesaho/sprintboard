import { Link } from "react-router-dom";
import "./Home.css";

const Home = () => {
  return (
    <div className="home">
      <h1 className="home-title">Welcome to PlanFlow</h1>
      <Link to="/signup" className="get-started">GET STARTED</Link>
    </div>
  );
};
export default Home;