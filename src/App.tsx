import { useState }    from "react";
import Stack           from "./components/Stack";
import { GarageView }  from "./views/GarageView";
import { WinnersView } from "./views/WinnersView";
import "./App.css";

type Page = "garage" | "winners";

const TABS: { id: Page; label: string }[] = [
  { id: "garage", label: "Garage" },
  { id: "winners", label: "Winners" }
];

export default function App() {
  const [page, setPage] = useState<Page>("garage");

  return (
    <div className="app">
      <nav className="nav">
        <Stack direction={"row"} alignItems={"center"} spacing={0}>
          {TABS.map((tab) => (
            <button
              key={tab.id}
              className={`nav-tab${page === tab.id ? " active" : ""}`}
              onClick={() => setPage(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </Stack>
      </nav>

      <main className="page">
        {page === "garage" && <GarageView/>}
        {page === "winners" && <WinnersView/>}
      </main>
    </div>
  );
}
