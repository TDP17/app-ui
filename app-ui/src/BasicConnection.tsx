import { engine } from "./utils/engine";
import { CanvasWidget } from "@projectstorm/react-canvas-core";

import styles from "./BasicConnection.module.css";

const BasicConnection: React.FC = () => {
  return (
    <div className={styles.canvasContainer}>
      <CanvasWidget engine={engine} className={styles.canvas} />
    </div>
  );
};

export default BasicConnection;
