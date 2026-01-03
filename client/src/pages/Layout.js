import { Outlet, Link } from "react-router-dom";
import React from "react";
import "./css/Layout.scss";

const Layout = () => {
    return (
        <>
            <nav>
                <ul>
                    <li>
                        <Link to="/">Home</Link>
                    </li>
                    <li>
                        <Link to="/Main">Main</Link>
                    </li>
                    <li>
                        <Link to="/Goals">Goals</Link>
                    </li>
                    <li>
                        <Link to="/ProgressTracker">Progress Tracker</Link>
                    </li>
                    <li>
                        <Link to="/Stats">Stats & Progression</Link>
                    </li>
                    <li>
                        <Link to="/Books">📚 My Books</Link>
                    </li>
                    <li>
                        <Link to="/About">About</Link>
                    </li>
                </ul>
            </nav>
            <Outlet />
        </>
    );
};

export default Layout;
