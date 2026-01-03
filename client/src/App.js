import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

// import "./App.css";

import Layout from "./pages/Layout";
import Main from "./pages/Main";
import About from "./pages/About";
import Goals from "./pages/Goals";
import ProgressTracker from "./pages/ProgressTracker";
import StatsPage from "./pages/StatsPage";

function App() {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<Layout />}>
					<Route index element={<Main />} />
					<>
						<Route path="/Main" element={<Main />} />
						<Route path="/About" element={<About />} />
						<Route path="/Goals" element={<Goals />} />
						<Route path="/ProgressTracker" element={<ProgressTracker />} />
						<Route path="/Stats" element={<StatsPage />} />
					</>
				</Route>
			</Routes>
		</BrowserRouter>
	);
}

export default App;
