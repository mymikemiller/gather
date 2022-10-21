import * as React from 'react';
import logo from "../assets/logo.png";
import { gather } from "../../declarations/gather"

const App = () => {
  const [greeting, setGreeting] = React.useState("");
  const [pending, setPending] = React.useState(false);
  const inputRef = React.useRef();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (pending) return;
    setPending(true);
    const name = inputRef.current.value.toString();

    // Interact with gather actor, calling the greet method
    const greeting = await gather.greet(name);
    setGreeting(greeting);
    setPending(false);
    return false;
  }

  return (
    <main>
      <img src={logo} alt="DFINITY logo" />
      <form onSubmit={handleSubmit}>
        <label htmlFor="name">Enter your name: &nbsp;</label>
        <input id="name" alt="Name" type="text" ref={inputRef} />
        <button id="clickMeBtn" type="submit" disabled={pending}>
          Click Me!
        </button>
      </form>
      <section id="greeting">{greeting}</section>
    </main>
  );
}

export default App;
