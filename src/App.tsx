import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HomeScreen } from "./features/home";
import tamaguiConfig from "./tamagui.config";
import { TamaguiProvider, Theme, YStack } from "tamagui";

function App() {
	const [colorScheme] = useState<"light" | "dark">("dark");

	return (
		<TamaguiProvider config={tamaguiConfig}>
			<Theme name={colorScheme}>
				<Theme name={colorScheme === "dark" ? "gray" : "gray"}>
					<YStack height="100vh" bc="$backgroundStrong">
						<BrowserRouter>
							<Routes>
								<Route
									path="*"
									element={<HomeScreen />}
								/>
							</Routes>
						</BrowserRouter>
					</YStack>
				</Theme>
			</Theme>
		</TamaguiProvider>
	);
}

export default App;
