import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

// import "./App.css";

import Layout from "./pages/Layout";
import Main from "./pages/Main";
import About from "./pages/About";

function App() {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<Layout />}>
					<Route index element={<Main />} />
					<>
						<Route path="/Main" element={<Main />} />
						<Route path="/About" element={<About />} />
					</>
				</Route>
			</Routes>
		</BrowserRouter>
	);
}

export default App;
