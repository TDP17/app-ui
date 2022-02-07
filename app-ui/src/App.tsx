import { useLayoutEffect, useState } from "react";
import BasicConnection from "./BasicConnection";
import { addModelListener, initModel, model, removeModelListener } from "./utils/engine";

const App : React.FC = () => {
  const [loaded, setLoaded] = useState(false);
  useLayoutEffect(() => {
    const listener = addModelListener(model);
    initModel();
    setLoaded(true);
    return () => {
      removeModelListener(model, listener);
    };
  }, []);

  return <div className="App">{loaded && <BasicConnection />}</div>;
};

export default App;
