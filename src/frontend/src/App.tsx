import * as React from "react";
import styled from "styled-components";
import Home from "./components/Home";
import RsvpForm from "./components/RsvpForm";
import CreateGathering from "./components/CreateGathering";
import { _SERVICE } from "../../declarations/gather/gather.did";
import toast, { Toaster } from "react-hot-toast";
import ErrorBoundary from "./components/ErrorBoundary";
import {
  Outlet,
  Route,
  Routes,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import Loading from "./components/Loading";
import { ActorSubclass } from "@dfinity/agent";
import { useEffect } from "react";
import { gather } from "../../declarations/gather"

const Header = styled.header`
  position: relative;
  padding: 1rem;
  display: flex;
  justify-content: center;
  h1 {
    margin-top: 0;
  }
  #logout {
    position: absolute;
    right: 0.5rem;
    top: 0.5rem;
  }
`;

const Main = styled.main`
  display: flex;
  flex-direction: column;
  padding: 0 1rem;
`;

export const AppContext = React.createContext<{
  gather?: ActorSubclass<_SERVICE>;
}>({
  // Default values
});

const App = () => {
  const navigate = useNavigate();

  return (
    <>
      <Toaster
        toastOptions={{
          duration: 5000,
          position: "bottom-center",
        }}
      />
      <ErrorBoundary>
        <AppContext.Provider
          value={{
            gather
          }}
        >
          <Main>
            <Routes>
              <Route path="/" element={
                <Header>Welcome to Gather. Please specify /gathering/#id in the URL to RSVP to a gathering.</Header>
              } />
              <Route path="gathering" element={<Outlet />}>
                <Route path=":gatheringId" element={<RsvpForm />} />
                {/* <Route path=":gatheringId/edit" element={<EditGathering />} /> */}
                <Route path="new" element={<CreateGathering />} />
              </Route>
              <Route path="/loading" element={<Loading />} />
            </Routes>
          </Main>
        </AppContext.Provider>
      </ErrorBoundary>
    </>
  );
};

export default App;
